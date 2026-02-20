import { useState } from "react"
import type { WorldCupMenuItem } from "../../data/worldcup-menus"

interface WorldCupBattleProps {
  pair: [WorldCupMenuItem, WorldCupMenuItem]
  roundName: string
  matchLabel: string
  progress: number
  onSelect: (item: WorldCupMenuItem) => void
}

export function WorldCupBattle({
  pair,
  roundName,
  matchLabel,
  progress,
  onSelect,
}: WorldCupBattleProps) {
  const [selected, setSelected] = useState<number | null>(null)

  const handleSelect = (item: WorldCupMenuItem, index: number) => {
    if (selected !== null) return
    setSelected(index)
    setTimeout(() => {
      setSelected(null)
      onSelect(item)
    }, 500)
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
      {/* Round info */}
      <div className="text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold">
          {roundName}
        </span>
        <p className="text-xs text-gray-400 mt-1">{matchLabel}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[280px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* VS battle */}
      <div className="relative flex items-center gap-3 w-full max-w-[320px]">
        {pair.map((item, i) => (
          <button
            key={item.id}
            onClick={() => handleSelect(item, i)}
            className={`flex-1 flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-300 ${
              selected === null
                ? "border-gray-100 bg-white hover:border-primary hover:shadow-lg active:scale-95"
                : selected === i
                ? "border-primary bg-primary/5 scale-105 shadow-lg"
                : "border-gray-100 bg-gray-50 opacity-40 scale-95"
            }`}
          >
            <span className="text-5xl">{item.emoji}</span>
            <span className="font-bold text-sm text-gray-800">{item.name}</span>
            <span className="text-[10px] text-gray-400">{item.category}</span>
          </button>
        ))}
        {/* VS badge */}
        <div className="absolute left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] text-white text-xs font-black flex items-center justify-center shadow-md z-10">
          VS
        </div>
      </div>

      <p className="text-xs text-gray-400">원하는 메뉴를 탭하세요!</p>
    </div>
  )
}
