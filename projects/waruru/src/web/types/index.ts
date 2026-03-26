// ─── Domain Types ──────────────────────────────────────────────────────────────

export type MatchStatus = 'pending' | 'confirmed' | 'arrived' | 'completed' | 'cancelled'

export type ReportStatus = 'pending' | 'resolved' | 'suspended'

export type VenueCategory =
  | '카페'
  | '레스토랑'
  | '바'
  | '공원'
  | '문화공간'
  | '스포츠'
  | '기타'

export type District = '마포' | '성동' | '강남' | '용산' | '송파'

// ─── Admin Stats ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  dau: number
  dauDelta: number
  weeklyMatches: number
  weeklyMatchesDelta: number
  rollingPaperRate: number
  rollingPaperRateDelta: number
  bleArrivalRate: number
  bleArrivalRateDelta: number
}

export interface RecentMatch {
  matchId: string
  district: District
  status: MatchStatus
  createdAt: string
  participantCount: number
}

// ─── Venue ─────────────────────────────────────────────────────────────────────

export interface Venue {
  id: string
  name: string
  category: VenueCategory
  district: District
  address: string
  lat: number
  lng: number
  openHours: string
  isActive: boolean
  createdAt: string
}

export interface VenueFormData {
  name: string
  category: VenueCategory
  district: District
  address: string
  lat: number | ''
  lng: number | ''
  openHours: string
}

// ─── Report ────────────────────────────────────────────────────────────────────

export interface Report {
  id: string
  reporterNickname: string
  targetNickname: string
  reason: string
  detail: string
  createdAt: string
  status: ReportStatus
}

// ─── API Response ──────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  error: string | null
}
