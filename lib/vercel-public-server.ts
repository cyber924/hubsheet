import {hubsheetApi} from './vercel-api';
import {sample} from './sample';

// Convert the existing public API response into the shape used by server-rendered pages.
export async function getPublicProjects(){
  const data = await hubsheetApi<{projects:any[]}>('/api/market');
  return data.projects.filter((p:any)=>p.id!==sample.id).map((p:any)=>({id:p.id,data:JSON.stringify(p),updatedAt:p.updatedAt,visibility:'public'}));
}
export async function getProject(id:string){
  try { const data = await hubsheetApi<{project:any}>('/api/market/'+encodeURIComponent(id)); return data.project; }
  catch { return null; }
}
export async function identity(){
  try { const data = await hubsheetApi<{user:any}>('/api/me'); return data.user || {id:null,email:null,name:''}; }
  catch { return {id:null,email:null,name:''}; }
}
