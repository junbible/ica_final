"""FastAPI 메인 애플리케이션"""

import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv

from chatbot.api import router as chatbot_router
from chatbot.rate_limit import limiter, rate_limit_exceeded_handler, RateLimits
from auth import auth_router
from database.connection import init_db

# 프론트엔드 빌드 디렉토리
FRONTEND_DIR = Path(__file__).parent / "frontend" / "dist"

# 환경변수 로드
load_dotenv()

# 허용된 오리진 (CORS)
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite 개발 서버
    "http://localhost:8000",  # 로컬 백엔드
    os.getenv("FRONTEND_URL", ""),  # 프로덕션 프론트엔드
    "https://nyam-production.up.railway.app",  # Railway 배포
]
# 빈 문자열 제거
ALLOWED_ORIGINS = [origin for origin in ALLOWED_ORIGINS if origin]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    # 시작 시
    # 데이터베이스 테이블 생성
    init_db()
    print("✅ 데이터베이스 초기화 완료")

    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY 환경변수를 설정해주세요.")
    else:
        print("✅ OpenAI API 키가 설정되었습니다.")
    print("🚀 메뉴 추천 챗봇 API 서버 시작")
    yield
    # 종료 시
    print("👋 서버 종료")


app = FastAPI(
    title="컨디션 기반 메뉴 추천 챗봇 API",
    description="""
    사용자의 컨디션(피로, 숙취, 스트레스, 감기, 다이어트 등)에 맞는
    메뉴를 추천해주는 AI 챗봇 API입니다.

    ## 주요 기능
    - 컨디션 기반 메뉴 추천
    - 실시간 스트리밍 응답
    - 대화 히스토리 관리
    - Function Calling을 통한 메뉴/음식점 검색

    ## Rate Limiting
    - 일반 API: 60회/분
    - AI 채팅: 10회/분
    - 세션 조회: 30회/분
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# Rate Limiter 설정
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# CORS 설정 (쿠키 기반 인증을 위해 특정 오리진 지정)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(chatbot_router)
app.include_router(auth_router)

# 프론트엔드 정적 파일 서빙
if FRONTEND_DIR.exists():
    # assets 폴더 (JS, CSS 등)
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")


@app.get("/api")
@limiter.limit(RateLimits.GENERAL)
async def api_root(request: Request):
    """API 상태 확인

    Rate Limit: 60회/분
    """
    return {
        "status": "running",
        "message": "컨디션 기반 메뉴 추천 챗봇 API",
        "docs": "/docs",
        "rate_limits": {
            "general": "60/minute",
            "ai_chat": "10/minute",
            "session": "30/minute"
        }
    }


@app.get("/api/health")
@limiter.limit(RateLimits.GENERAL)
async def health_check(request: Request):
    """헬스체크

    Rate Limit: 60회/분
    """
    return {"status": "healthy"}


# SPA 라우팅: 프론트엔드 index.html 서빙
@app.get("/")
async def serve_root():
    """프론트엔드 메인 페이지"""
    if FRONTEND_DIR.exists():
        return FileResponse(FRONTEND_DIR / "index.html")
    return {"message": "Frontend not built. Run 'npm run build' in frontend directory."}


@app.get("/logo.png")
async def serve_logo():
    """로고 이미지 서빙"""
    logo_path = FRONTEND_DIR / "logo.png"
    if logo_path.exists():
        return FileResponse(logo_path)
    return {"error": "Logo not found"}


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """SPA 라우팅 - 모든 경로를 index.html로 리다이렉트

    API 경로는 제외 (라우터에서 처리)
    """
    # API/Auth 경로는 이 핸들러에서 처리하지 않음
    if full_path.startswith(("api/", "auth/", "docs", "openapi.json", "redoc")):
        # 404 반환 - 라우터에서 처리되지 않은 API 경로
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=404,
            content={"detail": "Not Found"}
        )

    if FRONTEND_DIR.exists():
        # 정적 파일이 존재하면 해당 파일 반환
        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        # 그 외에는 index.html 반환 (SPA 라우팅)
        return FileResponse(FRONTEND_DIR / "index.html")
    return {"message": "Frontend not built"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
