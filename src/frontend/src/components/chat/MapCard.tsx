import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, ExternalLink, Phone, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface Restaurant {
  id: string
  name: string
  category: string
  address: string
  phone: string
  place_url: string
  lat: number
  lng: number
  distance: number
}

interface MapCardProps {
  restaurants: Restaurant[]
  onNavigate?: () => void
}

declare global {
  interface Window {
    kakao: any
  }
}

function initMap(
  container: HTMLDivElement,
  restaurants: Restaurant[],
) {
  const kakao = window.kakao

  const avgLat = restaurants.reduce((sum, r) => sum + r.lat, 0) / restaurants.length
  const avgLng = restaurants.reduce((sum, r) => sum + r.lng, 0) / restaurants.length

  const map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(avgLat, avgLng),
    level: 4,
  })

  restaurants.forEach((restaurant, index) => {
    const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng)
    const content = `
      <div style="
        background: linear-gradient(135deg, #FBBF24, #F59E0B);
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        border: 2px solid white;
      ">${index + 1}</div>
    `
    new kakao.maps.CustomOverlay({ position, content, yAnchor: 0.5 }).setMap(map)
  })
}

export function MapCard({ restaurants, onNavigate }: MapCardProps) {
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedRestaurant] = useState<Restaurant | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!restaurants.length || !mapRef.current) return

    const container = mapRef.current

    const tryInitMap = () => {
      try {
        initMap(container, restaurants)
        setMapLoaded(true)
      } catch (e) {
        console.error("Map init error:", e)
        setMapError(true)
      }
    }

    // SDK가 이미 완전히 로드된 경우 (LatLng 클래스 존재 확인)
    if (window.kakao?.maps?.LatLng) {
      tryInitMap()
      return
    }

    // SDK 로더가 존재하면 load() 호출
    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(() => tryInitMap())
      return
    }

    // SDK 자체가 아직 로드되지 않은 경우 — 폴링으로 대기
    let attempts = 0
    const maxAttempts = 20
    const interval = setInterval(() => {
      attempts++
      if (window.kakao?.maps?.load) {
        clearInterval(interval)
        window.kakao.maps.load(() => tryInitMap())
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        console.error("Kakao Maps SDK failed to load after timeout")
        setMapError(true)
      }
    }, 500)

    return () => clearInterval(interval)
  }, [restaurants])

  if (!restaurants.length) return null

  return (
    <Card className="overflow-hidden border-0 shadow-lg mt-2">
      {/* 지도 */}
      <div
        ref={mapRef}
        className="w-full h-[200px] bg-gray-100"
        style={{ minHeight: "200px" }}
      >
        {!mapLoaded && !mapError && (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            지도 로딩 중...
          </div>
        )}
        {mapError && (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            지도를 불러올 수 없습니다
          </div>
        )}
      </div>

      {/* 맛집 리스트 */}
      <div className="max-h-[200px] overflow-y-auto">
        {restaurants.map((restaurant, index) => (
          <div
            key={restaurant.id}
            className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-primary/5 ${
              selectedRestaurant?.id === restaurant.id ? "bg-primary/10" : ""
            }`}
            onClick={() => { onNavigate?.(); navigate(`/restaurant/${restaurant.id}?name=${encodeURIComponent(restaurant.name)}`, { state: { restaurant } }) }}
          >
            <div className="flex items-start gap-3">
              {/* 번호 */}
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                {index + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm truncate">{restaurant.name}</span>
                  {restaurant.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {restaurant.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{restaurant.address}</span>
                  <span className="text-primary font-medium ml-1">{restaurant.distance}m</span>
                </div>

                {/* 액션 버튼 */}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 text-xs px-2 bg-primary hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation()
                      onNavigate?.()
                      navigate(`/restaurant/${restaurant.id}?name=${encodeURIComponent(restaurant.name)}`, { state: { restaurant } })
                    }}
                  >
                    <ChevronRight className="w-3 h-3 mr-1" />
                    상세보기
                  </Button>
                  {restaurant.place_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(restaurant.place_url, "_blank")
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      카카오맵
                    </Button>
                  )}
                  {restaurant.phone && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(`tel:${restaurant.phone}`, "_self")
                      }}
                    >
                      <Phone className="w-3 h-3 mr-1" />
                      전화
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
