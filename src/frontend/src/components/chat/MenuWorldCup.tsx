import { useState, useCallback } from "react"
import { useWorldCup } from "../../hooks/useWorldCup"
import { useGeolocation } from "../../hooks/useGeolocation"
import { WorldCupBattle } from "./WorldCupBattle"
import { searchRestaurants, type KakaoRestaurant } from "../../lib/restaurant-api"
import { LOCATIONS, LOCATION_COORDS } from "../../data/restaurants"
import type { WorldCupMenuItem } from "../../data/worldcup-menus"
import type { Restaurant } from "./MapCard"

type Phase = "setup" | "playing" | "winner" | "locating" | "searching" | "done"

interface MenuWorldCupProps {
  onComplete: (restaurants: Restaurant[], summary: string, winnerName: string) => void
}

function kakaoToRestaurant(r: KakaoRestaurant): Restaurant {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    full_category: r.full_category,
    address: r.address,
    phone: r.phone,
    place_url: r.place_url,
    lat: r.lat,
    lng: r.lng,
    distance: r.distance,
  }
}

export function MenuWorldCup({ onComplete }: MenuWorldCupProps) {
  const worldCup = useWorldCup()
  const geo = useGeolocation()
  const [phase, setPhase] = useState<Phase>("setup")

  const handleStart = (size: 8 | 16) => {
    worldCup.startGame(size)
    setPhase("playing")
  }

  const handleSelect = (item: WorldCupMenuItem) => {
    worldCup.selectWinner(item)
  }

  const handleFindRestaurants = useCallback(async () => {
    if (!worldCup.winner) return
    setPhase("locating")

    // Try geolocation
    const pos = await geo.requestLocation()
    if (pos) {
      setPhase("searching")
      try {
        const res = await searchRestaurants(
          worldCup.winner.searchKeyword,
          pos.coords.latitude,
          pos.coords.longitude,
          1500,
          undefined,
          3,
        )
        const restaurants = res.restaurants.slice(0, 3).map(kakaoToRestaurant)
        const summary = `${worldCup.winner.emoji} ${worldCup.winner.name} 우승! 근처 맛집을 찾았어요.`
        onComplete(restaurants, summary, worldCup.winner.name)
      } catch {
        onComplete([], `${worldCup.winner.emoji} ${worldCup.winner.name} 우승! 근처 맛집 검색에 실패했어요.`, worldCup.winner.name)
      }
    } else {
      // Show fallback location picker
      setPhase("locating")
    }
  }, [worldCup.winner, geo, onComplete])

  const handleFallbackLocation = useCallback(async (loc: string) => {
    if (!worldCup.winner) return
    const coords = LOCATION_COORDS[loc]
    if (!coords) return

    setPhase("searching")
    try {
      const res = await searchRestaurants(
        worldCup.winner.searchKeyword,
        coords.lat,
        coords.lng,
        1500,
        undefined,
        3,
      )
      const restaurants = res.restaurants.slice(0, 3).map(kakaoToRestaurant)
      const summary = `${worldCup.winner.emoji} ${worldCup.winner.name} 우승! ${loc} 근처 맛집을 찾았어요.`
      onComplete(restaurants, summary, worldCup.winner.name)
    } catch {
      onComplete([], `${worldCup.winner.emoji} ${worldCup.winner.name} 우승! 맛집 검색에 실패했어요.`, worldCup.winner.name)
    }
  }, [worldCup.winner, onComplete])

  // Check if worldCup finished
  if (phase === "playing" && worldCup.phase === "finished") {
    setPhase("winner")
  }

  // Setup: choose 8 or 16
  if (phase === "setup") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-6xl">🏆</div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">메뉴 월드컵</h2>
          <p className="text-sm text-gray-500">오늘 뭐 먹고 싶은지 골라보세요!</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleStart(8)}
            className="px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-md"
          >
            8강
          </button>
          <button
            onClick={() => handleStart(16)}
            className="px-6 py-3 rounded-xl bg-white border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors"
          >
            16강
          </button>
        </div>
      </div>
    )
  }

  // Playing
  if (phase === "playing" && worldCup.currentPair) {
    return (
      <WorldCupBattle
        pair={worldCup.currentPair}
        roundName={worldCup.roundName}
        matchLabel={worldCup.matchLabel}
        progress={worldCup.progress}
        onSelect={handleSelect}
      />
    )
  }

  // Winner
  if (phase === "winner" && worldCup.winner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4">
        <div className="text-5xl animate-bounce">🏆</div>
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-1">우승!</p>
          <div className="text-6xl mb-2">{worldCup.winner.emoji}</div>
          <h2 className="text-2xl font-black text-gray-800">{worldCup.winner.name}</h2>
          <p className="text-xs text-gray-400 mt-1">{worldCup.winner.category}</p>
        </div>
        <button
          onClick={handleFindRestaurants}
          className="px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-md flex items-center gap-2"
        >
          <span>📍</span> 근처 맛집 찾기
        </button>
      </div>
    )
  }

  // Locating - fallback location picker
  if (phase === "locating" && geo.status === "denied") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
        <div className="text-5xl">📍</div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-1">어디서 드실 건가요?</h2>
          <p className="text-xs text-gray-500">위치 권한이 거부되었어요. 아래에서 선택해주세요.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
          {LOCATIONS.map((loc) => (
            <button
              key={loc}
              onClick={() => handleFallbackLocation(loc)}
              className="px-3 py-3 rounded-xl bg-white border-2 border-gray-100 text-gray-700 font-medium hover:border-primary hover:text-primary transition-colors shadow-sm text-sm"
            >
              {loc}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Locating/Searching - loading
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
      <div className="text-4xl animate-pulse">🔍</div>
      <p className="text-gray-600 font-medium">
        {phase === "locating" ? "위치를 확인하고 있어요..." : "맛집을 찾고 있어요..."}
      </p>
    </div>
  )
}
