"""API 요청/응답 스키마"""

from pydantic import BaseModel, Field
from typing import Optional


class ChatRequest(BaseModel):
    """채팅 요청"""
    message: str = Field(..., min_length=1, max_length=1000, description="사용자 메시지")
    session_id: Optional[str] = Field(None, description="세션 ID (없으면 새 세션 생성)")


class MenuRecommendation(BaseModel):
    """메뉴 추천 정보"""
    name: str = Field(..., description="메뉴 이름")
    emoji: str = Field(..., description="이모지")
    description: str = Field(..., description="메뉴 설명")
    image_url: str = Field(..., description="음식 이미지 URL")
    tags: list[str] = Field(default_factory=list, description="태그 목록")


class Restaurant(BaseModel):
    """맛집 정보"""
    id: str
    name: str
    category: str
    full_category: str = ""
    address: str
    phone: str
    place_url: str
    lat: float
    lng: float
    distance: int


class ChatResponse(BaseModel):
    """채팅 응답"""
    response: str = Field(..., description="챗봇 응답")
    session_id: str = Field(..., description="세션 ID")
    menus: Optional[list[MenuRecommendation]] = Field(None, description="추천 메뉴 목록 (이미지 포함)")
    restaurants: Optional[list[Restaurant]] = Field(None, description="추천 맛집 목록 (지도용)")


class SessionInfo(BaseModel):
    """세션 정보"""
    session_id: str
    message_count: int
    estimated_tokens: int


class ResetResponse(BaseModel):
    """리셋 응답"""
    message: str
    session_id: str
