export const DOCUMENT_KEYS=['title','category','purpose','designRequest','description','highlights','unknowns','images','style','channel','pageCount','sections','cover','layout','brand'];
export function projectDocument(value){return Object.fromEntries(DOCUMENT_KEYS.filter(k=>value[k]!==undefined).map(k=>[k,value[k]]))}
export function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,canonical(value[k])]));return value}
export function documentKey(value){return JSON.stringify(canonical(projectDocument(value)))}
export function publicSnapshot(row){return row.publishedData??row.published_data??row.data}
export function canAdmin(user){return !!user?.id&&user.email?.toLowerCase()==='cyber924@naver.com'}
export function coverSource(p){const chosen=p.cover;if(chosen?.source==='image'){const image=p.images.find(x=>x.id===chosen.id);if(image)return image.url||image.thumb;}
 const s=p.sections.find(x=>x.id===chosen?.id)||p.sections[0];return s?(s.renderMode!=='editable'&&s.generatedUrl?s.generatedUrl:s.backgroundUrl||s.imageUrl||p.images.find(x=>x.id===s.imageId)?.url):p.images[0]?.thumb||p.images[0]?.url;}
export function editableSection(s,patch){return {...s,...patch,...(!s.backgroundUrl&&s.generatedUrl?{renderMode:'editable'}:{})}}

export function selectAdvertisement(rows,category){return rows.filter(x=>x.enabled&&(x.category==='전체'||x.category===category)).sort((a,b)=>(Number(b.category===category)-Number(a.category===category))||b.priority-a.priority)[0]||null}
export function safeAdUrl(value){if(typeof value!=='string'||value.includes('\\'))return false;try{const url=new URL(value,'https://hubsheet.local');return (value.startsWith('/')&&!value.startsWith('//')&&url.origin==='https://hubsheet.local')||(url.protocol==='https:'&&value.startsWith('https://')&&!url.username&&!url.password)}catch{return false}}
