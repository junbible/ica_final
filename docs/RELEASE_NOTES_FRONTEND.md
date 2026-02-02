# Release Notes

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
