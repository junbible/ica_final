import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
  placeholderColor?: string
  onLoad?: () => void
  onError?: () => void
}

export function LazyImage({
  src,
  alt,
  className,
  wrapperClassName,
  placeholderColor = "bg-gray-100",
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.01,
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div
      ref={imgRef}
      className={cn("relative overflow-hidden", wrapperClassName)}
    >
      {/* Placeholder skeleton */}
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          placeholderColor,
          isLoaded ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Shimmer animation */}
        {!isLoaded && !hasError && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        )}
      </div>

      {/* Error state */}
      {hasError && (
        <div className={cn("absolute inset-0 flex items-center justify-center", placeholderColor)}>
          <span className="text-2xl">🍽️</span>
        </div>
      )}

      {/* Actual image */}
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
        />
      )}
    </div>
  )
}

// Optimized image URL helper for Unsplash
export function getOptimizedImageUrl(url: string, width: number = 400): string {
  if (url.includes("unsplash.com")) {
    // Add width parameter for Unsplash images
    const separator = url.includes("?") ? "&" : "?"
    return `${url}${separator}w=${width}&q=80&auto=format`
  }
  return url
}
