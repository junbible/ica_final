import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getCurrentUser, logout as apiLogout, refreshToken, type User } from "@/lib/auth"
import { useToast } from "@/components/ui/toast"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: () => void
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch {
      setUser(null)
    }
  }, [])

  const login = useCallback(() => {
    // 로그인 다이얼로그는 별도 컴포넌트에서 처리
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    showToast("로그아웃되었습니다", "info")
  }, [showToast])

  // 초기 로드 시 사용자 정보 확인 + OAuth 콜백 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authSuccess = params.get("auth_success")
    const authError = params.get("auth_error")
    const authDetail = params.get("detail")

    const initAuth = async () => {
      setIsLoading(true)

      // URL 파라미터 정리
      if (authSuccess || authError) {
        window.history.replaceState({}, "", window.location.pathname)
      }

      // OAuth 에러 처리
      if (authError) {
        const errorMessages: Record<string, string> = {
          token_failed: "로그인에 실패했습니다. 다시 시도해주세요.",
          user_info_failed: "사용자 정보를 가져올 수 없습니다.",
          invalid_state: "로그인 세션이 만료되었습니다. 다시 시도해주세요.",
          missing_params: "로그인 정보가 누락되었습니다. 다시 시도해주세요.",
          cancelled: "로그인이 취소되었습니다.",
          server_error: "서버 오류가 발생했습니다. 다시 시도해주세요.",
        }
        const msg = errorMessages[authError] || "로그인 중 오류가 발생했습니다."
        showToast(authDetail ? `${msg} (${authDetail})` : msg, "error")
        setIsLoading(false)
        return
      }

      // 쿠키로 사용자 정보 확인 (auth_success 또는 일반 페이지 로드)
      const currentUser = await getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        if (authSuccess) {
          showToast("로그인되었습니다", "success")
        }
        setIsLoading(false)
        return
      }

      // access_token 만료 시 refresh_token으로 갱신
      const refreshed = await refreshToken()
      if (refreshed) {
        const refreshedUser = await getCurrentUser()
        setUser(refreshedUser)
        if (authSuccess && refreshedUser) {
          showToast("로그인되었습니다", "success")
        }
      } else if (authSuccess) {
        // 쿠키가 설정되지 않은 경우
        showToast("로그인에 실패했습니다. 다시 시도해주세요.", "error")
      }
      setIsLoading(false)
    }

    initAuth()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
