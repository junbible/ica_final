import { Button } from "@/components/ui/button"

interface QuickRepliesProps {
  options: string[]
  onSelect: (option: string) => void
  disabled?: boolean
}

export function QuickReplies({ options, onSelect, disabled }: QuickRepliesProps) {
  if (options.length === 0) return null

  return (
    <div className="px-4 py-3 border-t border-border/50 bg-white/50">
      <p className="text-xs text-muted-foreground mb-2">빠른 선택</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant="outline"
            size="sm"
            onClick={() => onSelect(option)}
            disabled={disabled}
            className="rounded-full text-xs bg-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 shadow-sm"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  )
}
