from enum import Enum

from pydantic import BaseModel, Field


class FoodType(str, Enum):
    SPICY_SOUP = "SPICY_SOUP"
    MILD_SOUP = "MILD_SOUP"
    MEAT_HEAVY = "MEAT_HEAVY"
    LIGHT_MEAL = "LIGHT_MEAL"
    COMFORT_FOOD = "COMFORT_FOOD"
    REFRESH_MEAL = "REFRESH_MEAL"
    GREASY_MEAL = "GREASY_MEAL"
    QUICK_MEAL = "QUICK_MEAL"


class RecommendRequest(BaseModel):
    spicy: bool
    warm: bool
    light: bool
    soup: bool
    lat: float
    lng: float
    radius: int = Field(default=1200, ge=200, le=5000)


class ScoredRestaurant(BaseModel):
    id: str
    name: str
    category: str
    full_category: str = ""
    address: str = ""
    phone: str = ""
    place_url: str = ""
    image_url: str = ""
    lat: float = 0.0
    lng: float = 0.0
    distance: int = 0
    rating: float = 0.0
    recommendation_score: float = 0.0
    distance_weight: int = 0


class RecommendResponse(BaseModel):
    food_type: FoodType
    food_type_label: str
    food_type_reason: str
    condition_summary: dict[str, bool]
    restaurants: list[ScoredRestaurant]
    total_count: int
    secondary_food_type: FoodType | None = None
