# 👤 회원 테이블 설계서

> 컨디션 기반 메뉴 추천 서비스 - 회원 관련 DB 설계

---

## 📋 테이블 개요

| 테이블명 | 설명 | 주요 용도 | 예상 레코드 |
|----------|------|----------|-------------|
| `users` | 사용자 기본 정보 | 회원가입 시 저장 | 1,000+ (MVP) |
| `user_preferences` | 사용자 선호도 | 선호도 설문 응답 저장 | 1,000+ |
| `user_sessions` | 세션 관리 | 비로그인 사용자 추적 | 10,000+ |
| `user_logs` | 사용 로그 | 컨디션 선택/추천 클릭 기록 | 50,000+ |

---

## 📐 ERD 관계도

```
┌─────────────────┐       ┌─────────────────────┐
│     users       │       │   user_preferences  │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │──1:1──│ user_id (FK)        │
│ nickname        │       │ food_types          │
│ gender          │       │ spicy_level         │
│ age_group       │       │ dining_style        │
│ created_at      │       │ price_range         │
└────────┬────────┘       └─────────────────────┘
         │
         │ 1:N (nullable)
         ▼
┌─────────────────┐       ┌─────────────────────┐
│  user_sessions  │       │     user_logs       │
├─────────────────┤       ├─────────────────────┤
│ id (PK)         │──1:N──│ session_id (FK)     │
│ user_id (FK)    │       │ user_id (FK)        │
│ session_token   │       │ condition           │
│ location        │       │ sub_option          │
│ created_at      │       │ recommended_ids     │
└─────────────────┘       │ selected_id         │
                          └─────────────────────┘
```

---

## 1️⃣ users 테이블

> 사용자 기본 정보 저장 (회원가입 화면 기준)

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 와이어프레임 매핑 |
|--------|-------------|------|--------|------|-------------------|
| `id` | SERIAL | NOT NULL | AUTO | 사용자 고유 ID (PK) | - |
| `nickname` | VARCHAR(50) | NOT NULL | - | 닉네임 | 회원가입 > 닉네임 입력 |
| `gender` | VARCHAR(10) | NULL | NULL | 성별 | 회원가입 > 성별 선택 |
| `age_group` | VARCHAR(10) | NULL | NULL | 나이대 | 회원가입 > 나이대 선택 |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 가입일시 | - |
| `updated_at` | TIMESTAMP | NOT NULL | NOW() | 수정일시 | - |

### SQL

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    age_group VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_created_at ON users(created_at);
```

### 예시 데이터

| id | nickname | gender | age_group | created_at |
|----|----------|--------|-----------|------------|
| 1 | 점심러버 | male | 20s | 2026-01-30 12:00:00 |
| 2 | 맛집헌터 | female | 30s | 2026-01-30 13:00:00 |
| 3 | 혼밥왕 | NULL | 20s | 2026-01-30 14:00:00 |

---

## 2️⃣ user_preferences 테이블

> 사용자 선호도 설문 응답 저장 (선호도 설문 화면 기준)

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 와이어프레임 매핑 |
|--------|-------------|------|--------|------|-------------------|
| `id` | SERIAL | NOT NULL | AUTO | 고유 ID (PK) | - |
| `user_id` | INTEGER | NOT NULL | - | 사용자 ID (FK) | - |
| `food_types` | VARCHAR(100) | NULL | NULL | 선호 음식 종류 (복수) | Q1. 어떤 음식을 좋아하세요? |
| `spicy_level` | VARCHAR(20) | NULL | NULL | 매운 음식 선호도 | Q2. 매운 음식은요? |
| `dining_style` | VARCHAR(20) | NULL | NULL | 식사 스타일 | Q3. 어떻게 식사하세요? |
| `price_range` | VARCHAR(20) | NULL | NULL | 선호 가격대 | Q4. 선호 가격대는요? |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 생성일시 | - |
| `updated_at` | TIMESTAMP | NOT NULL | NOW() | 수정일시 | - |

### 선호도 옵션 값 정의

| 컬럼 | 옵션 코드 | 화면 표시 |
|------|-----------|-----------|
| food_types | `korean` | 🍚 한식 |
| food_types | `chinese` | 🥟 중식 |
| food_types | `japanese` | 🍣 일식 |
| food_types | `western` | 🍝 양식 |
| food_types | `snack` | 🍱 분식 |
| spicy_level | `none` | 🙅 못 먹어요 |
| spicy_level | `medium` | 😐 보통이요 |
| spicy_level | `love` | 🔥 좋아해요 |
| dining_style | `solo` | 🧑 혼밥 많아요 |
| dining_style | `together` | 👥 같이 먹어요 |
| price_range | `under_10k` | 💰 1만원 이하 |
| price_range | `10k_20k` | 💵 1-2만원 |
| price_range | `any` | 💎 상관없어요 |

### SQL

```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    food_types VARCHAR(100),          -- 콤마 구분: 'korean,japanese'
    spicy_level VARCHAR(20),          -- none, medium, love
    dining_style VARCHAR(20),         -- solo, together
    price_range VARCHAR(20),          -- under_10k, 10k_20k, any
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)                   -- 1:1 관계
);
```

### 예시 데이터

| id | user_id | food_types | spicy_level | dining_style | price_range |
|----|---------|------------|-------------|--------------|-------------|
| 1 | 1 | korean,japanese | love | solo | 10k_20k |
| 2 | 2 | western,chinese | medium | together | any |

---

## 3️⃣ user_sessions 테이블

> 세션 관리 - 비로그인 사용자도 추적 가능

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | 용도 |
|--------|-------------|------|--------|------|------|
| `id` | SERIAL | NOT NULL | AUTO | 세션 고유 ID (PK) | 로그 연결용 |
| `user_id` | INTEGER | NULL | NULL | 사용자 ID (FK, nullable) | 비로그인 시 NULL |
| `session_token` | VARCHAR(100) | NOT NULL | UUID | 세션 토큰 | 브라우저 식별 |
| `device_type` | VARCHAR(20) | NULL | NULL | 디바이스 종류 | 통계용 |
| `location_lat` | DECIMAL(10,8) | NULL | NULL | 위도 | 위치 기반 추천 |
| `location_lng` | DECIMAL(11,8) | NULL | NULL | 경도 | 위치 기반 추천 |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 세션 시작 | - |
| `last_active_at` | TIMESTAMP | NOT NULL | NOW() | 마지막 활동 | 세션 만료 체크 |

### SQL

```sql
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_token VARCHAR(100) NOT NULL UNIQUE,
    device_type VARCHAR(20),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
```

---

## 4️⃣ user_logs 테이블

> 사용 로그 - 컨디션 선택, 추천 결과, 클릭 기록

| 컬럼명 | 데이터 타입 | NULL | 기본값 | 설명 | PRD 매핑 |
|--------|-------------|------|--------|------|----------|
| `id` | SERIAL | NOT NULL | AUTO | 로그 고유 ID (PK) | - |
| `session_id` | INTEGER | NOT NULL | - | 세션 ID (FK) | chat_start 이벤트 |
| `user_id` | INTEGER | NULL | NULL | 사용자 ID (FK, nullable) | - |
| `event_type` | VARCHAR(30) | NOT NULL | - | 이벤트 종류 | 로그 설계 참조 |
| `condition` | VARCHAR(30) | NULL | NULL | 선택한 컨디션 | select_condition |
| `sub_option` | VARCHAR(30) | NULL | NULL | 선택한 세부옵션 | select_detail |
| `recommended_ids` | INTEGER[] | NULL | NULL | 추천된 가게 ID 배열 | rec_complete |
| `selected_id` | INTEGER | NULL | NULL | 클릭한 가게 ID | click_restaurant |
| `selected_rank` | INTEGER | NULL | NULL | 클릭한 가게 순위 | click_restaurant |
| `latency_ms` | INTEGER | NULL | NULL | 응답 시간 (ms) | rec_complete |
| `context` | JSONB | NULL | NULL | 추가 컨텍스트 | - |
| `created_at` | TIMESTAMP | NOT NULL | NOW() | 로그 시간 | - |

### event_type 정의

| event_type | 설명 | 기록 시점 | 필수 컬럼 |
|------------|------|----------|-----------|
| `chat_start` | 챗봇 실행 | FAB 클릭 시 | session_id |
| `select_condition` | 컨디션 선택 | 1단계 버튼 클릭 | condition |
| `select_detail` | 세부옵션 선택 | 2단계 버튼 클릭 | sub_option |
| `rec_complete` | 추천 완료 | 결과 로딩 완료 | recommended_ids, latency_ms |
| `click_restaurant` | 가게 클릭 | 결과 카드 클릭 | selected_id, selected_rank |
| `click_retry` | 다시하기 클릭 | 처음으로/다른추천 클릭 | - |

### SQL

```sql
CREATE TABLE user_logs (
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

CREATE INDEX idx_logs_session ON user_logs(session_id);
CREATE INDEX idx_logs_event ON user_logs(event_type);
CREATE INDEX idx_logs_created ON user_logs(created_at);
```

---

## 📝 전체 SQL (복사용)

```sql
-- =============================================
-- 컨디션 기반 메뉴 추천 서비스 - 회원 관련 테이블
-- PostgreSQL 기준
-- =============================================

-- 1. 사용자 기본 정보
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nickname VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    age_group VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. 사용자 선호도 (1:1 관계)
CREATE TABLE user_preferences (
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

-- 3. 세션 관리 (비로그인 사용자 포함)
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_token VARCHAR(100) NOT NULL UNIQUE,
    device_type VARCHAR(20),
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP DEFAULT NOW()
);

-- 4. 사용 로그
CREATE TABLE user_logs (
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
-- 인덱스
-- =============================================
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_logs_session ON user_logs(session_id);
CREATE INDEX idx_logs_event ON user_logs(event_type);
CREATE INDEX idx_logs_created ON user_logs(created_at);
CREATE INDEX idx_logs_condition ON user_logs(condition) WHERE condition IS NOT NULL;
```

---

## 테이블 생성 순서

FK 의존성을 고려한 생성 순서:

```
1. users
2. user_preferences (users 참조)
3. user_sessions (users 참조)
4. user_logs (users, user_sessions 참조)
```
