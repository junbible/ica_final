import { useState, useCallback } from "react"
import { WORLDCUP_MENUS, type WorldCupMenuItem } from "../data/worldcup-menus"

export type WorldCupPhase = "idle" | "playing" | "finished"

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getRoundName(remaining: number): string {
  if (remaining === 2) return "결승"
  if (remaining === 4) return "준결승"
  return `${remaining}강`
}

export function useWorldCup() {
  const [phase, setPhase] = useState<WorldCupPhase>("idle")
  const [items, setItems] = useState<WorldCupMenuItem[]>([])
  const [matchIndex, setMatchIndex] = useState(0)
  const [nextRound, setNextRound] = useState<WorldCupMenuItem[]>([])
  const [winner, setWinner] = useState<WorldCupMenuItem | null>(null)

  const totalInRound = items.length
  const matchCount = Math.floor(totalInRound / 2)
  const currentPair: [WorldCupMenuItem, WorldCupMenuItem] | null =
    phase === "playing" && matchIndex < matchCount
      ? [items[matchIndex * 2], items[matchIndex * 2 + 1]]
      : null

  const roundName = getRoundName(totalInRound)
  const matchLabel = `${matchIndex + 1} / ${matchCount}`
  const progress = matchCount > 0 ? (matchIndex / matchCount) * 100 : 0

  const startGame = useCallback((size: 8 | 16) => {
    const shuffled = shuffle(WORLDCUP_MENUS).slice(0, size)
    setItems(shuffled)
    setMatchIndex(0)
    setNextRound([])
    setWinner(null)
    setPhase("playing")
  }, [])

  const selectWinner = useCallback(
    (selected: WorldCupMenuItem) => {
      const updated = [...nextRound, selected]

      if (matchIndex + 1 < matchCount) {
        setNextRound(updated)
        setMatchIndex((i) => i + 1)
      } else {
        // Round finished
        if (updated.length === 1) {
          setWinner(updated[0])
          setPhase("finished")
        } else {
          // Next round
          setItems(updated)
          setNextRound([])
          setMatchIndex(0)
        }
      }
    },
    [nextRound, matchIndex, matchCount]
  )

  return {
    phase,
    currentPair,
    roundName,
    matchLabel,
    winner,
    progress,
    totalInRound,
    startGame,
    selectWinner,
  }
}
