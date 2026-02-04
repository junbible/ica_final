"""
리뷰에서 키워드 추출 → restaurant_keywords 테이블 업데이트
실행: python database/extract_keywords.py
"""

import os
import re
import psycopg2
from collections import Counter
from dotenv import load_dotenv

load_dotenv()

# DB 설정
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}

# 추출할 키워드 목록 (컨디션 매핑에 사용되는 키워드들)
TARGET_KEYWORDS = [
    # 맛 관련
    "맛있", "맛있는", "맛있어", "맛있다", "맵다", "매운", "매워", "매콤",
    "달다", "달달", "달콤", "짜다", "짠", "담백", "고소", "고소한",
    "시원", "시원한", "시원해", "얼큰", "얼큰한", "감칠맛", "깔끔", "깔끔한",
    
    # 양/가성비
    "푸짐", "푸짐한", "푸짐해", "양많", "양이많", "가성비", "든든", "든든한",
    "든든해", "배부른", "배불러", "넉넉", "넉넉한", "푸짐하고",
    
    # 상태/온도
    "뜨끈", "뜨끈한", "뜨끈해", "뜨거운", "따뜻", "따뜻한", "따뜻해",
    "진한", "진해", "걸쭉", "국물", "국물이",
    
    # 효과/상황
    "해장", "해장으로", "속풀이", "속이풀", "힘나", "힘이나", "보양", "기력",
    "회복", "든든하게", "속편", "속이편",
    
    # 식감
    "부드러", "부드러운", "바삭", "바삭한", "쫄깃", "쫄깃한", "촉촉", "아삭",
    "육즙", "녹아",
    
    # 분위기/서비스
    "친절", "친절한", "친절해", "깨끗", "깨끗한", "청결", "분위기", "혼밥",
    "조용", "조용한", "데이트", "가족", "회식",
    
    # 추천
    "추천", "재방문", "또올", "또 올", "단골", "최고", "맛집", "인정",
    
    # 음식 종류
    "고기", "삼겹살", "갈비", "국밥", "설렁탕", "곰탕", "순대", "순댓국",
    "찌개", "김치찌개", "된장", "떡볶이", "라면", "칼국수", "냉면",
    "삼계탕", "닭", "치킨", "튀김", "돈까스", "파스타", "스테이크",
    "샐러드", "죽", "디저트", "커피", "빵",
]


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def get_unprocessed_reviews():
    """아직 처리 안 된 리뷰 조회"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            SELECT id, restaurant_id, content
            FROM reviews
            WHERE is_processed = FALSE
        """)
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def extract_keywords_from_text(text):
    """텍스트에서 키워드 추출"""
    found_keywords = []
    text_lower = text.lower()
    
    for keyword in TARGET_KEYWORDS:
        if keyword in text_lower:
            # 정규화된 키워드로 변환
            normalized = normalize_keyword(keyword)
            if normalized:
                found_keywords.append(normalized)
    
    return found_keywords


def normalize_keyword(keyword):
    """키워드 정규화 (비슷한 표현 통일)"""
    mappings = {
        # 맛있다 계열
        "맛있": "맛있는", "맛있어": "맛있는", "맛있다": "맛있는",
        # 매운 계열
        "맵다": "매운", "매워": "매운", "매콤": "매운",
        # 달달 계열
        "달다": "달달", "달콤": "달달",
        # 시원 계열
        "시원해": "시원", "시원한": "시원",
        # 얼큰 계열
        "얼큰한": "얼큰",
        # 푸짐 계열
        "푸짐한": "푸짐", "푸짐해": "푸짐", "푸짐하고": "푸짐",
        "양많": "푸짐", "양이많": "푸짐",
        # 든든 계열
        "든든한": "든든", "든든해": "든든", "든든하게": "든든",
        "배부른": "든든", "배불러": "든든",
        # 뜨끈 계열
        "뜨끈한": "뜨끈", "뜨끈해": "뜨끈", "뜨거운": "뜨끈",
        "따뜻": "뜨끈", "따뜻한": "뜨끈", "따뜻해": "뜨끈",
        # 진한 계열
        "진해": "진한", "걸쭉": "진한",
        # 해장 계열
        "해장으로": "해장", "속풀이": "해장", "속이풀": "해장",
        # 부드러운 계열
        "부드러": "부드러운",
        # 바삭 계열
        "바삭한": "바삭",
        # 친절 계열
        "친절한": "친절", "친절해": "친절",
        # 깨끗 계열
        "깨끗한": "깨끗", "청결": "깨끗",
        # 담백 계열
        "담백한": "담백",
        # 고소 계열
        "고소한": "고소",
        # 깔끔 계열
        "깔끔한": "깔끔",
        # 추천 계열
        "재방문": "추천", "또올": "추천", "또 올": "추천",
        # 조용 계열
        "조용한": "조용",
        # 넉넉 계열
        "넉넉한": "넉넉",
        # 쫄깃 계열
        "쫄깃한": "쫄깃",
    }
    
    return mappings.get(keyword, keyword)


def update_restaurant_keywords(restaurant_id, keywords):
    """가게별 키워드 통계 업데이트"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        for keyword, count in keywords.items():
            cur.execute("""
                INSERT INTO restaurant_keywords (restaurant_id, keyword, count, sentiment)
                VALUES (%s, %s, %s, 'positive')
                ON CONFLICT (restaurant_id, keyword) DO UPDATE SET
                    count = restaurant_keywords.count + EXCLUDED.count,
                    updated_at = NOW()
            """, (restaurant_id, keyword, count))
        
        conn.commit()
    except Exception as e:
        print(f"   ❌ 키워드 저장 실패: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()


def mark_reviews_processed(review_ids):
    """리뷰 처리 완료 표시"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("""
            UPDATE reviews
            SET is_processed = TRUE
            WHERE id = ANY(%s)
        """, (review_ids,))
        conn.commit()
    finally:
        cur.close()
        conn.close()


def run_extraction():
    """키워드 추출 실행"""
    print("🚀 리뷰 키워드 추출 시작!\n")
    
    # 처리 안 된 리뷰 조회
    reviews = get_unprocessed_reviews()
    print(f"📋 처리할 리뷰: {len(reviews)}개\n")
    print("-" * 50)
    
    if not reviews:
        print("✅ 처리할 리뷰가 없습니다.")
        return
    
    # 가게별로 그룹핑
    restaurant_reviews = {}
    for review_id, restaurant_id, content in reviews:
        if restaurant_id not in restaurant_reviews:
            restaurant_reviews[restaurant_id] = []
        restaurant_reviews[restaurant_id].append((review_id, content))
    
    total_keywords = 0
    processed_reviews = []
    
    for restaurant_id, review_list in restaurant_reviews.items():
        # 가게의 모든 리뷰에서 키워드 추출
        all_keywords = []
        
        for review_id, content in review_list:
            keywords = extract_keywords_from_text(content)
            all_keywords.extend(keywords)
            processed_reviews.append(review_id)
        
        # 키워드 카운트
        keyword_counts = Counter(all_keywords)
        
        if keyword_counts:
            # DB 업데이트
            update_restaurant_keywords(restaurant_id, keyword_counts)
            total_keywords += len(keyword_counts)
            
            # 상위 키워드 출력
            top_keywords = keyword_counts.most_common(5)
            print(f"\n가게 ID {restaurant_id}: {len(review_list)}개 리뷰")
            print(f"   추출된 키워드: {', '.join([f'{k}({v})' for k, v in top_keywords])}")
    
    # 처리 완료 표시
    if processed_reviews:
        mark_reviews_processed(processed_reviews)
    
    print("\n" + "=" * 50)
    print(f"🎉 키워드 추출 완료!")
    print(f"   - 처리된 리뷰: {len(processed_reviews)}개")
    print(f"   - 추출된 키워드 종류: {total_keywords}개")


def get_keyword_stats():
    """키워드 통계 조회"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # 전체 키워드 통계
        cur.execute("""
            SELECT keyword, SUM(count) as total
            FROM restaurant_keywords
            GROUP BY keyword
            ORDER BY total DESC
            LIMIT 15
        """)
        top_keywords = cur.fetchall()
        
        print(f"\n📊 전체 키워드 통계 (상위 15개)")
        print("-" * 30)
        for keyword, total in top_keywords:
            bar = "█" * min(int(total / 2), 20)
            print(f"   {keyword:10} {bar} {total}")
            
    finally:
        cur.close()
        conn.close()


# =============================================
# 실행
# =============================================
if __name__ == "__main__":
    run_extraction()
    get_keyword_stats()