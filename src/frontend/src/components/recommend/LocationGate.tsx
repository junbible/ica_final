import { useEffect, useState } from "react"
import { useGeolocation } from "../../hooks/useGeolocation"
import { LOCATIONS, LOCATION_COORDS } from "../../data/restaurants"

interface LocationGateProps {
  onConfirm: (lat: number, lng: number) => void
}

export function LocationGate({ onConfirm }: LocationGateProps) {
  const { status, position, requestLocation } = useGeolocation()
  const [showFallback, setShowFallback] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)

  useEffect(() => {
    if (status === "granted" && position) {
      onConfirm(position.coords.latitude, position.coords.longitude)
    }
    if (status === "denied") {
      setShowFallback(true)
    }
  }, [status, position, onConfirm])

  const handleRequestGPS = () => {
    setHasRequested(true)
    requestLocation()
  }

  const handleFallback = (loc: string) => {
    const coords = LOCATION_COORDS[loc]
    if (coords) {
      onConfirm(coords.lat, coords.lng)
    }
  }

  // GPS 요청 중
  if (hasRequested && (status === "idle" || status === "requesting")) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <div className="text-6xl animate-pulse">📍</div>
        <p className="text-gray-600 font-medium">위치를 확인하고 있어요...</p>
      </div>
    )
  }

  // GPS 거부 → 지역 선택 폴백
  if (showFallback || status === "denied") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
        <div className="text-6xl">📍</div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            어디서 드실 건가요?
          </h2>
          <p className="text-gray-500 text-sm">
            위치 권한이 거부되었어요. 아래에서 선택해주세요.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => handleFallback(loc)}
              className="px-3 py-3 rounded-xl bg-white border-2 border-gray-100 text-gray-700 font-medium hover:border-primary hover:text-primary transition-colors shadow-sm text-sm"
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // GPS 사전 안내 화면 (첫 진입 시)
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-6 px-4">
      <div className="text-6xl">📍</div>
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">
          내 근처 맛집을 찾아볼까요?
        </h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          위치 정보를 허용하면<br />가까운 맛집을 바로 추천해드려요
        </p>
      </div>
      <button
        onClick={handleRequestGPS}
        className="px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-md"
      >
        현재 위치로 찾기
      </button>
      <button
        onClick={() => setShowFallback(true)}
        className="text-sm text-gray-400 underline"
      >
        직접 지역을 선택할게요
      </button>
    </div>
  )
}
