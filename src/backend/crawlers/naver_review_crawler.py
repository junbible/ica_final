"""
네이버 지도 리뷰 크롤러 (PC 버전)
가게명으로 검색 → 가게 클릭 → 리뷰 수집
실행: python crawlers/naver_review_crawler.py
"""

import os
import time
import urllib.parse
import psycopg2
from playwright.sync_api import sync_playwright
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


def get_connection():
    return psycopg2.connect(**DB_CONFIG)


def get_restaurants_to_crawl(limit=10):
    """리뷰 수집할 가게 목록 조회"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        # 아직 리뷰가 없는 가게
        cur.execute("""
            SELECT r.id, r.name
            FROM restaurants r
            LEFT JOIN reviews rv ON r.id = rv.restaurant_id
            WHERE rv.id IS NULL
            ORDER BY r.id
            LIMIT %s
        """, (limit,))
        
        return cur.fetchall()
    finally:
        cur.close()
        conn.close()


def save_reviews(restaurant_id, reviews):
    """리뷰 DB 저장"""
    conn = get_connection()
    cur = conn.cursor()
    
    saved_count = 0
    try:
        for review in reviews:
            content = review.get("content", "").strip()
            if not content or len(content) < 5:
                continue
                
            cur.execute("""
                INSERT INTO reviews (restaurant_id, content, rating, reviewer_name, is_processed)
                VALUES (%s, %s, %s, %s, FALSE)
            """, (
                restaurant_id,
                content,
                review.get("rating"),
                review.get("reviewer", "방문자"),
            ))
            saved_count += 1
        
        conn.commit()
        return saved_count
    except Exception as e:
        print(f"   ❌ 저장 실패: {e}")
        conn.rollback()
        return 0
    finally:
        cur.close()
        conn.close()


def crawl_reviews(page, restaurant_name, max_reviews=15):
    """
    네이버 지도 PC에서 리뷰 크롤링
    """
    reviews = []
    
    try:
        # 1. 네이버 지도 검색 (PC 버전)
        search_query = f"{restaurant_name} 강남"
        encoded_query = urllib.parse.quote(search_query)
        search_url = f"https://map.naver.com/p/search/{encoded_query}"
        
        print(f"   → 검색: {search_query}")
        page.goto(search_url, timeout=30000)
        time.sleep(3)
        
        # 2. 검색 결과에서 첫 번째 가게 클릭
        # iframe 안에 있을 수 있음
        try:
            # searchIframe 찾기
            search_iframe = page.frame_locator('#searchIframe')
            first_item = search_iframe.locator('li.VLTHu a.tzwk0, li.UEzoS a.tzwk0, a.place_bluelink').first
            
            if first_item.count() > 0:
                first_item.click()
                time.sleep(2)
            else:
                print(f"   → 검색 결과 없음 (iframe)")
                return []
        except Exception as e:
            print(f"   → iframe 접근 실패: {e}")
            # iframe 없이 직접 시도
            first_item = page.locator('a.place_bluelink, a.tzwk0').first
            if first_item.count() > 0:
                first_item.click()
                time.sleep(2)
            else:
                return []
        
        # 3. 가게 상세 페이지에서 리뷰 탭 클릭
        try:
            # entryIframe에서 리뷰 탭 찾기
            entry_iframe = page.frame_locator('#entryIframe')
            
            # 리뷰 탭 클릭
            review_tab = entry_iframe.locator('a:has-text("리뷰"), span:has-text("리뷰")').first
            if review_tab.count() > 0:
                review_tab.click()
                time.sleep(2)
            
            # 스크롤해서 더 많은 리뷰 로드
            for _ in range(3):
                entry_iframe.locator('body').evaluate("el => el.scrollBy(0, 500)")
                time.sleep(0.5)
            
            # 4. 리뷰 텍스트 추출
            # 여러 셀렉터 시도
            review_selectors = [
                'div.pui__vn15t2 a.pui__xtsQN-',
                'a.pui__xtsQN-',
                'div.pui__xtsQN-',
                'li.pui__X35jYm div.pui__vn15t2',
                'div.place_section_content span',
                'ul.place_apply_pui li',
            ]
            
            for selector in review_selectors:
                elements = entry_iframe.locator(selector).all()
                if elements:
                    print(f"   → 셀렉터 '{selector}' 로 {len(elements)}개 발견")
                    
                    for el in elements[:max_reviews]:
                        try:
                            text = el.inner_text()
                            # 필터링
                            if text and 10 < len(text) < 500:
                                skip_words = ['더보기', '접기', '신고', '도움이', '공유', '답글', '사진']
                                if not any(w in text for w in skip_words):
                                    reviews.append({
                                        "content": text.strip(),
                                        "reviewer": "방문자",
                                        "rating": None,
                                    })
                        except:
                            continue
                    
                    if reviews:
                        break
                        
        except Exception as e:
            print(f"   → 상세페이지 접근 실패: {e}")
        
        # 중복 제거
        seen = set()
        unique_reviews = []
        for r in reviews:
            if r["content"] not in seen:
                seen.add(r["content"])
                unique_reviews.append(r)
        
        return unique_reviews
        
    except Exception as e:
        print(f"   ⚠️ 크롤링 에러: {e}")
        return []


def run_crawler(limit=20, max_reviews_per_place=10):
    """크롤러 실행"""
    
    print("🚀 네이버 지도 리뷰 크롤링 시작!\n")
    
    # 크롤링할 가게 목록
    restaurants = get_restaurants_to_crawl(limit)
    print(f"📋 크롤링 대상: {len(restaurants)}개 가게\n")
    print("-" * 50)
    
    if not restaurants:
        print("❌ 크롤링할 가게가 없습니다.")
        return
    
    total_reviews = 0
    success_count = 0
    
    with sync_playwright() as p:
        # 브라우저 실행 (화면 보이게)
        browser = p.chromium.launch(headless=False)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900}
        )
        page = context.new_page()
        
        for i, (rest_id, name) in enumerate(restaurants, 1):
            print(f"\n[{i}/{len(restaurants)}] {name}")
            
            # 리뷰 크롤링
            reviews = crawl_reviews(page, name, max_reviews_per_place)
            
            if reviews:
                saved = save_reviews(rest_id, reviews)
                total_reviews += saved
                success_count += 1
                print(f"   ✅ {len(reviews)}개 리뷰 → {saved}개 저장")
            else:
                print(f"   ⚠️ 리뷰 수집 실패")
            
            # 차단 방지
            time.sleep(3)
        
        browser.close()
    
    print("\n" + "=" * 50)
    print(f"🎉 크롤링 완료!")
    print(f"   - 성공: {success_count}개 가게")
    print(f"   - 총 리뷰: {total_reviews}개")


def get_review_stats():
    """리뷰 통계 조회"""
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        cur.execute("SELECT COUNT(*) FROM reviews")
        total = cur.fetchone()[0]
        
        cur.execute("""
            SELECT r.name, COUNT(rv.id) as cnt
            FROM restaurants r
            JOIN reviews rv ON r.id = rv.restaurant_id
            GROUP BY r.id, r.name
            ORDER BY cnt DESC
            LIMIT 20
        """)
        top_restaurants = cur.fetchall()
        
        print(f"\n📊 리뷰 통계")
        print("-" * 30)
        print(f"총 리뷰 수: {total}개\n")
        
        if top_restaurants:
            print("리뷰 많은 가게 TOP 5:")
            for name, cnt in top_restaurants:
                print(f"  - {name}: {cnt}개")
    finally:
        cur.close()
        conn.close()


# =============================================
# 실행
# =============================================
if __name__ == "__main__":
    run_crawler(limit=20, max_reviews_per_place=10)
    get_review_stats()