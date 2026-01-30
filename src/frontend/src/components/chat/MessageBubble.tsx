import { cn } from "@/lib/utils"
import { Bot } from "lucide-react"

interface MessageBubbleProps {
  content: string
  isUser: boolean
  timestamp?: string
}

export function MessageBubble({ content, isUser, timestamp }: MessageBubbleProps) {
  return (
    <div className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}>
      {/* 봇 아바타 */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center shrink-0 shadow-md">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "max-w-[280px] px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
            isUser
              ? "bg-gradient-to-r from-[#FBBF24] to-[#F59E0B] text-black rounded-2xl rounded-br-sm"
              : "bg-white text-foreground rounded-2xl rounded-bl-sm border border-border/50"
          )}
        >
          <p className="whitespace-pre-wrap break-words">{content}</p>
        </div>
        {timestamp && (
          <span className="text-[10px] text-muted-foreground mt-1 px-1">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  )
}
