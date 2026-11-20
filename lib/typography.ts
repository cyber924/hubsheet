import type {Section,Typography,FontId} from './types';
export const FONT_OPTIONS=[{id:'pretendard' as FontId,label:'프리텐다드',family:'Hubsheet Pretendard',url:'/fonts/pretendard.woff2'},{id:'noto' as FontId,label:'Noto Sans KR',family:'Hubsheet Noto',url:'/fonts/noto-sans-kr.woff2'},{id:'nanum' as FontId,label:'나눔명조',family:'Hubsheet Nanum',url:'/fonts/nanum-myeongjo.woff2'}];
export function fontFamily(id:FontId){return FONT_OPTIONS.find(f=>f.id===id)?.family||FONT_OPTIONS[0].family}
export function typography(s:Section):Typography{return {...s.typography,title:{font:s.typography?.title?.font||'pretendard',size:s.typography?.title?.size||44},body:{font:s.typography?.body?.font||'pretendard',size:s.typography?.body?.size||20}}}
export function legacySection(s:Section){return !!s.generatedUrl&&s.renderMode!=='editable'&&!s.backgroundUrl}
