'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('registered')) setSuccess('Akun berhasil dibuat! Silakan login.')
    if (params.get('reset')) setSuccess('Password berhasil direset! Silakan login.')
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('token', data.token)
        window.location.href = '/dashboard/dashboard'
      } else {
        setError(data.error || 'Login gagal')
      }
    } catch {
      setError('Terjadi kesalahan koneksi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <h2 style={{fontSize:'22px', fontWeight:'800', textAlign:'center', marginBottom:'6px', color:'white'}}>Selamat Datang</h2>
      <p style={{textAlign:'center', color:'rgba(255,255,255,0.4)', fontSize:'13px', marginBottom:'24px'}}>Masuk ke akun kamu</p>

      {success && (
        <div style={{background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', color:'#86efac', padding:'11px 14px', borderRadius:'10px', marginBottom:'16px', fontSize:'13px'}}>
          {success}
        </div>
      )}
      {error && (
        <div style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#fca5a5', padding:'11px 14px', borderRadius:'10px', marginBottom:'16px', fontSize:'13px'}}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:'16px'}}>
          <label style={{display:'block', fontSize:'12px', fontWeight:'600', marginBottom:'7px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.5px'}}>Username</label>
          <input
            className="input-field"
            type="text"
            placeholder="Masukkan username"
            value={form.username}
            onChange={(e) => setForm({...form, username: e.target.value})}
            required
          />
        </div>
        <div style={{marginBottom:'10px'}}>
          <label style={{display:'block', fontSize:'12px', fontWeight:'600', marginBottom:'7px', color:'rgba(255,255,255,0.6)', textTransform:'uppercase', letterSpacing:'0.5px'}}>Password</label>
          <div style={{position:'relative'}}>
            <input
              className="input-field"
              type={showPassword ? 'text' : 'password'}
              placeholder="Masukkan password"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              style={{paddingRight:'44px', width:'100%', boxSizing:'border-box'}}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)',
                fontSize:'18px', padding:'0', lineHeight:'1'
              }}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
        </div>
        <div style={{textAlign:'right', marginBottom:'22px'}}>
          <Link href="/forgot-password" style={{fontSize:'12px', color:'#a78bfa', textDecoration:'none', fontWeight:'600'}}>Lupa password?</Link>
        </div>
        <button type="submit" className="btn-primary" disabled={loading} style={{width:'100%', padding:'13px', fontSize:'14px', opacity: loading ? 0.7 : 1}}>
          {loading ? 'Memproses...' : 'Login'}
        </button>
      </form>

      <div style={{textAlign:'center', marginTop:'20px', fontSize:'13px', color:'rgba(255,255,255,0.4)'}}>
        Belum punya akun?{' '}
        <Link href="/register" style={{color:'#a78bfa', fontWeight:'700', textDecoration:'none'}}>Daftar sekarang</Link>
      </div>
    </div>
  )
}
