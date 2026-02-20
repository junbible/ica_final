import { useEffect } from "react"
import { useRecommendation } from "../../hooks/useRecommendation"
import { LocationGate } from "../recommend/LocationGate"
import { SwipeFlow } from "../recommend/SwipeFlow"
import { ProcessingScreen } from "../recommend/ProcessingScreen"
import type { Restaurant } from "./MapCard"
import type { ScoredRestaurant } from "../../lib/recommend-api"

interface SwipeRecommendOverlayProps {
  onComplete: (restaurants: Restaurant[], summary: string) => void
}

function toRestaurant(r: ScoredRestaurant): Restaurant {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    full_category: r.full_category,
    address: r.address,
    phone: r.phone,
    place_url: r.place_url,
    lat: r.lat,
    lng: r.lng,
    distance: r.distance,
  }
}

export function SwipeRecommendOverlay({ onComplete }: SwipeRecommendOverlayProps) {
  const { step, result, confirmLocation, completeSwipe } = useRecommendation()

  useEffect(() => {
    if (step === "results" && result) {
      const restaurants = result.restaurants.slice(0, 3).map(toRestaurant)
      const summary = `${result.food_type_label} 맛집을 찾았어요! ${result.food_type_reason}`
      onComplete(restaurants, summary)
    }
  }, [step, result, onComplete])

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      {step === "location" && <LocationGate onConfirm={confirmLocation} />}
      {step === "swiping" && <SwipeFlow onComplete={completeSwipe} />}
      {(step === "processing" || step === "results") && <ProcessingScreen />}
      {step === "failure" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
          <div className="text-5xl">😢</div>
          <p className="text-gray-600 text-center">
            근처에서 맛집을 찾지 못했어요.<br />다시 시도해보세요!
          </p>
        </div>
      )}
    </div>
  )
}
