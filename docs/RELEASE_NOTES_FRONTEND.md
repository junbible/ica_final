# Release Notes

## v1.5.0 (2026-02-20)

### 🎉 주요 기능

#### 채팅 내 게이미피케이션 추천
- **스와이프 추천** — 채팅창에서 바로 스와이프 추천 플레이 가능 (기존 /recommend 플로우 재사용)
- **메뉴 월드컵** — 16개 메뉴 중 8강/16강 토너먼트로 오늘 먹고 싶은 메뉴 결정
- **채팅 오버레이** — Card 전체를 덮는 풀스크린 오버레이, 뒤로가기로 중간 이탈 가능
- **결과 → MapCard** — 게임 완료 시 결과가 채팅 메시지(MapCard)로 자동 표시

#### 메뉴 월드컵 상세
- **VS 대결 UI** — 두 메뉴 카드 나란히 + VS 뱃지, 선택 애니메이션 (500ms)
- **브라켓 토너먼트** — 셔플 → 라운드 진행 (16강/8강/준결승/결승) → 우승자 결정
- **우승자 → 맛집 검색** — 우승 메뉴의 searchKeyword로 카카오 API 맛집 검색
- **16개 메뉴** — 김치찌개, 삼겹살, 초밥, 파스타, 치킨, 떡볶이, 피자, 삼계탕, 해장국, 스테이크, 샐러드, 국밥, 라멘, 햄버거, 마라탕, 디저트

---

### 🔧 개선사항

#### 위치 선택 UX 개선 (P0)
- **GPS 사전 안내 화면** — "내 근처 맛집을 찾아볼까요?" 안내 후 GPS 요청 (수락률 향상)
- **추천 지역 확대** — 6개 → 9개 (명동, 건대, 잠실 추가)
- **3열 그리드** — 9개 지역에 맞게 레이아웃 조정

#### 장소 검색 & 위치 저장 (P1)
- **텍스트 장소 검색** — 동네, 역, 건물 이름으로 카카오 Places API 검색 (300ms 디바운스, 최대 5개 결과)
- **위치 localStorage 저장** — 선택한 위치를 자동 저장, 재방문 시 "이전 위치 사용" 원탭 제공
- **카카오 services 라이브러리** — `libraries=services` 추가로 키워드 검색 활성화

#### 반경 선택 칩 (P2)
- **500m / 1km / 3km 칩** — LocationGate에서 위치 선택 시 반경도 함께 설정
- **localStorage 저장** — 선택한 반경이 저장되어 스와이프·월드컵 모두에 적용
- **useRecommendation 연동** — confirmLocation에 radius 파라미터 추가

#### 시간대별 맞춤 추천 (P2)
- **환영 메시지** — 아침/점심/오후/저녁/야식 시간대별 다른 인사말
- **퀵리플라이** — 시간대에 맞는 5개 선택지 (아침: 해장·든든, 점심: 빠르게·특선, 저녁: 고기·회식 등)
- **5개 시간대** — morning (6-10시), lunch (10-14시), afternoon (14-17시), dinner (17-21시), latenight (21시-)

#### 개발 환경 개선
- **Vite dev proxy** — `/api`, `/chat`, `/auth` 요청을 `localhost:8000`으로 프록시

---

### 📁 변경된 파일

```
src/frontend/
├── index.html                              # Kakao SDK libraries=services 추가
├── vite.config.ts                          # dev proxy 설정 추가
└── src/
    ├── data/
    │   ├── restaurants.ts                  # LOCATIONS 9개로 확대
    │   └── worldcup-menus.ts              # 월드컵 16개 메뉴 데이터 (신규)
    ├── hooks/
    │   ├── useWorldCup.ts                 # 브라켓 토너먼트 로직 (신규)
    │   └── useRecommendation.ts           # confirmLocation에 radius 파라미터 추가
    ├── lib/
    │   ├── kakao-maps.ts                  # searchPlaces() 헬퍼 추가
    │   └── time-context.ts                # 시간대별 인사말/퀵리플라이 (신규)
    ├── components/
    │   ├── chat/
    │   │   ├── ChatContainer.tsx          # 게임 버튼 + 오버레이 통합
    │   │   ├── ChatOverlay.tsx            # 오버레이 컨테이너 (신규)
    │   │   ├── SwipeRecommendOverlay.tsx  # 스와이프 어댑터 (신규)
    │   │   ├── WorldCupBattle.tsx         # VS 대결 UI (신규)
    │   │   └── MenuWorldCup.tsx           # 월드컵 전체 플로우 (신규)
    │   └── recommend/
    │       └── LocationGate.tsx           # 사전 안내 + 검색 + 저장 + 반경 칩
```

---

### 📌 다음 버전 예정

- [ ] 구글 로그인 연동
- [ ] 최근 본 맛집 기록
- [ ] 푸시 알림
- [ ] 지도 위 "이 지역 검색" 패턴

---

## v1.4.0 (2026-02-14)

### 🎉 주요 기능

#### 카카오 Local API 실데이터 연동
- **하드코딩 데이터 제거** — 기존 18개 가짜 맛집 데이터를 카카오 실시간 API로 전면 교체
- **맛집 검색 API** — `GET /api/restaurants/search`, `/nearby`, `/region` 신규 엔드포인트
- **통합 ID 체계** — 챗봇·메인 페이지·상세 페이지 모두 카카오 place_id 기반으로 통일
- **Mock 폴백** — API 키 없이도 목업 데이터로 정상 동작

#### 챗봇 직접 검색 기능
- **음식+위치 한 줄 검색** — "강남역 짬뽕", "홍대 파스타" 등 바로 맛집 검색 가능
- **기존 2단계 플로우 유지** — "피곤해요" → "강남" 컨디션 기반 검색도 동일하게 동작

#### 맛집 상세 페이지 재설계
- **카카오 실데이터 기반** — 주소, 전화번호, 카테고리, 좌표 모두 실제 데이터
- **Kakao Maps SDK 직접 렌더링** — iframe 제거, SDK 기반 지도로 전환
- **카카오 플레이스 리뷰** — 실제 사용자 리뷰·별점 표시 (비공식 API)
- **영업시간 표시** — 오늘 영업 상태, 주간 영업시간 표시
- **"카카오맵에서 보기" CTA** — place_url로 카카오맵 상세 페이지 연결

---

### 🔧 개선사항

#### 채팅 UX 개선
- **입력 자동 포커스** — 메시지 전송 후 / 봇 응답 후 커서 자동 복귀
- **채팅 전용 Error Boundary** — 채팅 에러 시 전체 앱이 아닌 채팅 영역만 에러 표시 + "다시 시도" 버튼

#### 카카오맵 SDK 안정화
- **공유 SDK 로더** — `loadKakaoMaps()` 유틸리티로 중복 로딩 방지, 타임아웃 처리
- **Service Worker 캐싱 제외** — 카카오 SDK 스크립트를 SW 캐시에서 제외
- **맵 DOM 분리** — 카카오 SDK 컨테이너와 React 관리 노드를 완전 분리

#### 백엔드 안전성 강화
- **공유 카카오 클라이언트** — `restaurant/kakao_client.py`로 중복 코드 통합
- **OpenAI null 응답 처리** — `content: null` 반환 시에도 안전 처리
- **검색 에러 격리** — 맛집 검색 실패해도 챗봇 응답은 정상 반환

---

### 🐛 버그 수정

| 이슈 | 원인 | 수정 |
|------|------|------|
| 채팅에서 맛집 클릭 → 빈 화면 | navigate()와 모달 닫기 타이밍 충돌 | navigate 먼저 실행 후 setTimeout으로 모달 닫기 |
| `removeChild` 크래시 | 카카오 SDK가 React 관리 DOM 노드 삭제 | CSS display로 전환, 조건부 렌더링 제거 |
| 채팅 에러 → 전체 화면 에러 | Error Boundary가 전체 앱 래핑 | ChatErrorBoundary로 채팅 영역만 격리 |
| 입력 커서 사라짐 | 메시지 전송 후 focus 미처리 | useRef + auto-focus 추가 |
| 삼계탕·족발 이미지 깨짐 | Unsplash URL 404 | 유효한 이미지 URL로 교체 |
| 삼계탕 이모지 부적절 | 🍗(닭다리) 사용 | 🍲(국물) 으로 변경 |
| 챗봇 시간 UTC 표시 | timezone 미지정 | KST(Asia/Seoul) 적용 |
| 로그인 후 페이지 초기화 | redirect 시 원래 페이지 유실 | 로그인 전 페이지 보존 |
| AuthProvider 크래시 | useNavigate를 Router 밖에서 호출 | Router 내부로 이동 |

---

### 📁 변경된 파일

```
src/
├── restaurant/                    # 맛집 API 모듈 (신규)
│   ├── __init__.py
│   ├── kakao_client.py           # 카카오 API 공유 클라이언트
│   ├── schemas.py                # KakaoRestaurant, SearchResponse
│   └── api.py                    # /api/restaurants/* 엔드포인트
├── chatbot/
│   ├── api.py                    # 직접 검색, null 안전 처리
│   ├── kakao_api.py              # 공유 클라이언트로 위임
│   └── schemas.py                # full_category 추가
├── main.py                       # restaurant_router 등록
└── frontend/src/
    ├── App.tsx                   # ChatErrorBoundary 추가
    ├── lib/
    │   ├── kakao-maps.ts         # SDK 로더 (신규)
    │   └── restaurant-api.ts     # 맛집 API 클라이언트 (신규)
    ├── data/
    │   └── restaurants.ts        # 하드코딩 삭제, 상수만 유지
    ├── components/chat/
    │   ├── MapCard.tsx           # DOM 분리, CSS display
    │   └── ChatInput.tsx         # auto-focus 추가
    └── pages/
        ├── MainPage.tsx          # API 연동
        ├── RestaurantDetail.tsx  # 카카오 데이터 기반 재설계
        └── MyPage.tsx            # 이미지 폴백
```

---

### 📌 다음 버전 예정

- [ ] 구글 로그인 연동
- [ ] 최근 본 맛집 기록
- [ ] 푸시 알림
- [ ] Redis 기반 분산 Rate Limiting

---

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
