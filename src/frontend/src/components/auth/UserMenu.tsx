import { useState } from "react"
import { LogOut, User as UserIcon, ChevronDown } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export function UserMenu() {
  const { user, logout, isLoading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
    )
  }

  if (!user) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-secondary transition-colors"
      >
        {user.profile_image_url ? (
          <img
            src={user.profile_image_url}
            alt={user.nickname || "프로필"}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-4 h-4 text-primary" />
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <>
          {/* 배경 오버레이 */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* 드롭다운 메뉴 */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50 py-2">
            <div className="px-4 py-2 border-b">
              <p className="font-medium text-sm truncate">
                {user.nickname || "사용자"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email || `${user.provider} 로그인`}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </div>
        </>
      )}
    </div>
  )
}
