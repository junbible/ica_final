# Release Notes

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

### 📌 다음 버전 예정

- [ ] Redis 기반 분산 Rate Limiting
- [ ] 사용자 인증 (로그인)
- [ ] 메뉴 즐겨찾기 기능
- [ ] 리뷰/평점 연동
