"""카카오 로컬 API 연동"""

import os
import httpx
from typing import Optional

KAKAO_API_KEY = os.getenv("KAKAO_REST_API_KEY")
KAKAO_LOCAL_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"

# 지역별 좌표 (위도, 경도)
LOCATION_COORDS = {
    "강남": {"lat": 37.4979, "lng": 127.0276},
    "홍대": {"lat": 37.5563, "lng": 126.9220},
    "신촌": {"lat": 37.5550, "lng": 126.9366},
    "이태원": {"lat": 37.5340, "lng": 126.9948},
    "명동": {"lat": 37.5636, "lng": 126.9869},
    "건대": {"lat": 37.5404, "lng": 127.0696},
    "잠실": {"lat": 37.5133, "lng": 127.1001},
    "여의도": {"lat": 37.5219, "lng": 126.9245},
    "판교": {"lat": 37.3947, "lng": 127.1119},
    "종로": {"lat": 37.5704, "lng": 126.9922},
    "압구정": {"lat": 37.5270, "lng": 127.0281},
    "성수": {"lat": 37.5445, "lng": 127.0560},
}

# 컨디션별 검색 키워드 매핑
CONDITION_KEYWORDS = {
    "fatigue_1": ["삼계탕", "보양식", "국밥", "설렁탕"],
    "fatigue_2": ["스테이크", "파스타", "양식", "분위기좋은"],
    "fatigue_3": ["죽", "우동", "칼국수", "속편한"],
    "hangover_1": ["해장국", "콩나물국밥", "북어국", "죽"],
    "hangover_2": ["짬뽕", "육개장", "순두부", "얼큰한"],
    "hangover_3": ["냉면", "막국수", "시원한"],
    "stress_1": ["마라탕", "매운", "불닭", "닭발"],
    "stress_2": ["카페", "디저트", "케이크", "와플"],
    "stress_3": ["삼겹살", "고기", "치킨", "피자"],
    "cold_1": ["차", "죽", "따뜻한"],
    "cold_2": ["삼계탕", "칼국수", "뜨끈한"],
    "cold_3": ["감자탕", "육개장", "국물"],
    "diet_1": ["샐러드", "포케", "저칼로리"],
    "diet_2": ["닭가슴살", "단백질", "건강식"],
    "diet_3": ["한정식", "정식", "건강"],
    "light_1": ["포케", "샐러드", "아사이볼"],
    "light_2": ["쌀국수", "소바", "면요리"],
    "light_3": ["샌드위치", "베이글", "브런치"],
}


import random

# 폴백용 목업 맛집 데이터
MOCK_RESTAURANTS = {
    "강남": [
        {"name": "강남 삼계탕", "category": "한식", "address": "서울 강남구 테헤란로 123", "phone": "02-1234-5678"},
        {"name": "역삼 국밥집", "category": "한식", "address": "서울 강남구 역삼로 45", "phone": "02-2345-6789"},
        {"name": "강남역 마라탕", "category": "중식", "address": "서울 강남구 강남대로 78", "phone": "02-3456-7890"},
        {"name": "샐러드파티 강남점", "category": "샐러드", "address": "서울 강남구 봉은사로 12", "phone": "02-4567-8901"},
        {"name": "스테이크 하우스", "category": "양식", "address": "서울 강남구 선릉로 99", "phone": "02-5678-9012"},
    ],
    "홍대": [
        {"name": "홍대 치킨골목", "category": "치킨", "address": "서울 마포구 홍익로 10", "phone": "02-1111-2222"},
        {"name": "상수 파스타", "category": "양식", "address": "서울 마포구 상수동 123", "phone": "02-2222-3333"},
        {"name": "연남동 포케", "category": "샐러드", "address": "서울 마포구 연남로 45", "phone": "02-3333-4444"},
        {"name": "홍대 삼계탕", "category": "한식", "address": "서울 마포구 어울마당로 78", "phone": "02-4444-5555"},
        {"name": "마포 해장국", "category": "한식", "address": "서울 마포구 와우산로 55", "phone": "02-5555-6666"},
    ],
    "신촌": [
        {"name": "신촌 삼겹살", "category": "고기", "address": "서울 서대문구 신촌로 12", "phone": "02-6666-7777"},
        {"name": "이대 분식", "category": "분식", "address": "서울 서대문구 이화여대길 34", "phone": "02-7777-8888"},
        {"name": "신촌 국수집", "category": "한식", "address": "서울 서대문구 명물길 56", "phone": "02-8888-9999"},
        {"name": "연세로 카페", "category": "카페", "address": "서울 서대문구 연세로 78", "phone": "02-9999-0000"},
        {"name": "신촌 우동", "category": "일식", "address": "서울 서대문구 창천동 90", "phone": "02-0000-1111"},
    ],
}


def get_mock_restaurants(location: str, condition_key: str, size: int = 5) -> list[dict]:
    """목업 맛집 데이터 반환"""
    coords = LOCATION_COORDS.get(location, LOCATION_COORDS["강남"])
    mock_list = MOCK_RESTAURANTS.get(location, MOCK_RESTAURANTS.get("강남", []))

    results = []
    for i, mock in enumerate(mock_list[:size]):
        # 좌표에 약간의 랜덤 오프셋 추가
        lat_offset = random.uniform(-0.005, 0.005)
        lng_offset = random.uniform(-0.005, 0.005)

        results.append({
            "id": f"mock_{location}_{i}",
            "name": mock["name"],
            "category": mock["category"],
            "address": mock["address"],
            "phone": mock["phone"],
            "url": f"https://place.map.kakao.com/{i}",
            "lat": coords["lat"] + lat_offset,
            "lng": coords["lng"] + lng_offset,
            "distance": random.randint(50, 500),
        })

    results.sort(key=lambda x: x["distance"])
    return results


async def search_restaurants(
    location: str,
    keyword: str,
    condition_key: Optional[str] = None,
    radius: int = 1000,
    size: int = 5
) -> list[dict]:
    """
    카카오 로컬 API로 음식점 검색 (실패 시 목업 데이터 반환)

    Args:
        location: 위치명 (강남, 홍대 등)
        keyword: 검색 키워드 (삼계탕, 해장국 등)
        condition_key: 컨디션 키 (fatigue_1 등) - 추가 키워드 검색용
        radius: 검색 반경 (미터)
        size: 결과 개수

    Returns:
        음식점 목록
    """
    if not KAKAO_API_KEY:
        print("Warning: KAKAO_REST_API_KEY not set, using mock data")
        return get_mock_restaurants(location, condition_key or "default", size)

    # 좌표 가져오기
    coords = LOCATION_COORDS.get(location, LOCATION_COORDS.get("강남"))

    # 검색 키워드 조합
    search_keywords = [keyword]
    if condition_key and condition_key in CONDITION_KEYWORDS:
        search_keywords = CONDITION_KEYWORDS[condition_key][:2]  # 상위 2개만

    all_results = []

    async with httpx.AsyncClient() as client:
        for kw in search_keywords:
            try:
                response = await client.get(
                    KAKAO_LOCAL_URL,
                    headers={"Authorization": f"KakaoAK {KAKAO_API_KEY}"},
                    params={
                        "query": f"{location} {kw}",
                        "x": str(coords["lng"]),
                        "y": str(coords["lat"]),
                        "radius": radius,
                        "category_group_code": "FD6",  # 음식점
                        "sort": "accuracy",
                        "size": size,
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    for place in data.get("documents", []):
                        # 중복 제거
                        if not any(r["id"] == place["id"] for r in all_results):
                            all_results.append({
                                "id": place["id"],
                                "name": place["place_name"],
                                "category": place.get("category_name", "").split(" > ")[-1],
                                "address": place.get("road_address_name") or place.get("address_name", ""),
                                "phone": place.get("phone", ""),
                                "url": place.get("place_url", ""),
                                "lat": float(place["y"]),
                                "lng": float(place["x"]),
                                "distance": int(place.get("distance", 0)),
                            })
                else:
                    print(f"Kakao API error: {response.status_code} - {response.text[:100]}")
            except Exception as e:
                print(f"Kakao API error: {e}")
                continue

    # API 결과가 없으면 목업 데이터 반환
    if not all_results:
        print(f"No results from Kakao API, using mock data for {location}")
        return get_mock_restaurants(location, condition_key or "default", size)

    # 거리순 정렬 후 상위 N개 반환
    all_results.sort(key=lambda x: x["distance"])
    return all_results[:size]


async def search_by_condition(location: str, condition_key: str, size: int = 3) -> list[dict]:
    """컨디션 키로 맛집 검색"""
    keywords = CONDITION_KEYWORDS.get(condition_key, ["맛집"])
    return await search_restaurants(location, keywords[0], condition_key, size=size)
