"""인증 관련 Pydantic 스키마"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class UserResponse(BaseModel):
    """사용자 응답 스키마"""
    id: int
    email: Optional[str] = None
    nickname: Optional[str] = None
    profile_image_url: Optional[str] = None
    provider: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """토큰 응답 스키마"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class AuthCallbackResponse(BaseModel):
    """OAuth 콜백 응답"""
    success: bool
    message: str
    user: Optional[UserResponse] = None


class RefreshTokenRequest(BaseModel):
    """토큰 갱신 요청"""
    refresh_token: str


class LogoutRequest(BaseModel):
    """로그아웃 요청"""
    pass  # 쿠키에서 토큰을 가져오므로 body 없음
