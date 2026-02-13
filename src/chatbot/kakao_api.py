"""카카오 로컬 API 연동 — 공유 클라이언트 사용"""

from typing import Optional
from restaurant.kakao_client import (
    search_keyword,
    LOCATION_COORDS,
    CONDITION_KEYWORDS,
)


async def search_restaurants(
    location: str,
    keyword: str,
    condition_key: Optional[str] = None,
    radius: int = 1000,
    size: int = 5,
) -> list[dict]:
    """카카오 로컬 API로 음식점 검색 (공유 클라이언트 위임)"""
    coords = LOCATION_COORDS.get(location, LOCATION_COORDS.get("강남"))

    search_keywords = [keyword]
    if condition_key and condition_key in CONDITION_KEYWORDS:
        search_keywords = CONDITION_KEYWORDS[condition_key][:2]

    all_results: list[dict] = []

    for kw in search_keywords:
        result = await search_keyword(
            query=f"{location} {kw}",
            lat=coords["lat"],
            lng=coords["lng"],
            radius=radius,
            size=size,
        )
        for doc in result["documents"]:
            if not any(r["id"] == doc["id"] for r in all_results):
                all_results.append(doc)

    all_results.sort(key=lambda x: x["distance"])
    return all_results[:size]


async def search_by_condition(location: str, condition_key: str, size: int = 3) -> list[dict]:
    """컨디션 키로 맛집 검색"""
    keywords = CONDITION_KEYWORDS.get(condition_key, ["맛집"])
    return await search_restaurants(location, keywords[0], condition_key, size=size)
