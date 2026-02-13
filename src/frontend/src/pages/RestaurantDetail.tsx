import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  ArrowLeft,
  Share2,
  Phone,
  MapPin,
  ExternalLink,
  Navigation,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LazyImage, getOptimizedImageUrl } from "@/components/ui/lazy-image"
import { FavoriteButton } from "@/components/FavoriteButton"
import { LoginDialog } from "@/components/auth/LoginDialog"
import { getCategoryImage } from "@/data/restaurants"
import { getRestaurantDetail, searchRestaurants, type KakaoRestaurant } from "@/lib/restaurant-api"
import { useToast } from "@/components/ui/toast"

export function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  // React Router state로 전달된 레스토랑 데이터 (즉시 로딩)
  const stateRestaurant = (location.state as { restaurant?: KakaoRestaurant })?.restaurant || null

  const [restaurant, setRestaurant] = useState<KakaoRestaurant | null>(stateRestaurant)
  const [isLoading, setIsLoading] = useState(!stateRestaurant)
  const [error, setError] = useState<string | null>(null)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"info" | "place">("info")

  useEffect(() => {
    // state로 이미 데이터가 있으면 API 호출 불필요
    if (stateRestaurant) return
    if (!id) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    async function fetchDetail() {
      try {
        const params = new URLSearchParams(window.location.search)
        const name = params.get("name") || undefined

        let data = await getRestaurantDetail(id!, name)

        // 첫 시도 실패 시 ID를 쿼리로 검색 시도
        if (!data && !name) {
          const searchResult = await searchRestaurants(id!, undefined, undefined, undefined, undefined, 1)
          if (searchResult.restaurants.length > 0) {
            data = searchResult.restaurants[0]
          }
        }

        if (!cancelled) {
          if (data) {
            setRestaurant(data)
          } else {
            setError("맛집 정보를 불러올 수 없습니다")
          }
          setIsLoading(false)
        }
      } catch {
        if (!cancelled) {
          setError("네트워크 오류가 발생했습니다")
          setIsLoading(false)
        }
      }
    }

    fetchDetail()
    return () => { cancelled = true }
  }, [id, stateRestaurant])

  const handleCall = () => {
    if (restaurant?.phone) {
      window.location.href = `tel:${restaurant.phone}`
    } else {
      showToast("전화번호가 등록되지 않았습니다", "info")
    }
  }

  const handleOpenKakaoMap = () => {
    if (restaurant?.place_url) {
      window.open(restaurant.place_url, "_blank")
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: restaurant?.name || "맛집",
      text: `${restaurant?.name} - ${restaurant?.category}`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // 취소
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      showToast("링크가 복사되었습니다", "success")
    }
  }

  const handleCopyAddress = async () => {
    if (restaurant?.address) {
      await navigator.clipboard.writeText(restaurant.address)
      showToast("주소가 복사되었습니다", "success")
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center px-4 py-3">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        </header>
        <div className="animate-pulse">
          <div className="aspect-[2/1] bg-gray-200" />
          <div className="px-4 py-5 space-y-3">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{error || "맛집을 찾을 수 없습니다"}</p>
          <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  // 카테고리에서 태그 생성
  const tags = restaurant.full_category
    ? restaurant.full_category.split(" > ").filter(Boolean)
    : [restaurant.category]

  const categoryImage = restaurant.image_url || getCategoryImage(restaurant.full_category || restaurant.category)

  // place_url에서 place_id 추출 (place.map.kakao.com/{id} 형태)
  const kakaoPlaceId = restaurant.place_url?.match(/\/(\d+)$/)?.[1] || restaurant.id

  return (
    <div className="min-h-screen bg-background pb-24">
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <FavoriteButton
              restaurantId={restaurant.id}
              restaurantName={restaurant.name}
              restaurantImage={categoryImage}
              restaurantCategory={restaurant.category}
              onLoginRequired={() => setShowLoginDialog(true)}
              className="p-2 bg-transparent hover:bg-secondary"
            />
            <button onClick={handleShare} className="p-2 hover:bg-secondary rounded-full">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 카테고리 기본 이미지 */}
      <div className="relative aspect-[2/1] overflow-hidden">
        <LazyImage
          src={getOptimizedImageUrl(categoryImage, 800)}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="text-xl font-bold drop-shadow-md">{restaurant.name}</h1>
          <p className="text-sm text-white/80 mt-0.5">{restaurant.category}</p>
        </div>
      </div>

      {/* 기본 정보 바 */}
      <div className="px-4 py-3 bg-white flex items-center gap-4 text-sm border-b border-border">
        {restaurant.distance > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Navigation className="w-3.5 h-3.5" />
            <span>{restaurant.distance}m</span>
          </div>
        )}
        {restaurant.phone && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <Phone className="w-3.5 h-3.5" />
            <span>{restaurant.phone}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-1.5 ml-auto">
          {tags.slice(-2).map((tag) => (
            <span key={tag} className="px-2 py-0.5 bg-secondary text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 탭 */}
      <div className="flex bg-white border-b border-border">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
            activeTab === "info" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <MapPin className="w-4 h-4" />
            매장 정보
          </div>
          {activeTab === "info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("place")}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors relative ${
            activeTab === "place" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="flex items-center justify-center gap-1.5">
            <Star className="w-4 h-4" />
            사진 · 리뷰
          </div>
          {activeTab === "place" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "info" ? (
        <div className="bg-secondary/30 p-4 space-y-3">
          {/* 지도 */}
          <Card className="overflow-hidden border-0 shadow-sm">
            <iframe
              src={`https://map.kakao.com/link/map/${encodeURIComponent(restaurant.name)},${restaurant.lat},${restaurant.lng}`}
              className="w-full h-[160px] border-0"
              title="지도"
            />
            {restaurant.address && (
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{restaurant.address}</p>
                    <button onClick={handleCopyAddress} className="text-xs text-primary mt-1">
                      주소 복사
                    </button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* 전화번호 */}
          {restaurant.phone && (
            <Card className="p-3 border-0 shadow-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${restaurant.phone}`} className="text-sm text-primary font-medium">
                  {restaurant.phone}
                </a>
              </div>
            </Card>
          )}

          {/* 카카오맵 CTA */}
          <Card
            className="p-4 border-0 shadow-sm bg-amber-50 cursor-pointer hover:bg-amber-100 transition-colors"
            onClick={handleOpenKakaoMap}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                <ExternalLink className="w-5 h-5 text-amber-700" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900">카카오맵에서 상세보기</p>
                <p className="text-xs text-amber-700 mt-0.5">메뉴, 영업시간 등 전체 정보 확인</p>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="bg-secondary/30">
          {/* 카카오 플레이스 임베드 */}
          <div className="bg-white">
            <iframe
              src={`https://place.map.kakao.com/m/${kakaoPlaceId}`}
              className="w-full border-0"
              style={{ height: "calc(100vh - 220px)", minHeight: "500px" }}
              title="카카오 플레이스"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />
          </div>
          {/* 새 창으로 열기 */}
          <div className="p-3 flex justify-center">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={handleOpenKakaoMap}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              카카오맵 앱에서 열기
            </Button>
          </div>
        </div>
      )}

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-3 flex gap-3">
        <Button
          variant="outline"
          size="lg"
          className="flex-1 gap-2"
          onClick={handleCall}
        >
          <Phone className="w-5 h-5" />
          전화하기
        </Button>
        <Button
          size="lg"
          className="flex-1 gap-2 bg-primary hover:bg-primary/90"
          onClick={handleOpenKakaoMap}
        >
          <ExternalLink className="w-5 h-5" />
          카카오맵에서 보기
        </Button>
      </div>
    </div>
  )
}
