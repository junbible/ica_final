"""
컨디션 기반 메뉴 추천 API
실행: uvicorn api.main:app --reload
"""

import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

# =============================================
# FastAPI 앱 설정
# =============================================
app = FastAPI(
    title="🍽️ 컨디션 기반 메뉴 추천 API",
    description="오늘 컨디션에 맞는 강남역 맛집을 추천해드려요!",
    version="1.0.0"
)

# CORS 설정 (프론트엔드에서 접근 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8000", "https://nyam-production.up.railway.app"],  # 개발 중에는 모든 origin 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB 설정
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


def get_connection():
    """DB 연결"""
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


# =============================================
# 요청/응답 모델
# =============================================
class RecommendRequest(BaseModel):
    """추천 요청"""
    condition: str          # 메인 컨디션 (tired, hangover, stress, cold, hearty, light)
    detail: str             # 세부 옵션 (soup, meat, sweet 등)
    latitude: Optional[float] = 37.4979   # 위도 (기본: 강남역)
    longitude: Optional[float] = 127.0276  # 경도
    limit: Optional[int] = 5  # 추천 개수

class Restaurant(BaseModel):
    """가게 정보"""
    id: int
    name: str
    category: Optional[str]
    address: Optional[str]
    road_address: Optional[str]
    latitude: float
    longitude: float
    phone: Optional[str]
    rating: Optional[float]
    naver_map_url: Optional[str]
    distance_m: Optional[int]      # 거리 (미터)
    score: float                    # 추천 점수
    matched_keywords: List[str]     # 매칭된 키워드

class RecommendResponse(BaseModel):
    """추천 응답"""
    condition: str
    detail: str
    message: str
    recommendations: List[Restaurant]


# =============================================
# 컨디션별 메시지
# =============================================
CONDITION_MESSAGES = {
    ("tired", "soup"): "피곤할 때 뜨끈한 국물 한 그릇이 최고죠! 🍜",
    ("tired", "meat"): "기운 없을 땐 고기로 충전하세요! 🍖",
    ("tired", "sweet"): "달달한 보상 어떠세요? 🍰",
    ("tired", "light_recover"): "가볍게 회복하는 것도 좋아요! 🥗",
    ("hangover", "hot_soup"): "해장엔 뜨끈한 국물이 최고! 🍲",
    ("hangover", "cool"): "속이 안 좋을 땐 시원한 게 좋죠! 🍜",
    ("hangover", "mild"): "속 편한 음식으로 준비했어요! 🥣",
    ("hangover", "spicy_soup"): "얼큰하게 해장하세요! 🌶️",
    ("stress", "spicy"): "매운 걸로 스트레스 날려버려요! 🔥",
    ("stress", "sweet_stress"): "달달한 걸로 기분 전환! 🍫",
    ("stress", "meat_stress"): "고기 앞에서 스트레스는 없죠! 🥩",
    ("stress", "crispy"): "바삭한 튀김 어때요? 🍗",
    ("cold", "warm_soup"): "감기엔 따뜻한 국물이 약이에요! 🍲",
    ("cold", "soft"): "부드러운 음식으로 준비했어요! 🥣",
    ("cold", "vitamin"): "비타민 충전하세요! 🍊",
    ("cold", "healthy"): "몸보신 음식 추천해요! 🐔",
    ("hearty", "meat_hearty"): "푸짐한 고기로 든든하게! 🥩",
    ("hearty", "rice_soup"): "국밥 한 그릇이면 든든해요! 🍚",
    ("hearty", "noodle"): "면 요리로 든든하게! 🍝",
    ("hearty", "snack"): "분식으로 든든하게 채워요! 🍱",
    ("light", "salad"): "가볍게 샐러드 어때요? 🥗",
    ("light", "korean_light"): "담백한 한식 추천해요! 🥬",
    ("light", "simple"): "간단하게 한 끼! 🥪",
    ("light", "light_soup"): "맑은 국물로 가볍게! 🥣",
}


# =============================================
# API 엔드포인트
# =============================================

@app.get("/api")
def root():
    """API 상태 확인"""
    return {
        "status": "ok",
        "message": "🍽️ 컨디션 기반 메뉴 추천 API",
        "docs": "/docs"
    }


@app.get("/api/health")
def health_check():
    """헬스 체크"""
    try:
        conn = get_connection()
        conn.close()
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}


@app.post("/api/recommend", response_model=RecommendResponse)
def recommend(request: RecommendRequest):
    """
    🎯 컨디션 기반 맛집 추천 API
    
    - **condition**: 메인 컨디션 (tired, hangover, stress, cold, hearty, light)
    - **detail**: 세부 옵션 (soup, meat, sweet 등)
    - **latitude/longitude**: 사용자 위치 (기본: 강남역)
    - **limit**: 추천 개수 (기본: 5)
    """
    
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # 1. 컨디션에 매핑된 키워드 조회
        cur.execute("""
            SELECT target_keyword, weight
            FROM condition_rules
            WHERE condition_code = %s AND detail_code = %s
        """, (request.condition, request.detail))
        
        rules = cur.fetchall()
        
        if not rules:
            raise HTTPException(
                status_code=400,
                detail=f"알 수 없는 컨디션: {request.condition}/{request.detail}"
            )
        
        # 키워드 목록
        keywords = [r["target_keyword"] for r in rules]
        weights = {r["target_keyword"]: float(r["weight"]) for r in rules}
        
        # 2. 추천 점수 계산 쿼리
        # - 키워드 매칭 점수 + 거리 점수
        cur.execute("""
            WITH keyword_scores AS (
                SELECT 
                    r.id,
                    r.name,
                    r.category,
                    r.address,
                    r.road_address,
                    r.latitude,
                    r.longitude,
                    r.phone,
                    r.rating,
                    r.naver_map_url,
                    COALESCE(SUM(rk.count), 0) as keyword_count,
                    ARRAY_AGG(DISTINCT rk.keyword) FILTER (WHERE rk.keyword IS NOT NULL) as matched_keywords,
                    -- 거리 계산 (미터)
                    ROUND(
                        6371000 * acos(
                            cos(radians(%s)) * cos(radians(r.latitude)) *
                            cos(radians(r.longitude) - radians(%s)) +
                            sin(radians(%s)) * sin(radians(r.latitude))
                        )
                    )::int as distance_m
                FROM restaurants r
                LEFT JOIN restaurant_keywords rk 
                    ON r.id = rk.restaurant_id 
                    AND rk.keyword = ANY(%s)
                WHERE r.status = 'OPEN'
                GROUP BY r.id
            )
            SELECT 
                *,
                -- 최종 점수: 키워드 점수 + 평점 보너스 - 거리 패널티
                (keyword_count * 2 + COALESCE(rating, 0) * 10 - distance_m * 0.001) as score
            FROM keyword_scores
            WHERE keyword_count > 0 OR distance_m < 1500
            ORDER BY score DESC
            LIMIT %s
        """, (
            request.latitude,
            request.longitude,
            request.latitude,
            keywords,
            request.limit
        ))
        
        results = cur.fetchall()
        
        # 3. 응답 생성
        recommendations = []
        for row in results:
            recommendations.append(Restaurant(
                id=row["id"],
                name=row["name"],
                category=row["category"],
                address=row["address"],
                road_address=row["road_address"],
                latitude=float(row["latitude"]),
                longitude=float(row["longitude"]),
                phone=row["phone"],
                rating=float(row["rating"]) if row["rating"] else None,
                naver_map_url=row["naver_map_url"],
                distance_m=row["distance_m"],
                score=round(float(row["score"]), 2),
                matched_keywords=row["matched_keywords"] or []
            ))
        
        # 메시지
        message = CONDITION_MESSAGES.get(
            (request.condition, request.detail),
            "맛있는 식사 되세요! 🍽️"
        )
        
        return RecommendResponse(
            condition=request.condition,
            detail=request.detail,
            message=message,
            recommendations=recommendations
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


@app.get("/api/restaurants")
def get_restaurants(limit: int = 20):
    """전체 가게 목록 조회"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, name, category, address, rating, naver_map_url
            FROM restaurants
            WHERE status = 'OPEN'
            ORDER BY rating DESC NULLS LAST
            LIMIT %s
        """, (limit,))
        
        return {"restaurants": cur.fetchall()}
    finally:
        cur.close()
        conn.close()


@app.get("/api/conditions")
def get_conditions():
    """사용 가능한 컨디션 목록"""
    return {
        "conditions": [
            {
                "code": "tired",
                "label": "😫 피곤해요",
                "details": [
                    {"code": "soup", "label": "🍜 뜨끈한 국물"},
                    {"code": "meat", "label": "🍖 고기로 충전"},
                    {"code": "sweet", "label": "🍰 달달한 보상"},
                    {"code": "light_recover", "label": "🥗 가볍게 회복"},
                ]
            },
            {
                "code": "hangover",
                "label": "🍺 숙취있어요",
                "details": [
                    {"code": "hot_soup", "label": "🍲 뜨끈한 해장"},
                    {"code": "cool", "label": "🍜 시원한 것"},
                    {"code": "mild", "label": "🥣 속 편한 것"},
                    {"code": "spicy_soup", "label": "🌶️ 얼큰한 것"},
                ]
            },
            {
                "code": "stress",
                "label": "😤 스트레스",
                "details": [
                    {"code": "spicy", "label": "🔥 매운 걸로"},
                    {"code": "sweet_stress", "label": "🍫 달달한 걸로"},
                    {"code": "meat_stress", "label": "🥩 고기가 땡겨"},
                    {"code": "crispy", "label": "🍗 바삭한 걸로"},
                ]
            },
            {
                "code": "cold",
                "label": "🤧 감기기운",
                "details": [
                    {"code": "warm_soup", "label": "🍲 따뜻한 국물"},
                    {"code": "soft", "label": "🥣 부드러운 것"},
                    {"code": "vitamin", "label": "🍊 비타민 충전"},
                    {"code": "healthy", "label": "🐔 몸보신"},
                ]
            },
            {
                "code": "hearty",
                "label": "💪 든든하게",
                "details": [
                    {"code": "meat_hearty", "label": "🥩 고기"},
                    {"code": "rice_soup", "label": "🍚 밥 + 국"},
                    {"code": "noodle", "label": "🍝 면"},
                    {"code": "snack", "label": "🍱 분식"},
                ]
            },
            {
                "code": "light",
                "label": "🥗 가볍게",
                "details": [
                    {"code": "salad", "label": "🥗 샐러드"},
                    {"code": "korean_light", "label": "🥬 담백한 한식"},
                    {"code": "simple", "label": "🥪 간단히"},
                    {"code": "light_soup", "label": "🥣 국물 있게"},
                ]
            },
        ]
    }


# =============================================
# 실행
# =============================================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)