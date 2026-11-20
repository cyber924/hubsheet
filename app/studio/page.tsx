import {requirePageUser} from '../../lib/page-auth';import {Studio} from '../studio-client';import {ownedRow,draftResult} from '../../lib/project-store';import {projectFromSet,blankProject} from '../../lib/studio-document';import {env} from 'cloudflare:workers';import {notFound} from 'next/navigation';
export const dynamic='force-dynamic';export const metadata={title:'상세페이지 만들기',robots:{index:false,follow:false}};
export default async function Page({searchParams}:any){const query=await searchParams||{};const user=await requirePageUser('/studio');const id=typeof query.project==='string'?query.project:null;const fromSet=typeof query.fromSet==='string'?query.fromSet:null;
 if(id){try{const row=await ownedRow(id,user.id);return <Studio key={id} initialProject={draftResult(row)}/>;}catch{notFound();}}
 if(fromSet){const row=await env.DB!.prepare('SELECT data FROM product_sets WHERE id=? AND owner_id=?').bind(fromSet,user.id).first<{data:string}>();if(!row)notFound();return <Studio key={'set:'+fromSet} initialProject={projectFromSet(JSON.parse(row.data))}/>;}
 if(query.new==='1'||typeof query.category==='string')return <Studio key="new" initialProject={blankProject(typeof query.category==='string'?query.category:'패션')}/>;
 return <Studio/>;
}
