import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Share2,
  Phone,
  Calendar,
  MapPin,
  Clock,
  Star,
  ChevronRight,
  Heart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 탭 타입
type TabType = "menu" | "review" | "info"

// 더미 상세 데이터 (나중에 API 연동)
const RESTAURANT_DETAIL = {
  id: 1,
  name: "고려삼계탕",
  category: "한식 · 삼계탕",
  rating: 4.8,
  reviewCount: 2341,
  address: "서울 강남구 테헤란로 123",
  phone: "02-1234-5678",
  hours: "매일 10:00 - 22:00",
  description: "40년 전통의 삼계탕 전문점. 국내산 한방 재료만을 사용하여 정성껏 끓여낸 삼계탕을 맛보실 수 있습니다.",
  images: [
    "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800",
    "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  ],
  menus: [
    { name: "삼계탕", price: 18000, description: "국내산 토종닭 + 한방재료", isPopular: true, image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=200" },
    { name: "옻닭", price: 22000, description: "옻나무 추출물로 끓인 보양식", isPopular: true, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200" },
    { name: "전복삼계탕", price: 28000, description: "완도산 전복이 들어간 프리미엄", isPopular: false, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
    { name: "닭죽", price: 10000, description: "삼계탕 육수로 끓인 죽", isPopular: false, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200" },
    { name: "닭볶음탕", price: 35000, description: "2~3인분, 매콤한 닭볶음탕", isPopular: false, image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=200" },
  ],
  reviews: [
    {
      id: 1,
      author: "맛집탐험가",
      rating: 5,
      date: "2025.01.28",
      content: "삼계탕 국물이 정말 진하고 깊어요. 닭도 부드럽고 속재료도 알차게 들어있습니다. 강남에서 삼계탕 먹고 싶을 때 꼭 오는 곳!",
      helpful: 42,
    },
    {
      id: 2,
      author: "직장인A",
      rating: 5,
      date: "2025.01.25",
      content: "점심 특선 가성비 좋아요. 웨이팅 있지만 회전율 빨라서 금방 들어갈 수 있어요.",
      helpful: 28,
    },
    {
      id: 3,
      author: "보양식러버",
      rating: 4,
      date: "2025.01.20",
      content: "전복삼계탕 시켰는데 전복이 실해요. 가격대비 만족. 다만 주차가 좀 불편합니다.",
      helpful: 15,
    },
  ],
  location: {
    lat: 37.5665,
    lng: 127.0180,
  },
}

export function RestaurantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  // TODO: id로 실제 데이터 fetch
  console.log("Restaurant ID:", id)
  const [activeTab, setActiveTab] = useState<TabType>("menu")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLiked, setIsLiked] = useState(false)

  // 실제로는 id로 데이터 fetch
  const restaurant = RESTAURANT_DETAIL

  const handleCall = () => {
    window.location.href = `tel:${restaurant.phone}`
  }

  const handleReservation = () => {
    alert("예약 기능은 준비 중입니다.")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: restaurant.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("링크가 복사되었습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="p-2 hover:bg-secondary rounded-full"
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </button>
            <button onClick={handleShare} className="p-2 hover:bg-secondary rounded-full">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* 이미지 갤러리 */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={restaurant.images[currentImageIndex]}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {/* 이미지 인디케이터 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {restaurant.images.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentImageIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
        {/* 이미지 카운터 */}
        <div className="absolute bottom-4 right-4 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
          {currentImageIndex + 1} / {restaurant.images.length}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="px-4 py-5 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold mb-1">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground mb-2">{restaurant.category}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="font-semibold">{restaurant.rating}</span>
              </div>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">리뷰 {restaurant.reviewCount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {restaurant.description}
        </p>
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
          onClick={handleReservation}
        >
          <Calendar className="w-4 h-4" />
          예약하기
        </Button>
      </div>

      {/* 탭 네비게이션 */}
      <div className="sticky top-[57px] z-40 bg-white border-b border-border">
        <div className="flex">
          {[
            { key: "menu", label: "메뉴" },
            { key: "review", label: `리뷰 ${restaurant.reviewCount.toLocaleString()}` },
            { key: "info", label: "매장정보" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      <div className="bg-secondary/30">
        {/* 메뉴 탭 */}
        {activeTab === "menu" && (
          <div className="p-4 space-y-3">
            <h3 className="font-bold text-lg mb-3">메뉴</h3>
            {restaurant.menus.map((menu, idx) => (
              <Card key={idx} className="p-3 border-0 shadow-sm">
                <div className="flex gap-3">
                  {/* 썸네일 */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                    <img
                      src={menu.image}
                      alt={menu.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{menu.name}</span>
                        {menu.isPopular && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                            인기
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{menu.description}</p>
                    </div>
                    <span className="font-semibold text-primary">
                      {menu.price.toLocaleString()}원
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 리뷰 탭 */}
        {activeTab === "review" && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">리뷰</h3>
              <button className="text-sm text-primary flex items-center gap-1">
                리뷰 작성 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {restaurant.reviews.map((review) => (
              <Card key={review.id} className="p-4 border-0 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                    {review.author[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{review.author}</span>
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "fill-primary text-primary"
                                : "fill-gray-200 text-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{review.date}</span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed">{review.content}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  👍 {review.helpful}명에게 도움이 됨
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* 매장정보 탭 */}
        {activeTab === "info" && (
          <div className="p-4 space-y-4">
            <h3 className="font-bold text-lg mb-3">매장정보</h3>

            {/* 지도 */}
            <Card className="overflow-hidden border-0 shadow-sm">
              <div className="aspect-video bg-gray-100 relative">
                {/* 카카오맵 iframe 또는 실제 지도 컴포넌트 */}
                <iframe
                  src={`https://map.kakao.com/link/map/${restaurant.name},${restaurant.location.lat},${restaurant.location.lng}`}
                  className="w-full h-full border-0"
                  title="지도"
                />
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{restaurant.address}</p>
                    <button className="text-sm text-primary mt-1">주소 복사</button>
                  </div>
                </div>
              </div>
            </Card>

            {/* 영업시간 */}
            <Card className="p-4 border-0 shadow-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">영업시간</p>
                  <p className="text-sm text-muted-foreground mt-1">{restaurant.hours}</p>
                </div>
              </div>
            </Card>

            {/* 전화번호 */}
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
          </div>
        )}
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
          onClick={handleReservation}
        >
          <Calendar className="w-5 h-5" />
          예약하기
        </Button>
      </div>
    </div>
  )
}
