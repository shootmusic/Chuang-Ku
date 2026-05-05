import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import jwt from 'jsonwebtoken'

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json({ error: 'Token dan password harus diisi' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    let decoded
    try {
      decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET)
    } catch (err) {
      return NextResponse.json({ error: 'Token tidak valid atau sudah expired' }, { status: 400 })
    }

    if (!decoded || decoded.type !== 'reset') {
      return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)
    await prisma.user.update({
      where: { id: decoded.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ message: 'Password berhasil diubah' })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Token tidak valid atau sudah expired' }, { status: 400 })
  }
}
