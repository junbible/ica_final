import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, LogOut, User, Heart, Clock, Settings, Star, ChevronRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LazyImage, getOptimizedImageUrl } from "@/components/ui/lazy-image"
import { useAuth } from "@/contexts/AuthContext"
import { useFavorites } from "@/contexts/FavoritesContext"
import { getCategoryImage } from "@/data/restaurants"

export function MyPage() {
  const navigate = useNavigate()
  const { user, logout, isLoading } = useAuth()
  const { favorites, toggleFavorite, isLoading: favoritesLoading } = useFavorites()
  const [showFavorites, setShowFavorites] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    navigate("/")
    return null
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
  }

  const handleRemoveFavorite = async (favorite: typeof favorites[0]) => {
    await toggleFavorite({
      restaurant_id: favorite.restaurant_id,
      restaurant_name: favorite.restaurant_name,
    })
  }

  if (showFavorites) {
    return (
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <header className="sticky top-0 z-50 bg-white border-b border-border">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setShowFavorites(false)} className="p-2 -ml-2 hover:bg-secondary rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-bold text-lg">즐겨찾기</h1>
            <span className="text-sm text-muted-foreground">({favorites.length})</span>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6">
          {favoritesLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">저장한 맛집이 없어요</p>
              <p className="text-sm text-muted-foreground mt-1">마음에 드는 맛집을 즐겨찾기에 추가해보세요</p>
              <Button onClick={() => navigate("/")} className="mt-4">
                맛집 둘러보기
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((fav) => (
                <Card key={fav.id} className="overflow-hidden">
                  <div className="flex">
                    <div
                      className="w-24 h-24 shrink-0 cursor-pointer"
                      onClick={() => navigate(`/restaurant/${fav.restaurant_id}?name=${encodeURIComponent(fav.restaurant_name)}`)}
                    >
                      <LazyImage
                        src={getOptimizedImageUrl(
                          fav.restaurant_image || getCategoryImage(fav.restaurant_category || ""),
                          200
                        )}
                        alt={fav.restaurant_name}
                        className="w-full h-full object-cover"
                        wrapperClassName="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div
                        className="cursor-pointer"
                        onClick={() => navigate(`/restaurant/${fav.restaurant_id}?name=${encodeURIComponent(fav.restaurant_name)}`)}
                      >
                        <h3 className="font-bold text-sm">{fav.restaurant_name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          {fav.restaurant_rating && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-primary text-primary" />
                              <span className="text-xs">{fav.restaurant_rating}</span>
                            </div>
                          )}
                          {fav.restaurant_category && (
                            <span className="text-xs text-muted-foreground">{fav.restaurant_category}</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveFavorite(fav)}
                        className="self-end text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        삭제
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-secondary rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-lg">마이페이지</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* 프로필 카드 */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            {user.profile_image_url ? (
              <img
                src={user.profile_image_url}
                alt={user.nickname || "프로필"}
                className="w-20 h-20 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-10 h-10 text-primary" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold">{user.nickname || "사용자"}</h2>
              <p className="text-sm text-muted-foreground">
                {user.email || `${user.provider} 로그인`}
              </p>
              <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                카카오 연동
              </div>
            </div>
          </div>
        </Card>

        {/* 메뉴 목록 */}
        <div className="space-y-2 mb-6">
          {/* 즐겨찾기 */}
          <Card
            className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
            onClick={() => setShowFavorites(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">즐겨찾기</h3>
                <p className="text-sm text-muted-foreground">저장한 맛집 {favorites.length}개</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          {/* 최근 본 맛집 */}
          <Card className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">최근 본 맛집</h3>
                <p className="text-sm text-muted-foreground">준비 중</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>

          {/* 설정 */}
          <Card className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium">설정</h3>
                <p className="text-sm text-muted-foreground">준비 중</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* 로그아웃 버튼 */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          로그아웃
        </Button>

        {/* 앱 정보 */}
        <p className="text-center text-xs text-muted-foreground mt-8">
          nyam! v1.3.0
        </p>
      </main>
    </div>
  )
}
