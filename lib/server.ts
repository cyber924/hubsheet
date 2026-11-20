import {ensureIncidentRecovery} from './incident-recovery';
import { env } from 'cloudflare:workers';
import {headers} from 'next/headers';
import {cache} from 'react';
import {readSession} from './firebase-auth.mjs';
import {getDb} from '../db';
import {projects} from '../db/schema';
import {and,eq,desc,isNull} from 'drizzle-orm';
import {sample} from './sample';
import {publicSnapshot,documentKey} from './project-policy.mjs';
export const db=getDb;
export const identity=cache(async()=>{const h=await headers();try{const session=await readSession(h.get('cookie')||'');return session.user||{id:null,email:null,name:''}}catch{return {id:null,email:null,name:''}};});
export async function requireUser(){const u=await identity();if(!u.id)throw Object.assign(new Error('로그인 후 이용해주세요.'),{status:401});return u as {id:string;email:string};}
export function fail(e:any){return Response.json({error:e.message||'요청을 처리하지 못했습니다.'},{status:e.status||500});}
export async function getPublicProjects(){await ensureIncidentRecovery();const rows=await db().select().from(projects).where(and(eq(projects.visibility,'public'),isNull(projects.deletedAt))).orderBy(desc(projects.publishedAt),desc(projects.updatedAt));return rows.map(r=>({...r,data:publicSnapshot(r),updatedAt:r.publishedAt||r.updatedAt}));}
export async function getProject(id:string,owner?:string|null){if(id===sample.id)return sample;const [r]=await db().select().from(projects).where(eq(projects.id,id)).limit(1);if(!r||r.deletedAt||(r.visibility!=='public'&&r.ownerId!==owner))return null;const own=r.ownerId===owner;const data=JSON.parse(own?r.data:publicSnapshot(r));return {...data,id:r.id,visibility:r.visibility,updatedAt:own?r.updatedAt:r.publishedAt||r.updatedAt,status:r.status,...(own?{revision:r.revision,publishedRevision:r.publishedRevision,publishedAt:r.publishedAt,hasUnpublishedChanges:r.visibility==='public'&&documentKey(JSON.parse(r.data))!==documentKey(JSON.parse(publicSnapshot(r)))}:{})};}
export const bucket=()=>env.BUCKET!;
export async function credential(req:Request){const key=(env as any).GEMINI_API_KEY||req.headers.get('x-gemini-key');if(!key)throw Object.assign(new Error('AI 연결이 필요합니다. 설정에서 Gemini API 키를 연결해주세요.'),{status:503});return key;}
export async function gemini(key:string,model:string,parts:any[],json=false,image=false){
 if(!/^[a-z0-9.\-]+$/.test(model))throw new Error('모델 이름을 확인해주세요.');
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:image?{responseModalities:['TEXT','IMAGE']}:{temperature:0.65,...(json?{responseMimeType:'application/json'}:{})}}),signal:AbortSignal.timeout(150000)});
 const data:any=await r.json();if(!r.ok)throw Object.assign(new Error(`AI 요청 실패 (${r.status}). API 키·모델 접근 권한·사용 한도를 확인해주세요.`),{status:502});
 const result=data.candidates?.[0]?.content?.parts;if(!result?.length)throw new Error('AI가 결과를 반환하지 않았습니다. 입력 사진과 요청을 확인해주세요.');return result;
}
export function readJson(parts:any[]){const t=parts.filter(x=>x.text).map(x=>x.text).join('');try{return JSON.parse(t.replace(/^```json\s*|```$/g,''));}catch{throw new Error('AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.');}}
export async function checkOrigin(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw Object.assign(new Error('허용되지 않은 요청입니다.'),{status:403});}
