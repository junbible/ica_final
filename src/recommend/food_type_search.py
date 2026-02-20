"""Food Type to Kakao search keywords mapping and display labels."""

from .schemas import FoodType

FOOD_TYPE_KEYWORDS: dict[FoodType, list[str]] = {
    FoodType.SPICY_SOUP:   ["김치찌개", "짬뽕", "육개장"],
    FoodType.MILD_SOUP:    ["설렁탕", "갈비탕", "삼계탕"],
    FoodType.MEAT_HEAVY:   ["삼겹살", "갈비", "스테이크"],
    FoodType.LIGHT_MEAL:   ["샐러드", "포케", "샌드위치"],
    FoodType.COMFORT_FOOD: ["백반", "제육볶음", "된장찌개"],
    FoodType.REFRESH_MEAL: ["냉면", "메밀", "회"],
    FoodType.GREASY_MEAL:  ["치킨", "피자", "햄버거"],
    FoodType.QUICK_MEAL:   ["김밥", "우동", "토스트"],
}

FOOD_TYPE_LABELS: dict[FoodType, str] = {
    FoodType.SPICY_SOUP:   "매콤한 국물",
    FoodType.MILD_SOUP:    "담백한 국물",
    FoodType.MEAT_HEAVY:   "고기·든든한 식사",
    FoodType.LIGHT_MEAL:   "가벼운 식사",
    FoodType.COMFORT_FOOD: "따뜻한 집밥",
    FoodType.REFRESH_MEAL: "개운한 음식",
    FoodType.GREASY_MEAL:  "기름진 음식",
    FoodType.QUICK_MEAL:   "빠른 한 끼",
}

FOOD_TYPE_REASONS: dict[FoodType, str] = {
    FoodType.SPICY_SOUP:   "자극적이고 따끈한 국물이 필요한 컨디션이에요. 매콤한 국물 요리를 추천합니다!",
    FoodType.MILD_SOUP:    "따뜻하고 부드러운 국물이 당기는 컨디션이에요. 담백한 국물 요리를 추천합니다!",
    FoodType.MEAT_HEAVY:   "든든하게 배를 채우고 싶은 컨디션이에요. 고기 위주의 식사를 추천합니다!",
    FoodType.LIGHT_MEAL:   "가볍게 먹고 싶은 컨디션이에요. 부담 없는 한 끼를 추천합니다!",
    FoodType.COMFORT_FOOD: "따뜻하고 편안한 음식이 필요한 컨디션이에요. 집밥 스타일을 추천합니다!",
    FoodType.REFRESH_MEAL: "시원하고 개운한 음식이 당기는 컨디션이에요. 상쾌한 식사를 추천합니다!",
    FoodType.GREASY_MEAL:  "자극적이고 든든한 음식이 당기는 컨디션이에요. 기름진 요리를 추천합니다!",
    FoodType.QUICK_MEAL:   "간단하고 빠르게 해결하고 싶은 컨디션이에요. 간편한 한 끼를 추천합니다!",
}
