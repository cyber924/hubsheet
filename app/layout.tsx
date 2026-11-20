import {canAdmin} from '../lib/project-policy.mjs';
import {AuthProvider} from './auth-context';import {identity} from '../lib/vercel-public-server';
import type {Metadata} from 'next';import './globals.css';
export const metadata:Metadata={metadataBase:new URL('https://hubsheet.herestay-4226.chatgpt.site'),title:{default:'hubsheet — 사진에서 시작되는 고품질 상세페이지',template:'%s | hubsheet'},description:'패션·식품·화장품 등 다양한 분야의 상품 사진을 고품질 상세페이지로. 기획부터 디자인, 수정, HTML·풀 이미지 다운로드까지.',icons:{icon:'/favicon.svg'},openGraph:{title:'hubsheet — 상품의 매력을 담는 상세페이지',description:'상품 사진부터 기획·디자인·채널별 다운로드까지 한곳에서 완성하세요.',siteName:'hubsheet',locale:'ko_KR',type:'website',images:['/ads/hubsheet-studio.webp']},twitter:{card:'summary_large_image'}};
export default async function RootLayout({children}:{children:React.ReactNode}){const u=await identity();return <html lang="ko"><body><AuthProvider initialUser={u.id?{id:u.id,email:u.email||'',name:u.name||'',isAdmin:canAdmin(u)}:null}>{children}</AuthProvider></body></html>}
