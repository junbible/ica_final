import { useNavigate } from "react-router-dom"
import { useRecommendation } from "../hooks/useRecommendation"
import { LocationGate } from "../components/recommend/LocationGate"
import { SwipeFlow } from "../components/recommend/SwipeFlow"
import { ProcessingScreen } from "../components/recommend/ProcessingScreen"
import { ResultsScreen } from "../components/recommend/ResultsScreen"
import { FailureScreen } from "../components/recommend/FailureScreen"

export function RecommendPage() {
  const navigate = useNavigate()
  const rec = useRecommendation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 text-sm font-medium"
          >
            ← 홈
          </button>
          <h1 className="text-base font-bold text-gray-800">맞춤 추천</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Step content */}
      {rec.step === "location" && (
        <LocationGate onConfirm={rec.confirmLocation} />
      )}
      {rec.step === "swiping" && (
        <SwipeFlow onComplete={rec.completeSwipe} />
      )}
      {rec.step === "processing" && <ProcessingScreen />}
      {rec.step === "results" && rec.result && (
        <ResultsScreen result={rec.result} onRetry={rec.retry} />
      )}
      {rec.step === "failure" && (
        <FailureScreen
          error={rec.error}
          radius={rec.radius}
          onExpandRadius={rec.expandRadius}
          onRetry={rec.retry}
          onChangeLocation={rec.changeLocation}
        />
      )}
    </div>
  )
}

export default RecommendPage
