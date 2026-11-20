import {z} from 'zod';
import {firebaseCall,readSession,sessionHeaders,ID_COOKIE,parseCookies} from '../../../../lib/firebase-auth.mjs';
import {migrateLegacy} from '../../../../lib/legacy-account';
import {checkOrigin,fail} from '../../../../lib/server';
const credentials=z.object({email:z.string().trim().email().max(254),password:z.string().min(1).max(256)});
export async function POST(req:Request,{params}:any){try{
 await checkOrigin(req);const {action}=await params;
 if(action==='migrate-legacy'){const s=await readSession(req.headers.get('cookie')||'');if(!s.user)throw Object.assign(new Error('로그인 후 이용해주세요.'),{status:401});await migrateLegacy(req.headers,s.user.id);return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}
 if(action==='verify-email'){const session=await readSession(req.headers.get('cookie')||'');if(!session.user)throw Object.assign(new Error('로그인 후 이용해주세요.'),{status:401});const token=session.tokens?.idToken||(parseCookies(req.headers.get('cookie')||'') as Record<string,string>)[ID_COOKIE];await firebaseCall('sendOobCode',{requestType:'VERIFY_EMAIL',idToken:token});return Response.json({ok:true},{headers:session.tokens?sessionHeaders(session.tokens):{'Cache-Control':'no-store'}});}
 if(action==='logout')return Response.json({ok:true},{headers:sessionHeaders(null)});
 if(action==='refresh'){const s=await readSession(req.headers.get('cookie')||'');if(!s.user)return Response.json({error:'다시 로그인해주세요.'},{status:401,headers:sessionHeaders(null)});return Response.json({user:s.user},{headers:s.tokens?sessionHeaders(s.tokens):{'Cache-Control':'no-store'}});}
 if(!['login','signup','reset-password'].includes(action))return Response.json({error:'요청을 찾을 수 없습니다.'},{status:404});
 const raw=await req.json() as any;
 if(action==='reset-password'){const email=z.string().trim().email().max(254).parse(raw.email);try{await firebaseCall('sendOobCode',{requestType:'PASSWORD_RESET',email})}catch(e:any){if(e.authCode!=='EMAIL_NOT_FOUND')throw e;}return Response.json({ok:true,message:'등록된 이메일이면 비밀번호 재설정 메일이 발송됩니다.'},{headers:{'Cache-Control':'no-store'}});}
 const c=credentials.parse(raw);
 if(action==='signup'&&c.password.length<6)return Response.json({error:'비밀번호는 6자 이상으로 입력해주세요.'},{status:400});
 const d=await firebaseCall(action==='signup'?'signUp':'signInWithPassword',{email:c.email,password:c.password,returnSecureToken:true});
 return Response.json({ok:true,user:{id:d.localId,email:d.email}},{headers:sessionHeaders({idToken:d.idToken,refreshToken:d.refreshToken,expiresIn:d.expiresIn})});
 }catch(e:any){if(e instanceof z.ZodError)return Response.json({error:'이메일과 비밀번호를 확인해주세요.'},{status:400});return fail(e);}}
