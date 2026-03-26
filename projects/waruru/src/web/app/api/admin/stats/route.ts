import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { mockDashboardStats, mockRecentMatches } from '@/lib/mock-data'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    // In production, query from Supabase tables
    // For now, return mock data
    return NextResponse.json(
      {
        data: {
          stats: mockDashboardStats,
          recentMatches: mockRecentMatches,
        },
        error: null,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, max-age=60',
        },
      }
    )
  } catch (err) {
    console.error('[/api/admin/stats] Error:', err)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}
