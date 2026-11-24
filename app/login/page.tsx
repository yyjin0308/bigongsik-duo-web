'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../../lib/supabase';
export default function Login(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 async function route(){const c=supabase();const {data,error}=await c.auth.getUser();if(!data.user){setReady(true);return}if(error)throw error;const {data:m,error:e}=await c.from('members').select('status').eq('user_id',data.user.id).maybeSingle();if(e)throw e;window.location.replace(!m||m.status==='draft'?'/onboarding':m.status==='approved'?'/':'/member/status')}
 useEffect(()=>{route().catch(e=>{setMessage(e.message);setReady(true)})},[]);
 async function login(e:React.FormEvent){e.preventDefault();setBusy(true);setMessage('');try{const {error}=await supabase().auth.signInWithPassword({email,password});if(error)throw error;await route()}catch(e){setMessage(e instanceof Error?e.message:'로그인 실패')}finally{setBusy(false)}}
 return <main className="wrap" style={{maxWidth:500,paddingTop:36}}><div style={{textAlign:'center',background:'#321c29',color:'white',padding:'32px 16px',borderRadius:16}}><div className="eyebrow">RED CRYSTAL PRESENTS</div><h1>비공식듀오 ♡</h1><p>레드크리스탈 중매사가 엄선한 소개팅 프로필</p></div><div className="panel">{!ready?<p>로그인 확인 중...</p>:<><h2>새로운 인연의 시작</h2><form onSubmit={login}><label className="field">이메일<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="field">비밀번호<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="button" style={{width:'100%'}} disabled={busy}>로그인</button></form><p><Link href="/signup">아직 회원이 아니신가요? 회원가입</Link></p></>}{message&&<p role="alert">{message}</p>}</div><Link href="/admin">관리자 로그인</Link></main>
}
