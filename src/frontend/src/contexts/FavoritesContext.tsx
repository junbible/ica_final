import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getFavorites, addFavorite, removeFavorite, type Favorite, type FavoriteCreate } from "@/lib/favorites"
import { useAuth } from "./AuthContext"

interface FavoritesContextType {
  favorites: Favorite[]
  isLoading: boolean
  isFavorite: (restaurantId: string) => boolean
  toggleFavorite: (data: FavoriteCreate) => Promise<boolean>
  refreshFavorites: () => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const refreshFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([])
      return
    }
    setIsLoading(true)
    try {
      const data = await getFavorites()
      setFavorites(data)
    } catch {
      setFavorites([])
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  // 로그인 상태 변경 시 즐겨찾기 로드
  useEffect(() => {
    refreshFavorites()
  }, [refreshFavorites])

  const isFavorite = useCallback((restaurantId: string) => {
    return favorites.some(f => f.restaurant_id === restaurantId)
  }, [favorites])

  const toggleFavorite = useCallback(async (data: FavoriteCreate): Promise<boolean> => {
    if (!isAuthenticated) return false

    const existing = favorites.find(f => f.restaurant_id === data.restaurant_id)

    if (existing) {
      // 삭제
      const success = await removeFavorite(data.restaurant_id)
      if (success) {
        setFavorites(prev => prev.filter(f => f.restaurant_id !== data.restaurant_id))
        return true
      }
    } else {
      // 추가
      const newFavorite = await addFavorite(data)
      if (newFavorite) {
        setFavorites(prev => [newFavorite, ...prev])
        return true
      }
    }
    return false
  }, [isAuthenticated, favorites])

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        refreshFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
