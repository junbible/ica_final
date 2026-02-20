export interface SwipeQuestion {
  text: string
  emoji: string
  yesLabel: string
  noLabel: string
  conditionKey: "spicy" | "warm" | "light" | "soup"
}

export const SWIPE_QUESTIONS: SwipeQuestion[] = [
  {
    text: "자극적인 음식이 필요한가요?",
    emoji: "🌶️",
    yesLabel: "네!",
    noLabel: "아니요",
    conditionKey: "spicy",
  },
  {
    text: "따뜻한 음식이 좋은가요?",
    emoji: "🔥",
    yesLabel: "따뜻하게",
    noLabel: "시원하게",
    conditionKey: "warm",
  },
  {
    text: "가볍게 먹고 싶은가요?",
    emoji: "🥗",
    yesLabel: "가볍게",
    noLabel: "든든하게",
    conditionKey: "light",
  },
  {
    text: "국물이 필요한가요?",
    emoji: "🍜",
    yesLabel: "국물!",
    noLabel: "국물 없이",
    conditionKey: "soup",
  },
]
