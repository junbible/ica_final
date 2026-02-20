import { useSwipeGesture } from "../../hooks/useSwipeGesture"
import type { SwipeQuestion } from "../../data/swipe-questions"

interface SwipeCardProps {
  question: SwipeQuestion
  onYes: () => void
  onNo: () => void
}

export function SwipeCard({ question, onYes, onNo }: SwipeCardProps) {
  const { ref, offset, isDragging, direction, handlers } = useSwipeGesture({
    onSwipeRight: onYes,
    onSwipeLeft: onNo,
  })

  const rotation = offset * 0.1
  const absOffset = Math.abs(offset)
  const hintOpacity = Math.min(absOffset / 100, 1)

  return (
    <div
      ref={ref}
      {...handlers}
      className="relative w-72 h-96 select-none touch-none cursor-grab active:cursor-grabbing"
      style={{
        transform: `translateX(${offset}px) rotate(${rotation}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease-out",
      }}
    >
      <div className="w-full h-full bg-white rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center justify-center p-8 gap-6 relative overflow-hidden">
        {/* Left hint (NO) */}
        <div
          className="absolute inset-0 bg-red-50 rounded-3xl flex items-center justify-start pl-6 pointer-events-none"
          style={{ opacity: direction === "left" ? hintOpacity : 0 }}
        >
          <span className="text-red-500 font-bold text-lg rotate-[-15deg]">
            {question.noLabel} ✕
          </span>
        </div>

        {/* Right hint (YES) */}
        <div
          className="absolute inset-0 bg-green-50 rounded-3xl flex items-center justify-end pr-6 pointer-events-none"
          style={{ opacity: direction === "right" ? hintOpacity : 0 }}
        >
          <span className="text-green-500 font-bold text-lg rotate-[15deg]">
            {question.yesLabel} ✓
          </span>
        </div>

        {/* Content */}
        <span className="text-7xl">{question.emoji}</span>
        <p className="text-lg font-semibold text-gray-800 text-center leading-relaxed">
          {question.text}
        </p>
        <div className="flex gap-8 text-sm text-gray-400 mt-2">
          <span>← {question.noLabel}</span>
          <span>{question.yesLabel} →</span>
        </div>
      </div>
    </div>
  )
}
