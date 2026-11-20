import {z} from 'zod';
export const inquirySchema=z.object({id:z.string().uuid(),name:z.string().trim().min(1,'이름을 입력해주세요.').max(60),email:z.string().trim().email('답변받을 이메일을 확인해주세요.').max(254),type:z.enum(['서비스 이용','상세페이지 제작','제휴 문의','기타']),content:z.string().trim().min(10,'문의 내용을 10자 이상 입력해주세요.').max(3000),consent:z.literal(true),website:z.string().max(0).optional()});
export function inquiryReference(id:string){return 'HS-'+id.replaceAll('-','').slice(0,12).toUpperCase();}

export function newInquiryId(){const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=[...bytes].map(x=>x.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;}
