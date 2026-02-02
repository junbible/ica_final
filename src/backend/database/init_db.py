"""
DB 설정 및 테이블 생성 스크립트
실행 방법: python database/init_db.py
"""

import os
import psycopg2
from dotenv import load_dotenv

# .env 파일에서 환경변수 불러오기
load_dotenv()

# =============================================
# DB 접속 정보 (환경변수에서 가져옴)
# =============================================
DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT"),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


def get_connection():
    """DB 연결 함수"""
    return psycopg2.connect(**DB_CONFIG)


def create_tables():
    """모든 테이블 생성"""
    
    # =============================================
    # 테이블 생성 SQL
    # =============================================
    sql = """
    -- =============================================
    -- 1. 회원 관련 테이블
    -- =============================================
    
    -- 사용자 기본 정보
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        nickname VARCHAR(50) NOT NULL,
        gender VARCHAR(10),
        age_group VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 사용자 선호도
    CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        food_types VARCHAR(100),
        spicy_level VARCHAR(20),
        dining_style VARCHAR(20),
        price_range VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id)
    );

    -- 세션 관리
    CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        session_token VARCHAR(100) NOT NULL UNIQUE,
        device_type VARCHAR(20),
        location_lat DECIMAL(10, 8),
        location_lng DECIMAL(11, 8),
        created_at TIMESTAMP DEFAULT NOW(),
        last_active_at TIMESTAMP DEFAULT NOW()
    );

    -- 사용 로그
    CREATE TABLE IF NOT EXISTS user_logs (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES user_sessions(id),
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        event_type VARCHAR(30) NOT NULL,
        condition VARCHAR(30),
        sub_option VARCHAR(30),
        recommended_ids INTEGER[],
        selected_id INTEGER,
        selected_rank INTEGER,
        latency_ms INTEGER,
        context JSONB,
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- =============================================
    -- 2. 가게/리뷰 관련 테이블
    -- =============================================
    
    -- 가게 기본 정보
    CREATE TABLE IF NOT EXISTS restaurants (
        id SERIAL PRIMARY KEY,
        naver_id VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(200) NOT NULL,
        category VARCHAR(100),
        address VARCHAR(500),
        road_address VARCHAR(500),
        latitude DECIMAL(10, 8) NOT NULL,
        longitude DECIMAL(11, 8) NOT NULL,
        phone VARCHAR(20),
        rating DECIMAL(2, 1),
        review_count INTEGER DEFAULT 0,
        naver_map_url VARCHAR(500),
        image_url VARCHAR(500),
        business_hours JSONB,
        status VARCHAR(20) DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 메뉴 정보
    CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        price INTEGER,
        description TEXT,
        is_popular BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- 리뷰 원본
    CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_date DATE,
        reviewer_name VARCHAR(100),
        visit_count INTEGER,
        is_processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
    );

    -- 가게별 키워드 통계
    CREATE TABLE IF NOT EXISTS restaurant_keywords (
        id SERIAL PRIMARY KEY,
        restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
        keyword VARCHAR(50) NOT NULL,
        count INTEGER DEFAULT 1,
        sentiment VARCHAR(20) DEFAULT 'positive',
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(restaurant_id, keyword)
    );

    -- =============================================
    -- 3. 추천 로직 테이블
    -- =============================================
    
    -- 컨디션-키워드 매핑 규칙
    CREATE TABLE IF NOT EXISTS condition_rules (
        id SERIAL PRIMARY KEY,
        condition_code VARCHAR(30) NOT NULL,
        detail_code VARCHAR(30) NOT NULL,
        target_keyword VARCHAR(50) NOT NULL,
        weight DECIMAL(3, 2) DEFAULT 1.0,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(condition_code, detail_code, target_keyword)
    );

    -- =============================================
    -- 4. 인덱스 생성
    -- =============================================
    
    -- users
    CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
    
    -- user_sessions
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
    
    -- user_logs
    CREATE INDEX IF NOT EXISTS idx_logs_session ON user_logs(session_id);
    CREATE INDEX IF NOT EXISTS idx_logs_event ON user_logs(event_type);
    CREATE INDEX IF NOT EXISTS idx_logs_created ON user_logs(created_at);
    
    -- restaurants
    CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants(category);
    CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
    
    -- menus
    CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON menus(restaurant_id);
    
    -- reviews
    CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_date ON reviews(review_date);
    
    -- restaurant_keywords
    CREATE INDEX IF NOT EXISTS idx_keywords_restaurant ON restaurant_keywords(restaurant_id);
    CREATE INDEX IF NOT EXISTS idx_keywords_keyword ON restaurant_keywords(keyword);
    
    -- condition_rules
    CREATE INDEX IF NOT EXISTS idx_rules_condition ON condition_rules(condition_code, detail_code);
    """
    
    # DB 연결 및 실행
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        cur.execute(sql)
        conn.commit()
        print("✅ 모든 테이블이 성공적으로 생성되었습니다!")
        
        # 생성된 테이블 확인
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cur.fetchall()
        
        print("\n📋 생성된 테이블 목록:")
        for table in tables:
            print(f"   - {table[0]}")
            
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()


def insert_condition_rules():
    """컨디션-키워드 매핑 초기 데이터 삽입"""
    
    rules = [
        # 피곤해요 (tired)
        ('tired', 'soup', '뜨끈', 1.2),
        ('tired', 'soup', '든든', 1.0),
        ('tired', 'soup', '진한', 1.0),
        ('tired', 'soup', '국물', 1.0),
        ('tired', 'meat', '푸짐', 1.2),
        ('tired', 'meat', '고소', 1.0),
        ('tired', 'meat', '육즙', 1.0),
        ('tired', 'sweet', '달달', 1.2),
        ('tired', 'sweet', '디저트', 1.0),
        ('tired', 'light_recover', '담백', 1.0),
        ('tired', 'light_recover', '건강', 1.0),
        
        # 숙취있어요 (hangover)
        ('hangover', 'hot_soup', '해장', 2.0),
        ('hangover', 'hot_soup', '속풀이', 1.5),
        ('hangover', 'hot_soup', '얼큰', 1.3),
        ('hangover', 'hot_soup', '뜨끈', 1.2),
        ('hangover', 'cool', '시원', 1.5),
        ('hangover', 'cool', '냉면', 1.2),
        ('hangover', 'mild', '부드러운', 1.2),
        ('hangover', 'mild', '속편한', 1.3),
        ('hangover', 'spicy_soup', '얼큰', 1.5),
        ('hangover', 'spicy_soup', '칼칼', 1.3),
        
        # 스트레스 (stress)
        ('stress', 'spicy', '맵다', 1.5),
        ('stress', 'spicy', '매운', 1.5),
        ('stress', 'spicy', '화끈', 1.2),
        ('stress', 'sweet_stress', '달달', 1.3),
        ('stress', 'sweet_stress', '달콤', 1.2),
        ('stress', 'meat_stress', '고기', 1.2),
        ('stress', 'meat_stress', '푸짐', 1.0),
        ('stress', 'crispy', '바삭', 1.3),
        ('stress', 'crispy', '튀김', 1.2),
        
        # 감기기운 (cold)
        ('cold', 'warm_soup', '따뜻', 1.3),
        ('cold', 'warm_soup', '뜨끈', 1.2),
        ('cold', 'warm_soup', '보양', 1.5),
        ('cold', 'soft', '부드러운', 1.2),
        ('cold', 'soft', '죽', 1.3),
        ('cold', 'vitamin', '건강', 1.2),
        ('cold', 'vitamin', '비타민', 1.3),
        ('cold', 'healthy', '보양', 1.5),
        ('cold', 'healthy', '기력', 1.3),
        
        # 든든하게 (hearty)
        ('hearty', 'meat_hearty', '푸짐', 1.3),
        ('hearty', 'meat_hearty', '고기', 1.2),
        ('hearty', 'meat_hearty', '든든', 1.2),
        ('hearty', 'rice_soup', '국밥', 1.3),
        ('hearty', 'rice_soup', '든든', 1.2),
        ('hearty', 'noodle', '면', 1.0),
        ('hearty', 'noodle', '푸짐', 1.2),
        ('hearty', 'snack', '분식', 1.0),
        ('hearty', 'snack', '가성비', 1.2),
        
        # 가볍게 (light)
        ('light', 'salad', '담백', 1.2),
        ('light', 'salad', '건강', 1.2),
        ('light', 'salad', '샐러드', 1.3),
        ('light', 'korean_light', '담백', 1.2),
        ('light', 'korean_light', '깔끔', 1.0),
        ('light', 'simple', '간단', 1.2),
        ('light', 'simple', '가벼운', 1.2),
        ('light', 'light_soup', '맑은', 1.2),
        ('light', 'light_soup', '깔끔', 1.0),
    ]
    
    conn = get_connection()
    cur = conn.cursor()
    
    try:
        for rule in rules:
            cur.execute("""
                INSERT INTO condition_rules (condition_code, detail_code, target_keyword, weight)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (condition_code, detail_code, target_keyword) DO NOTHING
            """, rule)
        
        conn.commit()
        print(f"\n✅ 컨디션-키워드 매핑 {len(rules)}개 삽입 완료!")
        
    except Exception as e:
        print(f"❌ 에러 발생: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()


# =============================================
# 실행
# =============================================
if __name__ == "__main__":
    print("🚀 DB 초기화 시작...\n")
    create_tables()
    insert_condition_rules()
    print("\n🎉 DB 초기화 완료!")