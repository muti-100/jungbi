import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') || '재개발 정비사업'
  const display = request.nextUrl.searchParams.get('display') || '10'
  const sort = request.nextUrl.searchParams.get('sort') || 'date'

  const clientId = process.env.NAVER_CLIENT_ID
  const clientSecret = process.env.NAVER_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Naver API가 설정되지 않았습니다' }, { status: 500 })
  }

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
        next: { revalidate: 600 }, // cache 10 minutes
      }
    )

    if (!res.ok) {
      return NextResponse.json(
        { error: 'Naver API 오류', status: res.status },
        { status: res.status }
      )
    }

    const data = await res.json()

    // Strip HTML tags from title and description
    const items = (data.items as Array<{
      title: string
      description: string
      link: string
      originallink: string
      pubDate: string
    }>).map((item) => ({
      title: item.title.replace(/<[^>]*>/g, ''),
      description: item.description.replace(/<[^>]*>/g, ''),
      link: item.link,
      originallink: item.originallink,
      pubDate: item.pubDate,
    }))

    return NextResponse.json({ total: data.total as number, items })
  } catch {
    return NextResponse.json({ error: '뉴스를 불러오지 못했습니다' }, { status: 500 })
  }
}
