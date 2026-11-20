import {getPublicProjects,fail} from '../../../lib/server';import {sample} from '../../../lib/sample';
export async function GET(){try{const rows=await getPublicProjects();return Response.json({projects:[sample,...rows.map(r=>({...JSON.parse(r.data),id:r.id,visibility:'public',updatedAt:r.updatedAt}))]},{headers:{'Cache-Control':'no-store'}});}catch(e){return fail(e)}}
