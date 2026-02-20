import { useState, useCallback } from "react"
import { SWIPE_QUESTIONS } from "../../data/swipe-questions"
import type { ConditionVector } from "../../hooks/useRecommendation"
import { SwipeCard } from "./SwipeCard"

interface SwipeFlowProps {
  onComplete: (conditions: ConditionVector) => void
}

export function SwipeFlow({ onComplete }: SwipeFlowProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({
    spicy: false,
    warm: false,
    light: false,
    soup: false,
  })

  const handleAnswer = useCallback(
    (value: boolean) => {
      const question = SWIPE_QUESTIONS[currentIndex]
      const newAnswers = { ...answers, [question.conditionKey]: value }
      setAnswers(newAnswers)

      if (currentIndex < SWIPE_QUESTIONS.length - 1) {
        setCurrentIndex((i) => i + 1)
      } else {
        onComplete(newAnswers)
      }
    },
    [currentIndex, answers, onComplete]
  )

  const question = SWIPE_QUESTIONS[currentIndex]

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 px-4">
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">
          {currentIndex + 1} / {SWIPE_QUESTIONS.length}
        </p>
        <h2 className="text-xl font-bold text-gray-800">당신의 컨디션은?</h2>
      </div>

      <SwipeCard
        key={currentIndex}
        question={question}
        onYes={() => handleAnswer(true)}
        onNo={() => handleAnswer(false)}
      />

      {/* Progress dots */}
      <div className="flex gap-2">
        {SWIPE_QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < currentIndex
                ? "bg-primary"
                : i === currentIndex
                ? "bg-primary/60"
                : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Tap buttons for accessibility */}
      <div className="flex gap-4">
        <button
          onClick={() => handleAnswer(false)}
          className="px-6 py-2.5 rounded-full border-2 border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          {question.noLabel}
        </button>
        <button
          onClick={() => handleAnswer(true)}
          className="px-6 py-2.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary/90 transition-colors"
        >
          {question.yesLabel}
        </button>
      </div>
    </div>
  )
}
