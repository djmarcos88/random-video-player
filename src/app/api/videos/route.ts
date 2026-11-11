import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getShowByPath, scanVideoFiles } from '@/lib/shows'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const showParam = request.nextUrl.searchParams.get('show')

  let videoDir: string | undefined
  let showMeta: { path: string; title: string; image: string } | undefined

  if (showParam) {
    const show = getShowByPath(showParam)
    if (!show) {
      return NextResponse.json(
        { error: `Show "${showParam}" was not found in shows.json.` },
        { status: 404 }
      )
    }
    videoDir = show.folder
    showMeta = { path: show.path, title: show.title, image: show.image }
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
      { error: `Video directory not found: ${absDir}`, show: showMeta },
      { status: 500 }
    )
  }

  const filenames = scanVideoFiles(absDir).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true })
  )

  return NextResponse.json({ filenames, show: showMeta })
}
