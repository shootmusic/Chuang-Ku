import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const store = await prisma.store.findFirst({ where: { userId: decoded.id } })
    if (!store) return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })

    const orders = await prisma.order.findMany({
      where: { storeId: store.id },
      include: {
        user: { select: { username: true, email: true } },
        orderItems: { include: { product: { select: { name: true, productType: true } } } },
        logs: { orderBy: { createdAt: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Store orders error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
