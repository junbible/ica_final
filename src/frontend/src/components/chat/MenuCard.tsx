import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"

export interface Menu {
  name: string
  emoji: string
  description: string
  image_url: string
  tags: string[]
}

interface MenuCardProps {
  menus: Menu[]
}

export function MenuCard({ menus }: MenuCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
  }, [menus])

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 150
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      })
    }
  }

  if (!menus.length) return null

  return (
    <div className="mt-2 ml-8 sm:ml-10 -mr-4 relative group">
      {/* 왼쪽 스크롤 버튼 */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:scale-110 transition-transform"
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>
      )}

      {/* 오른쪽 스크롤 버튼 */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 pr-4 scrollbar-hide"
      >
        {menus.map((menu, index) => (
          <Card
            key={index}
            className="flex-shrink-0 w-[120px] sm:w-[140px] overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            {/* 이미지 */}
            <div className="relative h-[80px] sm:h-[100px] overflow-hidden">
              <img
                src={menu.image_url}
                alt={menu.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://via.placeholder.com/140x100/FBBF24/ffffff?text=${encodeURIComponent(menu.emoji)}`
                }}
              />
              {/* 이모지 오버레이 */}
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-xl sm:text-2xl drop-shadow-lg">
                {menu.emoji}
              </div>
            </div>

            {/* 정보 */}
            <div className="p-1.5 sm:p-2">
              <h4 className="font-bold text-xs sm:text-sm truncate">{menu.name}</h4>
              <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 mt-0.5 sm:mt-1">
                {menu.description}
              </p>
              {/* 태그 */}
              <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                {menu.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 bg-primary/10 text-primary rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
