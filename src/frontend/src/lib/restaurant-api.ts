/**
 * 백엔드 맛집 API 클라이언트
 */

const API_BASE = import.meta.env.VITE_API_URL || ""

export interface KakaoRestaurant {
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
}

export interface SearchResponse {
  restaurants: KakaoRestaurant[]
  total_count: number
  is_end: boolean
}

export interface RegionInfo {
  region_1depth: string
  region_2depth: string
  region_3depth: string
  display_name: string
}

export async function searchRestaurants(
  query: string,
  lat?: number,
  lng?: number,
  radius?: number,
  page?: number,
  size?: number,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ query })
  if (lat !== undefined) params.set("lat", String(lat))
  if (lng !== undefined) params.set("lng", String(lng))
  if (radius !== undefined) params.set("radius", String(radius))
  if (page !== undefined) params.set("page", String(page))
  if (size !== undefined) params.set("size", String(size))

  const res = await fetch(`${API_BASE}/api/restaurants/search?${params}`)
  if (!res.ok) throw new Error(`Search failed: ${res.status}`)
  return res.json()
}

export async function getNearbyRestaurants(
  lat: number,
  lng: number,
  radius?: number,
  size?: number,
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  })
  if (radius !== undefined) params.set("radius", String(radius))
  if (size !== undefined) params.set("size", String(size))

  const res = await fetch(`${API_BASE}/api/restaurants/nearby?${params}`)
  if (!res.ok) throw new Error(`Nearby search failed: ${res.status}`)
  return res.json()
}

export async function getRegionInfo(lat: number, lng: number): Promise<RegionInfo> {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
  })

  const res = await fetch(`${API_BASE}/api/restaurants/region?${params}`)
  if (!res.ok) throw new Error(`Region lookup failed: ${res.status}`)
  return res.json()
}

export interface Review {
  username: string
  point: number
  date: string
  contents: string
  photos: string[]
}

export interface ReviewResponse {
  reviews: Review[]
  total_count: number
  avg_score: number
}

export async function getRestaurantReviews(placeId: string): Promise<ReviewResponse> {
  try {
    const res = await fetch(`${API_BASE}/api/restaurants/${placeId}/reviews`)
    if (!res.ok) return { reviews: [], total_count: 0, avg_score: 0 }
    return res.json()
  } catch {
    return { reviews: [], total_count: 0, avg_score: 0 }
  }
}

export async function getRestaurantDetail(
  placeId: string,
  name?: string,
): Promise<KakaoRestaurant | null> {
  const params = new URLSearchParams()
  if (name) params.set("name", name)

  const res = await fetch(
    `${API_BASE}/api/restaurants/${placeId}?${params}`,
  )
  if (!res.ok) return null
  const data = await res.json()
  return data || null
}
