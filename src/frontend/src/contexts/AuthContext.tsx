import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { getCurrentUser, logout as apiLogout, refreshToken, type User } from "@/lib/auth"

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
  }, [])

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
      // URL에서 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname)
    } else if (authError) {
      console.error("Auth error:", authError)
      // URL에서 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [refreshUser])

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
