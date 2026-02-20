import { useState, useRef, useEffect, useCallback } from "react"
import { RotateCcw, Sparkles, X } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import { QuickReplies } from "./QuickReplies"
import { ChatInput } from "./ChatInput"
import { MapCard, type Restaurant } from "./MapCard"
import { MenuCard, type Menu } from "./MenuCard"
import { ChatOverlay, type OverlayResult } from "./ChatOverlay"
import { getTimeContext } from "../../lib/time-context"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  menus?: Menu[]
  restaurants?: Restaurant[]
}

// 프로덕션에서는 같은 도메인에서 서빙되므로 빈 문자열 사용
const API_URL = import.meta.env.VITE_API_URL || ""

const timeCtx = getTimeContext()

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  content: timeCtx.greeting,
  isUser: false,
  timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
}

const QUICK_REPLIES = timeCtx.quickReplies

interface ChatContainerProps {
  onClose?: () => void
}

export function ChatContainer({ onClose }: ChatContainerProps = {}) {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activeOverlay, setActiveOverlay] = useState<"swipe" | "worldcup" | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const now = () =>
    new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
      const response = await fetch(`${API_URL}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          session_id: sessionId,
        }),
      })

      if (!response.ok) throw new Error("API 요청 실패")

      const data = await response.json()
      setSessionId(data.session_id)

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: now(),
        menus: data.menus || undefined,
        restaurants: data.restaurants || undefined,
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      console.error("Error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "앗, 연결이 불안정해요 😵 잠시 후 다시 시도해주세요!",
        isUser: false,
        timestamp: now(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    if (sessionId) {
      try {
        await fetch(`${API_URL}/chat/session/${sessionId}/reset`, { method: "POST" })
      } catch (error) {
        console.error("Reset error:", error)
      }
    }
    setMessages([INITIAL_MESSAGE])
    setSessionId(null)
  }

  const handleOverlayComplete = useCallback((result: OverlayResult) => {
    setActiveOverlay(null)

    const userContent =
      result.type === "swipe"
        ? "스와이프로 메뉴추천 받기"
        : `메뉴 월드컵 🏆 ${result.winnerName ?? ""} 우승!`

    const userMsg: Message = {
      id: Date.now().toString(),
      content: userContent,
      isUser: true,
      timestamp: now(),
    }

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      content: result.summary,
      isUser: false,
      timestamp: now(),
      restaurants: result.restaurants.length > 0 ? result.restaurants : undefined,
    }

    setMessages((prev) => [...prev, userMsg, botMsg])
  }, [])

  return (
    <Card className="relative w-full h-full sm:w-[420px] sm:h-[680px] sm:max-h-[90vh] mx-auto flex flex-col shadow-2xl shadow-primary/20 border-0 sm:rounded-xl rounded-none overflow-hidden">
      {/* 헤더 - 그라데이션 배경 */}
      <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white py-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <img src="/logo.png" alt="nyam logo" className="w-10 h-10 object-contain bg-white rounded-full p-1" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-logo">nyam!</span>
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-normal opacity-90">컨디션 맞춤 메뉴 추천</p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              title="대화 초기화"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                title="닫기"
                className="text-white hover:bg-white/20 rounded-full hidden sm:flex"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* 메시지 영역 */}
      <CardContent className="flex-1 overflow-hidden p-0 bg-gradient-to-b from-secondary/50 to-background">
        <ScrollArea className="h-full [&>div>div]:!block">
          <div className="p-4 space-y-4 overflow-x-hidden">
            {messages.map((message) => (
              <div key={message.id}>
                <MessageBubble
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
                {/* 메뉴 이미지 카드 */}
                {message.menus && message.menus.length > 0 && (
                  <MenuCard menus={message.menus} />
                )}
                {/* 맛집 지도 카드 */}
                {message.restaurants && message.restaurants.length > 0 && (
                  <div className="ml-8 sm:ml-10 mt-2 mr-2">
                    <MapCard restaurants={message.restaurants} onNavigate={onClose} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* 게임 버튼 */}
      <div className="flex gap-2 px-4 pt-2">
        <button
          onClick={() => setActiveOverlay("swipe")}
          disabled={isLoading}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-orange-400 to-amber-400 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
        >
          스와이프 추천 🍽️
        </button>
        <button
          onClick={() => setActiveOverlay("worldcup")}
          disabled={isLoading}
          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
        >
          메뉴 월드컵 🏆
        </button>
      </div>

      {/* 빠른 선택 버튼 */}
      {messages.length === 1 && !isLoading && (
        <QuickReplies
          options={QUICK_REPLIES}
          onSelect={sendMessage}
          disabled={isLoading}
        />
      )}

      {/* 입력 영역 */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />

      {/* 게임 오버레이 */}
      {activeOverlay && (
        <ChatOverlay
          type={activeOverlay}
          onComplete={handleOverlayComplete}
          onClose={() => setActiveOverlay(null)}
        />
      )}
    </Card>
  )
}
