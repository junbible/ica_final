"""OAuth 클라이언트 설정 (카카오, 구글)"""

import os
import httpx
from typing import Optional
from dataclasses import dataclass

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

# 구글 OAuth 설정
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", f"{BASE_URL}/auth/google/callback")

# 프론트엔드 URL (OAuth 완료 후 리다이렉트)
FRONTEND_URL = os.getenv("FRONTEND_URL", BASE_URL)


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
            "state": state,
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{KakaoOAuth.AUTHORIZE_URL}?{query}"

    @staticmethod
    async def get_access_token(code: str) -> Optional[str]:
        """인가 코드로 액세스 토큰 획득"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                KakaoOAuth.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "client_id": KAKAO_CLIENT_ID,
                    "client_secret": KAKAO_CLIENT_SECRET,
                    "redirect_uri": KAKAO_REDIRECT_URI,
                    "code": code,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if response.status_code == 200:
                return response.json().get("access_token")
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
            return None


class GoogleOAuth:
    """구글 OAuth 클라이언트"""

    AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
    TOKEN_URL = "https://oauth2.googleapis.com/token"
    USER_INFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"

    @staticmethod
    def get_authorization_url(state: str) -> str:
        """구글 로그인 URL 생성"""
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "email profile",
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }
        query = "&".join(f"{k}={v}" for k, v in params.items())
        return f"{GoogleOAuth.AUTHORIZE_URL}?{query}"

    @staticmethod
    async def get_access_token(code: str) -> Optional[str]:
        """인가 코드로 액세스 토큰 획득"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                GoogleOAuth.TOKEN_URL,
                data={
                    "grant_type": "authorization_code",
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "redirect_uri": GOOGLE_REDIRECT_URI,
                    "code": code,
                },
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
            if response.status_code == 200:
                return response.json().get("access_token")
            return None

    @staticmethod
    async def get_user_info(access_token: str) -> Optional[OAuthUserInfo]:
        """액세스 토큰으로 사용자 정보 조회"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GoogleOAuth.USER_INFO_URL,
                headers={"Authorization": f"Bearer {access_token}"},
            )
            if response.status_code == 200:
                data = response.json()

                return OAuthUserInfo(
                    provider="google",
                    provider_id=data["id"],
                    email=data.get("email"),
                    nickname=data.get("name"),
                    profile_image_url=data.get("picture"),
                )
            return None
