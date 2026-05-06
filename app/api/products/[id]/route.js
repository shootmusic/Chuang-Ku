import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
      include: { store: { select: { storeName: true, telegramChatId: true } } }
    })
    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const store = await prisma.store.findFirst({ where: { userId: decoded.id } })
    if (!store) return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })
    await prisma.product.update({ where: { id: parseInt(params.id), storeId: store.id }, data: { isActive: false } })
    return NextResponse.json({ message: 'Produk dihapus' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const { verifyToken } = await import('@/lib/auth')
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await request.json()
    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data
    })
    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}