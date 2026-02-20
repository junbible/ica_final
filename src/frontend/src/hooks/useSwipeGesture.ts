import { useRef, useState, useCallback } from "react"

const THRESHOLD = 100

export type SwipeDirection = "left" | "right" | null

interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useSwipeGesture(options: UseSwipeGestureOptions) {
  const ref = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startX = useRef(0)
  const currentOffset = useRef(0)

  const direction: SwipeDirection =
    offset > 30 ? "right" : offset < -30 ? "left" : null

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true)
    startX.current = e.clientX
    currentOffset.current = 0
    ref.current?.setPointerCapture(e.pointerId)
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return
      const dx = e.clientX - startX.current
      currentOffset.current = dx
      setOffset(dx)
    },
    [isDragging]
  )

  const onPointerUp = useCallback(() => {
    if (!isDragging) return
    setIsDragging(false)
    const dx = currentOffset.current
    if (dx > THRESHOLD) {
      options.onSwipeRight?.()
    } else if (dx < -THRESHOLD) {
      options.onSwipeLeft?.()
    }
    setOffset(0)
  }, [isDragging, options])

  const handlers = {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel: onPointerUp,
  }

  return { ref, offset, isDragging, direction, handlers }
}
