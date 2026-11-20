import {requirePageUser} from '../../lib/page-auth';
import {Studio} from '../studio-client';
import {projectFromSet,blankProject} from '../../lib/studio-document';
import {hubsheetApi} from '../../lib/vercel-api';
import type {ProductSet} from '../../lib/product-shots';
import type {ProjectData} from '../../lib/types';
import {notFound} from 'next/navigation';

export const dynamic='force-dynamic';
export const metadata={title:'상세페이지 만들기',robots:{index:false,follow:false}};

export default async function Page({searchParams}:any){
 const query=await searchParams||{};
 await requirePageUser('/studio');
 const id=typeof query.project==='string'?query.project:null;
 const fromSet=typeof query.fromSet==='string'?query.fromSet:null;
 if(id){
  try {
   // The project record is owned by Cloudflare D1, not Vercel.
   const p=await hubsheetApi<ProjectData>('/api/projects/'+encodeURIComponent(id));
   return <Studio key={id} initialProject={p}/>;
  }catch{notFound();}
 }
 if(fromSet){
  const data=await hubsheetApi<{sets:ProductSet[]}>('/api/product-sets?id='+encodeURIComponent(fromSet));
  const set=data.sets[0];
  if(!set)notFound();
  return <Studio key={'set:'+fromSet} initialProject={projectFromSet(set)}/>;
 }
 if(query.new==='1'||typeof query.category==='string')return <Studio key="new" initialProject={blankProject(typeof query.category==='string'?query.category:'패션')}/>;
 return <Studio/>;
}
