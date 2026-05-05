import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { message, history } = await request.json()

    // Fetch data real dari DB
    const [products, stores] = await Promise.all([
      prisma.product.findMany({
        include: { store: { select: { storeName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      prisma.store.findMany({
        select: { storeName: true, storeDescription: true },
        take: 10
      })
    ])

    const productList = products.length > 0
      ? products.map(p => `- ${p.name} (${p.productType}) Rp${p.price.toLocaleString('id-ID')} | Toko: ${p.store?.storeName}`).join('\n')
      : 'Belum ada produk terdaftar'

    const storeList = stores.length > 0
      ? stores.map(s => `- ${s.storeName}: ${s.storeDescription || 'tidak ada deskripsi'}`).join('\n')
      : 'Belum ada toko terdaftar'

    const messages = [
      {
        role: 'system',
        content: `Kamu adalah asisten AI untuk Chuàng Kù 创库 — marketplace digital Indonesia.

DATA REAL DARI DATABASE (update setiap chat):

TOKO TERDAFTAR:
${storeList}

PRODUK TERSEDIA:
${productList}

TUGASMU:
- Jawab pertanyaan soal produk/toko berdasarkan data di atas SAJA
- Bantu user cara daftar, buka toko, checkout, pembayaran, pengiriman via Telegram
- Kalau produk/toko tidak ada di data di atas, bilang jujur "belum ada"
- Jawab singkat dan santai, bahasa Indonesia gaul
- JANGAN mengarang data di luar yang tertera di atas`
      },
      ...history.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
      { role: 'user', content: message }
    ]

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 500
      })
    })

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content || 'Maaf, tidak bisa menjawab.'
    return NextResponse.json({ text })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ text: 'Maaf, terjadi kesalahan.' })
  }
}
