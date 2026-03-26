import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'jungbi-web',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? '0.1.0',
      environment: process.env.NODE_ENV ?? 'development',
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
