export interface WorldCupMenuItem {
  id: number
  name: string
  emoji: string
  searchKeyword: string
  category: string
}

export const WORLDCUP_MENUS: WorldCupMenuItem[] = [
  { id: 1, name: "김치찌개", emoji: "🍲", searchKeyword: "김치찌개", category: "한식" },
  { id: 2, name: "삼겹살", emoji: "🥩", searchKeyword: "삼겹살", category: "한식" },
  { id: 3, name: "초밥", emoji: "🍣", searchKeyword: "초밥", category: "일식" },
  { id: 4, name: "파스타", emoji: "🍝", searchKeyword: "파스타", category: "양식" },
  { id: 5, name: "치킨", emoji: "🍗", searchKeyword: "치킨", category: "치킨" },
  { id: 6, name: "떡볶이", emoji: "🌶️", searchKeyword: "떡볶이", category: "분식" },
  { id: 7, name: "피자", emoji: "🍕", searchKeyword: "피자", category: "양식" },
  { id: 8, name: "삼계탕", emoji: "🐔", searchKeyword: "삼계탕", category: "한식" },
  { id: 9, name: "해장국", emoji: "🥘", searchKeyword: "해장국", category: "한식" },
  { id: 10, name: "스테이크", emoji: "🥩", searchKeyword: "스테이크", category: "양식" },
  { id: 11, name: "샐러드", emoji: "🥗", searchKeyword: "샐러드", category: "양식" },
  { id: 12, name: "국밥", emoji: "🍜", searchKeyword: "국밥", category: "한식" },
  { id: 13, name: "라멘", emoji: "🍜", searchKeyword: "라멘", category: "일식" },
  { id: 14, name: "햄버거", emoji: "🍔", searchKeyword: "햄버거", category: "패스트푸드" },
  { id: 15, name: "마라탕", emoji: "🌶️", searchKeyword: "마라탕", category: "중식" },
  { id: 16, name: "디저트", emoji: "🍰", searchKeyword: "디저트카페", category: "카페" },
]
