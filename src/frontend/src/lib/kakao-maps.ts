/**
 * 카카오 맵 SDK 로딩 유틸리티
 * 앱 전체에서 단일 Promise로 SDK 로딩을 관리
 */

declare global {
  interface Window {
    kakao: any
  }
}

let sdkPromise: Promise<void> | null = null

export function loadKakaoMaps(): Promise<void> {
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    // 이미 완전히 로드됨
    if (window.kakao?.maps?.LatLng) {
      console.log("[KakaoMaps] Already loaded")
      resolve()
      return
    }

    // load() 함수가 있으면 호출
    if (window.kakao?.maps?.load) {
      console.log("[KakaoMaps] Calling load()...")
      window.kakao.maps.load(() => {
        console.log("[KakaoMaps] load() callback fired, LatLng exists:", !!window.kakao?.maps?.LatLng)
        resolve()
      })
      return
    }

    // SDK 스크립트 자체가 아직 로드 안 됨 — 폴링
    console.log("[KakaoMaps] SDK not found, polling...")
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (window.kakao?.maps?.LatLng) {
        clearInterval(interval)
        console.log("[KakaoMaps] Found LatLng after polling")
        resolve()
      } else if (window.kakao?.maps?.load) {
        clearInterval(interval)
        console.log("[KakaoMaps] Found load() after polling, calling...")
        window.kakao.maps.load(() => {
          console.log("[KakaoMaps] load() callback fired after polling")
          resolve()
        })
      } else if (attempts >= 40) {
        clearInterval(interval)
        const state = `kakao=${!!window.kakao}, maps=${!!window.kakao?.maps}, load=${!!window.kakao?.maps?.load}`
        console.error(`[KakaoMaps] Timeout. State: ${state}`)
        reject(new Error(`SDK timeout (${state})`))
      }
    }, 500)
  })

  // 실패 시 다음 시도에서 다시 시도할 수 있도록 리셋
  sdkPromise.catch(() => { sdkPromise = null })

  return sdkPromise
}
