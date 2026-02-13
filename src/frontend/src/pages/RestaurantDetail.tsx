import { useState, useEffect } from "react"
import { useParams, useNavigate, useLocation } from "react-router-dom"
import {
  ArrowLeft,
  Share2,
  Phone,
  MapPin,
  ExternalLink,
  Navigation,
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
          <div className="aspect-[16/9] bg-gray-200" />
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

  const categoryImage = getCategoryImage(restaurant.full_category || restaurant.category)

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
      <div className="relative aspect-[16/9] overflow-hidden">
        <LazyImage
          src={getOptimizedImageUrl(categoryImage, 800)}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* 기본 정보 */}
      <div className="px-4 py-5 bg-white">
        <h1 className="text-xl font-bold mb-1">{restaurant.name}</h1>
        <p className="text-sm text-muted-foreground mb-3">{restaurant.category}</p>

        {/* 거리 */}
        {restaurant.distance > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <Navigation className="w-4 h-4" />
            <span>{restaurant.distance}m</span>
          </div>
        )}

        {/* 태그 */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="px-2 py-1 bg-secondary text-xs rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3 px-4 py-4 bg-white border-t border-border">
        <Button
          variant="outline"
          className="flex-1 gap-2"
          onClick={handleCall}
        >
          <Phone className="w-4 h-4" />
          전화
        </Button>
        <Button
          className="flex-1 gap-2 bg-primary hover:bg-primary/90"
          onClick={handleOpenKakaoMap}
        >
          <ExternalLink className="w-4 h-4" />
          카카오맵에서 보기
        </Button>
      </div>

      {/* 매장 정보 */}
      <div className="bg-secondary/30 p-4 space-y-4">
        {/* 지도 */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <div className="aspect-video bg-gray-100 relative">
            <iframe
              src={`https://map.kakao.com/link/map/${restaurant.name},${restaurant.lat},${restaurant.lng}`}
              className="w-full h-full border-0"
              title="지도"
            />
          </div>
          {restaurant.address && (
            <div className="p-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{restaurant.address}</p>
                  <button onClick={handleCopyAddress} className="text-sm text-primary mt-1">
                    주소 복사
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* 전화번호 */}
        {restaurant.phone && (
          <Card className="p-4 border-0 shadow-sm">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">전화번호</p>
                <a href={`tel:${restaurant.phone}`} className="text-sm text-primary mt-1 block">
                  {restaurant.phone}
                </a>
              </div>
            </div>
          </Card>
        )}

        {/* 카카오맵 안내 CTA */}
        <Card className="p-5 border-0 shadow-sm bg-amber-50">
          <div className="text-center">
            <p className="text-sm text-amber-800 mb-1 font-medium">
              메뉴, 리뷰, 영업시간 등 상세 정보는
            </p>
            <p className="text-sm text-amber-700 mb-3">
              카카오맵에서 확인할 수 있어요
            </p>
            <Button
              onClick={handleOpenKakaoMap}
              className="bg-amber-500 hover:bg-amber-600 text-white gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              카카오맵에서 상세보기
            </Button>
          </div>
        </Card>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 flex gap-3">
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
