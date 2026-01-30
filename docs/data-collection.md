# 데이터 수집 방법

## 데이터 소스 개요

| 소스 | 수집 방법 | 데이터 | 우선순위 |
|------|----------|--------|:---:|
| Naver Place API | 공식 API | 가게 기본 정보, 위치, 영업시간 | 1 |
| 네이버 플레이스 | 크롤링 | 리뷰 텍스트, 별점, 방문자 리뷰 | 1 |
| Kakao Map API | 공식 API | 위치 검색, 길찾기 | 2 |
| 배달의민족/요기요 | 크롤링 | 배달 메뉴 리뷰 (선택) | 3 |

---

## 1. Naver Place API

### API 정보
- **문서**: https://developers.naver.com/docs/serviceapi/search/local/local.md
- **인증**: Client ID + Client Secret 필요
- **호출 제한**: 일 25,000회

### 수집 데이터
```json
{
  "title": "가게명",
  "link": "네이버 플레이스 URL",
  "category": "한식>국밥",
  "address": "서울시 강남구...",
  "roadAddress": "도로명 주소",
  "mapx": "경도",
  "mapy": "위도"
}
```

### 예시 코드
```python
import requests

def search_local(query, display=5):
    url = "https://openapi.naver.com/v1/search/local.json"
    headers = {
        "X-Naver-Client-Id": CLIENT_ID,
        "X-Naver-Client-Secret": CLIENT_SECRET
    }
    params = {
        "query": query,
        "display": display
    }
    response = requests.get(url, headers=headers, params=params)
    return response.json()

# 사용 예시
results = search_local("강남역 국밥")
```

---

## 2. 네이버 플레이스 리뷰 크롤링

### 크롤링 대상
- 방문자 리뷰 텍스트
- 별점
- 작성일
- 리뷰어 정보 (선택)

### 수집 데이터 형식
```json
{
  "place_id": "12345678",
  "place_name": "00국밥",
  "reviews": [
    {
      "text": "국물이 진하고 든든해요. 피곤할 때 먹으면 힘이 나요.",
      "rating": 5,
      "date": "2025-01-20",
      "visit_count": 3
    }
  ]
}
```

### 크롤링 코드 예시 (Playwright)
```python
from playwright.sync_api import sync_playwright

def crawl_reviews(place_url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(place_url)

        # 리뷰 탭 클릭
        page.click('a[href*="review"]')
        page.wait_for_timeout(2000)

        # 리뷰 수집
        reviews = page.query_selector_all('.review_item')

        results = []
        for review in reviews:
            text = review.query_selector('.review_text').inner_text()
            results.append({"text": text})

        browser.close()
        return results
```

### 주의사항
- robots.txt 확인 필요
- 과도한 요청 자제 (딜레이 설정)
- User-Agent 설정
- IP 차단 대비 (프록시 고려)

---

## 3. Kakao Map API

### API 정보
- **문서**: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- **인증**: REST API 키 필요

### 활용 방안
- 키워드로 장소 검색
- 카테고리별 장소 검색
- 좌표로 주소 변환

### 예시 코드
```python
import requests

def search_keyword(query, x=None, y=None):
    url = "https://dapi.kakao.com/v2/local/search/keyword.json"
    headers = {
        "Authorization": f"KakaoAK {REST_API_KEY}"
    }
    params = {
        "query": query
    }
    if x and y:
        params["x"] = x
        params["y"] = y
        params["radius"] = 3000  # 3km

    response = requests.get(url, headers=headers, params=params)
    return response.json()
```

---

## 4. 데이터 수집 파이프라인

### 전체 흐름
```
1. 지역 키워드 설정 (예: "강남역")
   │
2. Naver Place API로 가게 목록 수집
   │
3. 각 가게별 네이버 플레이스 URL 추출
   │
4. Playwright로 리뷰 크롤링
   │
5. 데이터 정제 및 저장
   │
6. NLP 처리 (키워드 추출)
```

### 수집 일정 (1주차)

| 일차 | 작업 |
|:---:|------|
| 1일 | API 키 발급, 환경 설정 |
| 2일 | Naver Place API 연동, 가게 목록 수집 |
| 3일 | 크롤링 스크립트 개발 |
| 4일 | 리뷰 데이터 수집 (지역 1개) |
| 5일 | 데이터 정제, DB 저장 |

---

## 5. 데이터 스키마

### 가게 테이블 (restaurants)
```sql
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    naver_id VARCHAR(50) UNIQUE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    address VARCHAR(500),
    road_address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    business_hours JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 메뉴 테이블 (menus)
```sql
CREATE TABLE menus (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    name VARCHAR(200) NOT NULL,
    price INTEGER,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 리뷰 테이블 (reviews)
```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    content TEXT NOT NULL,
    rating INTEGER,
    review_date DATE,
    keywords JSONB,  -- 추출된 키워드
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 키워드 태그 테이블 (keyword_tags)
```sql
CREATE TABLE keyword_tags (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER REFERENCES restaurants(id),
    keyword VARCHAR(50) NOT NULL,
    count INTEGER DEFAULT 1,
    sentiment VARCHAR(20),  -- positive, negative, neutral
    UNIQUE(restaurant_id, keyword)
);
```

---

## 6. MVP 수집 범위

### 지역
- 1순위: 강남역 / 홍대입구역
- 2순위: 확장 시 추가

### 카테고리
| 카테고리 | 예시 |
|----------|------|
| 한식 | 국밥, 찌개, 백반 |
| 분식 | 떡볶이, 라면 |
| 중식 | 짜장면, 짬뽕 |
| 일식 | 라멘, 덮밥 |
| 양식 | 파스타, 스테이크 |
| 치킨 | 치킨 |
| 카페 | 카페, 디저트 |
| 술집 | 호프, 포장마차 |

### 목표 데이터량
- 가게: 500개 이상
- 리뷰: 가게당 평균 30개 → 총 15,000개 이상
