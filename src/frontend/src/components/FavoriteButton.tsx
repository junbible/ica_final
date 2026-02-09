import { useState } from "react"
import { Heart } from "lucide-react"
import { useFavorites } from "@/contexts/FavoritesContext"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  restaurantId: string
  restaurantName: string
  restaurantImage?: string
  restaurantCategory?: string
  restaurantRating?: string
  className?: string
  onLoginRequired?: () => void
}

export function FavoriteButton({
  restaurantId,
  restaurantName,
  restaurantImage,
  restaurantCategory,
  restaurantRating,
  className,
  onLoginRequired,
}: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [isLoading, setIsLoading] = useState(false)

  const favorite = isFavorite(restaurantId)

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (!isAuthenticated) {
      onLoginRequired?.()
      return
    }

    setIsLoading(true)
    await toggleFavorite({
      restaurant_id: restaurantId,
      restaurant_name: restaurantName,
      restaurant_image: restaurantImage,
      restaurant_category: restaurantCategory,
      restaurant_rating: restaurantRating,
    })
    setIsLoading(false)
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "p-1.5 rounded-full transition-all",
        favorite
          ? "bg-red-500 text-white"
          : "bg-black/30 text-white hover:bg-black/50",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <Heart
        className={cn(
          "w-4 h-4",
          favorite && "fill-current"
        )}
      />
    </button>
  )
}
