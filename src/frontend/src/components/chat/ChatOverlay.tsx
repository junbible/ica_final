import { useCallback } from "react"
import { ArrowLeft } from "lucide-react"
import { SwipeRecommendOverlay } from "./SwipeRecommendOverlay"
import { MenuWorldCup } from "./MenuWorldCup"
import type { Restaurant } from "./MapCard"

export interface OverlayResult {
  type: "swipe" | "worldcup"
  restaurants: Restaurant[]
  summary: string
  winnerName?: string
}

interface ChatOverlayProps {
  type: "swipe" | "worldcup"
  onComplete: (result: OverlayResult) => void
  onClose: () => void
}

export function ChatOverlay({ type, onComplete, onClose }: ChatOverlayProps) {
  const handleSwipeComplete = useCallback(
    (restaurants: Restaurant[], summary: string) => {
      onComplete({ type: "swipe", restaurants, summary })
    },
    [onComplete]
  )

  const handleWorldCupComplete = useCallback(
    (restaurants: Restaurant[], summary: string, winnerName: string) => {
      onComplete({ type: "worldcup", restaurants, summary, winnerName })
    },
    [onComplete]
  )

  const title = type === "swipe" ? "스와이프 추천" : "메뉴 월드컵"

  return (
    <div className="absolute inset-0 z-20 bg-white flex flex-col rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-white">
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-800">{title}</h3>
      </div>

      {/* Content */}
      {type === "swipe" ? (
        <SwipeRecommendOverlay onComplete={handleSwipeComplete} />
      ) : (
        <MenuWorldCup onComplete={handleWorldCupComplete} />
      )}
    </div>
  )
}
