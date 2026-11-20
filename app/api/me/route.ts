import {canAdmin} from '../../../lib/project-policy.mjs';
import {readSession,sessionHeaders} from '../../../lib/firebase-auth.mjs';

// Vercel hosts its own first-party Firebase session.
// Cloudflare/D1 data requests are proxied separately.
export async function GET(req:Request){
 try {
  const session=await readSession(req.headers.get('cookie')||'');
  const h=session.tokens?sessionHeaders(session.tokens):new Headers({'Cache-Control':'private,no-store'});
  if(!session.user && (req.headers.get('cookie')||'').includes('__Host-hubsheet-'))return Response.json({user:null,legacy:null,aiConnected:false},{headers:sessionHeaders(null)});
  return Response.json({user:session.user?{...session.user,isAdmin:canAdmin(session.user)}:null,legacy:null,aiConnected:false},{headers:h});
 }catch{
  return Response.json({error:'로그인 상태를 확인하지 못했습니다.'},{status:503,headers:{'Cache-Control':'no-store'}});
 }
}
