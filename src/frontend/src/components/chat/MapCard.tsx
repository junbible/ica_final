import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MapPin, ExternalLink, Phone, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RESTAURANTS as LOCAL_RESTAURANTS } from "@/data/restaurants"

export interface Restaurant {
  id: string
  name: string
  category: string
  address: string
  phone: string
  url: string
  lat: number
  lng: number
  distance: number
}

interface MapCardProps {
  restaurants: Restaurant[]
}

// 레스토랑 이름으로 로컬 데이터 매칭
function findLocalRestaurant(name: string) {
  // 정확한 이름 매칭
  const exact = LOCAL_RESTAURANTS.find(r => r.name === name)
  if (exact) return exact

  // 부분 매칭 (공백, 점 등 제거 후 비교)
  const normalize = (s: string) => s.replace(/[\s·\-\.]/g, "").toLowerCase()
  const normalizedName = normalize(name)

  return LOCAL_RESTAURANTS.find(r => {
    const normalizedLocal = normalize(r.name)
    return normalizedLocal.includes(normalizedName) || normalizedName.includes(normalizedLocal)
  })
}

declare global {
  interface Window {
    kakao: any
  }
}

export function MapCard({ restaurants }: MapCardProps) {
  const navigate = useNavigate()
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!restaurants.length || !mapRef.current) return

    // Kakao Maps SDK 로드 확인
    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao Maps SDK not loaded")
      return
    }

    window.kakao.maps.load(() => {
      setMapLoaded(true)

      // 지도 중심 계산 (맛집들의 평균 좌표)
      const avgLat = restaurants.reduce((sum, r) => sum + r.lat, 0) / restaurants.length
      const avgLng = restaurants.reduce((sum, r) => sum + r.lng, 0) / restaurants.length

      const mapOption = {
        center: new window.kakao.maps.LatLng(avgLat, avgLng),
        level: 4
      }

      const map = new window.kakao.maps.Map(mapRef.current, mapOption)

      // 마커 추가
      restaurants.forEach((restaurant, index) => {
        const markerPosition = new window.kakao.maps.LatLng(restaurant.lat, restaurant.lng)

        // 커스텀 오버레이 (숫자 마커)
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

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: markerPosition,
          content: content,
          yAnchor: 0.5
        })

        customOverlay.setMap(map)
      })
    })
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
        {!mapLoaded && (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            지도 로딩 중...
          </div>
        )}
      </div>

      {/* 맛집 리스트 */}
      <div className="max-h-[200px] overflow-y-auto">
        {restaurants.map((restaurant, index) => {
          const localMatch = findLocalRestaurant(restaurant.name)

          return (
            <div
              key={restaurant.id}
              className={`p-3 border-b last:border-b-0 cursor-pointer transition-colors hover:bg-primary/5 ${
                selectedRestaurant?.id === restaurant.id ? "bg-primary/10" : ""
              }`}
              onClick={() => {
                if (localMatch) {
                  navigate(`/restaurant/${localMatch.id}`)
                } else {
                  setSelectedRestaurant(restaurant)
                }
              }}
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
                    {localMatch && (
                      <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded font-medium">
                        앱 맛집
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
                    {localMatch ? (
                      <Button
                        variant="default"
                        size="sm"
                        className="h-7 text-xs px-2 bg-primary hover:bg-primary/90"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/restaurant/${localMatch.id}`)
                        }}
                      >
                        <ChevronRight className="w-3 h-3 mr-1" />
                        상세보기
                      </Button>
                    ) : restaurant.url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open(restaurant.url, "_blank")
                        }}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        카카오맵
                      </Button>
                    ) : null}
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
          )
        })}
      </div>
    </Card>
  )
}
