'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'

export default function ChatPage() {
  const router = useRouter()
  const [messages, setMessages] = useState([{ role:'assistant', content:'Halo! Gue Chuàng Kù AI. Mau tanya apa? Soal produk, payment, atau cara jualan.' }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const messagesRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = { role:'user', content:input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ message:input, history:messages })
      })
      const data = await res.json()
      if (data.text) setMessages(prev => [...prev, { role:'assistant', content:data.text }])
    } catch {
      setMessages(prev => [...prev, { role:'assistant', content:'Waduh error, coba lagi ya.' }])
    } finally { setLoading(false) }
  }

  return (
    <div style={{display:'flex', flexDirection:'column', height:'100vh', background:'#0f0520'}}>
      {/* Header */}
      <div style={{padding:'16px 20px', background:'rgba(15,5,35,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', gap:'12px', flexShrink:0}}>
        <button onClick={() => router.back()} style={{background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', padding:'4px', display:'flex', alignItems:'center'}}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div style={{width:'36px', height:'36px', background:'linear-gradient(135deg, #7c3aed, #a78bfa)', borderRadius:'10px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0}}>
          <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <div>
          <p style={{fontSize:'14px', fontWeight:'700', color:'white', margin:0}}>Chuàng Kù AI</p>
          <p style={{fontSize:'11px', color:'#4ade80', margin:0}}>Online</p>
        </div>
      </div>

      {/* Messages - scrollable */}
      <div
        ref={messagesRef}
        style={{flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'12px', paddingBottom:'80px'}}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{display:'flex', justifyContent: msg.role==='user' ? 'flex-end' : 'flex-start'}}>
            <div style={{
              maxWidth:'78%', padding:'10px 14px',
              borderRadius: msg.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role==='user' ? 'linear-gradient(135deg,#7c3aed,#5b21b6)' : 'rgba(255,255,255,0.07)',
              border: msg.role==='user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              fontSize:'14px', color:'white', lineHeight:'1.5', wordBreak:'break-word'
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{display:'flex', justifyContent:'flex-start'}}>
            <div style={{background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px 16px 16px 4px', padding:'12px 16px', display:'flex', gap:'4px', alignItems:'center'}}>
              {[0,150,300].map(d => (
                <span key={d} style={{width:'6px', height:'6px', background:'rgba(255,255,255,0.4)', borderRadius:'50%', display:'inline-block', animation:`bounce 1s ${d}ms infinite`}}/>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input - fixed at bottom */}
      <div style={{position:'fixed', bottom:'64px', left:0, right:0, padding:'12px 16px', background:'rgba(15,5,35,0.95)', backdropFilter:'blur(20px)', borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key==='Enter' && send()}
            placeholder="Ketik pesan..."
            style={{flex:1, padding:'11px 16px', borderRadius:'12px', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)', color:'white', fontSize:'14px', outline:'none'}}
          />
          <button
            onClick={send}
            disabled={loading||!input.trim()}
            style={{width:'42px', height:'42px', borderRadius:'12px', background:'linear-gradient(135deg,#7c3aed,#5b21b6)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity: loading||!input.trim() ? 0.5 : 1, flexShrink:0}}
          >
            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

      <BottomNav/>
    </div>
  )
}
