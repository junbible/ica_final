/**
 * 추천 API 클라이언트
 */

const API_BASE = import.meta.env.VITE_API_URL || ""

export interface RecommendRequest {
  spicy: boolean
  warm: boolean
  light: boolean
  soup: boolean
  lat: number
  lng: number
  radius?: number
}

export interface ScoredRestaurant {
  id: string
  name: string
  category: string
  full_category: string
  address: string
  phone: string
  place_url: string
  image_url: string
  lat: number
  lng: number
  distance: number
  rating: number
  recommendation_score: number
  distance_weight: number
}

export interface RecommendResponse {
  food_type: string
  food_type_label: string
  food_type_reason: string
  condition_summary: {
    spicy: boolean
    warm: boolean
    light: boolean
    soup: boolean
  }
  restaurants: ScoredRestaurant[]
  total_count: number
  secondary_food_type: string | null
}

export async function postRecommendation(
  req: RecommendRequest
): Promise<RecommendResponse> {
  const res = await fetch(`${API_BASE}/api/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })
  if (!res.ok) {
    throw new Error(`추천 요청 실패: ${res.status}`)
  }
  return res.json()
}
