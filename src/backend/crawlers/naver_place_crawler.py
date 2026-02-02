"""
네이버 Place API로 강남역 주변 식당 수집
실행 방법: python crawlers/naver_place_crawler.py
"""

import os
import re
import requests
import time
import psycopg2
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# =============================================
# 설정
# =============================================

# 네이버 API 키
NAVER_CLIENT_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_CLIENT_SECRET = os.getenv("NAVER_CLIENT_SECRET")

# DB 설정
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

# 검색할 키워드 목록 (강남역 기준)
SEARCH_KEYWORDS = [
    # 한식
    "강남역 국밥",
    "강남역 설렁탕",
    "강남역 삼계탕",
    "강남역 해장국",
    "강남역 순대국",
    "강남역 김치찌개",
    "강남역 된장찌개",
    "강남역 갈비탕",
    "강남역 곰탕",
    "강남역 육개장",
    "강남역 백반",
    "강남역 비빔밥",
    "강남역 불고기",
    "강남역 삼겹살",
    "강남역 갈비",
    "강남역 냉면",
    
    # 분식
    "강남역 떡볶이",
    "강남역 라면",
    "강남역 김밥",
    "강남역 칼국수",
    "강남역 우동",
    
    # 중식
    "강남역 짜장면",
    "강남역 짬뽕",
    "강남역 탕수육",
    "강남역 마라탕",
    
    # 일식
    "강남역 라멘",
    "강남역 초밥",
    "강남역 덮밥",
    "강남역 돈까스",
    
    # 양식
    "강남역 파스타",
    "강남역 스테이크",
    "강남역 햄버거",
    "강남역 피자",
    
    # 기타
    "강남역 치킨",
    "강남역 족발",
    "강남역 보쌈",
    "강남역 곱창",
    "강남역 샐러드",
    "강남역 포케",
    "강남역 샌드위치",
    "강남역 죽",
    "강남역 카페",
    "강남역 디저트",
]


def search_naver_local(query, display=5, start=1):
    """
    네이버 지역 검색 API 호출
    
    Args:
        query: 검색어 (예: "강남역 국밥")
        display: 한 번에 가져올 결과 수 (최대 5)
        start: 시작 위치
    
    Returns:
        검색 결과 리스트
    """
    url = "https://openapi.naver.com/v1/search/local.json"
    
    headers = {
        "X-Naver-Client-Id": NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": NAVER_CLIENT_SECRET,
    }
    
    params = {
        "query": query,
        "display": display,
        "start": start,
        "sort": "random",  # 랜덤 정렬로 다양한 결과
    }
    
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json().get("items", [])
    except Exception as e:
        print(f"   ❌ API 호출 실패: {e}")
        return []


def parse_coordinates(mapx, mapy):
    """
    네이버 좌표계를 위도/경도로 변환
    네이버 API는 카텍(KATEC) 좌표계 사용
    """
    # 네이버 API 좌표는 이미 경도/위도 형태로 제공됨 (10000000으로 나누기)
    try:
        longitude = float(mapx) / 10000000  # 경도
        latitude = float(mapy) / 10000000   # 위도
        return latitude, longitude
    except:
        return None, None


def extract_naver_id(link):
    """네이버 플레이스 URL에서 ID 추출"""
    # 예: https://map.naver.com/v5/search/.../place/1234567890
    if "place/" in link:
        return link.split("place/")[-1].split("?")[0]
    # 예: https://www.naver.com/place/1234567890
    elif "/place/" in link:
        return link.split("/place/")[-1].split("?")[0]
    else:
        # ID가 없으면 URL 해시로 대체
        return str(hash(link))[-10:]


def clean_html(text):
    """HTML 태그 제거"""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)


def save_restaurant(item):
    """
    가게 정보를 DB에 저장
    
    Args:
        item: 네이버 API 응답 아이템
    
    Returns:
        저장 성공 여부
    """
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    try:
        # 데이터 파싱
        naver_id = extract_naver_id(item.get("link", ""))
        name = clean_html(item.get("title", ""))
        category = item.get("category", "")
        address = item.get("address", "")
        road_address = item.get("roadAddress", "")
        latitude, longitude = parse_coordinates(
            item.get("mapx", 0), 
            item.get("mapy", 0)
        )
        phone = item.get("telephone", "")
        naver_map_url = item.get("link", "")
        
        # 좌표가 없으면 스킵
        if not latitude or not longitude:
            return False
        
        # DB 저장 (이미 있으면 업데이트)
        cur.execute("""
            INSERT INTO restaurants (
                naver_id, name, category, address, road_address,
                latitude, longitude, phone, naver_map_url, status
            ) VALUES (
                %s, %s, %s, %s, %s, %s, %s, %s, %s, 'OPEN'
            )
            ON CONFLICT (naver_id) DO UPDATE SET
                name = EXCLUDED.name,
                category = EXCLUDED.category,
                address = EXCLUDED.address,
                road_address = EXCLUDED.road_address,
                phone = EXCLUDED.phone,
                updated_at = NOW()
            RETURNING id
        """, (
            naver_id, name, category, address, road_address,
            latitude, longitude, phone, naver_map_url
        ))
        
        conn.commit()
        return True
        
    except Exception as e:
        print(f"   ❌ DB 저장 실패: {e}")
        conn.rollback()
        return False
    finally:
        cur.close()
        conn.close()


def crawl_all():
    """모든 키워드로 크롤링 실행"""
    
    print("🚀 강남역 맛집 크롤링 시작!\n")
    print(f"📋 검색 키워드: {len(SEARCH_KEYWORDS)}개")
    print("-" * 50)
    
    total_saved = 0
    total_found = 0
    
    for i, keyword in enumerate(SEARCH_KEYWORDS, 1):
        print(f"\n[{i}/{len(SEARCH_KEYWORDS)}] '{keyword}' 검색 중...")
        
        # API 호출 (최대 5개씩 2번 = 10개)
        items = []
        items.extend(search_naver_local(keyword, display=5, start=1))
        time.sleep(0.1)  # API 제한 방지
        items.extend(search_naver_local(keyword, display=5, start=6))
        
        total_found += len(items)
        
        # 저장
        saved_count = 0
        for item in items:
            if save_restaurant(item):
                saved_count += 1
        
        total_saved += saved_count
        print(f"   ✅ {len(items)}개 발견 → {saved_count}개 저장")
        
        # API 호출 제한 방지 (초당 10회 제한)
        time.sleep(0.2)
    
    print("\n" + "=" * 50)
    print(f"🎉 크롤링 완료!")
    print(f"   - 총 발견: {total_found}개")
    print(f"   - 총 저장: {total_saved}개 (중복 제외)")


def get_stats():
    """현재 DB 통계 조회"""
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    
    try:
        # 총 가게 수
        cur.execute("SELECT COUNT(*) FROM restaurants")
        total = cur.fetchone()[0]
        
        # 카테고리별 통계
        cur.execute("""
            SELECT 
                SPLIT_PART(category, '>', 1) as main_category,
                COUNT(*) as cnt
            FROM restaurants
            WHERE category IS NOT NULL AND category != ''
            GROUP BY main_category
            ORDER BY cnt DESC
            LIMIT 10
        """)
        categories = cur.fetchall()
        
        print("\n📊 현재 DB 통계")
        print("-" * 30)
        print(f"총 가게 수: {total}개\n")
        print("카테고리별:")
        for cat, cnt in categories:
            print(f"  - {cat}: {cnt}개")
            
    finally:
        cur.close()
        conn.close()


# =============================================
# 실행
# =============================================
if __name__ == "__main__":
    crawl_all()
    get_stats()