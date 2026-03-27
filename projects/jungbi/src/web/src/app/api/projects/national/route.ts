import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.DATA_GO_KR_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: '공공데이터포털 API가 설정되지 않았습니다' }, { status: 500 })
  }

  try {
    // 전국도시개발사업정보표준데이터
    const url = `https://api.odcloud.kr/api/15125869/v1/uddi:0b3bf577-5e5e-4be8-8627-d7a783ef31c3?page=1&perPage=500&serviceKey=${encodeURIComponent(apiKey)}`

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
    return NextResponse.json({ error: '전국 도시개발 데이터를 불러오지 못했습니다' }, { status: 500 })
  }
}
