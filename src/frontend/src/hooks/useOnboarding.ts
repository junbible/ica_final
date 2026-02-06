import { useState, useCallback } from "react"

const ONBOARDING_KEY = "nyam_onboarding_completed"

export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(ONBOARDING_KEY) === "true"
  })

  const completeOnboarding = useCallback(() => {
    localStorage.setItem(ONBOARDING_KEY, "true")
    setHasCompletedOnboarding(true)
  }, [])

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_KEY)
    setHasCompletedOnboarding(false)
  }, [])

  return {
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
  }
}
