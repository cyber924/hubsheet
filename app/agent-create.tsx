'use client';
import {useState} from 'react';
import {Sparkles} from 'lucide-react';
import {ai,api,settings} from '../lib/client';
import {blankProject} from '../lib/studio-document';
import {planSections} from '../lib/creative-direction';
import type {ProjectData} from '../lib/types';

export function AgentCreate(){
 const [instruction,setInstruction]=useState('');const [schedule,setSchedule]=useState(false);const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 const create=async()=>{if(!instruction.trim()||busy)return;setBusy(true);setMessage('이미지 허브에서 상품에 맞는 사진을 찾고 있습니다.');let projectId='';try{
  const pick=await api('/api/agent-recommend',{method:'POST',headers:{'x-gemini-key':settings().key},body:JSON.stringify({instruction,model:settings().model})});
  if(schedule&&(!pick.scheduledAt||!Number.isFinite(Date.parse(pick.scheduledAt))||Date.parse(pick.scheduledAt)<=Date.now()))throw new Error('예약 날짜와 시간을 미래 시각으로 구체적으로 입력해주세요. 예: 내일 오전 8시에 발행해줘.');
  const images=pick.images;const imageIds=images.map((x:any)=>x.id);let project:ProjectData={...blankProject(),images,pageCount:Math.min(4,images.length),designRequest:instruction};
  setMessage('선택한 사진을 분석하고 상품 정보를 작성하고 있습니다.');const analysis=await ai({action:'analyze',imageIds,project});project={...project,title:analysis.title,category:analysis.category,description:analysis.description,highlights:analysis.highlights,unknowns:analysis.unknowns,pageCount:Math.min(7,Math.max(1,analysis.recommendedCount))};
  setMessage('상세페이지 구성을 만들고 있습니다.');const plan=await ai({action:'plan',imageIds,pageCount:project.pageCount,project,instruction});project={...project,sections:planSections(project,plan.sections)};
  const saved=await api('/api/projects',{method:'POST',body:JSON.stringify({...project,manual:false})});projectId=saved.id;
  if(schedule){await api('/api/projects/'+projectId+'/schedule',{method:'POST',body:JSON.stringify({action:'set',scheduledAt:pick.scheduledAt})});setMessage(`상세페이지를 저장하고 ${new Date(pick.scheduledAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}에 예약했습니다. 시간이 지난 뒤 내 프로젝트를 열면 공개됩니다. 이미지 선택: ${pick.reason}`)}else setMessage(`상세페이지를 만들어 내 프로젝트에 저장했습니다. 이미지 선택: ${pick.reason}`);
 }catch(e:any){setMessage((projectId?'프로젝트는 저장됐지만 예약은 완료되지 않았습니다. ':'')+e.message)}finally{setBusy(false)}};
 return <section className="panel" style={{marginBottom:24}}><h2>에이전트로 상세페이지 만들기</h2><p className="muted">상품과 원하는 구성을 알려주면 관련 이미지를 골라 기획하고 프로젝트로 저장합니다.</p><div className="project-tabs"><button className={`btn ${!schedule?'primary':''}`} onClick={()=>setSchedule(false)} disabled={busy}>상세페이지 만들기</button><button className={`btn ${schedule?'primary':''}`} onClick={()=>setSchedule(true)} disabled={busy}>예약 발행</button></div><textarea aria-label="제작 요청" rows={3} maxLength={4000} value={instruction} onChange={e=>setInstruction(e.target.value)} placeholder={schedule?'예: 린넨 원피스 상세페이지를 만들어 내일 오전 8시에 발행해줘':'예: 자연스러운 린넨 원피스 상세페이지를 만들어줘'}/><p className="muted small-text">{schedule?'완성본은 바로 저장되며, 예약 시간이 지난 뒤 내 프로젝트를 열면 공개됩니다. 시간은 한국 기준입니다.':'생성 후 상품 정보와 선택된 이미지를 확인할 수 있습니다.'}</p><button className="btn primary" disabled={busy||!instruction.trim()} onClick={create}><Sparkles size={15}/>{busy?'만드는 중…':schedule?'만들고 예약하기':'상세페이지 만들기'}</button>{message&&<p role="status">{message}</p>}<a className="btn small" href="/projects">내 프로젝트 보기</a></section>
}
