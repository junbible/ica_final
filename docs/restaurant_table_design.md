# 🏪 가게/리뷰/추천 테이블 설계서

> 컨디션 기반 메뉴 추천 서비스 - 데이터 수집 및 추천 로직용 DB 설계

---

## 📋 테이블 개요

| 테이블명 | 설명 | 주요 용도 | 데이터 소스 | 예상 레코드 |
|----------|------|----------|-------------|-------------|
| `restaurants` | 가게 기본 정보 | 추천 결과 표시 | 네이버 Place API | 500+ (MVP) |
| `menus` | 메뉴 정보 | 가게별 대표 메뉴 | 크롤링 | 2,000+ |
| `reviews` | 리뷰 원본 데이터 | NLP 분석 원본 | 네이버 플레이스 크롤링 | 15,000+ |
| `restaurant_keywords` | 가게별 키워드 통계 | 추천 점수 계산 | NLP 분석 결과 | 5,000+ |
| `condition_rules` | 컨디션-키워드 매핑 | 추천 알고리즘 | 기획 정의 | 50~100 |

---

## 📐 ERD 관계도

```
┌─────────────────────┐
│    restaurants      │
├─────────────────────┤
│ id (PK)             │──┬──1:N──→ menus
│ naver_id            │  │
│ name                │  ├──1:N──→ reviews
│ category            │  │
│ address             │  └──1:N──→ restaurant_keywords
│ latitude/longitude  │
│ rating              │
│ status              │
└─────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│      reviews        │       │ restaurant_keywords │
├─────────────────────┤       ├─────────────────────┤
│ id (PK)             │       │ restaurant_id (FK)  │
│ restaurant_id (FK)  │       │ keyword             │
│ content             │──NLP──│ count               │
│ rating              │ 분석  │ sentiment           │
│ review_date         │       │                     │
└─────────────────────┘       └─────────────────────┘

┌─────────────────────┐
│   condition_rules   │
├─────────────────────┤
│ condition_code      │  ← 와이어프레임 컨디션 (tired, hangover...)
│ detail_code         │  ← 세부 옵션 (soup, meat...)
│ target_keyword      │  ← 검색할 키워드 (해장, 뜨끈...)
│ weight              │  ← 가중치
└─────────────────────┘
```

---

## 1️⃣ restaurants 테이블

> 가게 기본 정보 - 네이버 Place API + 크롤링 데이터

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 데이터 소스 |
|--------|-------------|------|--------|------|-------------|
| `id` | SERIAL | NOT NULL | AUTO | 가게 고유 ID (PK) | - |
| `naver_id` | VARCHAR(50) | NOT NULL | - | 네이버 플레이스 ID | Place API |
| `name` | VARCHAR(200) | NOT NULL | - | 가게명 | Place API |
| `category` | VARCHAR(100) | NULL | NULL | 카테고리 | Place API |
| `address` | VARCHAR(500) | NULL | NULL | 지번 주소 | Place API |
| `road_address` | VARCHAR(500) | NULL | NULL | 도로명 주소 | Place API |
| `latitude` | DECIMAL(10,8) | NOT NULL | - | 위도 | Place API |
| `longitude` | DECIMAL(11,8) | NOT NULL | - | 경도 | Place API |
| `phone` | VARCHAR(20) | NULL | NULL | 전화번호 | 크롤링 |
| `rating` | DECIMAL(2,1) | NULL | NULL | 평균 평점 (0.0~5.0) | 크롤링 |
| `review_count` | INTEGER | NULL | 0 | 리뷰 수 | 크롤링 |
| `naver_map_url` | VARCHAR(500) | NULL | NULL | 네이버 지도 URL | Place API |
| `image_url` | VARCHAR(500) | NULL | NULL | 대표 이미지 URL | 크롤링 |
| `business_hours` | JSONB | NULL | NULL | 영업시간 | 크롤링 |
| `status` | VARCHAR(20) | NOT NULL | OPEN | 영업 상태 | 크롤링 |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 등록일 | - |
| `updated_at` | TIMESTAMP | NOT NULL | NOW() | 수정일 | - |

### SQL

```sql
CREATE TABLE restaurants (
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

-- 인덱스 (위치 기반 검색용)
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_category ON restaurants(category);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_naver_id ON restaurants(naver_id);
```

### 예시 데이터

| id | naver_id | name | category | rating | status |
|----|----------|------|----------|--------|--------|
| 1 | 1234567890 | 신선설농탕 강남점 | 한식>설렁탕 | 4.5 | OPEN |
| 2 | 1234567891 | 하동관 강남 | 한식>곰탕 | 4.3 | OPEN |

### business_hours JSONB 예시

```json
{
  "mon": "09:00-21:00",
  "tue": "09:00-21:00",
  "wed": "09:00-21:00",
  "thu": "09:00-21:00",
  "fri": "09:00-22:00",
  "sat": "10:00-22:00",
  "sun": "휴무"
}
```

---

## 2️⃣ menus 테이블

> 가게별 메뉴 정보

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 데이터 소스 |
|--------|-------------|------|--------|------|-------------|
| `id` | SERIAL | NOT NULL | AUTO | 메뉴 고유 ID (PK) | - |
| `restaurant_id` | INTEGER | NOT NULL | - | 가게 ID (FK) | - |
| `name` | VARCHAR(200) | NOT NULL | - | 메뉴명 | 크롤링 |
| `price` | INTEGER | NULL | NULL | 가격 (원) | 크롤링 |
| `description` | TEXT | NULL | NULL | 메뉴 설명 | 크롤링 |
| `is_popular` | BOOLEAN | NOT NULL | FALSE | 인기 메뉴 여부 | 크롤링 |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 등록일 | - |

### SQL

```sql
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    price INTEGER,
    description TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);
```

### 예시 데이터

| id | restaurant_id | name | price | is_popular |
|----|---------------|------|-------|------------|
| 1 | 1 | 설렁탕 | 9000 | true |
| 2 | 1 | 도가니탕 | 13000 | false |
| 3 | 1 | 수육 (대) | 35000 | true |

---

## 3️⃣ reviews 테이블

> 리뷰 원본 데이터 - NLP 분석 전 원본 저장

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 데이터 소스 |
|--------|-------------|------|--------|------|-------------|
| `id` | SERIAL | NOT NULL | AUTO | 리뷰 고유 ID (PK) | - |
| `restaurant_id` | INTEGER | NOT NULL | - | 가게 ID (FK) | - |
| `content` | TEXT | NOT NULL | - | 리뷰 텍스트 | 크롤링 |
| `rating` | INTEGER | NULL | NULL | 별점 (1~5) | 크롤링 |
| `review_date` | DATE | NULL | NULL | 리뷰 작성일 | 크롤링 |
| `reviewer_name` | VARCHAR(100) | NULL | NULL | 작성자 (익명처리) | 크롤링 |
| `visit_count` | INTEGER | NULL | NULL | 방문 횟수 | 크롤링 |
| `is_processed` | BOOLEAN | NOT NULL | FALSE | NLP 처리 완료 여부 | 배치 처리 |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 수집일 | - |

### SQL

```sql
CREATE TABLE reviews (
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

-- 인덱스
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_processed ON reviews(is_processed) WHERE is_processed = FALSE;
CREATE INDEX idx_reviews_date ON reviews(review_date);
```

### 예시 데이터

| id | restaurant_id | content | rating | is_processed |
|----|---------------|---------|--------|--------------|
| 1 | 1 | 국물이 진하고 정말 든든해요. 피곤할 때 먹으면 힘이 나요. | 5 | true |
| 2 | 1 | 고기가 푸짐하고 가성비 좋아요 | 4 | true |
| 3 | 2 | 해장으로 최고입니다. 속이 확 풀려요 | 5 | false |

---

## 4️⃣ restaurant_keywords 테이블

> 가게별 키워드 통계 - NLP 분석 결과 집계

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 용도 |
|--------|-------------|------|--------|------|------|
| `id` | SERIAL | NOT NULL | AUTO | 고유 ID (PK) | - |
| `restaurant_id` | INTEGER | NOT NULL | - | 가게 ID (FK) | 가게 연결 |
| `keyword` | VARCHAR(50) | NOT NULL | - | 추출된 키워드 | 추천 매칭 |
| `count` | INTEGER | NOT NULL | 1 | 언급 횟수 | 점수 계산 |
| `sentiment` | VARCHAR(20) | NULL | positive | 감성 분류 | 필터링 |
| `updated_at` | TIMESTAMP | NOT NULL | NOW() | 마지막 업데이트 | 배치 관리 |

### 추출 대상 키워드 예시

| 카테고리 | 키워드 예시 |
|----------|------------|
| 맛 | 맵다, 달다, 짜다, 담백, 고소, 시원, 얼큰, 감칠맛 |
| 양 | 푸짐, 양많은, 가성비, 든든, 배부른, 넉넉 |
| 식감 | 부드러운, 바삭, 쫄깃, 촉촉, 아삭 |
| 상태 | 뜨끈, 따뜻, 시원, 차가운, 뜨거운 |
| 효과 | 해장, 힘나는, 회복, 보양, 속풀이, 기력 |
| 분위기 | 조용, 혼밥, 데이트, 가족, 회식 |

### SQL

```sql
CREATE TABLE restaurant_keywords (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    keyword VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 1,
    sentiment VARCHAR(20) DEFAULT 'positive',
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(restaurant_id, keyword)
);

-- 인덱스 (추천 검색용)
CREATE INDEX idx_keywords_restaurant ON restaurant_keywords(restaurant_id);
CREATE INDEX idx_keywords_keyword ON restaurant_keywords(keyword);
CREATE INDEX idx_keywords_count ON restaurant_keywords(count DESC);
```

### 예시 데이터

| id | restaurant_id | keyword | count | sentiment |
|----|---------------|---------|-------|-----------|
| 1 | 1 | 든든 | 25 | positive |
| 2 | 1 | 뜨끈 | 18 | positive |
| 3 | 1 | 진한 | 15 | positive |
| 4 | 2 | 해장 | 32 | positive |
| 5 | 2 | 속풀이 | 20 | positive |

---

## 5️⃣ condition_rules 테이블

> 컨디션-키워드 매핑 규칙 - 추천 알고리즘 핵심

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 와이어프레임 매핑 |
|--------|-------------|------|--------|------|-------------------|
| `id` | SERIAL | NOT NULL | AUTO | 규칙 고유 ID (PK) | - |
| `condition_code` | VARCHAR(30) | NOT NULL | - | 메인 컨디션 코드 | 1단계 선택 |
| `detail_code` | VARCHAR(30) | NOT NULL | - | 세부 옵션 코드 | 2단계 선택 |
| `target_keyword` | VARCHAR(50) | NOT NULL | - | 매칭할 키워드 | 검색 대상 |
| `weight` | DECIMAL(3,2) | NOT NULL | 1.0 | 가중치 | 점수 계산 |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 생성일 | - |

### 컨디션/세부옵션 코드 정의

#### 메인 컨디션 (6개)

| 코드 | 화면 표시 |
|------|-----------|
| `tired` | 😫 피곤해요 |
| `hangover` | 🍺 숙취있어요 |
| `stress` | 😤 스트레스 |
| `cold` | 🤧 감기기운 |
| `hearty` | 💪 든든하게 |
| `light` | 🥗 가볍게 |

#### 세부 옵션 (컨디션별)

| 컨디션 | 코드 | 화면 표시 |
|--------|------|-----------|
| tired | `meat` | 🍖 고기로 충전 |
| tired | `soup` | 🍜 뜨끈한 국물 |
| tired | `sweet` | 🍰 달달한 보상 |
| tired | `light_recover` | 🥗 가볍게 회복 |
| hangover | `hot_soup` | 🍲 뜨끈한 해장 |
| hangover | `cool` | 🍜 시원한 것 |
| hangover | `mild` | 🥣 속 편한 것 |
| hangover | `spicy_soup` | 🌶️ 얼큰한 것 |
| stress | `spicy` | 🔥 매운 걸로 |
| stress | `sweet_stress` | 🍫 달달한 걸로 |
| stress | `meat_stress` | 🥩 고기가 땡겨 |
| stress | `crispy` | 🍗 바삭한 걸로 |
| light | `salad` | 🥗 샐러드 |
| light | `korean_light` | 🥬 담백한 한식 |
| light | `simple` | 🥪 간단히 |
| light | `light_soup` | 🥣 국물 있게 |

### 매핑 데이터 예시

| condition_code | detail_code | target_keyword | weight | 설명 |
|----------------|-------------|----------------|--------|------|
| tired | soup | 뜨끈 | 1.2 | 피곤 + 국물 → 뜨끈한 |
| tired | soup | 든든 | 1.0 | 피곤 + 국물 → 든든한 |
| tired | soup | 진한 | 1.0 | 피곤 + 국물 → 진한 국물 |
| tired | meat | 푸짐 | 1.2 | 피곤 + 고기 → 푸짐한 |
| hangover | hot_soup | 해장 | 2.0 | 숙취 + 해장 (최고 가중치) |
| hangover | hot_soup | 속풀이 | 1.5 | 숙취 + 해장 → 속풀이 |
| hangover | hot_soup | 얼큰 | 1.3 | 숙취 + 해장 → 얼큰한 |
| stress | spicy | 맵다 | 1.5 | 스트레스 + 매운것 |
| stress | sweet_stress | 달달 | 1.3 | 스트레스 + 달달 |
| light | salad | 담백 | 1.2 | 가볍게 + 샐러드 |

### SQL

```sql
CREATE TABLE condition_rules (
    id SERIAL PRIMARY KEY,
    condition_code VARCHAR(30) NOT NULL,
    detail_code VARCHAR(30) NOT NULL,
    target_keyword VARCHAR(50) NOT NULL,
    weight DECIMAL(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(condition_code, detail_code, target_keyword)
);

CREATE INDEX idx_rules_condition ON condition_rules(condition_code, detail_code);
```

---

## 🎯 추천 알고리즘 흐름

```
1. 사용자가 "피곤해요 → 뜨끈한 국물" 선택
   │
2. condition_rules에서 매핑 조회
   SELECT target_keyword, weight 
   FROM condition_rules 
   WHERE condition_code = 'tired' AND detail_code = 'soup'
   │
   → 결과: [뜨끈(1.2), 든든(1.0), 진한(1.0)]
   │
3. restaurant_keywords에서 점수 계산
   SELECT r.*, 
          SUM(rk.count * cr.weight) + (r.rating * 10) AS score
   FROM restaurants r
   JOIN restaurant_keywords rk ON r.id = rk.restaurant_id
   JOIN condition_rules cr ON rk.keyword = cr.target_keyword
   WHERE cr.condition_code = 'tired' AND cr.detail_code = 'soup'
     AND r.status = 'OPEN'
     AND [위치 필터]
   GROUP BY r.id
   ORDER BY score DESC
   LIMIT 5
   │
4. 상위 5개 가게 반환
```

---

## 📝 전체 SQL (복사용)

```sql
-- =============================================
-- 컨디션 기반 메뉴 추천 서비스 - 가게/리뷰/추천 테이블
-- PostgreSQL 기준
-- =============================================

-- 1. 가게 기본 정보
CREATE TABLE restaurants (
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

-- 2. 메뉴 정보
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    price INTEGER,
    description TEXT,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. 리뷰 원본
CREATE TABLE reviews (
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

-- 4. 가게별 키워드 통계
CREATE TABLE restaurant_keywords (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    keyword VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 1,
    sentiment VARCHAR(20) DEFAULT 'positive',
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(restaurant_id, keyword)
);

-- 5. 컨디션-키워드 매핑 규칙
CREATE TABLE condition_rules (
    id SERIAL PRIMARY KEY,
    condition_code VARCHAR(30) NOT NULL,
    detail_code VARCHAR(30) NOT NULL,
    target_keyword VARCHAR(50) NOT NULL,
    weight DECIMAL(3, 2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(condition_code, detail_code, target_keyword)
);

-- =============================================
-- 인덱스
-- =============================================

-- restaurants
CREATE INDEX idx_restaurants_location ON restaurants(latitude, longitude);
CREATE INDEX idx_restaurants_category ON restaurants(category);
CREATE INDEX idx_restaurants_status ON restaurants(status);
CREATE INDEX idx_restaurants_naver_id ON restaurants(naver_id);

-- menus
CREATE INDEX idx_menus_restaurant ON menus(restaurant_id);

-- reviews
CREATE INDEX idx_reviews_restaurant ON reviews(restaurant_id);
CREATE INDEX idx_reviews_processed ON reviews(is_processed) WHERE is_processed = FALSE;
CREATE INDEX idx_reviews_date ON reviews(review_date);

-- restaurant_keywords
CREATE INDEX idx_keywords_restaurant ON restaurant_keywords(restaurant_id);
CREATE INDEX idx_keywords_keyword ON restaurant_keywords(keyword);
CREATE INDEX idx_keywords_count ON restaurant_keywords(count DESC);

-- condition_rules
CREATE INDEX idx_rules_condition ON condition_rules(condition_code, detail_code);
```

---

## 테이블 생성 순서

FK 의존성을 고려한 생성 순서:

```
1. restaurants (독립)
2. menus (restaurants 참조)
3. reviews (restaurants 참조)
4. restaurant_keywords (restaurants 참조)
5. condition_rules (독립)
```
