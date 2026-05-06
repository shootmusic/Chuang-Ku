import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'No token' }, { status: 401 })
    
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const store = await prisma.store.findFirst({
      where: { userId: decoded.id },
      include: { products: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } }
    })

    if (!store) return NextResponse.json({ store: null }, { status: 200 })
    return NextResponse.json({ store })
  } catch (error) {
    console.error('Store/my error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
