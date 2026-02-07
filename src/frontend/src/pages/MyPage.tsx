import { useNavigate } from "react-router-dom"
import { ArrowLeft, LogOut, User, Heart, Clock, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"

export function MyPage() {
  const navigate = useNavigate()
  const { user, logout, isLoading } = useAuth()

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

  const menuItems = [
    { icon: Heart, label: "즐겨찾기", description: "저장한 맛집 목록", onClick: () => {} },
    { icon: Clock, label: "최근 본 맛집", description: "최근에 확인한 맛집", onClick: () => {} },
    { icon: Settings, label: "설정", description: "알림 및 앱 설정", onClick: () => {} },
  ]

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
                {user.provider === "kakao" ? "카카오" : "구글"} 연동
              </div>
            </div>
          </div>
        </Card>

        {/* 메뉴 목록 */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item) => (
            <Card
              key={item.label}
              className="p-4 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={item.onClick}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            </Card>
          ))}
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
          nyam! v1.1.0
        </p>
      </main>
    </div>
  )
}
