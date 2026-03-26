import type { ProjectType } from '@/types'

// Redevelopment (재개발) procedure stages
export const REDEVELOPMENT_STAGES = [
  { code: 'RD-01', name: '기본계획 수립', duration_months: 12, legal_basis: ['도시정비법 제4조'] },
  { code: 'RD-02', name: '안전진단', duration_months: 6, legal_basis: ['도시정비법 제12조'] },
  { code: 'RD-03', name: '정비계획 수립 및 정비구역 지정', duration_months: 18, legal_basis: ['도시정비법 제8조', '도시정비법 제16조'] },
  { code: 'RD-04', name: '추진위원회 구성 및 승인', duration_months: 6, legal_basis: ['도시정비법 제31조'] },
  { code: 'RD-05', name: '조합 설립 인가', duration_months: 12, legal_basis: ['도시정비법 제35조'], consent_rate: 75 },
  { code: 'RD-06', name: '시공자 선정', duration_months: 6, legal_basis: ['도시정비법 제29조'] },
  { code: 'RD-07', name: '사업시행계획 인가', duration_months: 18, legal_basis: ['도시정비법 제50조'] },
  { code: 'RD-08', name: '분양설계 및 관리처분계획 인가', duration_months: 12, legal_basis: ['도시정비법 제49조', '도시정비법 제74조'] },
  { code: 'RD-09', name: '이주 및 철거', duration_months: 12, legal_basis: ['도시정비법 제81조'] },
  { code: 'RD-10', name: '착공 및 공사', duration_months: 36, legal_basis: ['건축법 제21조'] },
  { code: 'RD-11', name: '준공 및 입주', duration_months: 6, legal_basis: ['도시정비법 제83조'] },
  { code: 'RD-12', name: '청산', duration_months: 12, legal_basis: ['도시정비법 제89조'] },
] as const

// Reconstruction (재건축) procedure stages
export const RECONSTRUCTION_STAGES = [
  { code: 'RC-01', name: '기본계획 수립', duration_months: 12, legal_basis: ['도시정비법 제4조'] },
  { code: 'RC-02', name: '안전진단', duration_months: 9, legal_basis: ['도시정비법 제12조'] },
  { code: 'RC-03', name: '정비구역 지정', duration_months: 12, legal_basis: ['도시정비법 제8조'] },
  { code: 'RC-04', name: '추진위원회 구성', duration_months: 6, legal_basis: ['도시정비법 제31조'] },
  { code: 'RC-05', name: '조합 설립 인가', duration_months: 12, legal_basis: ['도시정비법 제35조'], consent_rate: 75 },
  { code: 'RC-06', name: '시공자 선정', duration_months: 6, legal_basis: ['도시정비법 제29조'] },
  { code: 'RC-07', name: '사업시행계획 인가', duration_months: 18, legal_basis: ['도시정비법 제50조'] },
  { code: 'RC-08', name: '관리처분계획 인가', duration_months: 12, legal_basis: ['도시정비법 제74조'] },
  { code: 'RC-09', name: '이주 및 철거', duration_months: 12, legal_basis: ['도시정비법 제81조'] },
  { code: 'RC-10', name: '착공 및 공사', duration_months: 30, legal_basis: ['건축법 제21조'] },
  { code: 'RC-11', name: '준공 및 입주', duration_months: 6, legal_basis: ['도시정비법 제83조'] },
] as const

export const PROJECT_TYPE_MAP: Record<ProjectType, { label: string; color: string; bgColor: string }> = {
  redevelopment: { label: '재개발', color: 'text-primary-600', bgColor: 'bg-primary-050' },
  reconstruction: { label: '재건축', color: 'text-info-600', bgColor: 'bg-info-100' },
  small_scale: { label: '소규모정비', color: 'text-success-600', bgColor: 'bg-success-100' },
  moa: { label: '모아주택', color: 'text-accent-600', bgColor: 'bg-accent-100' },
}

export const SIDEBAR_NAV = [
  {
    label: '대시보드',
    href: '/dashboard',
    icon: 'LayoutDashboard',
  },
  {
    label: '법령 관리',
    icon: 'ScrollText',
    children: [
      { label: '법령 조회', href: '/laws' },
      { label: '법령 업데이트 알림', href: '/laws/alerts' },
    ],
  },
  {
    label: '절차 관리',
    icon: 'GitBranch',
    children: [
      { label: '절차 플로우차트', href: '/flow' },
      { label: '단계별 진행 현황', href: '/dashboard' },
    ],
  },
  {
    label: '조례 비교',
    href: '/laws/compare',
    icon: 'BarChart3',
  },
  {
    label: '일정 관리',
    icon: 'CalendarClock',
    children: [
      { label: '캘린더', href: '/calendar' },
      { label: '마감기한 현황', href: '/calendar' },
    ],
  },
  {
    label: '사례 검색',
    href: '/cases',
    icon: 'FolderSearch',
  },
  {
    label: '설정',
    href: '/settings',
    icon: 'Settings',
  },
] as const

export const REGIONS_KR: Record<string, string> = {
  seoul: '서울특별시',
  busan: '부산광역시',
  daegu: '대구광역시',
  incheon: '인천광역시',
  gwangju: '광주광역시',
  daejeon: '대전광역시',
  ulsan: '울산광역시',
  sejong: '세종특별자치시',
  gyeonggi: '경기도',
  gangwon: '강원특별자치도',
  chungbuk: '충청북도',
  chungnam: '충청남도',
  jeonbuk: '전북특별자치도',
  jeonnam: '전라남도',
  gyeongbuk: '경상북도',
  gyeongnam: '경상남도',
  jeju: '제주특별자치도',
}
