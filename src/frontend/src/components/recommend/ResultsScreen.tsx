import type { RecommendResponse } from "../../lib/recommend-api"
import { RestaurantScoreCard } from "./RestaurantScoreCard"

interface ResultsScreenProps {
  result: RecommendResponse
  onRetry: () => void
}

const CONDITION_LABELS: Record<string, [string, string]> = {
  spicy: ["자극적", "순한맛"],
  warm: ["따뜻함", "시원함"],
  light: ["가볍게", "든든하게"],
  soup: ["국물", "국물 없이"],
}

export function ResultsScreen({ result, onRetry }: ResultsScreenProps) {
  return (
    <div className="pb-20 px-4">
      {/* Condition summary badges */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {Object.entries(result.condition_summary).map(([key, value]) => {
          const labels = CONDITION_LABELS[key]
          if (!labels) return null
          return (
            <span
              key={key}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            >
              {value ? labels[0] : labels[1]}
            </span>
          )
        })}
      </div>

      {/* Food type card */}
      <div className="mt-5 bg-gradient-to-br from-primary/10 to-amber-50 rounded-2xl p-5 text-center">
        <h2 className="text-2xl font-bold text-gray-800">
          {result.food_type_label}
        </h2>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          {result.food_type_reason}
        </p>
      </div>

      {/* Restaurant list */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">
            추천 맛집 ({result.total_count}곳)
          </h3>
        </div>
        <div className="flex flex-col gap-3">
          {result.restaurants.map((r, i) => (
            <RestaurantScoreCard key={r.id} restaurant={r} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Retry button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors shadow-md"
        >
          다시 추천받기
        </button>
      </div>
    </div>
  )
}
