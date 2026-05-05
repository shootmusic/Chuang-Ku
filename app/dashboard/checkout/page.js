'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [hasDigital, setHasDigital] = useState(false)
  const [hasPhysical, setHasPhysical] = useState(false)
  const [form, setForm] = useState({
    paymentMethod: 'saweria',
    buyerTelegram: '',
    buyerPhone: '',
    buyerEmail: '',
    notes: '',
    shippingAddress: ''
  })

  useEffect(() => { fetchCart() }, [])

  const fetchCart = async () => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    try {
      const res = await fetch('/api/cart', { headers:{'Authorization':`Bearer ${token}`} })
      const data = await res.json()
      if (res.ok) {
        setCart(data.cart || [])
        setHasDigital(data.cart?.some(i => i.product.productType === 'digital'))
        setHasPhysical(data.cart?.some(i => i.product.productType === 'physical'))
      }
    } catch(e) {} finally { setLoading(false) }
  }

  const total = cart.reduce((acc, i) => acc + (i.product.price * i.quantity), 0)

  const placeOrder = async () => {
    if (hasDigital && !form.buyerTelegram && !form.buyerPhone && !form.buyerEmail) {
      alert('Produk digital wajib isi Telegram, WA, atau Email untuk pengiriman!')
      return
    }
    if (hasPhysical && !form.shippingAddress) {
      alert('Produk fisik wajib isi alamat pengiriman!')
      return
    }
    setPlacing(true)
    const token = localStorage.getItem('token')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify({ ...form, cartItems: cart })
      })
      const data = await res.json()
      if (res.ok) {
        router.push(`/dashboard/payment/${data.order.orderNumber}`)
      } else { alert(data.error || 'Gagal buat pesanan') }
    } catch(e) { alert('Terjadi kesalahan') }
    finally { setPlacing(false) }
  }

  const inputStyle = {width:'100%',padding:'11px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box'}
  const labelStyle = {display:'block',fontSize:'11px',fontWeight:'600',color:'rgba(255,255,255,0.5)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'7px',marginTop:'14px'}

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh'}}>
      <div style={{width:'32px',height:'32px',border:'3px solid rgba(167,139,250,0.3)',borderTop:'3px solid #a78bfa',borderRadius:'50%'}}/>
    </div>
  )

  return (
    <div style={{padding:'20px 16px',paddingBottom:'100px'}}>
      <button onClick={() => router.back()} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',marginBottom:'20px',padding:0}}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Kembali
      </button>

      <h1 style={{fontSize:'20px',fontWeight:'800',color:'white',marginBottom:'20px'}}>Checkout</h1>

      {/* Order Summary */}
      <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'16px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
        <h3 style={{fontSize:'13px',fontWeight:'700',color:'#a78bfa',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'12px'}}>Ringkasan Pesanan</h3>
        {cart.map(item => (
          <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
            <div>
              <p style={{fontSize:'13px',fontWeight:'600',color:'white',margin:'0 0 2px'}}>{item.product.name}</p>
              <p style={{fontSize:'11px',color:'rgba(255,255,255,0.35)',margin:0}}>x{item.quantity} · {item.product.productType === 'digital' ? '📦 Digital' : '🏠 Fisik'}</p>
            </div>
            <p style={{fontSize:'13px',fontWeight:'700',color:'white',margin:0}}>Rp{(item.product.price*item.quantity).toLocaleString('id-ID')}</p>
          </div>
        ))}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:'12px'}}>
          <span style={{fontSize:'14px',fontWeight:'700',color:'white'}}>Total</span>
          <span style={{fontSize:'18px',fontWeight:'900',color:'#a78bfa'}}>Rp{total.toLocaleString('id-ID')}</span>
        </div>
      </div>

      {/* Payment Method */}
      <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'16px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
        <h3 style={{fontSize:'13px',fontWeight:'700',color:'#a78bfa',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'12px'}}>Metode Pembayaran</h3>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          {[
            {id:'saweria',label:'Saweria'},
            {id:'qris',label:'QRIS'},
            {id:'gopay',label:'GoPay'},
            {id:'transfer',label:'Transfer Bank'},
          ].map(m => (
            <button key={m.id} onClick={() => setForm({...form,paymentMethod:m.id})} style={{padding:'12px',borderRadius:'10px',border: form.paymentMethod===m.id ? '1px solid #7c3aed' : '1px solid rgba(255,255,255,0.08)',background: form.paymentMethod===m.id ? 'rgba(124,58,237,0.2)' : 'rgba(255,255,255,0.03)',color: form.paymentMethod===m.id ? 'white' : 'rgba(255,255,255,0.5)',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Delivery Info */}
      <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'16px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
        <h3 style={{fontSize:'13px',fontWeight:'700',color:'#a78bfa',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'4px'}}>Info Pengiriman</h3>

        {hasDigital && (
          <div style={{background:'rgba(124,58,237,0.1)',border:'1px solid rgba(124,58,237,0.2)',borderRadius:'8px',padding:'10px',marginBottom:'12px',marginTop:'10px'}}>
            <p style={{fontSize:'12px',color:'#c4b5fd',margin:0,lineHeight:'1.5'}}>📦 Produk digital akan dikirim via Telegram setelah pembayaran dikonfirmasi.</p>
          </div>
        )}

        {hasPhysical && (
          <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'8px',padding:'10px',marginBottom:'12px',marginTop:'10px'}}>
            <p style={{fontSize:'12px',color:'#fdba74',margin:0,lineHeight:'1.5'}}>🏠 Kamu punya produk fisik. Wajib isi alamat pengiriman.</p>
          </div>
        )}

        <label style={labelStyle}>Username / ID Telegram {hasDigital && <span style={{color:'#f87171'}}>*</span>}</label>
        <input style={inputStyle} placeholder="@username atau nomor ID Telegram" value={form.buyerTelegram} onChange={e=>setForm({...form,buyerTelegram:e.target.value})} />

        <label style={labelStyle}>Nomor WhatsApp</label>
        <input style={inputStyle} placeholder="08xxxxxxxxxx" value={form.buyerPhone} onChange={e=>setForm({...form,buyerPhone:e.target.value})} />

        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="email" placeholder="email@kamu.com" value={form.buyerEmail} onChange={e=>setForm({...form,buyerEmail:e.target.value})} />

        {hasPhysical && (
          <>
            <label style={labelStyle}>Alamat Pengiriman <span style={{color:'#f87171'}}>*</span></label>
            <textarea
              style={{...inputStyle,resize:'none'}}
              rows="3"
              placeholder="Nama Penerima, Jalan, Kelurahan, Kecamatan, Kota, Provinsi, Kode Pos, No HP"
              value={form.shippingAddress}
              onChange={e=>setForm({...form,shippingAddress:e.target.value})}
            />
          </>
        )}

        <label style={labelStyle}>Catatan (opsional)</label>
        <textarea style={{...inputStyle,resize:'none'}} rows="2" placeholder="Catatan untuk penjual..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
      </div>

      <button onClick={placeOrder} disabled={placing} style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'white',padding:'15px',borderRadius:'12px',border:'none',cursor:'pointer',fontSize:'15px',fontWeight:'700',opacity:placing?0.7:1}}>
        {placing ? 'Memproses...' : `Buat Pesanan · Rp${total.toLocaleString('id-ID')}`}
      </button>
    </div>
  )
}
