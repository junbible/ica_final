const FOOD_EMOJIS = ["🍜", "🍖", "🥗", "🍲", "🌶️", "🍕", "🍣", "🥘"]

export function ProcessingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      <div className="flex gap-3">
        {FOOD_EMOJIS.slice(0, 4).map((emoji, i) => (
          <span
            key={i}
            className="text-4xl animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            {emoji}
          </span>
        ))}
      </div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          맛집을 찾고 있어요
        </h2>
        <p className="text-gray-500 text-sm">
          컨디션에 딱 맞는 음식을 골라볼게요...
        </p>
      </div>
    </div>
  )
}
