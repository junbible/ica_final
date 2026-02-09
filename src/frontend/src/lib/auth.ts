/**
 * 인증 API 클라이언트
 */

const API_URL = import.meta.env.VITE_API_URL || ""

export interface User {
  id: number
  email: string | null
  nickname: string | null
  profile_image_url: string | null
  provider: string
  created_at: string
}

/**
 * 현재 로그인한 사용자 정보 조회
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      credentials: "include",
    })

    if (response.ok) {
      return await response.json()
    }
    return null
  } catch {
    return null
  }
}

/**
 * 토큰 갱신
 */
export async function refreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * 로그아웃
 */
export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  })
}

/**
 * 카카오 로그인 URL
 */
export function getKakaoLoginUrl(): string {
  return `${API_URL}/auth/kakao/login`
}

/**
 * 구글 로그인 URL
 */
export function getGoogleLoginUrl(): string {
  return `${API_URL}/auth/google/login`
}
