import { useState, useCallback } from "react"

type GeolocationStatus = "idle" | "requesting" | "granted" | "denied" | "error"

interface GeolocationState {
  status: GeolocationStatus
  position: GeolocationPosition | null
  error: GeolocationPositionError | null
}

interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => Promise<GeolocationPosition | null>
  isSupported: boolean
}

export function useGeolocation(): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    status: "idle",
    position: null,
    error: null,
  })

  const isSupported = typeof navigator !== "undefined" && "geolocation" in navigator

  const requestLocation = useCallback(async (): Promise<GeolocationPosition | null> => {
    if (!isSupported) {
      setState({
        status: "error",
        position: null,
        error: null,
      })
      return null
    }

    setState((prev) => ({ ...prev, status: "requesting" }))

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            status: "granted",
            position,
            error: null,
          })
          resolve(position)
        },
        (error) => {
          setState({
            status: error.code === error.PERMISSION_DENIED ? "denied" : "error",
            position: null,
            error,
          })
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }, [isSupported])

  return {
    ...state,
    requestLocation,
    isSupported,
  }
}
