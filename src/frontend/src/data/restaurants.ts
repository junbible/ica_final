// UI 상수 및 카테고리 이미지 매핑
// 하드코딩된 맛집 데이터는 삭제됨 — 카카오 API를 통해 실제 데이터 사용

// 컨디션별 추천
export const CONDITIONS = [
  { key: "tired", emoji: "😫", label: "피곤할 때", color: "from-orange-400 to-red-400" },
  { key: "hangover", emoji: "🍺", label: "해장 필요", color: "from-green-400 to-emerald-500" },
  { key: "stress", emoji: "😤", label: "스트레스", color: "from-red-400 to-pink-500" },
  { key: "light", emoji: "🥗", label: "가볍게", color: "from-emerald-400 to-teal-500" },
  { key: "special", emoji: "🎉", label: "특별한 날", color: "from-purple-400 to-indigo-500" },
  { key: "alone", emoji: "🍜", label: "혼밥", color: "from-blue-400 to-cyan-500" },
]

// 카테고리 목록
export const CATEGORIES = [
  { id: "korean", label: "한식", emoji: "🍚", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200" },
  { id: "chinese", label: "중식", emoji: "🥟", image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200" },
  { id: "japanese", label: "일식", emoji: "🍣", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=200" },
  { id: "western", label: "양식", emoji: "🍝", image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200" },
  { id: "cafe", label: "카페", emoji: "☕", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200" },
  { id: "bar", label: "술집", emoji: "🍺", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200" },
]

// 지역 목록
export const LOCATIONS = ["강남", "홍대", "신촌", "이태원", "성수", "여의도", "명동", "건대", "잠실"]

// 지역별 좌표 (프론트엔드 폴백 / GPS 비교용)
export const LOCATION_COORDS: Record<string, { lat: number; lng: number }> = {
  "강남": { lat: 37.4979, lng: 127.0276 },
  "홍대": { lat: 37.5563, lng: 126.9220 },
  "신촌": { lat: 37.5550, lng: 126.9366 },
  "이태원": { lat: 37.5340, lng: 126.9948 },
  "명동": { lat: 37.5636, lng: 126.9869 },
  "건대": { lat: 37.5404, lng: 127.0696 },
  "잠실": { lat: 37.5133, lng: 127.1001 },
  "여의도": { lat: 37.5219, lng: 126.9245 },
  "성수": { lat: 37.5445, lng: 127.0560 },
}

// 카테고리별 기본 이미지 (카카오 API가 이미지를 안 주므로)
export const CATEGORY_IMAGES: Record<string, string> = {
  "한식": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
  "중식": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400",
  "일식": "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
  "양식": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400",
  "카페": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
  "치킨": "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400",
  "분식": "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400",
  "패스트푸드": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
  "고기": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
  "삼겹살": "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
  "해장국": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
  "국밥": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
  "삼계탕": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
  "샐러드": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
  "포케": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
  "스테이크": "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400",
  "파스타": "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400",
  "마라탕": "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400",
  "피자": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  "디저트": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
  "술집": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400",
}

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400"

/** 카테고리 문자열에서 적절한 기본 이미지 반환 */
export function getCategoryImage(category: string): string {
  // 직접 매칭
  if (CATEGORY_IMAGES[category]) return CATEGORY_IMAGES[category]

  // 부분 매칭 — 카카오 카테고리는 "음식점 > 한식 > 삼계탕" 같은 형태
  for (const [key, url] of Object.entries(CATEGORY_IMAGES)) {
    if (category.includes(key)) return url
  }

  return DEFAULT_IMAGE
}

// 테마 컬렉션 (searchQuery 기반)
export const COLLECTIONS = [
  {
    id: "healing",
    title: "🍲 따끈한 국물이 생각날 때",
    subtitle: "몸도 마음도 녹이는 국물 맛집",
    color: "from-amber-500 to-orange-500",
    searchQuery: "해장국",
  },
  {
    id: "date",
    title: "💕 분위기 좋은 데이트 코스",
    subtitle: "특별한 날을 위한 레스토랑",
    color: "from-pink-500 to-rose-500",
    searchQuery: "레스토랑",
  },
  {
    id: "solo",
    title: "🍜 혼밥하기 좋은 곳",
    subtitle: "혼자서도 편하게 즐길 수 있는",
    color: "from-blue-500 to-indigo-500",
    searchQuery: "혼밥",
  },
  {
    id: "spicy",
    title: "🌶️ 오늘은 매운 게 땡긴다",
    subtitle: "스트레스 날리는 매운맛",
    color: "from-red-500 to-pink-500",
    searchQuery: "매운",
  },
]

// 카테고리 ID → 검색 키워드 매핑
export const CATEGORY_SEARCH_MAP: Record<string, string> = {
  korean: "한식",
  chinese: "중식",
  japanese: "일식",
  western: "양식",
  cafe: "카페",
  bar: "술집",
}
