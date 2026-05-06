import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function sendTelegram(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
  })
}

async function sendDocument(chatId, fileUrl, caption) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  // Tambah fl_attachment untuk force download di Cloudinary
  const downloadUrl = fileUrl.includes('cloudinary.com') 
    ? fileUrl.replace('/image/upload/', '/raw/upload/fl_attachment/') 
    : fileUrl
  await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, document: downloadUrl, caption, parse_mode: 'HTML' })
  })
}

async function sendPhoto(chatId, photoUrl, caption) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ chat_id: chatId, photo: photoUrl, caption, parse_mode: 'HTML' })
  })
}

async function addOrderLog(orderId, status, note) {
  await prisma.orderLog.create({ data: { orderId, status, note } })
}

export async function POST(request) {
  try {
    const { orderNumber, action, sellerChatId } = await request.json()

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: { include: { product: true } },
        store: true,
        user: true
      }
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    if (action === 'confirm') {
      await prisma.order.update({
        where: { orderNumber },
        data: { status: 'confirmed', confirmedAt: new Date() }
      })

      await addOrderLog(order.id, 'confirmed', `Dikonfirmasi oleh penjual (${sellerChatId})`)

      if (order.buyerTelegram) {
        await sendTelegram(order.buyerTelegram,
          `<b>✅ Pembayaran Dikonfirmasi!</b>\n\n` +
          `Order <code>${orderNumber}</code> kamu sudah dikonfirmasi penjual.\n` +
          `Produk kamu sedang dikirim...`
        )

        const hasDigital = order.orderItems.some(i => i.product.productType === 'digital')
        const hasPhysical = order.orderItems.some(i => i.product.productType === 'physical')

        for (const item of order.orderItems) {
          if (item.product.productType === 'digital' && item.product.fileUrl) {
            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(item.product.fileName || '')
            const caption = `<b>🎁 ${item.product.name}</b>\nOrder: <code>${orderNumber}</code>`

            if (isImage) {
              await sendPhoto(order.buyerTelegram, item.product.fileUrl, caption)
            } else {
              await sendDocument(order.buyerTelegram, item.product.fileUrl, caption)
            }
          }
        }

        if (hasDigital) {
          await sendTelegram(order.buyerTelegram,
            `Terima kasih sudah belanja di <b>${order.store.storeName}</b>! Semoga puas ya. 🙏`
          )
        }

        if (hasPhysical && !order.shippingAddress) {
          await sendTelegram(order.buyerTelegram,
            `📦 <b>Info Pengiriman Produk Fisik</b>\n\n` +
            `Mohon kirimkan alamat lengkap pengiriman kamu dengan format:\n\n` +
            `<code>ALAMAT#${orderNumber}#Nama Penerima, Jalan, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos, No HP</code>`
          )
          await addOrderLog(order.id, 'waiting_address', 'Menunggu alamat pengiriman dari buyer')
        }
      }

      if (order.store.telegramChatId) {
        await sendTelegram(order.store.telegramChatId,
          `✅ Kamu sudah konfirmasi pesanan <code>${orderNumber}</code>.\n` +
          `Produk digital sudah otomatis dikirim ke pembeli.`
        )
      }

    } else if (action === 'reject') {
      await prisma.order.update({
        where: { orderNumber },
        data: { status: 'rejected' }
      })

      await addOrderLog(order.id, 'rejected', `Ditolak oleh penjual (${sellerChatId})`)

      if (order.buyerTelegram) {
        await sendTelegram(order.buyerTelegram,
          `❌ Maaf, bukti pembayaran untuk order <code>${orderNumber}</code> ditolak penjual.\n` +
          `Silakan hubungi penjual untuk info lebih lanjut.`
        )
      }

      if (order.store.telegramChatId) {
        await sendTelegram(order.store.telegramChatId,
          `❌ Kamu sudah menolak pesanan <code>${orderNumber}</code>.`
        )
      }
    }

    return NextResponse.json({ message: 'Success' })
  } catch (error) {
    console.error('Confirm error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
