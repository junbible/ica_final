import { useEffect, useState, useRef } from "react"
import { Search, MapPin, Clock } from "lucide-react"
import { useGeolocation } from "../../hooks/useGeolocation"
import { LOCATIONS, LOCATION_COORDS } from "../../data/restaurants"
import { searchPlaces, type PlaceSearchResult } from "../../lib/kakao-maps"

const STORAGE_KEY = "nyam_last_location"

interface SavedLocation {
  name: string
  lat: number
  lng: number
}

function saveLocation(name: string, lat: number, lng: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ name, lat, lng }))
  } catch {}
}

function loadSavedLocation(): SavedLocation | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

interface LocationGateProps {
  onConfirm: (lat: number, lng: number) => void
}

export function LocationGate({ onConfirm }: LocationGateProps) {
  const { status, position, requestLocation } = useGeolocation()
  const [showFallback, setShowFallback] = useState(false)
  const [hasRequested, setHasRequested] = useState(false)
  const [savedLocation] = useState<SavedLocation | null>(loadSavedLocation)

  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PlaceSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (status === "granted" && position) {
      saveLocation("현재 위치", position.coords.latitude, position.coords.longitude)
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

  const handleSelectLocation = (name: string, lat: number, lng: number) => {
    saveLocation(name, lat, lng)
    onConfirm(lat, lng)
  }

  const handleFallback = (loc: string) => {
    const coords = LOCATION_COORDS[loc]
    if (coords) {
      handleSelectLocation(loc, coords.lat, coords.lng)
    }
  }

  const handleSearchInput = (value: string) => {
    setSearchQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (value.trim().length < 2) {
      setSearchResults([])
      return
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const results = await searchPlaces(value.trim())
        setSearchResults(results)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
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

  // GPS 거부 또는 직접 선택 → 지역 선택 UI
  if (showFallback || status === "denied") {
    return (
      <div className="flex flex-col items-center min-h-[80vh] gap-5 px-4 pt-8">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">
            어디서 드실 건가요?
          </h2>
          <p className="text-gray-400 text-xs">
            장소를 검색하거나 지역을 선택해주세요
          </p>
        </div>

        {/* 검색 입력 */}
        <div className="w-full max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="동네, 역, 건물 이름 검색"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-gray-100 focus:border-primary focus:outline-none text-sm transition-colors"
          />
        </div>

        {/* 검색 결과 */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="w-full max-w-xs bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {isSearching ? (
              <div className="px-4 py-3 text-sm text-gray-400 text-center">검색 중...</div>
            ) : (
              searchResults.map((place, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectLocation(place.name, place.lat, place.lng)}
                  className="w-full flex items-start gap-2.5 px-4 py-2.5 hover:bg-primary/5 transition-colors text-left border-b last:border-b-0"
                >
                  <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{place.name}</p>
                    <p className="text-xs text-gray-400 truncate">{place.address}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {/* 이전 위치 */}
        {savedLocation && !searchQuery && (
          <button
            onClick={() => handleSelectLocation(savedLocation.name, savedLocation.lat, savedLocation.lng)}
            className="w-full max-w-xs flex items-center gap-2.5 px-4 py-3 rounded-xl bg-primary/5 border-2 border-primary/20 hover:border-primary transition-colors"
          >
            <Clock className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="text-left min-w-0">
              <p className="text-sm font-medium text-gray-800">이전 위치 사용</p>
              <p className="text-xs text-gray-400 truncate">{savedLocation.name}</p>
            </div>
          </button>
        )}

        {/* 추천 지역 */}
        {!searchQuery && (
          <>
            <p className="text-xs text-gray-400 mt-1">추천 지역</p>
            <div className="grid grid-cols-3 gap-2.5 w-full max-w-xs">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleFallback(loc)}
                  className="px-3 py-2.5 rounded-xl bg-white border-2 border-gray-100 text-gray-700 font-medium hover:border-primary hover:text-primary transition-colors shadow-sm text-sm"
                >
                  {loc}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  // GPS 사전 안내 화면 (첫 진입)
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

      {/* 이전 위치가 있으면 바로 사용 옵션 */}
      {savedLocation && (
        <button
          onClick={() => handleSelectLocation(savedLocation.name, savedLocation.lat, savedLocation.lng)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors"
        >
          <Clock className="w-4 h-4" />
          {savedLocation.name} 주변으로 찾기
        </button>
      )}

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
