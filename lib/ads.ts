import {getDb} from '../db';import {advertisements} from '../db/schema';import {canAdmin,selectAdvertisement} from './project-policy.mjs';import {identity} from './server';
export type Advertisement={id:string;title:string;body:string;imageUrl:string;href:string;category:string;enabled:boolean;priority:number};
export const defaultAds:Advertisement[]=[{id:'hubsheet-house',title:'좋은 사진 한 장,\n멋진 상세페이지의 시작',body:'이미지 허브와 마일로가 함께하는 상품 스튜디오',imageUrl:'/ads/hubsheet-studio.webp',href:'/studio',category:'전체',enabled:true,priority:0}];
export async function allAds(){const rows=await getDb().select().from(advertisements);return rows.length?rows:defaultAds}
export async function categoryAd(category:string){try{const rows=await allAds();return selectAdvertisement(rows,category)}catch{return defaultAds[0]}}
export async function requireAdmin(){const u=await identity();if(!canAdmin(u))throw Object.assign(new Error('광고 관리는 관리자 계정만 이용할 수 있습니다.'),{status:403});return u as {id:string;email:string}}
