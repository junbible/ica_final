# Release Notes

## v1.3.0 (2026-02-09)

### 🎉 주요 기능

#### PWA 지원
- **앱 설치** - 모바일/데스크톱에서 홈 화면에 추가 가능
- **오프라인 지원** - Service Worker로 정적 에셋 캐싱
- **이미지 캐싱** - Unsplash 이미지 30일, Kakao API 1시간 캐싱
- **PWA 아이콘** - 192x192, 512x512, Apple Touch Icon

#### 토스트 알림
- **로그인 알림** - 성공/실패 시 한국어 메시지 표시
- **로그아웃 알림** - "로그아웃되었습니다"
- **즐겨찾기 알림** - 추가/삭제 시 피드백
- **에러 메시지** - 친절한 한국어 오류 메시지

#### 이미지 최적화
- **Lazy Loading** - Intersection Observer 기반 지연 로딩
- **Shimmer 효과** - 이미지 로딩 중 애니메이션
- **URL 최적화** - Unsplash 이미지 크기/품질 자동 조정
- **에러 처리** - 로딩 실패 시 🍽️ placeholder

#### 챗봇 → 상세페이지 연결
- **앱 맛집 매칭** - 챗봇 추천 레스토랑과 앱 데이터 연동
- **"앱 맛집" 배지** - 매칭된 레스토랑 표시
- **원클릭 이동** - 상세보기 버튼으로 상세페이지 이동

---

### 🔧 개선사항

#### 로딩 상태 개선
- **소셜 로그인 버튼** - 클릭 시 스피너 표시
- **버튼 비활성화** - 중복 클릭 방지

#### 레스토랑 데이터 리팩토링
- **공유 데이터 모듈** - `src/data/restaurants.ts`
- **18개 레스토랑 상세정보** - 주소, 전화, 영업시간, 메뉴, 리뷰, 좌표
- **헬퍼 함수** - `getRestaurantById`, `searchRestaurants` 등

#### 상세페이지 개선
- **FavoriteButton 연동** - 즐겨찾기 기능 통합
- **토스트 알림** - 공유, 주소 복사, 예약 시 피드백
- **404 처리** - 존재하지 않는 레스토랑 안내
- **태그 표시** - 해시태그 스타일 태그 UI

---

### 🐛 버그 수정

#### 데이터베이스 스키마 호환성
- **User.id 타입 수정** - VARCHAR(36) → BigInteger
- **Supabase 호환** - 기존 INTEGER 스키마와 호환
- **외래 키 수정** - RefreshToken, Favorite의 user_id 타입 변경

---

### 📁 변경된 파일

```
src/
├── database/
│   └── models.py                  # BigInteger id로 변경
└── frontend/
    ├── index.html                 # PWA 메타 태그
    ├── vite.config.ts             # vite-plugin-pwa 설정
    ├── public/
    │   ├── pwa-192x192.png        # PWA 아이콘 (신규)
    │   ├── pwa-512x512.png        # PWA 아이콘 (신규)
    │   └── apple-touch-icon.png   # iOS 아이콘 (신규)
    ├── scripts/
    │   └── generate-pwa-icons.js  # 아이콘 생성 스크립트 (신규)
    └── src/
        ├── index.css              # shimmer 애니메이션
        ├── data/
        │   └── restaurants.ts     # 공유 레스토랑 데이터 (신규)
        ├── components/
        │   ├── ui/
        │   │   ├── toast.tsx      # 토스트 컴포넌트 (신규)
        │   │   └── lazy-image.tsx # 지연 로딩 이미지 (신규)
        │   ├── auth/
        │   │   └── SocialLoginButton.tsx  # 로딩 상태 추가
        │   └── chat/
        │       └── MapCard.tsx    # 상세페이지 연결
        ├── contexts/
        │   ├── AuthContext.tsx    # 토스트 알림 추가
        │   └── FavoritesContext.tsx # 토스트 알림 추가
        ├── pages/
        │   ├── MainPage.tsx       # LazyImage 적용
        │   ├── MyPage.tsx         # LazyImage 적용
        │   └── RestaurantDetail.tsx # 전면 개편
        └── App.tsx                # ToastProvider 추가
```

---

### 📌 다음 버전 예정

- [ ] 구글 로그인 연동
- [ ] 최근 본 맛집 기록
- [ ] 푸시 알림
- [ ] Redis 기반 분산 Rate Limiting

---

## v1.2.0 (2026-02-06)

### 🎉 주요 기능

#### 온보딩 팝업
- **첫 방문 감지** - localStorage 기반 온보딩 상태 관리
- **위치 권한 요청** - 브라우저 Geolocation API 연동
- **3단계 플로우** - 환영 → 위치 권한 → 완료

#### 소셜 로그인 (카카오)
- **카카오 OAuth 2.0** - REST API 연동
- **프로필 동기화** - 닉네임, 프로필 사진 가져오기
- **JWT 토큰 인증** - httpOnly 쿠키 기반 보안
- **자동 토큰 갱신** - Refresh Token 지원

#### 마이페이지
- **프로필 표시** - 카카오 닉네임, 프로필 사진
- **로그인 상태 표시** - 연동된 소셜 계정 표시
- **로그아웃** - 세션 종료 및 토큰 삭제

---

### 🔐 백엔드 인증 인프라

#### 데이터베이스
- **SQLAlchemy ORM** - User, RefreshToken 모델
- **PostgreSQL/SQLite** - 환경별 자동 전환

#### Auth API 엔드포인트
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/auth/kakao/login` | 카카오 로그인 시작 |
| GET | `/auth/kakao/callback` | 카카오 콜백 처리 |
| GET | `/auth/google/login` | 구글 로그인 시작 |
| GET | `/auth/google/callback` | 구글 콜백 처리 |
| GET | `/auth/me` | 현재 사용자 정보 |
| POST | `/auth/refresh` | 토큰 갱신 |
| POST | `/auth/logout` | 로그아웃 |

---

### 📁 변경된 파일

```
src/
├── auth/                          # 인증 모듈 (신규)
│   ├── __init__.py
│   ├── api.py                     # Auth 라우터
│   ├── dependencies.py            # get_current_user
│   ├── jwt_handler.py             # JWT 토큰 처리
│   ├── oauth.py                   # 카카오/구글 OAuth
│   └── schemas.py                 # Pydantic 스키마
├── database/                      # 데이터베이스 (신규)
│   ├── __init__.py
│   ├── connection.py              # DB 연결 설정
│   └── models.py                  # SQLAlchemy 모델
├── main.py                        # Auth 라우터 등록, CORS 업데이트
└── frontend/src/
    ├── App.tsx                    # AuthProvider, 라우트 추가
    ├── contexts/
    │   └── AuthContext.tsx        # 인증 상태 Context (신규)
    ├── lib/
    │   └── auth.ts                # Auth API 클라이언트 (신규)
    ├── hooks/
    │   ├── useOnboarding.ts       # 온보딩 상태 훅 (신규)
    │   └── useGeolocation.ts      # 위치 권한 훅 (신규)
    ├── components/
    │   ├── auth/                  # 인증 컴포넌트 (신규)
    │   │   ├── LoginDialog.tsx    # 로그인 다이얼로그
    │   │   ├── SocialLoginButton.tsx
    │   │   └── UserMenu.tsx       # 사용자 메뉴
    │   └── onboarding/
    │       └── OnboardingDialog.tsx # 온보딩 팝업 (신규)
    └── pages/
        ├── MainPage.tsx           # 로그인 버튼 추가
        └── MyPage.tsx             # 마이페이지 (신규)
```

---

### ⚙️ 환경변수

```
# Railway 설정 필요
KAKAO_REST_API_KEY=<카카오 REST API 키>
KAKAO_CLIENT_SECRET=<카카오 Client Secret>
JWT_SECRET_KEY=<JWT 시크릿 키>

# 구글 OAuth (선택)
GOOGLE_CLIENT_ID=<구글 클라이언트 ID>
GOOGLE_CLIENT_SECRET=<구글 클라이언트 시크릿>
```

---

### 📌 다음 버전 예정

- [ ] 구글 로그인 연동
- [x] 즐겨찾기 기능 (DB 연동) → v1.3.0 완료
- [ ] 최근 본 맛집 기록
- [ ] 푸시 알림

---

## v1.1.0 (2026-02-04)

### 🎉 주요 기능

#### 메인 페이지 (CatchTable 스타일)
- **히어로 배너** - 시간대별 인사말 (아침/점심/오후/저녁/야식)
- **컨디션 바로가기** - 피곤할 때, 해장 필요, 스트레스, 가볍게, 특별한 날, 혼밥
- **지역 선택** - 강남, 홍대, 신촌, 이태원, 성수, 여의도
- **테마 컬렉션** - 따끈한 국물, 데이트 코스, 혼밥, 매운맛
- **지금 핫한 맛집** - HOT 태그 맛집 가로 스크롤
- **신규 오픈** - NEW 태그 맛집 섹션
- **카테고리** - 한식, 중식, 일식, 양식, 카페, 술집

#### 맛집 상세 페이지
- **메뉴 탭** - 메뉴 목록 및 가격 정보
- **리뷰 탭** - 사용자 리뷰 및 별점
- **지도 탭** - Kakao Maps 위치 표시
- **전화/길찾기** - 원클릭 액션 버튼

#### 페이지 라우팅
- **react-router-dom** 적용
- `/` - 메인 페이지
- `/restaurant/:id` - 맛집 상세
- `/chat` - AI 챗봇 (전체화면)

---

### 🎨 브랜딩 개선

#### nyam! 리브랜딩
- **서비스명 변경** - 냠냠추천봇 → nyam!
- **Unbounded Bold 폰트** - 로고 전용 웹폰트 적용
- **마스코트 로고** - 귀여운 노란색 캐릭터 이미지
- **파비콘 교체** - Vite 기본 아이콘 → nyam! 로고

---

### 📚 문서

- **DEVELOPMENT_GUIDE.md** - 개발자 가이드 문서 추가

---

### 📁 변경된 파일

```
docs/
└── DEVELOPMENT_GUIDE.md          # 개발자 가이드 (신규)

src/frontend/
├── public/
│   ├── logo.png                  # 마스코트 로고 (신규)
│   └── vite.svg                  # 삭제
├── index.html                    # 파비콘, Unbounded 폰트
├── package.json                  # react-router-dom 추가
└── src/
    ├── App.tsx                   # 라우팅 설정
    ├── index.css                 # .font-logo, 스크롤바 스타일
    ├── pages/
    │   ├── index.ts              # 페이지 export (신규)
    │   ├── MainPage.tsx          # 메인 페이지 (신규)
    │   └── RestaurantDetail.tsx  # 상세 페이지 (신규)
    └── components/chat/
        └── ChatContainer.tsx     # 리브랜딩 적용
```

---

## v1.0.0 (2025-02-02)

### 🎉 주요 기능

#### AI 챗봇 완성
- **OpenAI GPT-4o-mini 연동** - 자연스러운 대화형 메뉴 추천
- **시간대별 맞춤 추천** - 아침/점심/오후/저녁/야식 자동 감지
- **컨디션 기반 추천** - 피로, 숙취, 스트레스, 감기, 다이어트 등

#### 메뉴 이미지 카드
- **20종 메뉴 데이터베이스** - Unsplash 고품질 이미지
- **가로 스크롤 UI** - 터치/클릭 네비게이션
- **AI 응답 연동** - 추천 메뉴와 카드 자동 매칭

#### 맛집 검색 (Kakao API)
- **위치 기반 검색** - 강남, 홍대, 신촌 등 지역별
- **지도 표시** - Kakao Maps SDK 연동
- **Mock 데이터 fallback** - API 장애 시 대체 데이터

---

### 🔒 보안

#### Rate Limiting 추가
| 엔드포인트 | 제한 |
|-----------|------|
| 일반 API | 60회/분 |
| AI 채팅 | 10회/분 |
| 세션 조회 | 30회/분 |
| 세션 수정 | 10회/분 |

#### API 키 보안
- `.env` 파일 `.gitignore` 처리
- 환경변수 기반 설정
- 민감정보 노출 점검 완료

---

### 🚀 배포 준비

#### 지원 플랫폼
- **Railway** - `Procfile`, `railway.json`
- **Render** - `Procfile`, `runtime.txt`
- **AWS App Runner** - `apprunner.yaml`
- **Docker** - `Dockerfile`, `.dockerignore`

---

### 📱 UI/UX 개선

- 반응형 디자인 (모바일/데스크톱)
- 옐로우 테마 컬러 (#FBBF24)
- 부드러운 스크롤 & 애니메이션
- 빠른 답변 버튼 (Quick Replies)

---

### 📁 변경된 파일

```
src/
├── main.py                    # Rate Limiting 미들웨어
├── chatbot/
│   ├── api.py                 # OpenAI + 시간대별 추천
│   ├── rate_limit.py          # Rate Limiter 모듈 (신규)
│   ├── test_rate_limit.py     # 테스트 스크립트 (신규)
│   ├── kakao_api.py           # Mock 데이터 추가
│   └── schemas.py             # MenuRecommendation 모델
└── frontend/src/
    ├── components/chat/
    │   ├── ChatContainer.tsx  # 반응형 개선
    │   ├── MenuCard.tsx       # 스크롤 네비게이션
    │   └── MapCard.tsx        # 지도 컴포넌트
    └── index.css              # 스크롤바 유틸리티

# 배포 설정
Procfile
runtime.txt
railway.json
apprunner.yaml
Dockerfile
.dockerignore
.env.example
```

---

### 🔧 기술 스택

| 구분 | 기술 |
|------|------|
| Backend | FastAPI, Python 3.11, OpenAI API |
| Frontend | React, TypeScript, Vite, shadcn/ui |
| API | Kakao Local API, Kakao Maps SDK |
| Security | slowapi (Rate Limiting) |

---

### 👥 Contributors

- Frontend & Integration: @renocomms
- Backend: 백엔드 개발자
- AI: Claude Opus 4.5

---

### 📌 다음 버전 예정 (v1.1.0 기준)

- [ ] Redis 기반 분산 Rate Limiting
- [x] 사용자 인증 (로그인) → v1.2.0 완료
- [ ] 메뉴 즐겨찾기 기능
- [ ] 리뷰/평점 연동
