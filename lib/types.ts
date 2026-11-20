export const CATEGORIES = ['전체','식품','화장품','패션','생활용품','디지털','기타'];
export const STYLES = [{id:'editorial',name:'에디토리얼',sub:'여백과 타이포로 완성하는 감각',color:'#e6d9c9'},{id:'natural',name:'내추럴',sub:'따뜻한 색감, 자연스러운 이야기',color:'#d5ddc7'},{id:'bold',name:'볼드',sub:'시선을 사로잡는 강렬한 대비',color:'#e9b5a3'},{id:'minimal',name:'미니멀',sub:'상품에 집중하는 깔끔한 구성',color:'#dddfe6'}];
export type HubImage = {id:string;title:string;category:string;tags:string[];prompt:string;thumb:string;url:string;setId?:string;shot?:string;origin?:string};
export type FontId='pretendard'|'noto'|'nanum';
export type Typography={title:{font:FontId;size:number};body:{font:FontId;size:number};align?:'left'|'center'|'right';titleLeading?:number;bodyLeading?:number;paragraphGap?:number};
export type Cover={source:'section'|'image';id:string;position:number};
export type Overlay={position?:'top-left'|'top-center'|'top-right'|'middle-left'|'middle-center'|'middle-right'|'bottom-left'|'bottom-center'|'bottom-right';width?:number;backdrop?:'gradient'|'panel'|'none';tone?:'dark'|'light';opacity?:number;photoX?:number;photoY?:number};
export type Section = {id:string;eyebrow:string;title:string;body:string;imageId:string;imageUrl?:string;generatedUrl?:string;backgroundUrl?:string;renderMode?:'editable'|'legacy';typography?:Typography;layout?:string;overlay?:Overlay;secondaryImageId?:string};
export type ProjectData={id?:string;title:string;category:string;description:string;highlights:string;purpose?:string;designRequest?:string;unknowns:string[];images:HubImage[];style:string;channel:string;pageCount:number;sections:Section[];visibility?:string;updatedAt?:string;status?:string;sample?:boolean;layout?:string;brand?:Brand;cover?:Cover;deletedAt?:string|null;revision?:number;publishedRevision?:number;publishedAt?:string|null;hasUnpublishedChanges?:boolean;publishedTitle?:string;publishedCategory?:string;scheduledAt?:string;scheduledRevision?:number};
// Keep the ChatGPT Sites origin for that runtime; use Vercel for public SEO.
export const ORIGIN = process.env.VERCEL
  ? 'https://hubsheet.vercel.app'
  : 'https://hubsheet.herestay-4226.chatgpt.site';

export type Brand={name:string;logoUrl:string;color:string;titleFont:FontId;bodyFont:FontId};
