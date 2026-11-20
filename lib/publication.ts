import {coverSource} from './project-policy.mjs';
import type {ProjectData} from './types';
export function sectionPhoto(p:ProjectData,s:ProjectData['sections'][number]){return s.renderMode!=='editable'&&s.generatedUrl?s.generatedUrl:s.backgroundUrl||s.imageUrl||p.images.find(x=>x.id===s.imageId)?.url||p.images[0]?.url;}
export function publicationPhotos(p:ProjectData){return [...new Set([coverSource(p),...p.sections.map(s=>sectionPhoto(p,s))].filter((v):v is string=>!!v))];}
export function publicationIssues(p:ProjectData){const errors:string[]=[];if(!p.title.trim())errors.push('상품명을 입력해주세요.');if(!p.description.trim())errors.push('상품 설명을 입력해주세요.');if(!p.sections.length)errors.push('상세페이지를 먼저 완성해주세요.');if(!coverSource(p))errors.push('대표 이미지를 선택해주세요.');p.sections.forEach((s,i)=>{if(!s.title.trim())errors.push(`${i+1}페이지 제목이 비어 있습니다.`);if(!sectionPhoto(p,s))errors.push(`${i+1}페이지 사진이 없습니다.`);});return errors;}
