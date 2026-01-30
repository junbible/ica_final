"""컨디션 기반 메뉴 추천 챗봇"""

import os
from typing import Optional
from openai import OpenAI

from .config import (
    OPENAI_MODEL,
    MAX_TOKENS,
    TEMPERATURE,
    MAX_HISTORY_LENGTH,
    CONDITIONS,
    CONDITION_MENU_MAP,
)
from .prompts import SYSTEM_PROMPT


class MenuChatbot:
    """컨디션 기반 메뉴 추천 챗봇"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Args:
            api_key: OpenAI API 키. 없으면 환경변수에서 가져옴
        """
        self.client = OpenAI(api_key=api_key or os.getenv("OPENAI_API_KEY"))
        self.conversation_history: list[dict] = []
        self.context = {
            "condition": None,
            "sub_condition": None,
            "location": None,
        }

    def _build_messages(self, user_message: str) -> list[dict]:
        """OpenAI API에 보낼 메시지 목록 생성"""
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        # 대화 히스토리 추가 (최근 N개만)
        history = self.conversation_history[-MAX_HISTORY_LENGTH:]
        messages.extend(history)

        # 현재 사용자 메시지 추가
        messages.append({"role": "user", "content": user_message})

        return messages

    def chat(self, user_message: str) -> str:
        """
        사용자 메시지에 대한 응답 생성

        Args:
            user_message: 사용자 입력 메시지

        Returns:
            챗봇 응답 메시지
        """
        # 메시지 목록 생성
        messages = self._build_messages(user_message)

        # OpenAI API 호출
        response = self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
        )

        assistant_message = response.choices[0].message.content

        # 대화 히스토리에 추가
        self.conversation_history.append({"role": "user", "content": user_message})
        self.conversation_history.append(
            {"role": "assistant", "content": assistant_message}
        )

        return assistant_message

    def chat_stream(self, user_message: str):
        """
        스트리밍 방식으로 응답 생성 (실시간 출력용)

        Args:
            user_message: 사용자 입력 메시지

        Yields:
            응답 텍스트 청크
        """
        messages = self._build_messages(user_message)

        stream = self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            stream=True,
        )

        full_response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content:
                content = chunk.choices[0].delta.content
                full_response += content
                yield content

        # 대화 히스토리에 추가
        self.conversation_history.append({"role": "user", "content": user_message})
        self.conversation_history.append(
            {"role": "assistant", "content": full_response}
        )

    def reset(self):
        """대화 히스토리 초기화"""
        self.conversation_history = []
        self.context = {
            "condition": None,
            "sub_condition": None,
            "location": None,
        }

    def get_token_usage(self) -> dict:
        """대략적인 토큰 사용량 추정"""
        total_chars = sum(
            len(msg["content"]) for msg in self.conversation_history
        )
        # 대략 4글자 = 1토큰 (한국어는 더 많을 수 있음)
        estimated_tokens = total_chars // 2
        return {
            "estimated_tokens": estimated_tokens,
            "message_count": len(self.conversation_history),
        }


class MenuChatbotWithTools(MenuChatbot):
    """Function Calling을 사용하는 고급 챗봇"""

    def __init__(self, api_key: Optional[str] = None):
        super().__init__(api_key)
        self.tools = [
            {
                "type": "function",
                "function": {
                    "name": "search_menu_by_condition",
                    "description": "컨디션에 맞는 메뉴를 검색합니다",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "condition": {
                                "type": "string",
                                "description": "메인 컨디션 (피로, 숙취, 스트레스, 감기, 다이어트)",
                                "enum": list(CONDITIONS.keys()),
                            },
                            "sub_condition": {
                                "type": "string",
                                "description": "세부 컨디션",
                            },
                        },
                        "required": ["condition"],
                    },
                },
            },
            {
                "type": "function",
                "function": {
                    "name": "search_restaurant",
                    "description": "위치 기반으로 음식점을 검색합니다",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "menu": {
                                "type": "string",
                                "description": "찾고 싶은 메뉴",
                            },
                            "location": {
                                "type": "string",
                                "description": "위치 (예: 강남역, 홍대 등)",
                            },
                        },
                        "required": ["menu", "location"],
                    },
                },
            },
        ]

    def _search_menu_by_condition(
        self, condition: str, sub_condition: Optional[str] = None
    ) -> list[str]:
        """컨디션에 맞는 메뉴 검색 (샘플 구현)"""
        if condition not in CONDITION_MENU_MAP:
            return ["추천 메뉴를 찾을 수 없습니다"]

        condition_menus = CONDITION_MENU_MAP[condition]

        if sub_condition and sub_condition in condition_menus:
            return condition_menus[sub_condition]

        # sub_condition이 없으면 모든 메뉴 반환
        all_menus = []
        for menus in condition_menus.values():
            all_menus.extend(menus)
        return list(set(all_menus))

    def _search_restaurant(self, menu: str, location: str) -> list[dict]:
        """음식점 검색 (샘플 구현 - 실제로는 DB 조회)"""
        # TODO: 실제 DB 연동 시 구현
        return [
            {
                "name": f"{location} {menu} 맛집",
                "address": f"{location} 근처",
                "rating": 4.5,
            }
        ]

    def _handle_tool_call(self, tool_call) -> str:
        """Tool call 처리"""
        import json

        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)

        if function_name == "search_menu_by_condition":
            result = self._search_menu_by_condition(
                arguments["condition"],
                arguments.get("sub_condition"),
            )
            return json.dumps({"menus": result}, ensure_ascii=False)

        elif function_name == "search_restaurant":
            result = self._search_restaurant(
                arguments["menu"],
                arguments["location"],
            )
            return json.dumps({"restaurants": result}, ensure_ascii=False)

        return json.dumps({"error": "Unknown function"})

    def chat(self, user_message: str) -> str:
        """Tool calling을 포함한 대화"""
        messages = self._build_messages(user_message)

        response = self.client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=messages,
            max_tokens=MAX_TOKENS,
            temperature=TEMPERATURE,
            tools=self.tools,
            tool_choice="auto",
        )

        response_message = response.choices[0].message

        # Tool call이 있는 경우 처리
        if response_message.tool_calls:
            messages.append(response_message)

            for tool_call in response_message.tool_calls:
                tool_result = self._handle_tool_call(tool_call)
                messages.append(
                    {
                        "role": "tool",
                        "tool_call_id": tool_call.id,
                        "content": tool_result,
                    }
                )

            # Tool 결과를 포함하여 다시 응답 생성
            second_response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=messages,
                max_tokens=MAX_TOKENS,
                temperature=TEMPERATURE,
            )
            assistant_message = second_response.choices[0].message.content
        else:
            assistant_message = response_message.content

        # 대화 히스토리에 추가
        self.conversation_history.append({"role": "user", "content": user_message})
        self.conversation_history.append(
            {"role": "assistant", "content": assistant_message}
        )

        return assistant_message
