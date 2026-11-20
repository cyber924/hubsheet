import {cachedImages} from './hub';
import type {ProjectData} from './types';
const ids=['1790725759677','1790053115689','1790053283800','1790572323749'];
export const sample:ProjectData={id:'sample-fashion',title:'매일 입고 싶은, 단정한 멋',category:'패션',description:'크림부터 카멜까지, 일상에 자연스럽게 스며드는 네 가지 룩.',highlights:'뉴트럴 컬러 스타일링\n네 가지 데일리 룩\n단정한 실루엣',unknowns:['소재 혼용률','실측 사이즈','제조국'],images:ids.map(id=>({...cachedImages.find(x=>x.id==='7iLRc6oD_'+id)!,url:'/samples/'+id+'.webp'})),style:'editorial',channel:'naver',pageCount:4,sections:[{id:'sample-section',eyebrow:'DAILY LOOK COLLECTION',title:'매일 입고 싶은\n단정한 멋',body:'이미지 허브의 사진 4장으로 제작한 여성패션 컬렉션 디자인 시안입니다.',imageId:'7iLRc6oD_1790725759677',generatedUrl:'/samples/fashion-detail.webp'}],visibility:'public',sample:true,status:'complete'};
