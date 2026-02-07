"""데이터베이스 연결 설정"""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 환경변수에서 DATABASE_URL 가져오기
# Railway는 자동으로 DATABASE_URL 환경변수를 제공
DATABASE_URL = os.getenv("DATABASE_URL")

# SQLite fallback for local development without PostgreSQL
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./nyam.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # PostgreSQL URL 수정 (Railway 호환)
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI 의존성: 데이터베이스 세션 제공"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """데이터베이스 테이블 생성"""
    Base.metadata.create_all(bind=engine)
