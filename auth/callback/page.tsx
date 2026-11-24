'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {supabase} from '../../../lib/supabase';
export default function Callback(){
 const [message,setMessage]=useState('인증 확인 중입니다...');
 useEffect(()=>{let active=true;async function finish(){try{const url=new URL(window.location.href);const hash=new URLSearchParams(url.hash.slice(1));if(url.searchParams.has('error')||hash.has('error'))throw new Error('인증이 완료되지 않았습니다. 다시 로그인해 주세요.');const {data,error}=await supabase().auth.getSession();if(error)throw error;if(!active)return;if(data.session){window.location.replace('/login')}else setMessage('인증 세션을 확인하지 못했습니다. 이메일 인증은 가입한 브라우저에서 진행하거나 다시 로그인해 주세요.')}catch{if(active)setMessage('인증을 완료하지 못했습니다. 다시 로그인해 주세요.')}}finish();return()=>{active=false}},[]);
 return <main className="wrap" style={{maxWidth:500}}><div className="panel"><h1>비공식듀오</h1><p>{message}</p><Link className="button secondary" href="/login">로그인으로 이동</Link></div></main>
}
