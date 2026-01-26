#!/usr/bin/env python3
"""챗봇 테스트 스크립트"""

import os
import sys

# 상위 디렉토리를 path에 추가
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chatbot.chat import MenuChatbot, MenuChatbotWithTools


def test_basic_chat():
    """기본 대화 테스트"""
    print("=" * 50)
    print("기본 챗봇 테스트")
    print("=" * 50)

    bot = MenuChatbot()

    test_messages = [
        "안녕, 오늘 뭐 먹을지 추천해줘",
        "요즘 야근이 많아서 너무 피곤해",
        "체력적으로 많이 지쳤어",
    ]

    for msg in test_messages:
        print(f"\n👤 사용자: {msg}")
        response = bot.chat(msg)
        print(f"🤖 봇: {response}")

    print(f"\n📊 토큰 사용량: {bot.get_token_usage()}")


def test_streaming_chat():
    """스트리밍 대화 테스트"""
    print("\n" + "=" * 50)
    print("스트리밍 챗봇 테스트")
    print("=" * 50)

    bot = MenuChatbot()

    print("\n👤 사용자: 숙취인데 해장 메뉴 추천해줘")
    print("🤖 봇: ", end="", flush=True)

    for chunk in bot.chat_stream("숙취인데 해장 메뉴 추천해줘"):
        print(chunk, end="", flush=True)

    print()


def test_tool_calling():
    """Function Calling 테스트"""
    print("\n" + "=" * 50)
    print("Function Calling 챗봇 테스트")
    print("=" * 50)

    bot = MenuChatbotWithTools()

    test_messages = [
        "스트레스 받아서 매운 거 먹고 싶어",
        "강남역 근처에서 먹을 수 있는 데 있어?",
    ]

    for msg in test_messages:
        print(f"\n👤 사용자: {msg}")
        response = bot.chat(msg)
        print(f"🤖 봇: {response}")


def interactive_chat():
    """대화형 테스트"""
    print("\n" + "=" * 50)
    print("대화형 챗봇 (종료: quit 또는 q)")
    print("=" * 50)

    bot = MenuChatbotWithTools()

    print("\n🤖 봇: 안녕하세요! 오늘 컨디션은 어떠세요? 맞춤 메뉴를 추천해드릴게요 😊\n")

    while True:
        try:
            user_input = input("👤 사용자: ").strip()

            if user_input.lower() in ["quit", "q", "exit", "종료"]:
                print("\n👋 대화를 종료합니다. 맛있는 식사하세요!")
                break

            if not user_input:
                continue

            if user_input == "reset":
                bot.reset()
                print("🔄 대화가 초기화되었습니다.\n")
                continue

            if user_input == "usage":
                print(f"📊 토큰 사용량: {bot.get_token_usage()}\n")
                continue

            response = bot.chat(user_input)
            print(f"🤖 봇: {response}\n")

        except KeyboardInterrupt:
            print("\n\n👋 대화를 종료합니다.")
            break


def main():
    """메인 함수"""
    # API 키 확인
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  OPENAI_API_KEY 환경변수를 설정해주세요.")
        print("   export OPENAI_API_KEY='your-api-key'")
        return

    print("🍽️  컨디션 기반 메뉴 추천 챗봇 PoC")
    print("-" * 50)

    # 실행할 테스트 선택
    print("\n테스트 선택:")
    print("1. 기본 대화 테스트")
    print("2. 스트리밍 테스트")
    print("3. Function Calling 테스트")
    print("4. 대화형 테스트 (직접 대화)")
    print("5. 전체 테스트 실행")

    choice = input("\n선택 (1-5): ").strip()

    if choice == "1":
        test_basic_chat()
    elif choice == "2":
        test_streaming_chat()
    elif choice == "3":
        test_tool_calling()
    elif choice == "4":
        interactive_chat()
    elif choice == "5":
        test_basic_chat()
        test_streaming_chat()
        test_tool_calling()
    else:
        print("잘못된 선택입니다.")


if __name__ == "__main__":
    main()
