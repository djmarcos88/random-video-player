import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { getShowByPath, VIDEO_EXTENSIONS } from '@/lib/shows'

const MIME_TYPES: Record<string, string> = {
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo',
  '.m4v': 'video/x-m4v',
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const showParam = searchParams.get('show')
  const file = searchParams.get('file')

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
      { error: 'No video folder configured for this show.' },
      { status: 500 }
    )
  }

  if (!file) {
    return NextResponse.json({ error: 'Missing file parameter.' }, { status: 400 })
  }

  // Normalize path separators to prevent directory traversal
  const normalizedFile = path.normalize(file).replace(/^(\.\.(\/|\\|$))+/, '')
  const ext = path.extname(normalizedFile).toLowerCase()

  if (!VIDEO_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: 'File type not allowed.' }, { status: 403 })
  }

  const absDir = path.resolve(videoDir)
  const filePath = path.resolve(absDir, normalizedFile)

  // Ensure the resolved path stays within the configured video directory
  if (!filePath.startsWith(absDir + path.sep) && filePath !== absDir) {
    return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found.' }, { status: 404 })
  }

  const stat = fs.statSync(filePath)
  const fileSize = stat.size
  const contentType = MIME_TYPES[ext] ?? 'video/mp4'

  const rangeHeader = request.headers.get('range')

  if (rangeHeader) {
    // Parse the Range header (e.g. "bytes=0-1023")
    const parts = rangeHeader.replace(/bytes=/, '').split('-')
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
    const chunkSize = end - start + 1

    const stream = fs.createReadStream(filePath, { start, end })
    const webStream = new ReadableStream({
      start(controller) {
        stream.on('data', (chunk) => controller.enqueue(chunk))
        stream.on('end', () => controller.close())
        stream.on('error', (err) => controller.error(err))
      },
      cancel() {
        stream.destroy()
      },
    })

    return new Response(webStream, {
      status: 206,
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': String(chunkSize),
        'Content-Type': contentType,
      },
    })
  }

  // Full file response
  const stream = fs.createReadStream(filePath)
  const webStream = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => controller.enqueue(chunk))
      stream.on('end', () => controller.close())
      stream.on('error', (err) => controller.error(err))
    },
    cancel() {
      stream.destroy()
    },
  })

  return new Response(webStream, {
    status: 200,
    headers: {
      'Content-Length': String(fileSize),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    },
  })
}
