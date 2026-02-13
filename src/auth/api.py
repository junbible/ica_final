"""인증 API 라우터"""

import logging
import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse, HTMLResponse
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

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

# 일회용 인증 코드 → user_id 매핑 (콜백 후 프론트엔드에서 쿠키 교환용)
auth_codes: dict[str, int] = {}


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
        secure=True,
        samesite="none",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="none",
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
    logger.info(f"Kakao callback: code={bool(code)}, state={bool(state)}, error={error}")

    if error:
        logger.warning(f"Kakao callback error from provider: {error}")
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error={error}")

    if not code or not state:
        logger.warning("Kakao callback missing code or state")
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=missing_params")

    # State 검증
    if state not in oauth_states or oauth_states[state] != "kakao":
        logger.warning(f"Invalid state. Received: {state}, stored states: {list(oauth_states.keys())}")
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=invalid_state")

    del oauth_states[state]

    # 액세스 토큰 획득
    logger.info("Exchanging code for access token...")
    access_token = await KakaoOAuth.get_access_token(code)
    if not access_token:
        logger.error("Failed to get Kakao access token")
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=token_failed")

    # 사용자 정보 조회
    logger.info("Fetching user info from Kakao...")
    user_info = await KakaoOAuth.get_user_info(access_token)
    if not user_info:
        logger.error("Failed to get Kakao user info")
        return RedirectResponse(url=f"{FRONTEND_URL}?auth_error=user_info_failed")

    # 사용자 생성/조회
    logger.info(f"Creating/updating user: {user_info.nickname}")
    user = get_or_create_user(db, user_info)

    # 일회용 인증 코드 생성 → 프론트엔드에서 fetch()로 쿠키 교환
    auth_code = secrets.token_urlsafe(32)
    auth_codes[auth_code] = user.id
    logger.info(f"Login success, generated auth_code for user {user.id}")

    return RedirectResponse(
        url=f"{FRONTEND_URL}?auth_code={auth_code}",
        status_code=302,
    )



# ==================== 인증 코드 교환 ====================

@router.post("/exchange")
async def exchange_auth_code(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """일회용 인증 코드를 JWT 토큰(쿠키)으로 교환"""
    body = await request.json()
    code = body.get("code")

    if not code or code not in auth_codes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="유효하지 않은 인증 코드입니다",
        )

    user_id = auth_codes.pop(code)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다",
        )

    create_auth_response(response, user, db)
    logger.info(f"Auth code exchanged for user {user.id}, cookies set")

    return {"message": "로그인 성공", "user": {
        "id": user.id,
        "nickname": user.nickname,
        "email": user.email,
        "profile_image_url": user.profile_image_url,
        "provider": user.provider,
    }}


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


@router.get("/debug/config")
async def debug_config():
    """OAuth 설정 확인 (디버그용, 시크릿 값은 노출하지 않음)"""
    from .oauth import BASE_URL, KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET, KAKAO_REDIRECT_URI, FRONTEND_URL
    import os
    return {
        "base_url": BASE_URL,
        "redirect_uri": KAKAO_REDIRECT_URI,
        "frontend_url": FRONTEND_URL,
        "kakao_client_id_set": bool(KAKAO_CLIENT_ID),
        "kakao_client_id_prefix": KAKAO_CLIENT_ID[:4] + "..." if KAKAO_CLIENT_ID else "",
        "kakao_client_secret_set": bool(KAKAO_CLIENT_SECRET),
        "jwt_secret_from_env": bool(os.getenv("JWT_SECRET_KEY")),
        "railway_domain": os.getenv("RAILWAY_PUBLIC_DOMAIN", "not set"),
        "pending_oauth_states": len(oauth_states),
        "access_token_expire_minutes": ACCESS_TOKEN_EXPIRE_MINUTES,
    }


@router.get("/debug/cookies")
async def debug_cookies(request: Request):
    """브라우저가 보내는 쿠키 확인 (디버그용)"""
    access_token = request.cookies.get("access_token")
    refresh_token = request.cookies.get("refresh_token")

    result = {
        "access_token_present": bool(access_token),
        "refresh_token_present": bool(refresh_token),
        "all_cookies": list(request.cookies.keys()),
    }

    if access_token:
        payload = decode_token(access_token)
        result["access_token_valid"] = bool(payload)
        if payload:
            result["access_token_payload"] = {
                "sub": payload.get("sub"),
                "type": payload.get("type"),
                "exp": payload.get("exp"),
            }

    return result
