import {hubsheetApi} from './vercel-api';
import {sample} from './sample';
import {headers} from 'next/headers';
import {readSession} from './firebase-auth.mjs';

// Public D1 content remains on the existing Cloudflare API.
export async function getPublicProjects(){
 const data = await hubsheetApi<{projects:any[]}>('/api/market');
 return data.projects.filter((p:any)=>p.id!==sample.id).map((p:any)=>({id:p.id,data:JSON.stringify(p),updatedAt:p.updatedAt,visibility:'public'}));
}
export async function getProject(id:string){
 try {const data=await hubsheetApi<{project:any}>('/api/market/'+encodeURIComponent(id));return data.project;}
 catch{return null;}
}
// Server components must use the same Firebase session as /api/auth and /api/me.
export async function identity(){
 try{
  const h=await headers();
  const s=await readSession(h.get('cookie')||'');
  return s.user||{id:null,email:null,name:''};
 }catch{return {id:null,email:null,name:''};}
}
