import {requireUser,fail} from '../../../lib/server';
import {listHub} from '../../../lib/hub';
export async function GET(req:Request){try{await requireUser();return Response.json(await listHub(new URL(req.url).searchParams.has('refresh')),{headers:{'Cache-Control':'private,no-store'}});}catch(e){return fail(e);}}
