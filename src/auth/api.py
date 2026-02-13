"""인증 API 라우터"""

import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from database.connection import get_db
from database.models import User, RefreshToken
from .oauth import KakaoOAuth, FRONTEND_URL, OAuthUserInfo
from .jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_token,
    get_refresh_token_expiry,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from .schemas import UserResponse, TokenResponse
from .dependencies import get_current_user, get_token_from_cookie

router = APIRouter(prefix="/auth", tags=["authentication"])

# OAuth state 저장 (실제 프로덕션에서는 Redis 사용 권장)
oauth_states: dict[str, str] = {}


def get_or_create_user(db: Session, user_info: OAuthUserInfo) -> User:
    """사용자 조회 또는 생성"""
    user = db.query(User).filter(
        User.provider == user_info.provider,
        User.provider_id == user_info.provider_id,
    ).first()

    if user:
        # 기존 사용자 정보 업데이트
        user.nickname = user_info.nickname or user.nickname
        user.profile_image_url = user_info.profile_image_url or user.profile_image_url
        user.email = user_info.email or user.email
        user.last_login_at = datetime.utcnow()
        db.commit()
        db.refresh(user)
    else:
        # 새 사용자 생성
        user = User(
            email=user_info.email,
            nickname=user_info.nickname,
            profile_image_url=user_info.profile_image_url,
            provider=user_info.provider,
            provider_id=user_info.provider_id,
            last_login_at=datetime.utcnow(),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return user


def create_auth_response(response: Response, user: User, db: Session) -> None:
    """인증 응답 생성 (쿠키 설정)"""
    # 토큰 생성
    access_token = create_access_token({"sub": user.id})
    refresh_token = create_refresh_token({"sub": user.id})

    # 리프레시 토큰 DB에 저장
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=hash_token(refresh_token),
        expires_at=get_refresh_token_expiry(),
    )
    db.add(db_refresh_token)
    db.commit()

    # 쿠키 설정
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,  # HTTPS에서만
        samesite="lax",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7일
        path="/",
    )


# ==================== 카카오 OAuth ====================

@router.get("/kakao/login")
async def kakao_login():
    """카카오 로그인 시작"""
    state = secrets.token_urlsafe(16)
    oauth_states[state] = "kakao"
    return RedirectResponse(url=KakaoOAuth.get_authorization_url(state))


@router.get("/kakao/callback")
async def kakao_callback(
    code: Optional[str] = None,
    state: Optional[str] = None,
    error: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """카카오 OAuth 콜백 처리"""
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error={error}")

    if not code or not state:
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=missing_params")

    # State 검증
    if state not in oauth_states or oauth_states[state] != "kakao":
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=invalid_state")

    del oauth_states[state]

    # 액세스 토큰 획득
    access_token = await KakaoOAuth.get_access_token(code)
    if not access_token:
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=token_failed")

    # 사용자 정보 조회
    user_info = await KakaoOAuth.get_user_info(access_token)
    if not user_info:
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=user_info_failed")

    # 사용자 생성/조회
    user = get_or_create_user(db, user_info)

    # 리다이렉트 응답 생성
    response = RedirectResponse(url=f"{FRONTEND_URL}?auth_success=true")
    create_auth_response(response, user, db)

    return response



# ==================== 토큰 관리 ====================

@router.post("/refresh")
async def refresh_access_token(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """액세스 토큰 갱신"""
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="리프레시 토큰이 없습니다",
        )

    # 토큰 검증
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="유효하지 않은 리프레시 토큰입니다",
        )

    user_id = payload.get("sub")

    # DB에서 리프레시 토큰 확인
    token_hash = hash_token(refresh_token)
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False,
    ).first()

    if not db_token or db_token.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="리프레시 토큰이 만료되었거나 유효하지 않습니다",
        )

    # 사용자 조회
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자를 찾을 수 없습니다",
        )

    # 기존 리프레시 토큰 무효화
    db_token.revoked = True
    db.commit()

    # 새 토큰 발급
    create_auth_response(response, user, db)

    return {"message": "토큰이 갱신되었습니다"}


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """로그아웃"""
    refresh_token = request.cookies.get("refresh_token")

    if refresh_token:
        # 리프레시 토큰 무효화
        token_hash = hash_token(refresh_token)
        db_token = db.query(RefreshToken).filter(
            RefreshToken.token_hash == token_hash,
        ).first()
        if db_token:
            db_token.revoked = True
            db.commit()

    # 쿠키 삭제
    response.delete_cookie("access_token", path="/")
    response.delete_cookie("refresh_token", path="/")

    return {"message": "로그아웃되었습니다"}


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(get_current_user)):
    """현재 로그인한 사용자 정보"""
    return user
