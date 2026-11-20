import {checkOrigin,requireUser,credential,gemini,readJson,fail} from '../../../lib/server';
import {listHub} from '../../../lib/hub';
import {z} from 'zod';
export async function POST(req:Request){try{
 await checkOrigin(req);await requireUser();const key=await credential(req);const {instruction,model}=z.object({instruction:z.string().trim().min(2).max(4000),model:z.string().regex(/^[a-z0-9.\-]{1,100}$/)}).parse(await req.json());
 const {images}=await listHub();if(!images.length)throw new Error('이미지 허브에 선택할 이미지가 없습니다.');
 const words=instruction.toLowerCase().split(/[^가-힣a-z0-9]+/).filter(x=>x.length>=2);
 const candidates=images.map(im=>({im,score:words.reduce((n,w)=>n+((im.title+' '+im.tags.join(' ')+' '+im.prompt.slice(0,150)).toLowerCase().includes(w)?1:0),0)})).sort((a,b)=>b.score-a.score).slice(0,200).map(x=>x.im);
 const metadata=candidates.map(({id,title,category,tags,prompt})=>({id,title,category,tags,prompt:prompt.slice(0,160)}));
 const now=new Date().toISOString();const answer=readJson(await gemini(key,model,[{text:`당신은 상품 상세페이지 기획자입니다. 사용자 요청: ${instruction}. 후보 이미지 목록: ${JSON.stringify(metadata)}. 상품과 일치하는 사진만 1~7개 고르고 서로 다른 상품을 섞지 마세요. 일치하는 사진이 없으면 ids는 빈 배열로 반환하세요. 사용자가 발행 날짜와 시간을 명시했다면 한국 시간(Asia/Seoul) 기준 ISO 8601 +09:00 형식으로 해석하세요. 현재 UTC 시각 ${now}. 시간이 명시되지 않으면 scheduledAt은 null입니다. JSON만 반환: {"ids":["후보 id"],"scheduledAt":null,"reason":"선택 이유"}`}],true));
 const parsed=z.object({ids:z.array(z.string()).max(7),scheduledAt:z.string().nullable().optional(),reason:z.string().max(1000)}).parse(answer);const chosen=parsed.ids.map(id=>candidates.find(x=>x.id===id)).filter(Boolean);if(!chosen.length)throw new Error('요청에 맞는 이미지를 찾지 못했습니다. 상품명이나 특징을 더 구체적으로 입력해주세요.');
 return Response.json({images:chosen,scheduledAt:parsed.scheduledAt||null,reason:parsed.reason});
 }catch(e){return fail(e)}}
