"""
Pure scoring functions for food type determination and restaurant ranking.
Implements PRD sections 9.1–9.3 and 11.2–11.5.
"""

from .schemas import FoodType

# PRD 9.3: tie-breaking priority (lower index = higher priority)
FOOD_TYPE_PRIORITY: list[FoodType] = [
    FoodType.SPICY_SOUP,
    FoodType.MILD_SOUP,
    FoodType.MEAT_HEAVY,
    FoodType.COMFORT_FOOD,
    FoodType.GREASY_MEAL,
    FoodType.LIGHT_MEAL,
    FoodType.REFRESH_MEAL,
    FoodType.QUICK_MEAL,
]

# PRD 9.2: which conditions each food type scores from
_SCORE_RULES: dict[FoodType, list[tuple[str, int]]] = {
    FoodType.SPICY_SOUP:   [("SPICY", 2), ("WARM", 2), ("SOUP", 3)],
    FoodType.MILD_SOUP:    [("NON_SPICY", 1), ("WARM", 2), ("SOUP", 3)],
    FoodType.MEAT_HEAVY:   [("HEAVY", 2), ("DRY", 1)],
    FoodType.LIGHT_MEAL:   [("LIGHT", 2), ("DRY", 1)],
    FoodType.COMFORT_FOOD: [("WARM", 2), ("NON_SPICY", 1)],
    FoodType.REFRESH_MEAL: [("COOL", 2), ("LIGHT", 1)],
    FoodType.GREASY_MEAL:  [("HEAVY", 2), ("SPICY", 1)],
    FoodType.QUICK_MEAL:   [("LIGHT", 1), ("DRY", 1)],
}

# PRD 9.3: tie-breaking attributes (soup > warm > heavy)
_HAS_SOUP = {FoodType.SPICY_SOUP, FoodType.MILD_SOUP}
_HAS_WARM = {FoodType.SPICY_SOUP, FoodType.MILD_SOUP, FoodType.COMFORT_FOOD}
_HAS_HEAVY = {FoodType.MEAT_HEAVY, FoodType.GREASY_MEAL}


def compute_food_type_scores(
    spicy: bool, warm: bool, light: bool, soup: bool
) -> dict[FoodType, int]:
    """Compute scores for all 8 food types based on condition vector (PRD 9.2)."""
    # Map boolean inputs to condition flags
    flags: set[str] = set()
    flags.add("SPICY" if spicy else "NON_SPICY")
    flags.add("WARM" if warm else "COOL")
    flags.add("LIGHT" if light else "HEAVY")
    flags.add("SOUP" if soup else "DRY")

    scores: dict[FoodType, int] = {}
    for food_type, rules in _SCORE_RULES.items():
        total = 0
        for condition, points in rules:
            if condition in flags:
                total += points
        scores[food_type] = total

    return scores


def determine_food_type(
    scores: dict[FoodType, int],
) -> tuple[FoodType, FoodType | None]:
    """
    Determine primary and secondary food type from scores (PRD 9.3).
    Tie-breaking: SOUP-bearing > WARM-bearing > HEAVY-bearing > priority table.
    Returns (primary, secondary) where secondary may be None.
    """
    max_score = max(scores.values())

    # Sort all types by: score desc, then tie-breaking rules
    def sort_key(ft: FoodType) -> tuple[int, int, int, int, int]:
        return (
            -scores[ft],
            -(1 if ft in _HAS_SOUP else 0),
            -(1 if ft in _HAS_WARM else 0),
            -(1 if ft in _HAS_HEAVY else 0),
            FOOD_TYPE_PRIORITY.index(ft),
        )

    ranked = sorted(scores.keys(), key=sort_key)
    primary = ranked[0]

    # Secondary: next best with score > 0
    secondary = None
    for ft in ranked[1:]:
        if scores[ft] > 0:
            secondary = ft
            break

    return primary, secondary


def compute_distance_weight(distance_m: int) -> int:
    """Compute distance weight score based on PRD 11.3."""
    if distance_m <= 200:
        return 35
    if distance_m <= 400:
        return 25
    if distance_m <= 700:
        return 15
    if distance_m <= 1200:
        return 5
    return 0


def compute_recommendation_score(rating: float, distance_m: int) -> float:
    """Compute recommendation score per PRD 11.2: (rating * 15) + distance_weight."""
    return (rating * 15) + compute_distance_weight(distance_m)
