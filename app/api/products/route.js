import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      include: { store: { select: { storeName: true } } },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ products })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { name, description, price, stock, productType, fileUrl, fileName, filePublicId, imageUrl } = body

    const store = await prisma.store.findFirst({ where: { userId: decoded.id } })
    if (!store) return NextResponse.json({ error: 'Buat toko dulu!' }, { status: 400 })

    const product = await prisma.product.create({
      data: { name, description, price: parseInt(price), stock: parseInt(stock) || 999, productType: productType || 'digital', storeId: store.id, fileUrl, fileName, filePublicId, imageUrl }
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
