"""FastAPI 메인 애플리케이션"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from chatbot.api import router as chatbot_router

# 환경변수 로드
load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 시작/종료 시 실행"""
    # 시작 시
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
    """,
    version="1.0.0",
    lifespan=lifespan,
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(chatbot_router)


@app.get("/")
async def root():
    """API 상태 확인"""
    return {
        "status": "running",
        "message": "컨디션 기반 메뉴 추천 챗봇 API",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """헬스체크"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
