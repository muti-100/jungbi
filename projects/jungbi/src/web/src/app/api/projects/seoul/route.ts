import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const apiKey = process.env.DATA_GO_KR_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: '공공데이터포털 API가 설정되지 않았습니다' }, { status: 500 })
  }

  const page = request.nextUrl.searchParams.get('page') || '1'
  const perPage = request.nextUrl.searchParams.get('perPage') || '100'

  try {
    // 서울특별시_서울시 정비사업 데이터 API
    const url = `https://api.odcloud.kr/api/15044658/v1/uddi:35c6cebf-e2cb-4777-af72-5da1e0ef5c5b?page=${page}&perPage=${perPage}&serviceKey=${encodeURIComponent(apiKey)}`

    const res = await fetch(url, {
      next: { revalidate: 86400 }, // cache 24 hours
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        {
          error: '공공데이터포털 API 오류',
          status: res.status,
          detail: text.substring(0, 200),
        },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: '서울시 정비사업 데이터를 불러오지 못했습니다' }, { status: 500 })
  }
}
