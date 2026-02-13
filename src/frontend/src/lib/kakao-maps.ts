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
      resolve()
      return
    }

    // load() 함수가 있으면 호출
    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(() => resolve())
      return
    }

    // SDK 스크립트 자체가 아직 로드 안 됨 — 폴링
    let attempts = 0
    const interval = setInterval(() => {
      attempts++
      if (window.kakao?.maps?.LatLng) {
        clearInterval(interval)
        resolve()
      } else if (window.kakao?.maps?.load) {
        clearInterval(interval)
        window.kakao.maps.load(() => resolve())
      } else if (attempts >= 40) {
        clearInterval(interval)
        reject(new Error("Kakao Maps SDK load timeout"))
      }
    }, 500)
  })

  return sdkPromise
}
