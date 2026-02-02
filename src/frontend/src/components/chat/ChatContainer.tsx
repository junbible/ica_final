import { useState, useRef, useEffect } from "react"
import { RotateCcw, Sparkles } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageBubble } from "./MessageBubble"
import { TypingIndicator } from "./TypingIndicator"
import { QuickReplies } from "./QuickReplies"
import { ChatInput } from "./ChatInput"
import { MapCard, type Restaurant } from "./MapCard"
import { MenuCard, type Menu } from "./MenuCard"

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string
  menus?: Menu[]
  restaurants?: Restaurant[]
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  content: "안녕하세요! 오늘 컨디션은 어떠세요? 맞춤 메뉴를 추천해드릴게요 😊",
  isUser: false,
  timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
}

const QUICK_REPLIES = [
  "피곤해요 😫",
  "숙취가 있어요 🍺",
  "스트레스 받아요 😤",
  "감기 기운이 있어요 🤧",
  "가볍게 먹고 싶어요 🥗"
]

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const sendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
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
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
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
        timestamp: new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
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

  return (
    <Card className="w-full h-full sm:w-[420px] sm:h-[680px] sm:max-h-[90vh] mx-auto flex flex-col shadow-2xl shadow-primary/20 border-0 sm:rounded-xl rounded-none overflow-hidden">
      {/* 헤더 - 그라데이션 배경 */}
      <CardHeader className="bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-white py-4 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <div>
              <div className="flex items-center gap-1.5">
                냠냠 추천봇
                <Sparkles className="w-4 h-4" />
              </div>
              <p className="text-xs font-normal opacity-90">컨디션 맞춤 메뉴 추천</p>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            title="대화 초기화"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
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
                    <MapCard restaurants={message.restaurants} />
                  </div>
                )}
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

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
    </Card>
  )
}
