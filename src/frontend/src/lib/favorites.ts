/**
 * 즐겨찾기 API 클라이언트
 */

const API_URL = import.meta.env.VITE_API_URL || ""

export interface Favorite {
  id: string
  restaurant_id: string
  restaurant_name: string
  restaurant_image: string | null
  restaurant_category: string | null
  restaurant_rating: string | null
  created_at: string
}

export interface FavoriteCreate {
  restaurant_id: string
  restaurant_name: string
  restaurant_image?: string
  restaurant_category?: string
  restaurant_rating?: string
}

/**
 * 즐겨찾기 목록 조회
 */
export async function getFavorites(): Promise<Favorite[]> {
  try {
    const response = await fetch(`${API_URL}/api/favorites`, {
      credentials: "include",
    })
    if (response.ok) {
      return await response.json()
    }
    return []
  } catch {
    return []
  }
}

/**
 * 즐겨찾기 추가
 */
export async function addFavorite(data: FavoriteCreate): Promise<Favorite | null> {
  try {
    const response = await fetch(`${API_URL}/api/favorites`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (response.ok) {
      return await response.json()
    }
    return null
  } catch {
    return null
  }
}

/**
 * 즐겨찾기 삭제
 */
export async function removeFavorite(restaurantId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/favorites/${restaurantId}`, {
      method: "DELETE",
      credentials: "include",
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 즐겨찾기 여부 확인
 */
export async function checkFavorite(restaurantId: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/favorites/check/${restaurantId}`, {
      credentials: "include",
    })
    if (response.ok) {
      const data = await response.json()
      return data.is_favorite
    }
    return false
  } catch {
    return false
  }
}
