import { useNavigate } from "react-router-dom"
import type { ScoredRestaurant } from "../../lib/recommend-api"
import { getCategoryImage } from "../../data/restaurants"
import { FavoriteButton } from "../FavoriteButton"

interface RestaurantScoreCardProps {
  restaurant: ScoredRestaurant
  rank: number
}

function formatDistance(m: number): string {
  if (m < 1000) return `${m}m`
  return `${(m / 1000).toFixed(1)}km`
}

export function RestaurantScoreCard({
  restaurant,
  rank,
}: RestaurantScoreCardProps) {
  const navigate = useNavigate()
  const imageUrl = restaurant.image_url || getCategoryImage(restaurant.category)

  const rankColors: Record<number, string> = {
    1: "bg-yellow-400 text-white",
    2: "bg-gray-300 text-white",
    3: "bg-amber-600 text-white",
  }

  return (
    <div
      onClick={() => navigate(`/restaurant/${restaurant.id}?name=${encodeURIComponent(restaurant.name)}`)}
      className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Image + rank badge */}
      <div className="relative w-20 h-20 flex-shrink-0">
        <img
          src={imageUrl}
          alt={restaurant.name}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = getCategoryImage(restaurant.category)
          }}
        />
        {rank <= 3 && (
          <span
            className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              rankColors[rank] || ""
            }`}
          >
            {rank}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 text-sm truncate">
            {restaurant.name}
          </h3>
          <FavoriteButton
            restaurantId={restaurant.id}
            restaurantName={restaurant.name}
            restaurantImage={imageUrl}
            restaurantCategory={restaurant.category}
            restaurantRating={restaurant.rating.toFixed(1)}
            className="flex-shrink-0"
          />
        </div>
        <p className="text-xs text-gray-500 truncate">{restaurant.category}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {restaurant.rating > 0 && (
            <span className="text-xs font-medium text-yellow-600">
              ★ {restaurant.rating.toFixed(1)}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {formatDistance(restaurant.distance)}
          </span>
        </div>
        <div className="mt-1">
          <span className="text-[10px] text-gray-400">
            추천점수 {restaurant.recommendation_score.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}
