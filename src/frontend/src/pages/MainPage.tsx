import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, MessageCircle, Navigation, ChevronRight, Flame, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LazyImage, getOptimizedImageUrl } from "@/components/ui/lazy-image"
import { useAuth } from "@/contexts/AuthContext"
import { UserMenu } from "@/components/auth/UserMenu"
import { LoginDialog } from "@/components/auth/LoginDialog"
import { FavoriteButton } from "@/components/FavoriteButton"
import {
  CONDITIONS,
  CATEGORIES,
  LOCATIONS,
  COLLECTIONS,
  LOCATION_COORDS,
  CATEGORY_SEARCH_MAP,
  getCategoryImage,
} from "@/data/restaurants"
import {
  searchRestaurants,
  getNearbyRestaurants,
  getRegionInfo,
  type KakaoRestaurant,
} from "@/lib/restaurant-api"

// 시간대 계산
function getTimeContext() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 10) return { period: "아침", emoji: "🌅", meal: "아침 식사", greeting: "좋은 아침이에요!" }
  if (hour >= 10 && hour < 14) return { period: "점심", emoji: "☀️", meal: "점심 식사", greeting: "점심 뭐 드실래요?" }
  if (hour >= 14 && hour < 17) return { period: "오후", emoji: "🌤️", meal: "간식", greeting: "나른한 오후네요" }
  if (hour >= 17 && hour < 21) return { period: "저녁", emoji: "🌆", meal: "저녁 식사", greeting: "저녁 메뉴 고민되시죠?" }
  return { period: "야식", emoji: "🌙", meal: "야식", greeting: "야식 타임!" }
}

interface MainPageProps {
  onOpenChat: () => void
}

export function MainPage({ onOpenChat }: MainPageProps) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [selectedLocation, setSelectedLocation] = useState("강남")
  const [searchQuery, setSearchQuery] = useState("")
  const [showTooltip, setShowTooltip] = useState(true)
  const [isLocating, setIsLocating] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(false)
  const timeContext = getTimeContext()

  // API 데이터 상태
  const [nearbyRestaurants, setNearbyRestaurants] = useState<KakaoRestaurant[]>([])
  const [hotRestaurants, setHotRestaurants] = useState<KakaoRestaurant[]>([])
  const [collectionData, setCollectionData] = useState<Record<string, KakaoRestaurant[]>>({})
  const [searchResults, setSearchResults] = useState<KakaoRestaurant[]>([])
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingNearby, setIsLoadingNearby] = useState(true)
  const [isLoadingHot, setIsLoadingHot] = useState(true)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  // 주변 맛집 + 핫한 맛집 로드
  const loadRestaurants = useCallback(async (location: string) => {
    const coords = LOCATION_COORDS[location] || LOCATION_COORDS["강남"]

    setIsLoadingNearby(true)
    setIsLoadingHot(true)

    try {
      const [nearbyRes, hotRes] = await Promise.all([
        getNearbyRestaurants(coords.lat, coords.lng, 2000, 8),
        searchRestaurants(`${location} 인기 맛집`, coords.lat, coords.lng, 3000, 1, 6),
      ])
      setNearbyRestaurants(nearbyRes.restaurants)
      setHotRestaurants(hotRes.restaurants)
    } catch (e) {
      console.error("Failed to load restaurants:", e)
    } finally {
      setIsLoadingNearby(false)
      setIsLoadingHot(false)
    }
  }, [])

  // 컬렉션 데이터 로드
  const loadCollections = useCallback(async (location: string) => {
    const coords = LOCATION_COORDS[location] || LOCATION_COORDS["강남"]
    const results: Record<string, KakaoRestaurant[]> = {}

    await Promise.all(
      COLLECTIONS.map(async (col) => {
        try {
          const res = await searchRestaurants(
            `${location} ${col.searchQuery}`,
            coords.lat,
            coords.lng,
            3000,
            1,
            5,
          )
          results[col.id] = res.restaurants
        } catch {
          results[col.id] = []
        }
      }),
    )

    setCollectionData(results)
  }, [])

  // 위치 변경 시 데이터 로드
  useEffect(() => {
    loadRestaurants(selectedLocation)
    loadCollections(selectedLocation)
  }, [selectedLocation, loadRestaurants, loadCollections])

  const getCurrentLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserCoords({ lat: latitude, lng: longitude })

          try {
            const region = await getRegionInfo(latitude, longitude)
            // 지역명에서 LOCATIONS와 매칭
            const matched = LOCATIONS.find(
              (loc) =>
                region.display_name.includes(loc) ||
                region.region_2depth.includes(loc),
            )
            setSelectedLocation(matched || "강남")
          } catch {
            setSelectedLocation("강남")
          }
          setIsLocating(false)
        },
        () => {
          setSelectedLocation("강남")
          setIsLocating(false)
        },
      )
    }
  }

  // 검색 실행
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const coords = userCoords || LOCATION_COORDS[selectedLocation] || LOCATION_COORDS["강남"]
        const res = await searchRestaurants(searchQuery, coords.lat, coords.lng, 5000, 1, 15)
        setSearchResults(res.restaurants)
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedLocation, userCoords])

  // 검색 결과 모드
  if (searchQuery.trim()) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          getCurrentLocation={getCurrentLocation}
          isLocating={isLocating}
          isAuthenticated={isAuthenticated}
          onLoginClick={() => setShowLoginDialog(true)}
        />
        <main className="max-w-5xl mx-auto px-4 py-4">
          <h2 className="text-lg font-bold mb-4">
            '{searchQuery}' 검색 결과
            {!isSearching && ` (${searchResults.length})`}
          </h2>
          {isSearching ? (
            <SkeletonGrid count={4} />
          ) : (
            <KakaoRestaurantGrid restaurants={searchResults} navigate={navigate} onLoginRequired={() => setShowLoginDialog(true)} />
          )}
        </main>
        <ChatFAB onOpenChat={onOpenChat} showTooltip={false} />
        <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <LoginDialog open={showLoginDialog} onOpenChange={setShowLoginDialog} />

      {/* 헤더 */}
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        getCurrentLocation={getCurrentLocation}
        isLocating={isLocating}
        isAuthenticated={isAuthenticated}
        onLoginClick={() => setShowLoginDialog(true)}
      />

      <main className="max-w-5xl mx-auto">
        {/* 히어로 배너 */}
        <section className="px-4 py-6">
          <div className="bg-gradient-to-br from-primary via-amber-400 to-orange-400 rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 text-[100px] opacity-20 -mt-4 -mr-4">
              {timeContext.emoji}
            </div>
            <p className="text-white/80 text-sm mb-1">{timeContext.period} 추천</p>
            <h2 className="text-xl font-bold mb-2">{timeContext.greeting}</h2>
            <p className="text-white/90 text-sm mb-4">
              {selectedLocation}에서 맛있는 {timeContext.meal} 어때요?
            </p>
            <button
              onClick={onOpenChat}
              className="bg-white text-primary font-semibold px-4 py-2 rounded-full text-sm hover:bg-white/90 transition-colors"
            >
              AI에게 추천받기 ✨
            </button>
          </div>
        </section>

        {/* 컨디션 바로가기 */}
        <section className="px-4 pb-6">
          <h3 className="font-bold text-base mb-3">오늘 컨디션은?</h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {CONDITIONS.map((c) => (
              <button
                key={c.key}
                onClick={onOpenChat}
                className={`bg-gradient-to-br ${c.color} text-white rounded-xl p-3 text-center hover:scale-105 transition-transform`}
              >
                <span className="text-2xl block mb-1">{c.emoji}</span>
                <span className="text-xs font-medium">{c.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 지역 선택 */}
        <section className="px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {LOCATIONS.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedLocation === loc
                    ? "bg-primary text-white"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
              >
                {loc}
              </button>
            ))}
          </div>
        </section>

        {/* 지금 핫한 맛집 */}
        <section className="py-6">
          <SectionHeader title="지금 핫한 맛집" icon={<Flame className="w-5 h-5 text-red-500" />} />
          {isLoadingHot ? (
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {hotRestaurants.map((r) => (
                <KakaoCardHorizontal key={r.id} restaurant={r} onClick={() => navigate(`/restaurant/${r.id}`)} onLoginRequired={() => setShowLoginDialog(true)} />
              ))}
            </div>
          )}
        </section>

        {/* 테마 컬렉션 */}
        {COLLECTIONS.map((collection) => {
          const restaurants = collectionData[collection.id] || []
          return (
            <section key={collection.id} className="py-6">
              <div className="px-4 mb-3">
                <h3 className="font-bold text-base">{collection.title}</h3>
                <p className="text-sm text-muted-foreground">{collection.subtitle}</p>
              </div>
              <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {restaurants.length === 0
                  ? [...Array(3)].map((_, i) => <SkeletonCard key={i} />)
                  : restaurants.map((r) => (
                      <KakaoCardHorizontal key={r.id} restaurant={r} onClick={() => navigate(`/restaurant/${r.id}`)} onLoginRequired={() => setShowLoginDialog(true)} />
                    ))}
              </div>
            </section>
          )
        })}

        {/* 카테고리 */}
        <section className="py-6 bg-secondary/50">
          <SectionHeader title="카테고리" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSearchQuery(CATEGORY_SEARCH_MAP[cat.id] || cat.label)}
                className="bg-white rounded-xl p-3 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 mx-auto mb-2 rounded-full overflow-hidden bg-gray-100">
                  <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 내 주변 맛집 */}
        <section className="py-6">
          <SectionHeader title={`${selectedLocation} 맛집`} icon={<MapPin className="w-5 h-5 text-primary" />} />
          <div className="px-4">
            {isLoadingNearby ? (
              <SkeletonGrid count={4} />
            ) : (
              <KakaoRestaurantGrid restaurants={nearbyRestaurants} navigate={navigate} onLoginRequired={() => setShowLoginDialog(true)} />
            )}
          </div>
        </section>
      </main>

      {/* FAB */}
      <ChatFAB onOpenChat={onOpenChat} showTooltip={showTooltip} />
    </div>
  )
}

// 검색 헤더 컴포넌트
function SearchHeader({ searchQuery, setSearchQuery, selectedLocation, getCurrentLocation, isLocating, isAuthenticated, onLoginClick }: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  selectedLocation: string
  getCurrentLocation: () => void
  isLocating: boolean
  isAuthenticated: boolean
  onLoginClick: () => void
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-1">
            <img src="/logo.png" alt="nyam logo" className="w-8 h-8 object-contain" />
            <span className="font-logo text-xl text-primary">nyam!</span>
          </h1>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="맛집, 메뉴 검색"
              className="pl-10 bg-secondary border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={getCurrentLocation}
            className="flex items-center gap-1 text-sm bg-secondary px-3 py-2 rounded-full hover:bg-secondary/80 transition-colors"
          >
            {isLocating ? (
              <Navigation className="w-4 h-4 animate-pulse text-primary" />
            ) : (
              <MapPin className="w-4 h-4 text-primary" />
            )}
            <span className="font-medium hidden sm:inline">{selectedLocation}</span>
          </button>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <Button
              onClick={onLoginClick}
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">로그인</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

// 섹션 헤더 컴포넌트
function SectionHeader({ title, icon, actionText }: { title: string; icon?: React.ReactNode; actionText?: string }) {
  return (
    <div className="flex items-center justify-between px-4 mb-3">
      <h3 className="font-bold text-base flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {actionText && (
        <button className="text-sm text-muted-foreground flex items-center gap-1 hover:text-foreground">
          {actionText} <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// 카카오 맛집 가로 스크롤 카드
function KakaoCardHorizontal({ restaurant, onClick, onLoginRequired }: {
  restaurant: KakaoRestaurant
  onClick: () => void
  onLoginRequired?: () => void
}) {
  const image = getCategoryImage(restaurant.full_category || restaurant.category)

  return (
    <Card
      onClick={onClick}
      className="w-[160px] shrink-0 overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative w-full h-[120px]">
        <LazyImage
          src={getOptimizedImageUrl(image, 320)}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          wrapperClassName="w-full h-full"
        />
        <FavoriteButton
          restaurantId={restaurant.id}
          restaurantName={restaurant.name}
          restaurantImage={image}
          restaurantCategory={restaurant.category}
          onLoginRequired={onLoginRequired}
          className="absolute top-2 right-2 z-10"
        />
      </div>
      <div className="p-2.5">
        <h4 className="font-bold text-sm truncate">{restaurant.name}</h4>
        <p className="text-xs text-muted-foreground mt-1 truncate">
          {restaurant.category}
          {restaurant.distance > 0 && ` · ${restaurant.distance}m`}
        </p>
      </div>
    </Card>
  )
}

// 카카오 맛집 그리드
function KakaoRestaurantGrid({ restaurants, navigate, onLoginRequired }: {
  restaurants: KakaoRestaurant[]
  navigate: ReturnType<typeof useNavigate>
  onLoginRequired?: () => void
}) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <p>이 지역에 맛집 정보가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {restaurants.map((r) => {
        const image = getCategoryImage(r.full_category || r.category)
        return (
          <Card
            key={r.id}
            onClick={() => navigate(`/restaurant/${r.id}`)}
            className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="relative w-full h-[120px]">
              <LazyImage
                src={getOptimizedImageUrl(image, 400)}
                alt={r.name}
                className="w-full h-full object-cover"
                wrapperClassName="w-full h-full"
              />
              <FavoriteButton
                restaurantId={r.id}
                restaurantName={r.name}
                restaurantImage={image}
                restaurantCategory={r.category}
                onLoginRequired={onLoginRequired}
                className="absolute top-2 right-2 z-10"
              />
            </div>
            <div className="p-2.5">
              <h4 className="font-bold text-sm truncate">{r.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">
                {r.category}
                {r.distance > 0 && ` · ${r.distance}m`}
              </p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

// 스켈레톤 카드
function SkeletonCard() {
  return (
    <Card className="w-[160px] shrink-0 overflow-hidden border-0 shadow-md animate-pulse">
      <div className="w-full h-[120px] bg-gray-200" />
      <div className="p-2.5 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </Card>
  )
}

// 스켈레톤 그리드
function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {[...Array(count)].map((_, i) => (
        <Card key={i} className="overflow-hidden border-0 shadow-md animate-pulse">
          <div className="w-full h-[120px] bg-gray-200" />
          <div className="p-2.5 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  )
}

// 챗봇 FAB
function ChatFAB({ onOpenChat, showTooltip }: { onOpenChat: () => void; showTooltip: boolean }) {
  return (
    <>
      <button
        onClick={onOpenChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-primary to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
      {showTooltip && (
        <div className="fixed bottom-6 right-24 bg-foreground text-background text-sm px-3 py-2 rounded-lg shadow-lg z-40 animate-pulse">
          AI 추천받기
          <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-foreground" />
        </div>
      )}
    </>
  )
}
