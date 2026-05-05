'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const orderNumber = params.orderNumber
  const [copied, setCopied] = useState('')
  const [order, setOrder] = useState(null)
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const token = localStorage.getItem('token')
      if (!token) { router.push('/login'); return }
      try {
        const res = await fetch('/api/orders/my', { headers:{'Authorization':`Bearer ${token}`} })
        const data = await res.json()
        if (res.ok) {
          const found = data.orders?.find(o => o.orderNumber === orderNumber)
          if (found) {
            setOrder(found)
            // Ambil info payment toko
            const storeRes = await fetch(`/api/store/my`, { headers:{'Authorization':`Bearer ${token}`} })
            // Cari store dari order
            const allStores = await fetch('/api/store').then(r => r.json())
            const foundStore = allStores.stores?.find(s => s.id === found.storeId)
            if (foundStore) setStore(foundStore)
          }
        }
      } catch(e) {} finally { setLoading(false) }
    }
    fetchOrder()
  }, [orderNumber])

  const copy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#0f0520'}}>
      <div style={{width:'32px',height:'32px',border:'3px solid rgba(167,139,250,0.3)',borderTop:'3px solid #a78bfa',borderRadius:'50%'}}/>
    </div>
  )

  const renderPaymentInfo = () => {
    const method = order?.paymentMethod
    if (method === 'saweria' && store?.saweriaUrl) return (
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',marginBottom:'16px'}}>Klik tombol untuk bayar via Saweria</p>
        <a href={store.saweriaUrl} target="_blank" rel="noopener noreferrer"
          style={{display:'inline-block',padding:'12px 32px',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',borderRadius:'12px',color:'white',fontWeight:'700',fontSize:'15px',textDecoration:'none'}}>
          Buka Saweria 💸
        </a>
      </div>
    )
    if (method === 'qris' && store?.qrisUrl) return (
      <div style={{textAlign:'center'}}>
        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',marginBottom:'16px'}}>Scan QR Code pakai e-wallet atau mobile banking</p>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>
          <div style={{background:'white',padding:'12px',borderRadius:'16px',display:'inline-block'}}>
            <img src={store.qrisUrl} alt="QRIS" style={{width:'200px',height:'200px',display:'block'}}/>
          </div>
        </div>
      </div>
    )
    if (method === 'gopay' && store?.gopayNumber) return (
      <div>
        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',marginBottom:'12px'}}>Transfer ke nomor GoPay:</p>
        <div style={{background:'rgba(0,0,0,0.3)',borderRadius:'14px',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',margin:'0 0 2px'}}>GoPay</p>
            <p style={{fontFamily:'monospace',fontWeight:'700',fontSize:'18px',color:'white',margin:0}}>{store.gopayNumber}</p>
          </div>
          <button onClick={() => copy(store.gopayNumber,'gopay')} style={{background:'#7c3aed',border:'none',borderRadius:'8px',padding:'8px 14px',color:'white',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
            {copied==='gopay'?'✓':'Copy'}
          </button>
        </div>
      </div>
    )
    if (method === 'transfer' && store?.bankAccount) return (
      <div>
        <p style={{fontSize:'13px',color:'rgba(255,255,255,0.6)',marginBottom:'12px'}}>Transfer ke rekening:</p>
        <div style={{background:'rgba(0,0,0,0.3)',borderRadius:'14px',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',margin:'0 0 2px'}}>{store.bankName || 'Bank'}</p>
            <p style={{fontFamily:'monospace',fontWeight:'700',fontSize:'18px',color:'white',margin:0}}>{store.bankAccount}</p>
          </div>
          <button onClick={() => copy(store.bankAccount,'bank')} style={{background:'#7c3aed',border:'none',borderRadius:'8px',padding:'8px 14px',color:'white',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
            {copied==='bank'?'✓':'Copy'}
          </button>
        </div>
      </div>
    )
    return (
      <div style={{textAlign:'center',color:'rgba(255,255,255,0.5)',fontSize:'13px'}}>
        <p>Hubungi penjual untuk info pembayaran.</p>
      </div>
    )
  }

  return (
    <div style={{background:'#0f0520',minHeight:'100vh',padding:'20px',display:'flex',alignItems:'flex-start',justifyContent:'center'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <h1 style={{fontSize:'22px',fontWeight:'900',color:'white',marginBottom:'20px'}}>💳 Pembayaran</h1>

        <div style={{background:'rgba(0,0,0,0.3)',borderRadius:'14px',padding:'16px',marginBottom:'20px',textAlign:'center'}}>
          <p style={{fontSize:'11px',color:'rgba(255,255,255,0.4)',marginBottom:'4px'}}>Order Number</p>
          <p style={{fontFamily:'monospace',fontWeight:'700',color:'#fbbf24',fontSize:'16px',margin:'0 0 8px'}}>{orderNumber}</p>
          <p style={{fontSize:'28px',fontWeight:'900',color:'white',margin:0}}>
            Rp{order?.totalAmount?.toLocaleString('id-ID') || '-'}
          </p>
        </div>

        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'20px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
          {renderPaymentInfo()}
        </div>

        <div style={{background:'rgba(234,179,8,0.15)',border:'1px solid rgba(234,179,8,0.3)',borderRadius:'14px',padding:'16px',marginBottom:'20px'}}>
          <p style={{fontSize:'13px',color:'#fcd34d',lineHeight:'1.6',margin:0}}>
            📸 Setelah bayar, screenshot bukti pembayaran dan kirim ke bot Telegram.<br/>
            Bot akan otomatis memproses pesananmu!
          </p>
        </div>

        <button onClick={() => router.push('/dashboard/orders')} style={{width:'100%',padding:'14px',borderRadius:'12px',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',border:'none',cursor:'pointer',color:'white',fontSize:'15px',fontWeight:'700'}}>
          Lihat Status Pesanan
        </button>
      </div>
    </div>
  )
}
