type TimePeriod = "morning" | "lunch" | "afternoon" | "dinner" | "latenight"

interface TimeContext {
  period: TimePeriod
  greeting: string
  quickReplies: string[]
}

function getPeriod(): TimePeriod {
  const h = new Date().getHours()
  if (h >= 6 && h < 10) return "morning"
  if (h >= 10 && h < 14) return "lunch"
  if (h >= 14 && h < 17) return "afternoon"
  if (h >= 17 && h < 21) return "dinner"
  return "latenight"
}

const CONTEXT_MAP: Record<TimePeriod, TimeContext> = {
  morning: {
    period: "morning",
    greeting: "좋은 아침이에요! 든든한 아침 메뉴 추천해드릴게요 🌅",
    quickReplies: [
      "숙취가 있어요 🍺",
      "든든하게 먹고 싶어요 🍚",
      "가볍게 먹고 싶어요 🥗",
      "따뜻한 국물이 땡겨요 🍲",
      "빵이나 브런치 🥐",
    ],
  },
  lunch: {
    period: "lunch",
    greeting: "점심시간이에요! 오늘 뭐 먹을지 골라볼까요? 🍽️",
    quickReplies: [
      "빠르게 먹고 싶어요 ⚡",
      "점심 특선 추천해줘 🍱",
      "매운 거 땡겨요 🌶️",
      "가볍게 먹고 싶어요 🥗",
      "오늘은 특별하게 🎉",
    ],
  },
  afternoon: {
    period: "afternoon",
    greeting: "나른한 오후네요! 간식이나 카페 추천해드릴까요? ☕",
    quickReplies: [
      "커피 한 잔 ☕",
      "달달한 디저트 🍰",
      "간식이 필요해요 🍪",
      "스트레스 받아요 😤",
      "가볍게 먹고 싶어요 🥗",
    ],
  },
  dinner: {
    period: "dinner",
    greeting: "저녁시간이에요! 맛있는 저녁 추천해드릴게요 🌙",
    quickReplies: [
      "고기 먹고 싶어요 🥩",
      "오늘 회식이에요 🍻",
      "피곤해요 😫",
      "매운 거 땡겨요 🌶️",
      "혼밥하고 싶어요 🍜",
    ],
  },
  latenight: {
    period: "latenight",
    greeting: "야식 타임! 오늘 밤 뭐 먹을까요? 🌃",
    quickReplies: [
      "야식 추천해줘 🍗",
      "라멘 땡겨요 🍜",
      "치킨 먹고 싶어요 🐔",
      "술안주 추천 🍺",
      "가볍게 먹고 싶어요 🥗",
    ],
  },
}

export function getTimeContext(): TimeContext {
  return CONTEXT_MAP[getPeriod()]
}
