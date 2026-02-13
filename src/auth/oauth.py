"""OAuth 클라이언트 설정 (카카오)"""

import os
import logging
from urllib.parse import urlencode

import httpx
from typing import Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)

# 기본 URL (Railway 배포 시 자동 감지)
BASE_URL = os.getenv("RAILWAY_PUBLIC_DOMAIN", "")
if BASE_URL:
    BASE_URL = f"https://{BASE_URL}"
else:
    BASE_URL = os.getenv("BASE_URL", "http://localhost:8000")

# 카카오 OAuth 설정
KAKAO_CLIENT_ID = os.getenv("KAKAO_REST_API_KEY", "")  # 기존 REST API 키 재사용
KAKAO_CLIENT_SECRET = os.getenv("KAKAO_CLIENT_SECRET", "")
KAKAO_REDIRECT_URI = os.getenv("KAKAO_REDIRECT_URI", f"{BASE_URL}/auth/kakao/callback")

# 프론트엔드 URL (OAuth 완료 후 리다이렉트)
FRONTEND_URL = os.getenv("FRONTEND_URL", BASE_URL)

logger.info(f"OAuth BASE_URL: {BASE_URL}")
logger.info(f"OAuth REDIRECT_URI: {KAKAO_REDIRECT_URI}")
logger.info(f"OAuth FRONTEND_URL: {FRONTEND_URL}")
logger.info(f"OAuth KAKAO_CLIENT_ID set: {bool(KAKAO_CLIENT_ID)}")


@dataclass
class OAuthUserInfo:
    """OAuth 사용자 정보"""
    provider: str
    provider_id: str
    email: Optional[str]
    nickname: Optional[str]
    profile_image_url: Optional[str]


class KakaoOAuth:
    """카카오 OAuth 클라이언트"""

    AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize"
    TOKEN_URL = "https://kauth.kakao.com/oauth/token"
    USER_INFO_URL = "https://kapi.kakao.com/v2/user/me"

    @staticmethod
    def get_authorization_url(state: str) -> str:
        """카카오 로그인 URL 생성"""
        params = {
            "client_id": KAKAO_CLIENT_ID,
            "redirect_uri": KAKAO_REDIRECT_URI,
            "response_type": "code",
            "scope": "profile_nickname,profile_image",
            "state": state,
        }
        return f"{KakaoOAuth.AUTHORIZE_URL}?{urlencode(params)}"

    @staticmethod
    async def get_access_token(code: str) -> Optional[str]:
        """인가 코드로 액세스 토큰 획득"""
        async with httpx.AsyncClient() as client:
            data = {
                "grant_type": "authorization_code",
                "client_id": KAKAO_CLIENT_ID,
                "redirect_uri": KAKAO_REDIRECT_URI,
                "code": code,
            }
            # client_secret이 설정된 경우에만 포함
            if KAKAO_CLIENT_SECRET:
                data["client_secret"] = KAKAO_CLIENT_SECRET

            response = await client.post(
                KakaoOAuth.TOKEN_URL,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if response.status_code == 200:
                return response.json().get("access_token")
            logger.error(f"Kakao token exchange failed: {response.status_code} {response.text}")
            return None

    @staticmethod
    async def get_user_info(access_token: str) -> Optional[OAuthUserInfo]:
        """액세스 토큰으로 사용자 정보 조회"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                KakaoOAuth.USER_INFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code == 200:
                data = response.json()
                kakao_account = data.get("kakao_account", {})
                profile = kakao_account.get("profile", {})

                return OAuthUserInfo(
                    provider="kakao",
                    provider_id=str(data["id"]),
                    email=kakao_account.get("email"),
                    nickname=profile.get("nickname"),
                    profile_image_url=profile.get("profile_image_url"),
                )
            logger.error(f"Kakao user info failed: {response.status_code} {response.text}")
            return None
