# nyam! 개발 가이드

> 컨디션 맞춤 맛집 추천 서비스

## 빠른 시작

```bash
# 백엔드 실행
cd src && python3 -m uvicorn main:app --reload --port 8000

# 프론트엔드 실행 (새 터미널)
cd src/frontend && npm run dev
```

- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:8000
- API 문서: http://localhost:8000/docs

---

## 프로젝트 구조

```
ica_final/
├── src/
│   ├── main.py                 # FastAPI 앱 진입점
│   ├── chatbot/
│   │   ├── api.py              # 챗봇 API 엔드포인트
│   │   ├── schemas.py          # Pydantic 모델
│   │   ├── kakao_api.py        # 카카오 맛집 검색
│   │   ├── rate_limit.py       # Rate Limiting 설정
│   │   └── test_rate_limit.py  # Rate Limit 테스트
│   │
│   └── frontend/
│       ├── index.html          # HTML 진입점 (폰트 로드)
│       ├── package.json        # npm 의존성
│       ├── src/
│       │   ├── main.tsx        # React 진입점
│       │   ├── App.tsx         # 라우팅 설정
│       │   ├── index.css       # 글로벌 스타일 + Tailwind
│       │   ├── pages/
│       │   │   ├── MainPage.tsx        # 메인 (맛집 리스트)
│       │   │   └── RestaurantDetail.tsx # 맛집 상세
│       │   └── components/
│       │       ├── chat/       # 챗봇 컴포넌트
│       │       └── ui/         # shadcn/ui 컴포넌트
│       └── dist/               # 빌드 결과물
│
├── docs/                       # 문서
├── requirements.txt            # Python 의존성
├── Dockerfile                  # Docker 설정
├── Procfile                    # Railway/Render 배포
└── .env.example                # 환경변수 예시
```

---

## 기술 스택

### 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 프레임워크 |
| TypeScript | 5.x | 타입 안전성 |
| Vite | 7.x | 빌드 도구 |
| Tailwind CSS | 4.x | 스타일링 |
| shadcn/ui | - | UI 컴포넌트 |
| react-router-dom | 6.x | 라우팅 |
| lucide-react | - | 아이콘 |

### 백엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| FastAPI | 0.100+ | API 프레임워크 |
| OpenAI | 1.x | GPT-4o-mini 챗봇 |
| slowapi | 0.1.9 | Rate Limiting |
| Pydantic | 2.x | 데이터 검증 |

---

## 주요 파일 설명

### 프론트엔드

| 파일 | 설명 |
|------|------|
| `App.tsx` | 라우팅 (`/`, `/restaurant/:id`, `/chat`) + 챗봇 모달 |
| `MainPage.tsx` | 메인 페이지 - 히어로, 컨디션, 테마 컬렉션, 맛집 그리드 |
| `RestaurantDetail.tsx` | 상세 페이지 - 이미지, 메뉴, 리뷰, 지도 |
| `ChatContainer.tsx` | 챗봇 UI - 메시지, 입력, 빠른 답변 |
| `index.css` | 테마 색상, 폰트, 유틸리티 클래스 |

### 백엔드

| 파일 | 설명 |
|------|------|
| `main.py` | FastAPI 앱, CORS, Rate Limiter 미들웨어 |
| `api.py` | `/chat/message` 엔드포인트, OpenAI 연동, 메뉴 감지 |
| `kakao_api.py` | 카카오 맛집 검색 + Mock 데이터 fallback |
| `rate_limit.py` | IP 기반 Rate Limiting 설정 |

---

## 디자인 시스템

### 색상 (index.css)
```css
--primary: #FBBF24;        /* 메인 옐로우 */
--background: #FFFDF5;     /* 배경 */
--secondary: #FEF9E7;      /* 보조 배경 */
--accent: #FDE68A;         /* 강조 */
```

### 폰트
- **본문**: Pretendard
- **로고**: Unbounded Bold (`.font-logo`)

### 브랜딩
- 서비스명: **nyam!**
- 이모지: 🍽️

---

## API 엔드포인트

### 챗봇
```
POST /chat/message
{
  "message": "피곤해요",
  "session_id": null
}

Response:
{
  "response": "삼계탕 어때요?",
  "session_id": "uuid",
  "menus": [...],
  "restaurants": [...]
}
```

### Rate Limits
| 엔드포인트 | 제한 |
|-----------|------|
| 일반 API | 60회/분 |
| AI 채팅 | 10회/분 |
| 세션 조회 | 30회/분 |

---

## 환경변수

```bash
# .env 파일 생성
cp .env.example .env

# 필수 값 설정
OPENAI_API_KEY=sk-...
KAKAO_REST_API_KEY=...
```

---

## 라우팅

| 경로 | 컴포넌트 | 설명 |
|------|----------|------|
| `/` | MainPage | 메인 (맛집 리스트) |
| `/restaurant/:id` | RestaurantDetail | 맛집 상세 |
| `/chat` | ChatContainer (전체화면) | 챗봇 전용 |

---

## 주요 기능

### 완료됨 ✅
- [x] OpenAI 챗봇 연동
- [x] 시간대별 추천 (아침/점심/저녁/야식)
- [x] 컨디션별 추천 (피곤/숙취/스트레스/가벼움)
- [x] 메뉴 이미지 카드 (가로 스크롤)
- [x] 맛집 상세 페이지 (메뉴/리뷰/지도)
- [x] 위치 기반 필터링
- [x] Rate Limiting
- [x] 반응형 UI
- [x] 테마 컬렉션 (국물/데이트/혼밥/매운맛)

### 미완료 (향후 작업)
- [ ] 네이버 API 연동 (실제 맛집 데이터)
- [ ] 로그인/회원가입
- [ ] 즐겨찾기 기능
- [ ] 실제 예약 연동
- [ ] 서버 배포 (Railway/Render)

---

## 자주 쓰는 명령어

```bash
# 프론트엔드
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 미리보기

# 백엔드
python3 -m uvicorn main:app --reload    # 개발 서버
python3 -m chatbot.test_rate_limit      # Rate Limit 테스트

# Git
git status
git add .
git commit -m "메시지"
git push
```

---

## 트러블슈팅

### 포트 충돌
```bash
# 사용 중인 포트 확인
lsof -i :5173
lsof -i :8000

# 프로세스 종료
kill -9 <PID>
```

### OpenAI API 오류
- `.env` 파일에 `OPENAI_API_KEY` 확인
- API 키 잔액 확인

### 카카오 API 403 오류
- Mock 데이터로 자동 fallback됨
- 실제 연동 시 카카오 개발자 센터에서 앱 설정 필요

---

## 배포

### Railway (권장)
```bash
railway login
railway init
railway up
```

### Render
1. https://render.com 접속
2. GitHub 연동
3. Build: `pip install -r requirements.txt`
4. Start: `cd src && uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 연락처

- GitHub: https://github.com/junbible/ica_final
- 팀: 파이널 2팀
