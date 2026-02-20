interface FailureScreenProps {
  error: string | null
  radius: number
  onExpandRadius: () => void
  onRetry: () => void
  onChangeLocation: () => void
}

export function FailureScreen({
  error,
  radius,
  onExpandRadius,
  onRetry,
  onChangeLocation,
}: FailureScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      <div className="text-6xl">😢</div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          결과가 없습니다
        </h2>
        <p className="text-gray-500 text-sm">
          {error || `반경 ${(radius / 1000).toFixed(1)}km 내에 조건에 맞는 식당을 찾지 못했어요.`}
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onExpandRadius}
          className="w-full px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          범위 넓혀서 다시 추천 ({((radius + 1000) / 1000).toFixed(1)}km)
        </button>
        <button
          onClick={onRetry}
          className="w-full px-6 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          컨디션 다시 선택
        </button>
        <button
          onClick={onChangeLocation}
          className="w-full px-6 py-3 rounded-full border-2 border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          위치 변경
        </button>
      </div>
    </div>
  )
}
