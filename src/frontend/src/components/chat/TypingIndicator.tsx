import { Bot } from "lucide-react"

export function TypingIndicator() {
  return (
    <div className="flex justify-start gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FBBF24] to-[#F59E0B] flex items-center justify-center shrink-0 shadow-md">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-border/50">
        <div className="flex space-x-1.5">
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}
