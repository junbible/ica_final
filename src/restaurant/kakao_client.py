"""카카오 로컬 API 공유 클라이언트"""

import os
import random
import httpx

KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
KAKAO_CATEGORY_URL = "https://dapi.kakao.com/v2/local/search/category.json"
KAKAO_COORD2REGION_URL = "https://dapi.kakao.com/v2/local/geo/coord2regioncode.json"

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


def _parse_place(place: dict) -> dict:
    """카카오 API 응답의 place를 통일된 형식으로 변환"""
    return {
        "id": place["id"],
        "name": place["place_name"],
        "category": place.get("category_name", "").split(" > ")[-1],
        "full_category": place.get("category_name", ""),
        "address": place.get("road_address_name") or place.get("address_name", ""),
        "phone": place.get("phone", ""),
        "place_url": place.get("place_url", ""),
        "lat": float(place["y"]),
        "lng": float(place["x"]),
        "distance": int(place.get("distance", 0)),
    }


def _get_mock_results(query: str = "", size: int = 5) -> list[dict]:
    """API 키 없을 때 목업 데이터 반환"""
    mock_data = [
        {"name": "강남 삼계탕", "category": "한식", "full_category": "음식점 > 한식 > 삼계탕", "address": "서울 강남구 테헤란로 123", "phone": "02-1234-5678", "lat": 37.4999, "lng": 127.0286},
        {"name": "역삼 국밥집", "category": "한식", "full_category": "음식점 > 한식 > 국밥", "address": "서울 강남구 역삼로 45", "phone": "02-2345-6789", "lat": 37.4989, "lng": 127.0316},
        {"name": "강남역 마라탕", "category": "중식", "full_category": "음식점 > 중식 > 마라탕", "address": "서울 강남구 강남대로 78", "phone": "02-3456-7890", "lat": 37.4969, "lng": 127.0256},
        {"name": "샐러드파티 강남점", "category": "샐러드", "full_category": "음식점 > 양식 > 샐러드", "address": "서울 강남구 봉은사로 12", "phone": "02-4567-8901", "lat": 37.5009, "lng": 127.0296},
        {"name": "스테이크 하우스", "category": "양식", "full_category": "음식점 > 양식 > 스테이크", "address": "서울 강남구 선릉로 99", "phone": "02-5678-9012", "lat": 37.5019, "lng": 127.0266},
        {"name": "홍대 치킨골목", "category": "치킨", "full_category": "음식점 > 치킨", "address": "서울 마포구 홍익로 10", "phone": "02-1111-2222", "lat": 37.5573, "lng": 126.9230},
        {"name": "상수 파스타", "category": "양식", "full_category": "음식점 > 양식 > 파스타", "address": "서울 마포구 상수동 123", "phone": "02-2222-3333", "lat": 37.5553, "lng": 126.9210},
        {"name": "연남동 포케", "category": "포케", "full_category": "음식점 > 양식 > 포케", "address": "서울 마포구 연남로 45", "phone": "02-3333-4444", "lat": 37.5583, "lng": 126.9240},
    ]

    # 검색어와 관련된 결과 필터링
    if query:
        filtered = [m for m in mock_data if query in m["name"] or query in m["category"]]
        if not filtered:
            filtered = mock_data
    else:
        filtered = mock_data

    results = []
    for i, mock in enumerate(filtered[:size]):
        results.append({
            "id": f"mock_{i}_{random.randint(1000, 9999)}",
            "name": mock["name"],
            "category": mock["category"],
            "full_category": mock["full_category"],
            "address": mock["address"],
            "phone": mock["phone"],
            "place_url": f"https://place.map.kakao.com/{i}",
            "lat": mock["lat"] + random.uniform(-0.002, 0.002),
            "lng": mock["lng"] + random.uniform(-0.002, 0.002),
            "distance": random.randint(50, 500),
        })

    results.sort(key=lambda x: x["distance"])
    return results


async def search_keyword(
    query: str,
    lat: float | None = None,
    lng: float | None = None,
    radius: int = 2000,
    page: int = 1,
    size: int = 15,
    category_code: str = "FD6",
) -> dict:
    """카카오 키워드 검색

    Returns:
        {"documents": [...], "meta": {"total_count": int, "is_end": bool}}
    """
    if not os.getenv("KAKAO_REST_API_KEY"):
        mocks = _get_mock_results(query, size)
        return {"documents": mocks, "meta": {"total_count": len(mocks), "is_end": True}}

    params: dict = {
        "query": query,
        "category_group_code": category_code,
        "sort": "accuracy",
        "page": page,
        "size": size,
    }
    if lat is not None and lng is not None:
        params["y"] = str(lat)
        params["x"] = str(lng)
        params["radius"] = radius

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                KAKAO_KEYWORD_URL,
                headers={"Authorization": f"KakaoAK {os.getenv('KAKAO_REST_API_KEY')}"},
                params=params,
            )
            if response.status_code == 200:
                data = response.json()
                documents = [_parse_place(p) for p in data.get("documents", [])]
                meta = data.get("meta", {})
                return {
                    "documents": documents,
                    "meta": {
                        "total_count": meta.get("total_count", len(documents)),
                        "is_end": meta.get("is_end", True),
                    },
                }
            else:
                print(f"Kakao keyword API error: {response.status_code}")
        except Exception as e:
            print(f"Kakao keyword API error: {e}")

    mocks = _get_mock_results(query, size)
    return {"documents": mocks, "meta": {"total_count": len(mocks), "is_end": True}}


async def search_nearby(
    lat: float,
    lng: float,
    radius: int = 2000,
    category_code: str = "FD6",
    page: int = 1,
    size: int = 15,
) -> dict:
    """카카오 카테고리 기반 주변 검색

    Returns:
        {"documents": [...], "meta": {"total_count": int, "is_end": bool}}
    """
    if not os.getenv("KAKAO_REST_API_KEY"):
        mocks = _get_mock_results("", size)
        return {"documents": mocks, "meta": {"total_count": len(mocks), "is_end": True}}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                KAKAO_CATEGORY_URL,
                headers={"Authorization": f"KakaoAK {os.getenv('KAKAO_REST_API_KEY')}"},
                params={
                    "category_group_code": category_code,
                    "y": str(lat),
                    "x": str(lng),
                    "radius": radius,
                    "sort": "distance",
                    "page": page,
                    "size": size,
                },
            )
            if response.status_code == 200:
                data = response.json()
                documents = [_parse_place(p) for p in data.get("documents", [])]
                meta = data.get("meta", {})
                return {
                    "documents": documents,
                    "meta": {
                        "total_count": meta.get("total_count", len(documents)),
                        "is_end": meta.get("is_end", True),
                    },
                }
            else:
                print(f"Kakao category API error: {response.status_code}")
        except Exception as e:
            print(f"Kakao category API error: {e}")

    mocks = _get_mock_results("", size)
    return {"documents": mocks, "meta": {"total_count": len(mocks), "is_end": True}}


async def coord2region(lat: float, lng: float) -> dict | None:
    """좌표 → 지역명 변환

    Returns:
        {"region_1depth": "서울특별시", "region_2depth": "강남구", "region_3depth": "역삼동", "display_name": "강남구 역삼동"}
    """
    def _mock_region(lat: float, lng: float) -> dict:
        """좌표로 대략적 지역 추정 (목업)"""
        for name, coords in LOCATION_COORDS.items():
            if abs(lat - coords["lat"]) < 0.02 and abs(lng - coords["lng"]) < 0.02:
                return {
                    "region_1depth": "서울특별시",
                    "region_2depth": f"{name}구",
                    "region_3depth": f"{name}동",
                    "display_name": f"{name}",
                }
        return {
            "region_1depth": "서울특별시",
            "region_2depth": "강남구",
            "region_3depth": "역삼동",
            "display_name": "강남구 역삼동",
        }

    if not os.getenv("KAKAO_REST_API_KEY"):
        return _mock_region(lat, lng)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                KAKAO_COORD2REGION_URL,
                headers={"Authorization": f"KakaoAK {os.getenv('KAKAO_REST_API_KEY')}"},
                params={"x": str(lng), "y": str(lat)},
            )
            if response.status_code == 200:
                data = response.json()
                documents = data.get("documents", [])
                region = None
                for doc in documents:
                    if doc.get("region_type") == "H":
                        region = doc
                        break
                if not region and documents:
                    region = documents[0]

                if region:
                    r1 = region.get("region_1depth_name", "")
                    r2 = region.get("region_2depth_name", "")
                    r3 = region.get("region_3depth_name", "")
                    return {
                        "region_1depth": r1,
                        "region_2depth": r2,
                        "region_3depth": r3,
                        "display_name": f"{r2} {r3}".strip(),
                    }
            else:
                print(f"Kakao coord2region API error: {response.status_code}")
        except Exception as e:
            print(f"Kakao coord2region API error: {e}")

    return _mock_region(lat, lng)
