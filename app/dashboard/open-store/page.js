'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OpenStorePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    storeName: '',
    storeDescription: '',
    telegramChatId: '',
    saweriaUrl: '',
    qrisUrl: '',
    gopayNumber: '',
    bankAccount: '',
    bankName: '',
  })

  const set = (k, v) => setForm({...form, [k]: v})

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.storeName || !form.telegramChatId) {
      alert('Nama toko dan Telegram Chat ID wajib diisi!')
      return
    }
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/store', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':`Bearer ${token}`},
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/dashboard/my-store')
      } else {
        alert('Gagal: ' + data.error)
      }
    } catch { alert('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  const label = (text, required) => (
    <label style={{display:'block',fontSize:'12px',fontWeight:'600',marginBottom:'6px',color:'rgba(255,255,255,0.6)',textTransform:'uppercase',letterSpacing:'0.5px'}}>
      {text}{required && <span style={{color:'#f87171',marginLeft:'3px'}}>*</span>}
    </label>
  )

  const inputStyle = {width:'100%',padding:'11px 14px',borderRadius:'10px',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'white',fontSize:'14px',outline:'none',boxSizing:'border-box',marginBottom:'16px'}

  return (
    <div style={{padding:'24px 16px',paddingBottom:'40px',maxWidth:'500px',margin:'0 auto'}}>
      <h1 style={{fontSize:'20px',fontWeight:'800',color:'white',marginBottom:'24px'}}>Buka Toko</h1>

      <form onSubmit={handleSubmit}>
        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'20px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
          <h2 style={{fontSize:'14px',fontWeight:'700',color:'#a78bfa',marginBottom:'16px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Informasi Toko</h2>
          {label('Nama Toko', true)}
          <input style={inputStyle} type="text" placeholder="Nama toko kamu" value={form.storeName} onChange={e=>set('storeName',e.target.value)} required/>
          {label('Deskripsi')}
          <textarea value={form.storeDescription} onChange={e=>set('storeDescription',e.target.value)} placeholder="Deskripsi singkat toko kamu" rows="3" style={{...inputStyle,resize:'none'}}/>
        </div>

        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'20px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'16px'}}>
          <h2 style={{fontSize:'14px',fontWeight:'700',color:'#a78bfa',marginBottom:'16px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Integrasi Telegram</h2>
          {label('Telegram Chat ID', true)}
          <input style={inputStyle} type="text" placeholder="Contoh: 7710155531" value={form.telegramChatId} onChange={e=>set('telegramChatId',e.target.value)} required/>
          <p style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginTop:'-12px',marginBottom:'0'}}>
            Chat @userinfobot di Telegram untuk dapat ID kamu
          </p>
        </div>

        <div style={{background:'rgba(255,255,255,0.05)',borderRadius:'16px',padding:'20px',border:'1px solid rgba(255,255,255,0.08)',marginBottom:'24px'}}>
          <h2 style={{fontSize:'14px',fontWeight:'700',color:'#a78bfa',marginBottom:'4px',textTransform:'uppercase',letterSpacing:'0.5px'}}>Info Pembayaran</h2>
          <p style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',marginBottom:'16px'}}>Isi sesuai metode yang kamu punya (minimal 1)</p>
          {label('Link Saweria')}
          <input style={inputStyle} type="text" placeholder="https://saweria.co/username" value={form.saweriaUrl} onChange={e=>set('saweriaUrl',e.target.value)}/>
          {label('URL Gambar QRIS')}
          <input style={inputStyle} type="text" placeholder="https://..." value={form.qrisUrl} onChange={e=>set('qrisUrl',e.target.value)}/>
          {label('Nomor GoPay')}
          <input style={inputStyle} type="text" placeholder="08xxxxxxxxxx" value={form.gopayNumber} onChange={e=>set('gopayNumber',e.target.value)}/>
          {label('Nama Bank')}
          <input style={inputStyle} type="text" placeholder="BCA / BRI / Mandiri" value={form.bankName} onChange={e=>set('bankName',e.target.value)}/>
          {label('Nomor Rekening')}
          <input style={inputStyle} type="text" placeholder="1234567890" value={form.bankAccount} onChange={e=>set('bankAccount',e.target.value)}/>
        </div>

        <button type="submit" disabled={loading} style={{width:'100%',background:'linear-gradient(135deg,#7c3aed,#5b21b6)',color:'white',padding:'14px',borderRadius:'12px',border:'none',cursor:'pointer',fontSize:'15px',fontWeight:'700',opacity:loading?0.7:1}}>
          {loading ? 'Memproses...' : 'Buat Toko Sekarang'}
        </button>
      </form>
    </div>
  )
}
