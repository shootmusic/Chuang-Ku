import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function generateOrderNumber() {
  return 'CK' + Date.now() + Math.random().toString(36).substr(2,4).toUpperCase()
}

async function sendTelegram(chatId, text, extra = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', ...extra })
    })
  } catch(e) { console.error('Telegram error:', e.message) }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    const decoded = verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { paymentMethod, buyerTelegram, buyerPhone, buyerEmail, notes, shippingAddress, cartItems } = await request.json()

    if (!cartItems || cartItems.length === 0) return NextResponse.json({ error: 'Keranjang kosong' }, { status: 400 })

    const hasPhysical = cartItems.some(i => i.product.productType === 'physical')
    if (hasPhysical && !shippingAddress) {
      return NextResponse.json({ error: 'Alamat pengiriman wajib diisi untuk produk fisik' }, { status: 400 })
    }

    const storeId = cartItems[0].product.storeId
    const store = await prisma.store.findUnique({ where: { id: storeId } })
    if (!store) return NextResponse.json({ error: 'Toko tidak ditemukan' }, { status: 404 })

    const totalAmount = cartItems.reduce((acc, i) => acc + (i.product.price * i.quantity), 0)
    const orderNumber = generateOrderNumber()

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: decoded.id,
        storeId,
        totalAmount,
        status: 'pending',
        paymentMethod,
        buyerTelegram: buyerTelegram || null,
        buyerPhone: buyerPhone || null,
        buyerEmail: buyerEmail || null,
        notes: notes || null,
        shippingAddress: shippingAddress || null,
        orderItems: {
          create: cartItems.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            priceAtTime: i.product.price
          }))
        },
        logs: {
          create: { status: 'pending', note: 'Order dibuat' }
        }
      },
      include: { orderItems: { include: { product: true } } }
    })

    try { await prisma.cart.deleteMany({ where: { userId: decoded.id } }) } catch(e) {}

    if (buyerTelegram) {
      const productList = cartItems.map(i => `• ${i.product.name} x${i.quantity}`).join('\n')

      let paymentInfo = ''
      if (paymentMethod === 'saweria' && store.saweriaUrl) {
        paymentInfo = `💳 Bayar via Saweria:\n${store.saweriaUrl}`
      } else if (paymentMethod === 'qris' && store.qrisUrl) {
        paymentInfo = `💳 Bayar via QRIS:\n${store.qrisUrl}`
      } else if (paymentMethod === 'gopay' && store.gopayNumber) {
        paymentInfo = `💳 Bayar via GoPay ke: ${store.gopayNumber}`
      } else if (paymentMethod === 'transfer' && store.bankAccount) {
        paymentInfo = `💳 Transfer ke ${store.bankName || 'Bank'}: ${store.bankAccount}`
      } else {
        paymentInfo = `💳 Metode: ${paymentMethod?.toUpperCase()}`
      }

      await sendTelegram(buyerTelegram,
        `Halo! Pesanan baru dari <b>Chuàng Kù 创库</b>\n\n` +
        `🧾 Order ID: <code>${orderNumber}</code>\n\n` +
        `<b>Produk:</b>\n${productList}\n\n` +
        `💰 <b>Total: Rp${totalAmount.toLocaleString('id-ID')}</b>\n\n` +
        `${paymentInfo}\n\n` +
        `Setelah bayar, kirim screenshot bukti pembayaran ke bot ini ya! 📸`
      )
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
