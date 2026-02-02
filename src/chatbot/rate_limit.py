"""Rate Limiting 설정 모듈"""

from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request
from fastapi.responses import JSONResponse


def get_real_ip(request: Request) -> str:
    """프록시/로드밸런서 뒤에서도 실제 IP 추출"""
    # X-Forwarded-For 헤더 확인 (프록시 환경)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        # 첫 번째 IP가 실제 클라이언트 IP
        return forwarded.split(",")[0].strip()

    # X-Real-IP 헤더 확인 (Nginx 등)
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # 기본: 직접 연결된 IP
    return get_remote_address(request)


# Limiter 인스턴스 생성 (IP 기반)
limiter = Limiter(key_func=get_real_ip)


# Rate Limit 설정값
class RateLimits:
    """Rate Limit 설정값"""

    # 일반 API: IP당 1분에 60번
    GENERAL = "60/minute"

    # AI 답변 생성: IP당 1분에 10번 (비용 절감)
    AI_CHAT = "10/minute"

    # 로그인 시도: IP당 5분에 5번 (보안)
    LOGIN = "5/5minutes"

    # 세션 조회: IP당 1분에 30번
    SESSION = "30/minute"

    # 세션 리셋/삭제: IP당 1분에 10번
    SESSION_MODIFY = "10/minute"


async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> JSONResponse:
    """Rate Limit 초과 시 응답 핸들러"""
    # Retry-After 헤더에서 대기 시간 추출
    retry_after = exc.detail.split("per")[0].strip() if exc.detail else "잠시"

    return JSONResponse(
        status_code=429,
        content={
            "error": "too_many_requests",
            "message": f"요청이 너무 많아요! 😅 {retry_after} 후에 다시 시도해주세요.",
            "detail": str(exc.detail),
            "retry_after": retry_after
        },
        headers={
            "Retry-After": "60",  # 기본 60초
            "X-RateLimit-Limit": exc.detail.split(",")[0] if exc.detail else "unknown"
        }
    )
