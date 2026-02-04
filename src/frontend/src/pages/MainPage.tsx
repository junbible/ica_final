import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search, MapPin, Star, MessageCircle, Navigation, ChevronRight, TrendingUp, Clock, Flame } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

// 시간대 계산
function getTimeContext() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 10) return { period: "아침", emoji: "🌅", meal: "아침 식사", greeting: "좋은 아침이에요!" }
  if (hour >= 10 && hour < 14) return { period: "점심", emoji: "☀️", meal: "점심 식사", greeting: "점심 뭐 드실래요?" }
  if (hour >= 14 && hour < 17) return { period: "오후", emoji: "🌤️", meal: "간식", greeting: "나른한 오후네요" }
  if (hour >= 17 && hour < 21) return { period: "저녁", emoji: "🌆", meal: "저녁 식사", greeting: "저녁 메뉴 고민되시죠?" }
  return { period: "야식", emoji: "🌙", meal: "야식", greeting: "야식 타임!" }
}

// 컨디션별 추천
const CONDITIONS = [
  { key: "tired", emoji: "😫", label: "피곤할 때", color: "from-orange-400 to-red-400" },
  { key: "hangover", emoji: "🍺", label: "해장 필요", color: "from-green-400 to-emerald-500" },
  { key: "stress", emoji: "😤", label: "스트레스", color: "from-red-400 to-pink-500" },
  { key: "light", emoji: "🥗", label: "가볍게", color: "from-emerald-400 to-teal-500" },
  { key: "special", emoji: "🎉", label: "특별한 날", color: "from-purple-400 to-indigo-500" },
  { key: "alone", emoji: "🍜", label: "혼밥", color: "from-blue-400 to-cyan-500" },
]

// 카테고리 목록
const CATEGORIES = [
  { id: "korean", label: "한식", emoji: "🍚", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200" },
  { id: "chinese", label: "중식", emoji: "🥟", image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200" },
  { id: "japanese", label: "일식", emoji: "🍣", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200" },
  { id: "western", label: "양식", emoji: "🍝", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200" },
  { id: "cafe", label: "카페", emoji: "☕", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200" },
  { id: "bar", label: "술집", emoji: "🍺", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200" },
]

// 지역 목록
const LOCATIONS = ["강남", "홍대", "신촌", "이태원", "성수", "여의도"]

// 테마 컬렉션
const COLLECTIONS = [
  {
    id: "healing",
    title: "🍲 따끈한 국물이 생각날 때",
    subtitle: "몸도 마음도 녹이는 국물 맛집",
    color: "from-amber-500 to-orange-500",
    restaurants: [1, 7, 11, 12, 16],
  },
  {
    id: "date",
    title: "💕 분위기 좋은 데이트 코스",
    subtitle: "특별한 날을 위한 레스토랑",
    color: "from-pink-500 to-rose-500",
    restaurants: [3, 15],
  },
  {
    id: "solo",
    title: "🍜 혼밥하기 좋은 곳",
    subtitle: "혼자서도 편하게 즐길 수 있는",
    color: "from-blue-500 to-indigo-500",
    restaurants: [5, 4, 9],
  },
  {
    id: "spicy",
    title: "🌶️ 오늘은 매운 게 땡긴다",
    subtitle: "스트레스 날리는 매운맛",
    color: "from-red-500 to-pink-500",
    restaurants: [8, 10, 14],
  },
]

// 맛집 데이터
const RESTAURANTS = [
  { id: 1, name: "본가 설렁탕 강남점", category: "한식", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400", rating: 4.7, reviewCount: 1247, distance: "85m", tags: ["설렁탕", "해장", "24시"], location: "강남", isNew: false, isHot: true },
  { id: 2, name: "고려삼계탕", category: "한식", image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400", rating: 4.8, reviewCount: 2341, distance: "120m", tags: ["삼계탕", "보양식"], location: "강남", isNew: false, isHot: true },
  { id: 3, name: "더스테이크하우스", category: "양식", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400", rating: 4.8, reviewCount: 534, distance: "450m", tags: ["스테이크", "데이트"], location: "강남", isNew: true, isHot: false },
  { id: 4, name: "샐러디 강남점", category: "양식", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", rating: 4.5, reviewCount: 1823, distance: "95m", tags: ["샐러드", "다이어트"], location: "강남", isNew: false, isHot: false },
  { id: 5, name: "아비꼬 카레", category: "일식", image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400", rating: 4.5, reviewCount: 5123, distance: "75m", tags: ["카레", "가성비"], location: "강남", isNew: false, isHot: true },
  { id: 6, name: "옛날옛적 홍대점", category: "한식", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400", rating: 4.5, reviewCount: 2156, distance: "150m", tags: ["삼겹살", "회식"], location: "홍대", isNew: false, isHot: true },
  { id: 7, name: "콩나물해장국 홍대점", category: "한식", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400", rating: 4.6, reviewCount: 1987, distance: "80m", tags: ["해장", "24시"], location: "홍대", isNew: false, isHot: false },
  { id: 8, name: "황소곱창 본점", category: "한식", image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400", rating: 4.6, reviewCount: 4521, distance: "350m", tags: ["곱창", "매운맛"], location: "홍대", isNew: false, isHot: true },
  { id: 9, name: "포케올데이 홍대", category: "양식", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400", rating: 4.4, reviewCount: 892, distance: "200m", tags: ["포케", "건강식"], location: "홍대", isNew: true, isHot: false },
  { id: 10, name: "진진 마라탕", category: "중식", image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400", rating: 4.4, reviewCount: 967, distance: "180m", tags: ["마라탕", "매운맛"], location: "신촌", isNew: false, isHot: true },
  { id: 11, name: "교동짬뽕 신촌점", category: "중식", image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400", rating: 4.3, reviewCount: 3421, distance: "95m", tags: ["짬뽕", "해장"], location: "신촌", isNew: false, isHot: false },
  { id: 12, name: "신선설농탕", category: "한식", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400", rating: 4.5, reviewCount: 1654, distance: "150m", tags: ["설렁탕", "보양식"], location: "신촌", isNew: false, isHot: false },
  { id: 13, name: "성수샐러드클럽", category: "양식", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", rating: 4.7, reviewCount: 2234, distance: "120m", tags: ["샐러드", "브런치"], location: "성수", isNew: true, isHot: false },
  { id: 14, name: "떡볶이공장 성수", category: "한식", image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400", rating: 4.3, reviewCount: 1876, distance: "200m", tags: ["떡볶이", "매운맛"], location: "성수", isNew: false, isHot: false },
  { id: 15, name: "온더보더 이태원", category: "양식", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400", rating: 4.5, reviewCount: 1678, distance: "280m", tags: ["멕시칸", "브런치"], location: "이태원", isNew: false, isHot: false },
  { id: 16, name: "이태원 곰탕집", category: "한식", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400", rating: 4.6, reviewCount: 2341, distance: "150m", tags: ["곰탕", "보양식"], location: "이태원", isNew: false, isHot: false },
  { id: 17, name: "여의도삼계탕", category: "한식", image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400", rating: 4.7, reviewCount: 1543, distance: "100m", tags: ["삼계탕", "점심"], location: "여의도", isNew: false, isHot: false },
  { id: 18, name: "점심엔샐러드", category: "양식", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400", rating: 4.4, reviewCount: 987, distance: "180m", tags: ["샐러드", "도시락"], location: "여의도", isNew: true, isHot: false },
]

interface MainPageProps {
  onOpenChat: () => void
}

export function MainPage({ onOpenChat }: MainPageProps) {
  const navigate = useNavigate()
  const [selectedLocation, setSelectedLocation] = useState("강남")
  const [searchQuery, setSearchQuery] = useState("")
  const [showTooltip, setShowTooltip] = useState(true)
  const [isLocating, setIsLocating] = useState(false)
  const timeContext = getTimeContext()

  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 4000)
    return () => clearTimeout(timer)
  }, [])

  const getCurrentLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          if (latitude > 37.52 && longitude > 127.02) setSelectedLocation("강남")
          else if (latitude > 37.55 && longitude < 126.93) setSelectedLocation("홍대")
          else if (latitude > 37.55 && longitude < 126.95) setSelectedLocation("신촌")
          else if (latitude > 37.53 && longitude < 126.99) setSelectedLocation("여의도")
          else if (latitude > 37.54 && longitude > 127.04) setSelectedLocation("성수")
          else setSelectedLocation("강남")
          setIsLocating(false)
        },
        () => { setSelectedLocation("강남"); setIsLocating(false) }
      )
    }
  }

  const getRestaurantById = (id: number) => RESTAURANTS.find(r => r.id === id)
  const nearbyRestaurants = RESTAURANTS.filter(r => r.location === selectedLocation)
  const hotRestaurants = RESTAURANTS.filter(r => r.isHot).slice(0, 6)
  const newRestaurants = RESTAURANTS.filter(r => r.isNew)

  // 검색 결과
  if (searchQuery) {
    const filtered = RESTAURANTS.filter(r =>
      r.name.includes(searchQuery) || r.tags.some(t => t.includes(searchQuery))
    )
    return (
      <div className="min-h-screen bg-background pb-20">
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedLocation={selectedLocation}
          getCurrentLocation={getCurrentLocation}
          isLocating={isLocating}
        />
        <main className="max-w-5xl mx-auto px-4 py-4">
          <h2 className="text-lg font-bold mb-4">'{searchQuery}' 검색 결과 ({filtered.length})</h2>
          <RestaurantGrid restaurants={filtered} navigate={navigate} />
        </main>
        <ChatFAB onOpenChat={onOpenChat} showTooltip={false} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* 헤더 */}
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        getCurrentLocation={getCurrentLocation}
        isLocating={isLocating}
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
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedLocation === loc
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
          <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {hotRestaurants.map((r) => (
              <RestaurantCardHorizontal key={r.id} restaurant={r} onClick={() => navigate(`/restaurant/${r.id}`)} />
            ))}
          </div>
        </section>

        {/* 테마 컬렉션 */}
        {COLLECTIONS.map((collection) => (
          <section key={collection.id} className="py-6">
            <div className="px-4 mb-3">
              <h3 className="font-bold text-base">{collection.title}</h3>
              <p className="text-sm text-muted-foreground">{collection.subtitle}</p>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {collection.restaurants.map((id) => {
                const r = getRestaurantById(id)
                return r ? <RestaurantCardHorizontal key={r.id} restaurant={r} onClick={() => navigate(`/restaurant/${r.id}`)} /> : null
              })}
            </div>
          </section>
        ))}

        {/* 카테고리 */}
        <section className="py-6 bg-secondary/50">
          <SectionHeader title="카테고리" />
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 px-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/category/${cat.id}`)}
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

        {/* 신규 오픈 */}
        {newRestaurants.length > 0 && (
          <section className="py-6">
            <SectionHeader title="신규 오픈" icon={<Clock className="w-5 h-5 text-blue-500" />} />
            <div className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide">
              {newRestaurants.map((r) => (
                <RestaurantCardHorizontal key={r.id} restaurant={r} onClick={() => navigate(`/restaurant/${r.id}`)} isNew />
              ))}
            </div>
          </section>
        )}

        {/* 내 주변 맛집 */}
        <section className="py-6">
          <SectionHeader title={`${selectedLocation} 맛집`} icon={<TrendingUp className="w-5 h-5 text-primary" />} actionText="전체보기" />
          <div className="px-4">
            <RestaurantGrid restaurants={nearbyRestaurants} navigate={navigate} />
          </div>
        </section>
      </main>

      {/* FAB */}
      <ChatFAB onOpenChat={onOpenChat} showTooltip={showTooltip} />
    </div>
  )
}

// 검색 헤더 컴포넌트
function SearchHeader({ searchQuery, setSearchQuery, selectedLocation, getCurrentLocation, isLocating }: {
  searchQuery: string
  setSearchQuery: (v: string) => void
  selectedLocation: string
  getCurrentLocation: () => void
  isLocating: boolean
}) {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="flex items-center gap-1">
            <span className="text-2xl">🍽️</span>
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

// 가로 스크롤 카드
function RestaurantCardHorizontal({ restaurant, onClick, isNew }: {
  restaurant: typeof RESTAURANTS[0]
  onClick: () => void
  isNew?: boolean
}) {
  return (
    <Card
      onClick={onClick}
      className="w-[160px] shrink-0 overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="relative w-full h-[120px] bg-gray-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        {isNew && (
          <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
        )}
        {restaurant.isHot && !isNew && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">HOT</span>
        )}
      </div>
      <div className="p-2.5">
        <h4 className="font-bold text-sm truncate">{restaurant.name}</h4>
        <div className="flex items-center gap-1 mt-1">
          <Star className="w-3 h-3 fill-primary text-primary" />
          <span className="text-sm font-medium">{restaurant.rating}</span>
          <span className="text-xs text-muted-foreground">({restaurant.reviewCount.toLocaleString()})</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 truncate">{restaurant.category} · {restaurant.distance}</p>
      </div>
    </Card>
  )
}

// 그리드 카드
function RestaurantGrid({ restaurants, navigate }: { restaurants: typeof RESTAURANTS; navigate: ReturnType<typeof useNavigate> }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {restaurants.map((r) => (
        <Card
          key={r.id}
          onClick={() => navigate(`/restaurant/${r.id}`)}
          className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        >
          <div className="relative w-full h-[120px] bg-gray-100">
            <img
              src={r.image}
              alt={r.name}
              className="w-full h-full object-cover"
            />
            {r.isNew && (
              <span className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">NEW</span>
            )}
            {r.isHot && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">HOT</span>
            )}
          </div>
          <div className="p-2.5">
            <h4 className="font-bold text-sm truncate">{r.name}</h4>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-sm">{r.rating}</span>
              <span className="text-xs text-muted-foreground">· {r.distance}</span>
            </div>
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
