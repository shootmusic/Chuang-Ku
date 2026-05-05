import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email harus diisi' }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive'
        }
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'Jika email terdaftar, link reset akan dikirim' })
    }

    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: 'reset' },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: '1h' }
    )

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: 'Reset Password - Chuàng Kù',
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:20px">
          <h2 style="color:#7c3aed">Reset Password</h2>
          <p>Halo <b>${user.username}</b>,</p>
          <p>Klik tombol di bawah untuk reset password kamu:</p>
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#5b21b6);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
            Reset Password
          </a>
          <p style="color:#666;font-size:12px">Link berlaku 1 jam. Abaikan jika tidak merasa meminta reset password.</p>
        </div>
      `
    })

    return NextResponse.json({ message: 'Jika email terdaftar, link reset akan dikirim' })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Gagal mengirim email' }, { status: 500 })
  }
}
