import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getShowByPath, scanVideoFiles } from '@/lib/shows'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const showParam = request.nextUrl.searchParams.get('show')

  let videoDir: string | undefined
  if (showParam) {
    const show = getShowByPath(showParam)
    if (!show) {
      return NextResponse.json(
        { error: `Show "${showParam}" was not found in shows.json.` },
        { status: 404 }
      )
    }
    videoDir = show.folder
  } else {
    videoDir = process.env.VIDEO_DIR
  }

  if (!videoDir) {
    return NextResponse.json(
      { error: 'No video folder configured for this show. Check shows.json.' },
      { status: 500 }
    )
  }

  const absDir = path.resolve(videoDir)

  if (!fs.existsSync(absDir)) {
    return NextResponse.json(
      { error: `Video directory not found: ${absDir}` },
      { status: 500 }
    )
  }

  const files = scanVideoFiles(absDir)

  if (files.length === 0) {
    return NextResponse.json(
      { error: 'No video files found in the configured directory.' },
      { status: 404 }
    )
  }

  const filename = files[Math.floor(Math.random() * files.length)]

  return NextResponse.json(
    { filename },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    }
  )
}
