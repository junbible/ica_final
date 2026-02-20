import asyncio
import logging

from fastapi import APIRouter, HTTPException, Request

from chatbot.rate_limit import limiter, RateLimits
from restaurant.kakao_client import (
    fetch_place_images,
    fetch_place_reviews,
    search_keyword,
)

from .food_type_search import FOOD_TYPE_KEYWORDS, FOOD_TYPE_LABELS, FOOD_TYPE_REASONS
from .schemas import FoodType, RecommendRequest, RecommendResponse, ScoredRestaurant
from .scoring import (
    compute_food_type_scores,
    compute_recommendation_score,
    compute_distance_weight,
    determine_food_type,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["recommend"])


async def _search_by_food_type(
    food_type: FoodType,
    lat: float,
    lng: float,
    radius: int,
) -> list[dict]:
    """Search restaurants for a food type using its keywords in parallel."""
    keywords = FOOD_TYPE_KEYWORDS[food_type][:3]
    tasks = [
        search_keyword(query=kw, lat=lat, lng=lng, radius=radius, size=15)
        for kw in keywords
    ]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    seen_ids: set[str] = set()
    restaurants: list[dict] = []
    for result in results:
        if isinstance(result, Exception):
            logger.warning("Search keyword failed: %s", result)
            continue
        for doc in result.get("documents", []):
            rid = doc.get("id", "")
            if rid and rid not in seen_ids:
                seen_ids.add(rid)
                restaurants.append(doc)

    # Sort by distance, take top 10
    restaurants.sort(key=lambda r: r.get("distance", 99999))
    return restaurants[:10]


async def _enrich_restaurants(
    restaurants: list[dict],
) -> list[ScoredRestaurant]:
    """Fetch reviews + images in parallel, compute scores."""
    if not restaurants:
        return []

    place_ids = [r["id"] for r in restaurants]

    # Parallel: fetch reviews for each + batch images
    review_tasks = [fetch_place_reviews(pid) for pid in place_ids]
    image_task = fetch_place_images(place_ids)

    review_results = await asyncio.gather(*review_tasks, return_exceptions=True)
    image_map = await image_task

    scored: list[ScoredRestaurant] = []
    for i, r in enumerate(restaurants):
        # Extract rating from review data
        rating = 0.0
        if i < len(review_results) and not isinstance(review_results[i], Exception):
            review_data = review_results[i]
            rating = review_data.get("avg_score", 0.0)

        distance = r.get("distance", 0)
        if isinstance(distance, str):
            distance = int(distance) if distance.isdigit() else 0

        dist_weight = compute_distance_weight(distance)
        rec_score = compute_recommendation_score(rating, distance)

        scored.append(ScoredRestaurant(
            id=r.get("id", ""),
            name=r.get("name", ""),
            category=r.get("category", ""),
            full_category=r.get("full_category", ""),
            address=r.get("address", ""),
            phone=r.get("phone", ""),
            place_url=r.get("place_url", ""),
            image_url=image_map.get(r.get("id", ""), r.get("image_url", "")),
            lat=float(r.get("lat", 0)),
            lng=float(r.get("lng", 0)),
            distance=distance,
            rating=rating,
            recommendation_score=rec_score,
            distance_weight=dist_weight,
        ))

    # PRD 11.5: score DESC → rating DESC → distance ASC
    scored.sort(key=lambda s: (-s.recommendation_score, -s.rating, s.distance))
    return scored


@router.post("/recommend", response_model=RecommendResponse)
@limiter.limit(RateLimits.GENERAL)
async def recommend(request: Request, body: RecommendRequest) -> RecommendResponse:
    """Swipe-based food recommendation endpoint."""
    # 1. Compute food type scores
    scores = compute_food_type_scores(body.spicy, body.warm, body.light, body.soup)

    # 2. Determine primary + secondary food type
    primary, secondary = determine_food_type(scores)

    # 3. Search restaurants by primary food type
    raw_restaurants = await _search_by_food_type(
        primary, body.lat, body.lng, body.radius
    )

    # 4. Enrich with reviews, images, scores
    scored = await _enrich_restaurants(raw_restaurants)

    # 5. If 0 results with primary, try secondary
    if not scored and secondary:
        raw_restaurants = await _search_by_food_type(
            secondary, body.lat, body.lng, body.radius
        )
        scored = await _enrich_restaurants(raw_restaurants)

    condition_summary = {
        "spicy": body.spicy,
        "warm": body.warm,
        "light": body.light,
        "soup": body.soup,
    }

    return RecommendResponse(
        food_type=primary,
        food_type_label=FOOD_TYPE_LABELS[primary],
        food_type_reason=FOOD_TYPE_REASONS[primary],
        condition_summary=condition_summary,
        restaurants=scored,
        total_count=len(scored),
        secondary_food_type=secondary,
    )
