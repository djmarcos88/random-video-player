import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const VIDEO_EXTENSIONS = new Set(['.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v'])

export async function GET() {
  const videoDir = process.env.VIDEO_DIR

  if (!videoDir) {
    return NextResponse.json(
      { error: 'VIDEO_DIR is not configured. Set it in .env.local.' },
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

  let filenames: string[]
  try {
    filenames = fs
      .readdirSync(absDir)
      .filter((f) => VIDEO_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  } catch {
    return NextResponse.json(
      { error: 'Failed to read video directory.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ filenames })
}
