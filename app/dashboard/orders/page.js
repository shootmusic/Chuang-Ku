'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/login'); return }
    fetch('/api/orders/my', { headers:{'Authorization':`Bearer ${token}`} })
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [])

  const statusColor = (s) => ({
    pending: '#fbbf24',
    waiting_confirmation: '#60a5fa',
    confirmed: '#4ade80',
    waiting_address: '#f97316',
    processing: '#a78bfa',
    shipped: '#22d3ee',
    delivered: '#4ade80',
    rejected: '#f87171'
  }[s] || '#a78bfa')

  const statusLabel = (s) => ({
    pending: 'Menunggu Pembayaran',
    waiting_confirmation: 'Menunggu Konfirmasi',
    confirmed: 'Dikonfirmasi',
    waiting_address: 'Menunggu Alamat',
    processing: 'Diproses',
    shipped: 'Dikirim',
    delivered: 'Selesai',
    rejected: 'Ditolak'
  }[s] || s)

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'80vh'}}>
      <div style={{width:'32px',height:'32px',border:'3px solid rgba(167,139,250,0.3)',borderTop:'3px solid #a78bfa',borderRadius:'50%'}}/>
    </div>
  )

  return (
    <div style={{padding:'20px 16px',paddingBottom:'90px'}}>
      <button onClick={() => router.back()} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.5)',display:'flex',alignItems:'center',gap:'6px',fontSize:'13px',marginBottom:'20px',padding:0}}>
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        Kembali
      </button>
      <h1 style={{fontSize:'20px',fontWeight:'800',color:'white',marginBottom:'20px'}}>Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div style={{textAlign:'center',padding:'60px 20px',color:'rgba(255,255,255,0.3)'}}>
          <svg style={{margin:'0 auto 12px',display:'block'}} width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg>
          <p style={{fontSize:'14px'}}>Belum ada pesanan</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {orders.map(order => (
            <div key={order.id} style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'16px',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                <div>
                  <p style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',margin:'0 0 4px',fontFamily:'monospace'}}>{order.orderNumber}</p>
                  <p style={{fontSize:'14px',fontWeight:'700',color:'white',margin:0}}>{order.store?.storeName}</p>
                </div>
                <span style={{fontSize:'11px',fontWeight:'700',color:statusColor(order.status),background:`${statusColor(order.status)}20`,padding:'4px 10px',borderRadius:'99px'}}>
                  {statusLabel(order.status)}
                </span>
              </div>

              {/* Info tambahan berdasarkan status */}
              {order.status === 'shipped' && order.trackingNumber && (
                <div style={{background:'rgba(34,211,238,0.1)',border:'1px solid rgba(34,211,238,0.2)',borderRadius:'10px',padding:'10px',marginBottom:'10px'}}>
                  <p style={{fontSize:'12px',color:'#67e8f9',margin:0}}>
                    🚚 Resi: <b>{order.trackingNumber.replace('#',' - ')}</b>
                  </p>
                </div>
              )}

              {order.status === 'waiting_address' && (
                <div style={{background:'rgba(249,115,22,0.1)',border:'1px solid rgba(249,115,22,0.2)',borderRadius:'10px',padding:'10px',marginBottom:'10px'}}>
                  <p style={{fontSize:'12px',color:'#fdba74',margin:'0 0 6px'}}>📦 Kirim alamat pengiriman ke bot Telegram:</p>
                  <p style={{fontSize:'11px',color:'rgba(255,255,255,0.5)',fontFamily:'monospace',margin:0,wordBreak:'break-all'}}>
                    ALAMAT#{order.orderNumber}#Nama, Jalan, Kel, Kec, Kota, Provinsi, Kodepos, NoHP
                  </p>
                </div>
              )}

              <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'10px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <p style={{fontSize:'12px',color:'rgba(255,255,255,0.4)',margin:0}}>{new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                <p style={{fontSize:'16px',fontWeight:'800',color:'white',margin:0}}>Rp{order.totalAmount.toLocaleString('id-ID')}</p>
              </div>

              {order.status === 'pending' && (
                <button onClick={() => router.push(`/dashboard/payment/${order.orderNumber}`)} style={{width:'100%',marginTop:'12px',padding:'10px',borderRadius:'10px',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',border:'none',cursor:'pointer',color:'white',fontSize:'13px',fontWeight:'700'}}>
                  Lanjut Bayar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
