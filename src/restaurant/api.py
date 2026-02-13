"""맛집 검색 API 라우터"""

from fastapi import APIRouter, Request
from chatbot.rate_limit import limiter, RateLimits
from .schemas import KakaoRestaurant, SearchResponse, RegionInfo
from .kakao_client import search_keyword, search_nearby, coord2region

router = APIRouter(prefix="/api/restaurants", tags=["restaurants"])


@router.get("/search", response_model=SearchResponse)
@limiter.limit(RateLimits.GENERAL)
async def api_search(
    request: Request,
    query: str,
    lat: float | None = None,
    lng: float | None = None,
    radius: int = 2000,
    page: int = 1,
    size: int = 15,
):
    """키워드로 맛집 검색"""
    result = await search_keyword(query, lat, lng, radius, page, size)
    restaurants = [KakaoRestaurant(**doc) for doc in result["documents"]]
    return SearchResponse(
        restaurants=restaurants,
        total_count=result["meta"]["total_count"],
        is_end=result["meta"]["is_end"],
    )


@router.get("/nearby", response_model=SearchResponse)
@limiter.limit(RateLimits.GENERAL)
async def api_nearby(
    request: Request,
    lat: float,
    lng: float,
    radius: int = 2000,
    size: int = 15,
):
    """주변 맛집 검색 (카테고리 기반)"""
    result = await search_nearby(lat, lng, radius, size=size)
    restaurants = [KakaoRestaurant(**doc) for doc in result["documents"]]
    return SearchResponse(
        restaurants=restaurants,
        total_count=result["meta"]["total_count"],
        is_end=result["meta"]["is_end"],
    )


@router.get("/region", response_model=RegionInfo)
@limiter.limit(RateLimits.GENERAL)
async def api_region(
    request: Request,
    lat: float,
    lng: float,
):
    """좌표 → 지역명 변환"""
    result = await coord2region(lat, lng)
    if not result:
        return RegionInfo(
            region_1depth="",
            region_2depth="",
            region_3depth="",
            display_name="알 수 없는 지역",
        )
    return RegionInfo(**result)


@router.get("/{place_id}", response_model=KakaoRestaurant | None)
@limiter.limit(RateLimits.GENERAL)
async def api_detail(
    request: Request,
    place_id: str,
    name: str | None = None,
    lat: float | None = None,
    lng: float | None = None,
):
    """단일 맛집 조회 (이름으로 검색 후 ID 매칭)"""
    if not name:
        return None

    # 기본 좌표 (서울 중심) — 좌표 없이 검색하면 카카오 API가 실패할 수 있음
    search_lat = lat or 37.5665
    search_lng = lng or 126.9780

    result = await search_keyword(name, lat=search_lat, lng=search_lng, radius=20000, size=5)
    for doc in result["documents"]:
        if doc["id"] == place_id:
            return KakaoRestaurant(**doc)

    # ID 정확 매칭 실패 시 첫 번째 결과라도 반환
    if result["documents"]:
        return KakaoRestaurant(**result["documents"][0])

    return None
