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
    // 여기서는 아무것도 하지 않음
  }, [])

  const logout = useCallback(async () => {
    await apiLogout()
    setUser(null)
    showToast("로그아웃되었습니다", "info")
  }, [showToast])

  // 초기 로드 시 사용자 정보 확인
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true)
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch {
        // 토큰 갱신 시도
        const refreshed = await refreshToken()
        if (refreshed) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // URL에서 auth_success 파라미터 확인 (OAuth 콜백 후)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const authSuccess = params.get("auth_success")
    const authError = params.get("auth_error")

    if (authSuccess === "true") {
      // 로그인 성공 - 사용자 정보 새로고침
      refreshUser()
      showToast("로그인되었습니다", "success")
      // URL에서 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname)
    } else if (authError) {
      // 에러 메시지 변환
      const errorMessages: Record<string, string> = {
        token_failed: "로그인에 실패했습니다. 다시 시도해주세요.",
        user_info_failed: "사용자 정보를 가져올 수 없습니다.",
        invalid_state: "로그인 세션이 만료되었습니다. 다시 시도해주세요.",
        missing_params: "로그인 정보가 누락되었습니다. 다시 시도해주세요.",
        cancelled: "로그인이 취소되었습니다.",
      }
      const message = errorMessages[authError] || "로그인 중 오류가 발생했습니다."
      showToast(message, "error")
      // URL에서 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [refreshUser, showToast])

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
