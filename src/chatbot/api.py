"""FastAPI 챗봇 API - OpenAI + 카카오 API 연동"""

import os
import uuid
from datetime import datetime
from zoneinfo import ZoneInfo
from openai import AsyncOpenAI
from fastapi import APIRouter, HTTPException, Request
from dotenv import load_dotenv
from .schemas import ChatRequest, ChatResponse, SessionInfo, ResetResponse, Restaurant, MenuRecommendation
from .kakao_api import search_by_condition, LOCATION_COORDS
from .rate_limit import limiter, RateLimits

load_dotenv()

router = APIRouter(prefix="/chat", tags=["chatbot"])

# OpenAI 클라이언트
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# 세션별 대화 히스토리 및 컨텍스트
sessions: dict[str, dict] = {}


def get_time_context() -> dict:
    """현재 시간대 컨텍스트 반환 (한국 시간 기준)"""
    hour = datetime.now(ZoneInfo("Asia/Seoul")).hour

    if 5 <= hour < 10:
        return {
            "period": "아침",
            "greeting": "좋은 아침이에요! ☀️",
            "meal": "아침 식사",
            "recommendations": ["죽", "토스트", "샌드위치", "우유", "시리얼", "계란요리"],
            "mood": "상쾌한 하루의 시작을 위한"
        }
    elif 10 <= hour < 14:
        return {
            "period": "점심",
            "greeting": "점심 시간이네요! 🍱",
            "meal": "점심 식사",
            "recommendations": ["백반", "비빔밥", "국수", "덮밥", "김치찌개", "된장찌개"],
            "mood": "든든한 점심으로 오후를 힘차게"
        }
    elif 14 <= hour < 17:
        return {
            "period": "오후",
            "greeting": "나른한 오후네요! ☕",
            "meal": "간식/카페",
            "recommendations": ["커피", "케이크", "마카롱", "빵", "과일", "스무디"],
            "mood": "달달한 간식으로 에너지 충전"
        }
    elif 17 <= hour < 21:
        return {
            "period": "저녁",
            "greeting": "저녁 시간이에요! 🌙",
            "meal": "저녁 식사",
            "recommendations": ["삼겹살", "치킨", "파스타", "스테이크", "회", "찌개"],
            "mood": "하루의 마무리를 맛있게"
        }
    else:  # 21시 ~ 5시
        return {
            "period": "야식",
            "greeting": "야식 타임! 🌃",
            "meal": "야식",
            "recommendations": ["치킨", "족발", "라면", "떡볶이", "피자", "햄버거"],
            "mood": "야식의 유혹을 즐기는"
        }


# 메뉴 이미지 데이터베이스 (Unsplash 무료 이미지)
MENU_DATABASE = {
    "삼계탕": {
        "emoji": "🍗",
        "description": "영양 만점 보양식, 따끈한 국물이 몸을 녹여줘요",
        "image_url": "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=400",
        "tags": ["보양식", "한식", "국물"]
    },
    "삼겹살": {
        "emoji": "🥓",
        "description": "고소한 삼겹살 한 점, 스트레스가 녹아요",
        "image_url": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
        "tags": ["고기", "회식", "인기"]
    },
    "치킨": {
        "emoji": "🍗",
        "description": "바삭바삭 치킨은 언제나 옳다!",
        "image_url": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400",
        "tags": ["야식", "배달", "인기"]
    },
    "파스타": {
        "emoji": "🍝",
        "description": "크리미한 소스와 쫄깃한 면의 조화",
        "image_url": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
        "tags": ["양식", "데이트", "분위기"]
    },
    "스테이크": {
        "emoji": "🥩",
        "description": "육즙 가득한 스테이크로 특별한 한 끼",
        "image_url": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400",
        "tags": ["양식", "특별식", "고단백"]
    },
    "콩나물국밥": {
        "emoji": "🥣",
        "description": "해장의 정석! 시원한 국물이 속을 풀어줘요",
        "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        "tags": ["해장", "한식", "국물"]
    },
    "짬뽕": {
        "emoji": "🍜",
        "description": "얼큰한 국물이 두통을 날려줘요",
        "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
        "tags": ["중식", "얼큰", "면"]
    },
    "마라탕": {
        "emoji": "🌶️",
        "description": "얼얼한 매운맛으로 스트레스 해소!",
        "image_url": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400",
        "tags": ["중식", "매운맛", "푸짐"]
    },
    "케이크": {
        "emoji": "🎂",
        "description": "달콤한 케이크 한 조각의 행복",
        "image_url": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
        "tags": ["디저트", "달달", "카페"]
    },
    "샐러드": {
        "emoji": "🥗",
        "description": "신선한 채소로 건강하게!",
        "image_url": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
        "tags": ["다이어트", "건강식", "가벼움"]
    },
    "포케": {
        "emoji": "🐟",
        "description": "신선한 회와 야채의 하와이안 조화",
        "image_url": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
        "tags": ["건강식", "트렌디", "가벼움"]
    },
    "피자": {
        "emoji": "🍕",
        "description": "치즈 쭈욱~ 함께 나눠 먹는 즐거움",
        "image_url": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
        "tags": ["양식", "배달", "파티"]
    },
    "라면": {
        "emoji": "🍜",
        "description": "야식의 왕, 뜨끈한 라면 한 그릇",
        "image_url": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
        "tags": ["야식", "간편식", "국물"]
    },
    "족발": {
        "emoji": "🦶",
        "description": "쫄깃한 족발과 새우젓의 환상 조합",
        "image_url": "https://images.unsplash.com/photo-1583224994076-b456e61ff42f?w=400",
        "tags": ["야식", "회식", "안주"]
    },
    "떡볶이": {
        "emoji": "🍢",
        "description": "매콤달콤 국민 간식",
        "image_url": "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400",
        "tags": ["분식", "매콤", "간식"]
    },
    "비빔밥": {
        "emoji": "🍚",
        "description": "알록달록 영양 가득 비빔밥",
        "image_url": "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400",
        "tags": ["한식", "건강식", "점심"]
    },
    "닭가슴살": {
        "emoji": "🍗",
        "description": "다이어터의 영원한 친구",
        "image_url": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400",
        "tags": ["다이어트", "고단백", "건강식"]
    },
    "샌드위치": {
        "emoji": "🥪",
        "description": "간편하지만 든든한 한 끼",
        "image_url": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400",
        "tags": ["간편식", "브런치", "가벼움"]
    },
    "커피": {
        "emoji": "☕",
        "description": "향긋한 커피 한 잔의 여유",
        "image_url": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
        "tags": ["카페", "음료", "휴식"]
    },
    "국밥": {
        "emoji": "🍲",
        "description": "뜨끈한 국밥 한 그릇으로 속이 든든",
        "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
        "tags": ["한식", "국물", "해장"]
    },
}


def detect_menus_in_response(response: str) -> list[dict]:
    """응답에서 메뉴 감지하여 이미지 정보 반환"""
    detected_menus = []
    for menu_name, menu_data in MENU_DATABASE.items():
        if menu_name in response:
            detected_menus.append({
                "name": menu_name,
                "emoji": menu_data["emoji"],
                "description": menu_data["description"],
                "image_url": menu_data["image_url"],
                "tags": menu_data["tags"]
            })
    # 최대 3개까지만 반환
    return detected_menus[:3]


# 시스템 프롬프트 생성 함수
def get_system_prompt() -> str:
    time_ctx = get_time_context()
    available_menus = ', '.join(MENU_DATABASE.keys())

    return f"""당신은 친근한 메뉴 추천 챗봇 "냠냠봇"입니다.

## 현재 시간 정보
- 시간대: {time_ctx['period']} ({datetime.now(ZoneInfo("Asia/Seoul")).strftime('%H:%M')})
- 식사: {time_ctx['meal']}

## 역할
사용자의 컨디션(피로, 숙취, 스트레스, 감기, 다이어트 등)에 맞는 메뉴를 추천해주세요.

## ⚠️ 매우 중요: 메뉴 추천 규칙
메뉴를 추천할 때는 반드시 아래 목록에서만 선택하세요 (정확한 이름 사용):
{available_menus}

예시:
- "삼겹살" (O) / "삼겹살구이" (X)
- "치킨" (O) / "후라이드치킨" (X)
- "파스타" (O) / "크림파스타" (X)
- "콩나물국밥" (O) / "콩나물해장국" (X)

## 대화 흐름
1. 인사 시 "{time_ctx['greeting']}" 같은 시간대별 인사 사용
2. 컨디션 파악 → 세부 증상/선호 질문
3. 메뉴 추천 시 위 목록에서 2-3개 선택하여 추천
4. 위치 질문 → 맛집 추천

## 응답 스타일
- 친근하고 따뜻한 말투
- 이모지 활용 😊🍽️
- 짧고 읽기 쉽게

## 컨디션별 추천 (위 목록에서 선택)
- 피곤/체력: 삼계탕, 국밥, 비빔밥
- 피곤/정신: 스테이크, 파스타, 케이크
- 숙취: 콩나물국밥, 짬뽕, 국밥
- 스트레스/매운거: 마라탕, 떡볶이
- 스트레스/달달: 케이크, 커피
- 스트레스/든든: 삼겹살, 치킨, 피자
- 감기: 삼계탕, 국밥
- 다이어트: 샐러드, 닭가슴살, 포케
- 가벼운식사: 샌드위치, 포케, 샐러드
- 야식: 치킨, 피자, 라면, 족발, 떡볶이

## 시간대별 안내
- 아침: 샌드위치, 커피, 국밥
- 점심: 비빔밥, 국밥, 파스타
- 오후: 케이크, 커피
- 저녁: 삼겹살, 치킨, 파스타, 스테이크
- 야식: 치킨, 족발, 라면, 떡볶이, 피자

## 중요
- 메뉴 추천 후 "위치를 알려주시면 근처 맛집도 찾아드릴게요! (예: 강남, 홍대, 신촌)" 안내
"""


def get_or_create_session(session_id: str | None) -> str:
    """세션 ID 조회 또는 생성"""
    if session_id and session_id in sessions:
        return session_id

    new_id = session_id or str(uuid.uuid4())
    sessions[new_id] = {
        "history": [],
        "condition_key": None,
        "waiting_for_location": False
    }
    return new_id


def detect_condition_key(message: str) -> str | None:
    """메시지에서 컨디션 키 감지"""
    message_lower = message.lower()

    if any(k in message_lower for k in ["피곤", "지침", "힘들"]):
        if any(k in message_lower for k in ["체력", "운동", "야근"]):
            return "fatigue_1"
        elif any(k in message_lower for k in ["정신", "번아웃", "스트레스"]):
            return "fatigue_2"
        elif any(k in message_lower for k in ["수면", "잠"]):
            return "fatigue_3"
        return "fatigue_1"

    if any(k in message_lower for k in ["숙취", "술", "해장"]):
        if any(k in message_lower for k in ["속", "울렁"]):
            return "hangover_1"
        elif any(k in message_lower for k in ["머리", "두통"]):
            return "hangover_2"
        elif any(k in message_lower for k in ["목", "갈증"]):
            return "hangover_3"
        return "hangover_1"

    if any(k in message_lower for k in ["스트레스", "짜증", "화남"]):
        if any(k in message_lower for k in ["매운", "매콤", "얼큰"]):
            return "stress_1"
        elif any(k in message_lower for k in ["달달", "단거", "디저트"]):
            return "stress_2"
        elif any(k in message_lower for k in ["든든", "배부르", "고기"]):
            return "stress_3"
        return "stress_1"

    if any(k in message_lower for k in ["감기", "아픔", "으슬"]):
        return "cold_2"

    if any(k in message_lower for k in ["다이어트", "살", "건강"]):
        return "diet_1"

    if any(k in message_lower for k in ["가볍", "간단", "가벼운"]):
        return "light_1"

    return None


def detect_location(message: str) -> str | None:
    """메시지에서 위치 감지"""
    for loc in LOCATION_COORDS.keys():
        if loc in message:
            return loc
    return None


async def get_openai_response(messages: list[dict]) -> str:
    """OpenAI API 호출"""
    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return "죄송해요, 잠시 문제가 생겼어요 😅 다시 말씀해주시겠어요?"


def format_restaurant_response(location: str, restaurants: list[dict]) -> str:
    """맛집 추천 응답 포맷팅"""
    if not restaurants:
        return f"\n\n📍 **{location}** 근처 맛집을 찾지 못했어요 😢"

    response = f"\n\n📍 **{location} 근처 맛집** 찾았어요!\n\n"
    for rest in restaurants:
        response += f"🏠 **{rest['name']}**\n"
        response += f"   📍 {rest['address']}\n"
        if rest.get('phone'):
            response += f"   📞 {rest['phone']}\n"
        response += f"   🚶 {rest['distance']}m\n\n"

    response += "맛있는 식사 되세요! 🍽️"
    return response


async def get_response(message: str, session_id: str) -> tuple[str, list[dict] | None, list[dict] | None]:
    """메시지에 맞는 응답 생성 (응답, 맛집, 메뉴)"""
    session = sessions[session_id]

    # 컨디션 키 감지 및 저장
    condition_key = detect_condition_key(message)
    if condition_key:
        session["condition_key"] = condition_key
        session["waiting_for_location"] = True

    # 위치 감지
    location = detect_location(message)
    restaurants = None
    restaurant_info = ""

    if location and session.get("waiting_for_location"):
        # 맛집 검색
        condition_key = session.get("condition_key", "fatigue_1")
        restaurants = await search_by_condition(location, condition_key, size=5)
        restaurant_info = format_restaurant_response(location, restaurants)
        session["waiting_for_location"] = False

    # OpenAI 메시지 구성 (시간대별 프롬프트)
    messages = [{"role": "system", "content": get_system_prompt()}]
    messages.extend(session["history"])
    messages.append({"role": "user", "content": message})

    # OpenAI 응답 생성
    ai_response = await get_openai_response(messages)

    # 맛집 정보 추가
    if restaurant_info:
        ai_response += restaurant_info

    # 응답에서 메뉴 감지
    detected_menus = detect_menus_in_response(ai_response)

    # 히스토리 업데이트
    session["history"].append({"role": "user", "content": message})
    session["history"].append({"role": "assistant", "content": ai_response})

    # 히스토리 길이 제한 (최근 20개)
    if len(session["history"]) > 20:
        session["history"] = session["history"][-20:]

    return ai_response, restaurants, detected_menus


@router.post("/message", response_model=ChatResponse)
@limiter.limit(RateLimits.AI_CHAT)
async def send_message(request: Request, chat_request: ChatRequest) -> ChatResponse:
    """챗봇에 메시지 전송 (OpenAI + 카카오 API)

    Rate Limit: 5회/분 (AI API 비용 절감)
    """
    session_id = get_or_create_session(chat_request.session_id)
    response_text, restaurants, menus = await get_response(chat_request.message, session_id)

    # Restaurant 객체로 변환
    restaurant_models = None
    if restaurants:
        restaurant_models = [
            Restaurant(
                id=r["id"],
                name=r["name"],
                category=r.get("category", ""),
                address=r.get("address", ""),
                phone=r.get("phone", ""),
                place_url=r.get("place_url", r.get("url", "")),
                lat=r["lat"],
                lng=r["lng"],
                distance=r.get("distance", 0)
            )
            for r in restaurants
        ]

    # Menu 객체로 변환
    menu_models = None
    if menus:
        menu_models = [
            MenuRecommendation(
                name=m["name"],
                emoji=m["emoji"],
                description=m["description"],
                image_url=m["image_url"],
                tags=m["tags"]
            )
            for m in menus
        ]

    return ChatResponse(
        response=response_text,
        session_id=session_id,
        menus=menu_models,
        restaurants=restaurant_models
    )


@router.get("/session/{session_id}", response_model=SessionInfo)
@limiter.limit(RateLimits.SESSION)
async def get_session_info(request: Request, session_id: str) -> SessionInfo:
    """세션 정보 조회

    Rate Limit: 30회/분
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    return SessionInfo(
        session_id=session_id,
        message_count=len(sessions[session_id]["history"]),
        estimated_tokens=len(sessions[session_id]["history"]) * 50
    )


@router.post("/session/{session_id}/reset", response_model=ResetResponse)
@limiter.limit(RateLimits.SESSION_MODIFY)
async def reset_session(request: Request, session_id: str) -> ResetResponse:
    """세션 대화 초기화

    Rate Limit: 10회/분
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    sessions[session_id] = {
        "history": [],
        "condition_key": None,
        "waiting_for_location": False
    }

    return ResetResponse(
        message="대화가 초기화되었습니다",
        session_id=session_id
    )


@router.delete("/session/{session_id}")
@limiter.limit(RateLimits.SESSION_MODIFY)
async def delete_session(request: Request, session_id: str) -> dict:
    """세션 삭제

    Rate Limit: 10회/분
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="세션을 찾을 수 없습니다")

    del sessions[session_id]

    return {"message": "세션이 삭제되었습니다", "session_id": session_id}
