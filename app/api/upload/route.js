import { NextResponse } from 'next/server'
import { uploadFile } from '@/lib/cloudinary'
import { verifyToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { file, fileName, type } = await request.json()
    // file = base64 string
    const folder = type === 'product' ? 'products' : 'images'
    const result = await uploadFile(file, folder, fileName)

    return NextResponse.json({ url: result.url, publicId: result.publicId, fileName })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload gagal' }, { status: 500 })
  }
}
