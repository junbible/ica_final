// 맛집 데이터 타입
export interface Restaurant {
  id: number
  name: string
  category: string
  image: string
  rating: number
  reviewCount: number
  distance: string
  tags: string[]
  location: string
  isNew: boolean
  isHot: boolean
  // 상세 정보 (선택적)
  address?: string
  phone?: string
  hours?: string
  description?: string
  images?: string[]
  menus?: Menu[]
  reviews?: Review[]
  coordinates?: {
    lat: number
    lng: number
  }
}

export interface Menu {
  name: string
  price: number
  description: string
  isPopular: boolean
  image: string
}

export interface Review {
  id: number
  author: string
  rating: number
  date: string
  content: string
  helpful: number
}

// 맛집 데이터
export const RESTAURANTS: Restaurant[] = [
  {
    id: 1,
    name: "본가 설렁탕 강남점",
    category: "한식",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    rating: 4.7,
    reviewCount: 1247,
    distance: "85m",
    tags: ["설렁탕", "해장", "24시"],
    location: "강남",
    isNew: false,
    isHot: true,
    address: "서울 강남구 테헤란로 101",
    phone: "02-555-1234",
    hours: "24시간 영업",
    description: "30년 전통의 설렁탕 전문점. 진한 사골 육수와 부드러운 고기가 일품입니다.",
    images: [
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800",
    ],
    menus: [
      { name: "설렁탕", price: 12000, description: "진한 사골 육수", isPopular: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
      { name: "도가니탕", price: 15000, description: "부드러운 도가니", isPopular: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
      { name: "수육", price: 35000, description: "2~3인분", isPopular: false, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
    ],
    reviews: [
      { id: 1, author: "맛집러버", rating: 5, date: "2025.02.01", content: "국물이 진하고 고기가 부드러워요!", helpful: 23 },
      { id: 2, author: "야식파", rating: 4, date: "2025.01.28", content: "24시간이라 편해요", helpful: 15 },
    ],
    coordinates: { lat: 37.5012, lng: 127.0396 },
  },
  {
    id: 2,
    name: "고려삼계탕",
    category: "한식",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
    rating: 4.8,
    reviewCount: 2341,
    distance: "120m",
    tags: ["삼계탕", "보양식"],
    location: "강남",
    isNew: false,
    isHot: true,
    address: "서울 강남구 테헤란로 123",
    phone: "02-1234-5678",
    hours: "매일 10:00 - 22:00",
    description: "40년 전통의 삼계탕 전문점. 국내산 한방 재료만을 사용하여 정성껏 끓여낸 삼계탕을 맛보실 수 있습니다.",
    images: [
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800",
      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    ],
    menus: [
      { name: "삼계탕", price: 18000, description: "국내산 토종닭 + 한방재료", isPopular: true, image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=200" },
      { name: "옻닭", price: 22000, description: "옻나무 추출물로 끓인 보양식", isPopular: true, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=200" },
      { name: "전복삼계탕", price: 28000, description: "완도산 전복이 들어간 프리미엄", isPopular: false, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
      { name: "닭죽", price: 10000, description: "삼계탕 육수로 끓인 죽", isPopular: false, image: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=200" },
    ],
    reviews: [
      { id: 1, author: "맛집탐험가", rating: 5, date: "2025.01.28", content: "삼계탕 국물이 정말 진하고 깊어요. 강남에서 삼계탕 먹고 싶을 때 꼭 오는 곳!", helpful: 42 },
      { id: 2, author: "직장인A", rating: 5, date: "2025.01.25", content: "점심 특선 가성비 좋아요.", helpful: 28 },
      { id: 3, author: "보양식러버", rating: 4, date: "2025.01.20", content: "전복삼계탕 시켰는데 전복이 실해요. 가격대비 만족.", helpful: 15 },
    ],
    coordinates: { lat: 37.5665, lng: 127.0180 },
  },
  {
    id: 3,
    name: "더스테이크하우스",
    category: "양식",
    image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400",
    rating: 4.8,
    reviewCount: 534,
    distance: "450m",
    tags: ["스테이크", "데이트"],
    location: "강남",
    isNew: true,
    isHot: false,
    address: "서울 강남구 압구정로 45",
    phone: "02-333-4567",
    hours: "매일 11:30 - 22:00",
    description: "프리미엄 스테이크 전문점. 최상급 한우와 수입산 프라임 등급 소고기를 제공합니다.",
    images: [
      "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800",
      "https://images.unsplash.com/photo-1558030006-450675393462?w=800",
    ],
    menus: [
      { name: "안심 스테이크", price: 65000, description: "200g, 부드러운 식감", isPopular: true, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200" },
      { name: "립아이 스테이크", price: 75000, description: "250g, 마블링이 풍부", isPopular: true, image: "https://images.unsplash.com/photo-1558030006-450675393462?w=200" },
      { name: "코스 A", price: 120000, description: "에피타이저 + 스테이크 + 디저트", isPopular: false, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200" },
    ],
    reviews: [
      { id: 1, author: "스테이크매니아", rating: 5, date: "2025.02.05", content: "고기 퀄리티가 정말 좋아요!", helpful: 31 },
    ],
    coordinates: { lat: 37.5267, lng: 127.0401 },
  },
  {
    id: 4,
    name: "샐러디 강남점",
    category: "양식",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    rating: 4.5,
    reviewCount: 1823,
    distance: "95m",
    tags: ["샐러드", "다이어트"],
    location: "강남",
    isNew: false,
    isHot: false,
    address: "서울 강남구 강남대로 321",
    phone: "02-444-5678",
    hours: "평일 08:00 - 21:00",
    description: "신선한 재료로 만드는 건강한 샐러드 전문점",
    images: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800"],
    menus: [
      { name: "시저 샐러드", price: 12000, description: "로메인 + 파마산", isPopular: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200" },
      { name: "닭가슴살 샐러드", price: 14000, description: "단백질 보충", isPopular: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200" },
    ],
    reviews: [
      { id: 1, author: "헬스인", rating: 5, date: "2025.01.30", content: "다이어트 중 매일 와요", helpful: 18 },
    ],
    coordinates: { lat: 37.4979, lng: 127.0276 },
  },
  {
    id: 5,
    name: "아비꼬 카레",
    category: "일식",
    image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400",
    rating: 4.5,
    reviewCount: 5123,
    distance: "75m",
    tags: ["카레", "가성비"],
    location: "강남",
    isNew: false,
    isHot: true,
    address: "서울 강남구 역삼로 55",
    phone: "02-555-6789",
    hours: "매일 11:00 - 21:00",
    description: "일본식 카레 전문점. 진한 카레 소스와 다양한 토핑이 특징입니다.",
    images: ["https://images.unsplash.com/photo-1574484284002-952d92456975?w=800"],
    menus: [
      { name: "카츠카레", price: 9500, description: "바삭한 돈카츠 + 카레", isPopular: true, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=200" },
      { name: "치즈카레", price: 10500, description: "듬뿍 치즈", isPopular: true, image: "https://images.unsplash.com/photo-1574484284002-952d92456975?w=200" },
    ],
    reviews: [
      { id: 1, author: "카레덕후", rating: 5, date: "2025.02.03", content: "가성비 최고!", helpful: 55 },
    ],
    coordinates: { lat: 37.5001, lng: 127.0366 },
  },
  {
    id: 6,
    name: "옛날옛적 홍대점",
    category: "한식",
    image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400",
    rating: 4.5,
    reviewCount: 2156,
    distance: "150m",
    tags: ["삼겹살", "회식"],
    location: "홍대",
    isNew: false,
    isHot: true,
    address: "서울 마포구 홍익로 12",
    phone: "02-666-7890",
    hours: "매일 17:00 - 02:00",
    description: "숯불에 구워 먹는 삼겹살 전문점",
    images: ["https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800"],
    menus: [
      { name: "삼겹살", price: 17000, description: "1인분 180g", isPopular: true, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200" },
      { name: "목살", price: 18000, description: "1인분 180g", isPopular: true, image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=200" },
    ],
    reviews: [
      { id: 1, author: "고기러버", rating: 5, date: "2025.01.25", content: "숯불 향이 좋아요", helpful: 32 },
    ],
    coordinates: { lat: 37.5563, lng: 126.9234 },
  },
  {
    id: 7,
    name: "콩나물해장국 홍대점",
    category: "한식",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    rating: 4.6,
    reviewCount: 1987,
    distance: "80m",
    tags: ["해장", "24시"],
    location: "홍대",
    isNew: false,
    isHot: false,
    address: "서울 마포구 와우산로 33",
    phone: "02-777-8901",
    hours: "24시간 영업",
    description: "시원한 콩나물 해장국 전문점",
    images: ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"],
    menus: [
      { name: "콩나물해장국", price: 9000, description: "시원한 국물", isPopular: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
      { name: "알탕", price: 12000, description: "매콤한 알탕", isPopular: false, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
    ],
    reviews: [
      { id: 1, author: "해장왕", rating: 5, date: "2025.01.20", content: "술 마신 다음날 최고", helpful: 45 },
    ],
    coordinates: { lat: 37.5551, lng: 126.9256 },
  },
  {
    id: 8,
    name: "황소곱창 본점",
    category: "한식",
    image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400",
    rating: 4.6,
    reviewCount: 4521,
    distance: "350m",
    tags: ["곱창", "매운맛"],
    location: "홍대",
    isNew: false,
    isHot: true,
    address: "서울 마포구 어울마당로 88",
    phone: "02-888-9012",
    hours: "매일 16:00 - 03:00",
    description: "신선한 국내산 곱창만 사용하는 곱창 전문점",
    images: ["https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=800"],
    menus: [
      { name: "모듬곱창", price: 35000, description: "2인분, 곱창+대창+막창", isPopular: true, image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=200" },
      { name: "곱창전골", price: 30000, description: "2인분", isPopular: false, image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=200" },
    ],
    reviews: [
      { id: 1, author: "곱창마니아", rating: 5, date: "2025.02.01", content: "여기 곱창 진짜 신선해요", helpful: 67 },
    ],
    coordinates: { lat: 37.5533, lng: 126.9215 },
  },
  {
    id: 9,
    name: "포케올데이 홍대",
    category: "양식",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
    rating: 4.4,
    reviewCount: 892,
    distance: "200m",
    tags: ["포케", "건강식"],
    location: "홍대",
    isNew: true,
    isHot: false,
    address: "서울 마포구 양화로 56",
    phone: "02-999-0123",
    hours: "매일 10:00 - 21:00",
    description: "하와이안 포케 전문점",
    images: ["https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"],
    menus: [
      { name: "연어 포케", price: 14000, description: "신선한 연어", isPopular: true, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200" },
      { name: "참치 포케", price: 15000, description: "참치 + 아보카도", isPopular: true, image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200" },
    ],
    reviews: [
      { id: 1, author: "건강식러버", rating: 4, date: "2025.02.05", content: "신선하고 맛있어요", helpful: 12 },
    ],
    coordinates: { lat: 37.5567, lng: 126.9198 },
  },
  {
    id: 10,
    name: "진진 마라탕",
    category: "중식",
    image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400",
    rating: 4.4,
    reviewCount: 967,
    distance: "180m",
    tags: ["마라탕", "매운맛"],
    location: "신촌",
    isNew: false,
    isHot: true,
    address: "서울 서대문구 연세로 77",
    phone: "02-111-2345",
    hours: "매일 11:00 - 22:00",
    description: "본토 스타일 마라탕 전문점",
    images: ["https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800"],
    menus: [
      { name: "마라탕", price: 8000, description: "100g당 가격", isPopular: true, image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200" },
      { name: "마라샹궈", price: 15000, description: "1인분", isPopular: true, image: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=200" },
    ],
    reviews: [
      { id: 1, author: "마라홀릭", rating: 5, date: "2025.01.28", content: "마라 레벨 조절 가능해서 좋아요", helpful: 28 },
    ],
    coordinates: { lat: 37.5599, lng: 126.9368 },
  },
  {
    id: 11,
    name: "교동짬뽕 신촌점",
    category: "중식",
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400",
    rating: 4.3,
    reviewCount: 3421,
    distance: "95m",
    tags: ["짬뽕", "해장"],
    location: "신촌",
    isNew: false,
    isHot: false,
    address: "서울 서대문구 신촌로 88",
    phone: "02-222-3456",
    hours: "매일 10:30 - 21:30",
    description: "얼큰한 짬뽕 전문점",
    images: ["https://images.unsplash.com/photo-1555126634-323283e090fa?w=800"],
    menus: [
      { name: "짬뽕", price: 9000, description: "얼큰한 국물", isPopular: true, image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=200" },
      { name: "짜장면", price: 7000, description: "춘장 듬뿍", isPopular: false, image: "https://images.unsplash.com/photo-1555126634-323283e090fa?w=200" },
    ],
    reviews: [
      { id: 1, author: "짬뽕러버", rating: 4, date: "2025.01.22", content: "국물이 시원해요", helpful: 19 },
    ],
    coordinates: { lat: 37.5589, lng: 126.9388 },
  },
  {
    id: 12,
    name: "신선설농탕",
    category: "한식",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    rating: 4.5,
    reviewCount: 1654,
    distance: "150m",
    tags: ["설렁탕", "보양식"],
    location: "신촌",
    isNew: false,
    isHot: false,
    address: "서울 서대문구 이화여대길 33",
    phone: "02-333-4567",
    hours: "매일 07:00 - 22:00",
    description: "진한 사골 국물의 설농탕 전문점",
    images: ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"],
    menus: [
      { name: "설농탕", price: 11000, description: "진한 사골 국물", isPopular: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
      { name: "특설농탕", price: 14000, description: "고기 듬뿍", isPopular: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
    ],
    reviews: [
      { id: 1, author: "설렁탕마니아", rating: 5, date: "2025.01.18", content: "아침에 먹기 좋아요", helpful: 22 },
    ],
    coordinates: { lat: 37.5612, lng: 126.9466 },
  },
  {
    id: 13,
    name: "성수샐러드클럽",
    category: "양식",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    rating: 4.7,
    reviewCount: 2234,
    distance: "120m",
    tags: ["샐러드", "브런치"],
    location: "성수",
    isNew: true,
    isHot: false,
    address: "서울 성동구 성수이로 99",
    phone: "02-444-5678",
    hours: "매일 09:00 - 20:00",
    description: "성수동 핫플레이스 샐러드 카페",
    images: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800"],
    menus: [
      { name: "시그니처 샐러드", price: 16000, description: "매장 베스트", isPopular: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200" },
      { name: "아보카도 토스트", price: 12000, description: "브런치 메뉴", isPopular: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200" },
    ],
    reviews: [
      { id: 1, author: "성수러버", rating: 5, date: "2025.02.07", content: "인테리어도 예쁘고 음식도 맛있어요", helpful: 35 },
    ],
    coordinates: { lat: 37.5447, lng: 127.0556 },
  },
  {
    id: 14,
    name: "떡볶이공장 성수",
    category: "한식",
    image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=400",
    rating: 4.3,
    reviewCount: 1876,
    distance: "200m",
    tags: ["떡볶이", "매운맛"],
    location: "성수",
    isNew: false,
    isHot: false,
    address: "서울 성동구 왕십리로 111",
    phone: "02-555-6789",
    hours: "매일 11:00 - 21:00",
    description: "수제 떡볶이 전문점",
    images: ["https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=800"],
    menus: [
      { name: "로제떡볶이", price: 14000, description: "크림소스 + 떡볶이", isPopular: true, image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=200" },
      { name: "매운떡볶이", price: 10000, description: "전통 매운맛", isPopular: false, image: "https://images.unsplash.com/photo-1635363638580-c2809d049eee?w=200" },
    ],
    reviews: [
      { id: 1, author: "떡볶이러버", rating: 4, date: "2025.01.25", content: "로제가 진짜 맛있어요", helpful: 41 },
    ],
    coordinates: { lat: 37.5467, lng: 127.0521 },
  },
  {
    id: 15,
    name: "온더보더 이태원",
    category: "양식",
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
    rating: 4.5,
    reviewCount: 1678,
    distance: "280m",
    tags: ["멕시칸", "브런치"],
    location: "이태원",
    isNew: false,
    isHot: false,
    address: "서울 용산구 이태원로 55",
    phone: "02-666-7890",
    hours: "매일 11:00 - 22:00",
    description: "정통 멕시칸 레스토랑",
    images: ["https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800"],
    menus: [
      { name: "타코 플래터", price: 25000, description: "타코 3종 세트", isPopular: true, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200" },
      { name: "퀘사디아", price: 18000, description: "치즈 가득", isPopular: true, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200" },
    ],
    reviews: [
      { id: 1, author: "멕시칸팬", rating: 5, date: "2025.01.30", content: "이태원에서 멕시칸 먹을 땐 여기!", helpful: 27 },
    ],
    coordinates: { lat: 37.5344, lng: 126.9944 },
  },
  {
    id: 16,
    name: "이태원 곰탕집",
    category: "한식",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400",
    rating: 4.6,
    reviewCount: 2341,
    distance: "150m",
    tags: ["곰탕", "보양식"],
    location: "이태원",
    isNew: false,
    isHot: false,
    address: "서울 용산구 녹사평대로 77",
    phone: "02-777-8901",
    hours: "매일 08:00 - 21:00",
    description: "진한 곰탕 전문점",
    images: ["https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800"],
    menus: [
      { name: "곰탕", price: 13000, description: "진한 사골 국물", isPopular: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
      { name: "갈비탕", price: 16000, description: "갈비 + 사골", isPopular: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200" },
    ],
    reviews: [
      { id: 1, author: "탕마니아", rating: 5, date: "2025.02.02", content: "사골 맛이 진해요", helpful: 33 },
    ],
    coordinates: { lat: 37.5356, lng: 126.9912 },
  },
  {
    id: 17,
    name: "여의도삼계탕",
    category: "한식",
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400",
    rating: 4.7,
    reviewCount: 1543,
    distance: "100m",
    tags: ["삼계탕", "점심"],
    location: "여의도",
    isNew: false,
    isHot: false,
    address: "서울 영등포구 여의나루로 66",
    phone: "02-888-9012",
    hours: "평일 10:00 - 20:00",
    description: "직장인들이 사랑하는 삼계탕 맛집",
    images: ["https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800"],
    menus: [
      { name: "삼계탕", price: 16000, description: "국내산 닭", isPopular: true, image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=200" },
      { name: "녹두삼계탕", price: 18000, description: "녹두 + 한방재료", isPopular: false, image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=200" },
    ],
    reviews: [
      { id: 1, author: "여의도직장인", rating: 5, date: "2025.01.29", content: "점심시간 웨이팅 있어요", helpful: 24 },
    ],
    coordinates: { lat: 37.5283, lng: 126.9244 },
  },
  {
    id: 18,
    name: "점심엔샐러드",
    category: "양식",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    rating: 4.4,
    reviewCount: 987,
    distance: "180m",
    tags: ["샐러드", "도시락"],
    location: "여의도",
    isNew: true,
    isHot: false,
    address: "서울 영등포구 국제금융로 88",
    phone: "02-999-0123",
    hours: "평일 08:00 - 18:00",
    description: "건강한 점심 샐러드 전문점",
    images: ["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800"],
    menus: [
      { name: "도시락 샐러드", price: 11000, description: "포장 전용", isPopular: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200" },
      { name: "프로틴 샐러드", price: 13000, description: "닭가슴살 100g", isPopular: true, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200" },
    ],
    reviews: [
      { id: 1, author: "다이어터", rating: 4, date: "2025.02.06", content: "포장해서 회사에서 먹어요", helpful: 16 },
    ],
    coordinates: { lat: 37.5256, lng: 126.9267 },
  },
]

// 헬퍼 함수들
export function getRestaurantById(id: number): Restaurant | undefined {
  return RESTAURANTS.find(r => r.id === id)
}

export function getRestaurantsByLocation(location: string): Restaurant[] {
  return RESTAURANTS.filter(r => r.location === location)
}

export function getHotRestaurants(limit = 6): Restaurant[] {
  return RESTAURANTS.filter(r => r.isHot).slice(0, limit)
}

export function getNewRestaurants(): Restaurant[] {
  return RESTAURANTS.filter(r => r.isNew)
}

export function searchRestaurants(query: string): Restaurant[] {
  const lowerQuery = query.toLowerCase()
  return RESTAURANTS.filter(r =>
    r.name.toLowerCase().includes(lowerQuery) ||
    r.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
    r.category.toLowerCase().includes(lowerQuery)
  )
}

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
export const LOCATIONS = ["강남", "홍대", "신촌", "이태원", "성수", "여의도"]

// 테마 컬렉션
export const COLLECTIONS = [
  {
    id: "healing",
    title: "🍲 따끈한 국물이 생각날 때",
    subtitle: "몸도 마음도 녹이는 국물 맛집",
    color: "from-amber-500 to-orange-500",
    restaurants: [1, 7, 11, 12, 16],
  },
  {
    id: "date",
    title: "💕 분위기 좋은 데이트 코스",
    subtitle: "특별한 날을 위한 레스토랑",
    color: "from-pink-500 to-rose-500",
    restaurants: [3, 15],
  },
  {
    id: "solo",
    title: "🍜 혼밥하기 좋은 곳",
    subtitle: "혼자서도 편하게 즐길 수 있는",
    color: "from-blue-500 to-indigo-500",
    restaurants: [5, 4, 9],
  },
  {
    id: "spicy",
    title: "🌶️ 오늘은 매운 게 땡긴다",
    subtitle: "스트레스 날리는 매운맛",
    color: "from-red-500 to-pink-500",
    restaurants: [8, 10, 14],
  },
]
