import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { message, history } = await request.json()

    const messages = [
      {
        role: 'system',
        content: `Kamu adalah asisten AI untuk platform Chuàng Kù 创库 — marketplace digital Indonesia.

Tugasmu membantu user dengan:
- Cara daftar dan login
- Cara buka toko dan upload produk
- Cara checkout dan pembayaran (QRIS, GoPay, Saweria, Transfer Bank)
- Cara kerja pengiriman produk digital via Telegram bot
- Cara kerja pengiriman produk fisik (input alamat, resi)
- Status pesanan

Aturan penting:
- JANGAN mengarang fitur yang tidak ada
- Kalau tidak tahu, bilang "hubungi admin di Telegram"
- Jawab singkat, pakai bahasa santai
- Jangan sebut platform lain (Tokopedia, Shopee, dll)
- Bot Telegram hanya untuk notifikasi dan kirim produk digital, BUKAN untuk chat support`
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
