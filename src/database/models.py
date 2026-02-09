"""데이터베이스 모델"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey, Text, BigInteger
from sqlalchemy.orm import relationship

from .connection import Base


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    """사용자 모델 - Supabase의 기존 users 테이블과 호환"""
    __tablename__ = "users"

    # Supabase는 INTEGER id 사용
    id = Column(BigInteger, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    nickname = Column(String(100), nullable=True)
    profile_image_url = Column(Text, nullable=True)

    # OAuth 제공자 정보
    provider = Column(String(20), nullable=False)  # 'kakao', 'google'
    provider_id = Column(String(255), nullable=False)

    # 메타데이터
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login_at = Column(DateTime, nullable=True)

    # 관계
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.nickname} ({self.provider})>"


class RefreshToken(Base):
    """리프레시 토큰 모델"""
    __tablename__ = "refresh_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked = Column(Boolean, default=False)

    # 관계
    user = relationship("User", back_populates="refresh_tokens")

    def __repr__(self):
        return f"<RefreshToken user_id={self.user_id}>"


class Favorite(Base):
    """즐겨찾기 모델"""
    __tablename__ = "favorites"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    restaurant_id = Column(String(50), nullable=False, index=True)  # 맛집 ID
    restaurant_name = Column(String(200), nullable=False)  # 맛집 이름
    restaurant_image = Column(Text, nullable=True)  # 맛집 이미지 URL
    restaurant_category = Column(String(50), nullable=True)  # 카테고리
    restaurant_rating = Column(String(10), nullable=True)  # 평점
    created_at = Column(DateTime, default=datetime.utcnow)

    # 관계
    user = relationship("User", back_populates="favorites")

    def __repr__(self):
        return f"<Favorite {self.restaurant_name}>"
