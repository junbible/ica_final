"""Rate Limiting 테스트 스크립트

사용법:
    cd src && python -m chatbot.test_rate_limit

테스트 항목:
    1. 일반 API (60회/분) - 정상 동작 확인
    2. AI 채팅 (5회/분) - Rate Limit 초과 확인
"""

import asyncio
import httpx
import time


BASE_URL = "http://localhost:8000"


async def test_general_api():
    """일반 API Rate Limit 테스트 (60회/분)"""
    print("\n" + "=" * 50)
    print("1. 일반 API 테스트 (/health)")
    print("   제한: 60회/분")
    print("=" * 50)

    async with httpx.AsyncClient() as client:
        success_count = 0
        rate_limited_count = 0

        for i in range(65):  # 60개 초과 테스트
            try:
                response = await client.get(f"{BASE_URL}/health")
                if response.status_code == 200:
                    success_count += 1
                elif response.status_code == 429:
                    rate_limited_count += 1
                    print(f"   [{i+1}] Rate Limited: {response.json()['message']}")
            except Exception as e:
                print(f"   [{i+1}] Error: {e}")

        print(f"\n   결과: {success_count}개 성공, {rate_limited_count}개 제한됨")
        return rate_limited_count > 0


async def test_ai_chat_api():
    """AI 채팅 API Rate Limit 테스트 (5회/분)"""
    print("\n" + "=" * 50)
    print("2. AI 채팅 API 테스트 (/chat/message)")
    print("   제한: 5회/분")
    print("=" * 50)

    async with httpx.AsyncClient(timeout=30.0) as client:
        success_count = 0
        rate_limited_count = 0

        for i in range(8):  # 5개 초과 테스트
            try:
                response = await client.post(
                    f"{BASE_URL}/chat/message",
                    json={"message": "테스트 메시지", "session_id": None}
                )

                if response.status_code == 200:
                    success_count += 1
                    print(f"   [{i+1}] 성공")
                elif response.status_code == 429:
                    rate_limited_count += 1
                    data = response.json()
                    print(f"   [{i+1}] Rate Limited: {data['message']}")
                else:
                    print(f"   [{i+1}] 상태코드: {response.status_code}")

            except Exception as e:
                print(f"   [{i+1}] Error: {e}")

        print(f"\n   결과: {success_count}개 성공, {rate_limited_count}개 제한됨")

        if rate_limited_count > 0:
            print("   Rate Limiting 정상 동작!")
            return True
        else:
            print("   Rate Limiting이 동작하지 않음 (OpenAI API 키 확인 필요)")
            return False


async def test_rate_limit_headers():
    """Rate Limit 헤더 확인"""
    print("\n" + "=" * 50)
    print("3. Rate Limit 응답 헤더 확인")
    print("=" * 50)

    async with httpx.AsyncClient() as client:
        # 먼저 제한에 걸리게 요청
        for _ in range(6):
            response = await client.post(
                f"{BASE_URL}/chat/message",
                json={"message": "테스트", "session_id": None}
            )

            if response.status_code == 429:
                print(f"   Status: {response.status_code}")
                print(f"   Headers: Retry-After = {response.headers.get('Retry-After', 'N/A')}")
                print(f"   Body: {response.json()}")
                return True

    print("   Rate Limit 헤더를 확인할 수 없음 (더 많은 요청 필요)")
    return False


async def main():
    """메인 테스트 함수"""
    print("\n" + "=" * 60)
    print("  Rate Limiting 테스트 시작")
    print("  서버가 실행 중인지 확인하세요: http://localhost:8000")
    print("=" * 60)

    # 서버 연결 확인
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{BASE_URL}/")
            if response.status_code != 200:
                print("\n서버에 연결할 수 없습니다!")
                return
    except Exception as e:
        print(f"\n서버 연결 실패: {e}")
        print("서버를 먼저 실행하세요: cd src && python -m uvicorn main:app --reload")
        return

    print("\n서버 연결 성공!")

    # 테스트 실행
    results = {
        "일반 API": await test_general_api(),
        "AI 채팅 API": await test_ai_chat_api(),
        "응답 헤더": await test_rate_limit_headers(),
    }

    # 결과 요약
    print("\n" + "=" * 60)
    print("  테스트 결과 요약")
    print("=" * 60)

    for test_name, passed in results.items():
        status = "PASS" if passed else "FAIL"
        print(f"   {test_name}: {status}")

    print("\n" + "=" * 60)
    print("  테스트 완료!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(main())
