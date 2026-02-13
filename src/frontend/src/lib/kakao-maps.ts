/**
 * 카카오 맵 SDK 로딩 유틸리티
 */

declare global {
  interface Window {
    kakao: any
  }
}

let sdkPromise: Promise<void> | null = null

function callLoadWithTimeout(timeoutMs = 10000): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("kakao.maps.load() 콜백 미응답 — 카카오 개발자 콘솔에서 JS 키에 도메인을 등록했는지 확인하세요"))
    }, timeoutMs)

    window.kakao.maps.load(() => {
      clearTimeout(timer)
      resolve()
    })
  })
}

export function loadKakaoMaps(): Promise<void> {
  if (sdkPromise) return sdkPromise

  sdkPromise = new Promise((resolve, reject) => {
    // 이미 완전히 로드됨
    if (window.kakao?.maps?.LatLng) {
      resolve()
      return
    }

    // load() 함수가 있으면 타임아웃 포함 호출
    if (window.kakao?.maps?.load) {
      callLoadWithTimeout().then(resolve).catch(reject)
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
        callLoadWithTimeout().then(resolve).catch(reject)
      } else if (attempts >= 20) {
        clearInterval(interval)
        reject(new Error("카카오 맵 SDK 스크립트 로딩 실패"))
      }
    }, 500)
  })

  sdkPromise.catch(() => { sdkPromise = null })

  return sdkPromise
}
