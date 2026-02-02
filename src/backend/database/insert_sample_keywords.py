"""
샘플 키워드 데이터 삽입
실제 리뷰 크롤링 전까지 테스트용으로 사용
실행: python database/insert_sample_keywords.py
"""

import os
import random
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

# 카테고리별 키워드 매핑
CATEGORY_KEYWORDS = {
    "한식": ["든든", "뜨끈", "국물", "진한", "푸짐", "가성비", "해장", "속풀이", "담백", "고소"],
    "음식점": ["맛있는", "푸짐", "가성비", "친절", "분위기", "깔끔", "든든", "추천"],
    "중식": ["푸짐", "짜장", "짬뽕", "탕수육", "가성비", "맛있는", "양많은"],
    "분식": ["떡볶이", "맛있는", "가성비", "푸짐", "매운", "달달"],
    "술집": ["분위기", "안주", "맛있는", "가성비", "친절"],
    "카페,디저트": ["달달", "디저트", "분위기", "예쁜", "맛있는", "커피"],
    "육류,고기요리": ["고기", "푸짐", "육즙", "맛있는", "가성비", "굽기"],
    "도시락,컵밥": ["가성비", "푸짐", "든든", "빠른", "간편"],
}

# 일반 키워드 (모든 가게에 랜덤 적용)
GENERAL_KEYWORDS = [
    "맛있는", "친절", "깔끔", "가성비", "푸짐", "추천", "재방문", "분위기"
]


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def insert_sample_keywords():
    """모든 가게에 샘플 키워드 삽입"""
    
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # 모든 가게 조회
        cur.execute("SELECT id, name, category FROM restaurants")
        restaurants = cur.fetchall()
        
        print(f"🚀 {len(restaurants)}개 가게에 키워드 삽입 시작...\n")
        
        total_keywords = 0
        
        for rest_id, name, category in restaurants:
            # 카테고리에 맞는 키워드 선택
            keywords_to_add = []
            
            # 카테고리별 키워드
            if category:
                main_category = category.split(">")[0].strip()
                if main_category in CATEGORY_KEYWORDS:
                    keywords_to_add.extend(CATEGORY_KEYWORDS[main_category])
            
            # 일반 키워드 추가
            keywords_to_add.extend(random.sample(GENERAL_KEYWORDS, 3))
            
            # 중복 제거
            keywords_to_add = list(set(keywords_to_add))
            
            # DB에 삽입
            for keyword in keywords_to_add:
                count = random.randint(5, 30)  # 랜덤 언급 횟수
                
                cur.execute("""
                    INSERT INTO restaurant_keywords (restaurant_id, keyword, count, sentiment)
                    VALUES (%s, %s, %s, 'positive')
                    ON CONFLICT (restaurant_id, keyword) DO UPDATE SET
                        count = EXCLUDED.count
                """, (rest_id, keyword, count))
                
                total_keywords += 1
        
        conn.commit()
        print(f"✅ 총 {total_keywords}개 키워드 삽입 완료!")
        
        # 통계 출력
        cur.execute("""
            SELECT keyword, SUM(count) as total
            FROM restaurant_keywords
            GROUP BY keyword
            ORDER BY total DESC
            LIMIT 10
        """)
        
        print("\n📊 키워드 통계 (상위 10개):")
        for keyword, total in cur.fetchall():
            print(f"   - {keyword}: {total}회")
            
    except Exception as e:
        print(f"❌ 에러: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    insert_sample_keywords()