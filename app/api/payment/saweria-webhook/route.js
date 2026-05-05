import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request) {
  try {
    const body = await request.json()

    if (body.streamKey !== process.env.SAWERIA_STREAM_KEY) {
      return NextResponse.json({ error: 'Invalid stream key' }, { status: 401 })
    }

    const pendingOrder = await prisma.order.findFirst({
      where: {
        totalAmount: body.amount,
        status: 'pending',
        createdAt: {
          gte: new Date(Date.now() - 30 * 60 * 1000)
        }
      },
      include: {
        user: true,
        store: true,
        orderItems: {
          include: { product: true }
        }
      }
    })

    if (pendingOrder) {
      await prisma.order.update({
        where: { id: pendingOrder.id },
        data: {
          status: 'waiting_confirmation',
          paymentProof: JSON.stringify(body)
        }
      })

      await sendTelegramMessage(
        process.env.TELEGRAM_OWNER_CHAT_ID,
        `💰 Pembayaran via Saweria masuk untuk order ${pendingOrder.orderNumber}!\nCek dan konfirmasi.`
      )

      if (pendingOrder.store?.telegramChatId) {
        await sendTelegramMessage(
          pendingOrder.store.telegramChatId,
          `💰 Pembayaran via Saweria masuk untuk order ${pendingOrder.orderNumber}!\nCek dan konfirmasi.`
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Saweria webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}
