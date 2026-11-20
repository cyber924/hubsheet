import {env} from 'cloudflare:workers';
import {UPDATE_SCHEDULE,PUBLISH_SCHEDULE} from '../../../../../lib/schedule-sql.mjs';
import {checkOrigin,fail,requireUser} from '../../../../../lib/server';
import {ownedRow} from '../../../../../lib/project-store';
import {publicationIssues,publicationPhotos} from '../../../../../lib/publication';
export async function POST(req:Request,{params}:any){try{
 await checkOrigin(req);const u=await requireUser();const {id}=await params;const body=await req.json() as any;const row=await ownedRow(id,u.id);const data=JSON.parse(row.data);
 if(body.action==='set'){
  const time=new Date(body.scheduledAt);if(!Number.isFinite(time.getTime())||time.getTime()<=Date.now())throw Object.assign(new Error('미래의 발행 시간을 선택해주세요.'),{status:400});
  if(row.visibility==='public')throw Object.assign(new Error('이미 공개된 프로젝트는 예약할 수 없습니다.'),{status:400});
  const issues=publicationIssues(data);if(issues.length)throw Object.assign(new Error(issues.join(' ')),{status:400});
  data.scheduledAt=time.toISOString();data.scheduledRevision=row.revision;
 }else if(body.action==='cancel'){delete data.scheduledAt;delete data.scheduledRevision;
 }else if(body.action==='publish_due'){
  if(!data.scheduledAt||!Number.isFinite(Date.parse(data.scheduledAt))||Date.parse(data.scheduledAt)>Date.now())throw Object.assign(new Error('아직 예약 발행 시간이 아닙니다.'),{status:400});
  if(data.scheduledRevision!==row.revision)throw Object.assign(new Error('예약 후 프로젝트가 수정되었습니다. 내용을 확인하고 다시 예약해주세요.'),{status:409});
  const issues=publicationIssues(data);if(issues.length)throw Object.assign(new Error(issues.join(' ')),{status:400});
  for(const url of publicationPhotos(data)){if(url.startsWith('/api/assets/')){const object=await env.BUCKET!.head(url.slice('/api/assets/'.length));if(!object?.size)throw Object.assign(new Error('불러올 수 없는 이미지가 있습니다.'),{status:400});}}
  delete data.scheduledAt;delete data.scheduledRevision;const json=JSON.stringify(data);
  const published=await env.DB!.prepare(PUBLISH_SCHEDULE).bind(json,json,new Date().toISOString(),id,u.id,row.data,row.revision).run();
  if(!published.meta.changes)throw Object.assign(new Error('프로젝트가 변경되었습니다. 새로고침 후 다시 확인해주세요.'),{status:409});
  return Response.json({ok:true,scheduledAt:null});
 }else throw Object.assign(new Error('예약 요청을 확인해주세요.'),{status:400});
 const result=await env.DB!.prepare(UPDATE_SCHEDULE).bind(JSON.stringify(data),id,u.id,row.data,row.revision).run();
 if(!result.meta.changes)throw Object.assign(new Error('프로젝트가 변경되었습니다. 새로고침 후 다시 확인해주세요.'),{status:409});
 return Response.json({ok:true,scheduledAt:data.scheduledAt||null});
 }catch(e){return fail(e)}}
