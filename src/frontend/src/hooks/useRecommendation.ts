import { useState, useCallback } from "react"
import {
  postRecommendation,
  type RecommendRequest,
  type RecommendResponse,
} from "../lib/recommend-api"

export type RecommendStep =
  | "location"
  | "swiping"
  | "processing"
  | "results"
  | "failure"

export interface ConditionVector {
  spicy: boolean
  warm: boolean
  light: boolean
  soup: boolean
}

interface LocationData {
  lat: number
  lng: number
}

export function useRecommendation() {
  const [step, setStep] = useState<RecommendStep>("location")
  const [location, setLocation] = useState<LocationData | null>(null)
  const [conditions, setConditions] = useState<ConditionVector | null>(null)
  const [result, setResult] = useState<RecommendResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [radius, setRadius] = useState(1200)

  const confirmLocation = useCallback((lat: number, lng: number) => {
    setLocation({ lat, lng })
    setStep("swiping")
  }, [])

  const completeSwipe = useCallback(
    async (conds: ConditionVector, currentRadius?: number) => {
      setConditions(conds)
      setStep("processing")
      setError(null)

      const loc = location
      if (!loc) {
        setError("위치 정보가 없습니다")
        setStep("failure")
        return
      }

      const r = currentRadius ?? radius
      try {
        const req: RecommendRequest = {
          ...conds,
          lat: loc.lat,
          lng: loc.lng,
          radius: r,
        }
        const res = await postRecommendation(req)
        if (res.total_count === 0) {
          setResult(res)
          setStep("failure")
        } else {
          setResult(res)
          setStep("results")
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "추천 요청 중 오류가 발생했습니다")
        setStep("failure")
      }
    },
    [location, radius]
  )

  const retry = useCallback(() => {
    setRadius(1200)
    setStep("swiping")
  }, [])

  const expandRadius = useCallback(() => {
    if (!conditions) return
    const newRadius = radius + 1000
    setRadius(newRadius)
    completeSwipe(conditions, newRadius)
  }, [conditions, radius, completeSwipe])

  const changeLocation = useCallback(() => {
    setRadius(1200)
    setStep("location")
  }, [])

  return {
    step,
    location,
    conditions,
    result,
    error,
    radius,
    confirmLocation,
    completeSwipe,
    retry,
    expandRadius,
    changeLocation,
  }
}
