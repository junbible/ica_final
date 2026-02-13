"""맛집 API 요청/응답 스키마"""

from pydantic import BaseModel


class KakaoRestaurant(BaseModel):
    """카카오 API 기반 맛집 정보"""
    id: str                # 카카오 place_id
    name: str
    category: str          # 마지막 카테고리 (예: "한식")
    full_category: str     # 전체 카테고리 (예: "음식점 > 한식 > 삼계탕")
    address: str
    phone: str
    place_url: str         # 카카오맵 상세 페이지 링크
    image_url: str = ""    # 카카오 플레이스 대표 이미지
    lat: float
    lng: float
    distance: int


class SearchResponse(BaseModel):
    """검색 응답"""
    restaurants: list[KakaoRestaurant]
    total_count: int
    is_end: bool


class ReviewPhoto(BaseModel):
    """리뷰 사진"""
    url: str


class Review(BaseModel):
    """카카오 플레이스 리뷰"""
    username: str          # 마스킹된 이름
    point: int             # 별점 (1-5)
    date: str              # 날짜
    contents: str          # 리뷰 내용
    photos: list[str] = [] # 사진 URL 리스트


class ReviewResponse(BaseModel):
    """리뷰 응답"""
    reviews: list[Review]
    total_count: int
    avg_score: float


class RegionInfo(BaseModel):
    """좌표 → 지역 정보"""
    region_1depth: str     # "서울특별시"
    region_2depth: str     # "강남구"
    region_3depth: str     # "역삼동"
    display_name: str      # "강남구 역삼동"
