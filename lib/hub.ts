import seed from './hub-seed.json';
import type {HubImage} from './types';
const base='https://firestore.googleapis.com/v1/projects/studio-9240700230-1dd9a/databases/(default)/documents';
const key='AIzaSyDEpFAsf1fI65xXklKYsukAWFYw5bzaHyc'; // Public Firebase browser configuration, not a server credential.
export const cachedImages=seed as HubImage[];
let cache:{at:number;images:HubImage[]}|null=null;
export async function readHubImage(id:string){
 if(!/^[\w-]{1,150}$/.test(id))throw new Error('올바르지 않은 이미지 ID입니다.');
 const r=await fetch(`${base}/images/${encodeURIComponent(id)}?key=${key}`,{signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw new Error('원본 이미지를 불러오지 못했습니다.');
 const d:any=await r.json();if(d.fields?.visibility?.stringValue!=='public')throw new Error('공개 이미지가 아닙니다.');
 const data=d.fields?.dataUrl?.stringValue;if(!/^data:image\/(png|jpeg|webp);base64,/.test(data||''))throw new Error('이미지 데이터가 없습니다.');return data as string;
}
function category(title:string,tags:string[]){const primary:Record<string,string>={'패션':'패션','음식':'식품','식품':'식품','화장품':'화장품','제품':'기타','여행':'기타','부동산':'기타','금융':'기타','건강':'기타','교육':'기타','스포츠':'기타'};if(primary[tags[0]])return primary[tags[0]];const t=title+' '+tags.join(' ');for(const [c,keys] of [['패션',['패션','의류','룩북','아우터']],['화장품',['화장품','뷰티','스킨케어']],['식품',['음식','식품','맛집','카페','요리']],['디지털',['테크','디지털','이어폰']],['생활용품',['인테리어','가구','생활']]] as [string,string[]][]){if(keys.some(x=>t.includes(x)))return c;}return '기타';}
export function invalidateHub(){cache=null;}
export async function listHub(force=false){
 if(force)cache=null;
 if(cache&&Date.now()-cache.at<300000)return {images:cache.images,source:'live'};
 try{
 const out:HubImage[]=[];let cursor='';
 for(let page=0;page<20;page++){
 const q:any={from:[{collectionId:'images'}],where:{fieldFilter:{field:{fieldPath:'visibility'},op:'EQUAL',value:{stringValue:'public'}}},orderBy:[{field:{fieldPath:'__name__'},direction:'ASCENDING'}],limit:200};
 if(cursor)q.startAt={values:[{referenceValue:cursor}],before:false};
 const r=await fetch(`${base}:runQuery?key=${key}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({structuredQuery:q}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw new Error('허브 HTTP '+r.status);
 const rows:any=await r.json();const docs=rows.map((x:any)=>x.document).filter(Boolean);
 for(const d of docs){const f=d.fields;const id=d.name.split('/').pop();const title=f.title?.stringValue||'이름 없는 이미지';const tags=(f.tags?.arrayValue?.values||[]).map((x:any)=>x.stringValue);out.push({id,title,tags,category:category(title,tags),prompt:f.prompt?.stringValue||'',setId:f.productSetId?.stringValue,shot:f.shot?.stringValue,origin:f.source?.stringValue,thumb:cachedImages.find(x=>x.id===id)?.thumb||`/api/hub/${id}?thumb=1`,url:`/api/hub/${id}`});}
 if(docs.length<200)break;cursor=docs.at(-1).name;
 }
 cache={at:Date.now(),images:out};return {images:out,source:'live'};
 }catch(e){console.warn('Hub sync:',e instanceof Error?e.message:'unknown');return {images:cachedImages,source:'cached',warning:'허브 연결이 지연되어 최근 동기화한 목록을 표시합니다.'};}
}
