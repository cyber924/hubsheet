// The shared Firebase web configuration is public. No service-account key is used.
export const FIREBASE_PROJECT_ID='studio-9240700230-1dd9a';
export const FIREBASE_WEB_API_KEY='AIzaSyDEpFAsf1fI65xXklKYsukAWFYw5bzaHyc';
export const ID_COOKIE='__Host-hubsheet-id';
export const REFRESH_COOKIE='__Host-hubsheet-refresh';
const issuer=`https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
export function safeReturnTo(value, fallback='/'){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||value.includes('\\'))return fallback;
 try{const u=new URL(value,'https://hubsheet.local');if(u.origin!=='https://hubsheet.local'||/^\/(login|signup|api\/auth)(\/|$)/.test(u.pathname))return fallback;return u.pathname+u.search+u.hash;}catch{return fallback;}
}
export function parseCookies(header=''){
 const map={};for(const item of header.split(';')){const i=item.indexOf('=');if(i<0)continue;try{map[item.slice(0,i).trim()]=decodeURIComponent(item.slice(i+1).trim())}catch{}}
 return map;
}
export function tokenClaims(token,now=Math.floor(Date.now()/1000)){
 try{if(typeof token!=='string'||token.length>14000)return null;const parts=token.split('.');if(parts.length!==3)return null;const decode=v=>JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(v.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0))));const h=decode(parts[0]);const c=decode(parts[1]);if(h.alg!=='RS256'||!h.kid||c.aud!==FIREBASE_PROJECT_ID||c.iss!==issuer||typeof c.sub!=='string'||!c.sub.length||c.sub.length>128||!Number.isFinite(c.exp)||c.exp<=now||!Number.isFinite(c.iat)||c.iat>now+30||!Number.isFinite(c.auth_time)||c.auth_time>now+30)return null;return c;}catch{return null;}
}
export function authMessage(code=''){
 if(code.startsWith('WEAK_PASSWORD'))return '비밀번호는 6자 이상으로 입력해주세요.';
 return ({EMAIL_EXISTS:'이미 가입된 이메일입니다. 로그인해주세요.',INVALID_EMAIL:'이메일 형식을 확인해주세요.',INVALID_LOGIN_CREDENTIALS:'이메일 또는 비밀번호가 올바르지 않습니다.',EMAIL_NOT_FOUND:'이메일 또는 비밀번호가 올바르지 않습니다.',INVALID_PASSWORD:'이메일 또는 비밀번호가 올바르지 않습니다.',USER_DISABLED:'사용 중지된 계정입니다. 관리자에게 문의해주세요.',OPERATION_NOT_ALLOWED:'Firebase에서 이메일/비밀번호 로그인을 활성화해야 합니다.',TOO_MANY_ATTEMPTS_TRY_LATER:'요청이 많습니다. 잠시 후 다시 시도해주세요.',API_KEY_INVALID:'Firebase 연결 설정을 확인해주세요.',CREDENTIAL_TOO_OLD_LOGIN_AGAIN:'보안을 위해 다시 로그인해주세요.'})[code]||'인증을 완료하지 못했습니다. 잠시 후 다시 시도해주세요.';
}
export async function firebaseCall(action,body,fetcher=fetch){
 const r=await fetcher(`https://identitytoolkit.googleapis.com/v1/accounts:${action}?key=${FIREBASE_WEB_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 const d=await r.json();if(!r.ok){const code=String(d.error?.message||'');throw Object.assign(new Error(authMessage(code)),{status:r.status===429?429:400,authCode:code});}return d;
}
async function verifyToken(token,fetcher,now){
 const claims=tokenClaims(token,now);if(!claims)return null;
 try{const data=await firebaseCall('lookup',{idToken:token},fetcher);const u=data.users?.[0];if(!u||u.disabled||u.localId!==claims.sub||(Number(u.validSince)&&claims.auth_time<Number(u.validSince)))return null;
 return {id:u.localId,email:u.email||'',name:u.displayName||'',emailVerified:!!u.emailVerified};
 }catch(e){if(e.authCode)return null;throw e;}
}
export async function readSession(header,{fetcher=fetch,now=Math.floor(Date.now()/1000)}={}){
 const cookies=parseCookies(header);const id=cookies[ID_COOKIE];const refresh=cookies[REFRESH_COOKIE];
 if(id){const user=await verifyToken(id,fetcher,now);if(user)return {user,tokens:null};}
 if(!refresh)return {user:null,tokens:null};
 try{
 const r=await fetcher(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_WEB_API_KEY}`,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',refresh_token:refresh}).toString(),signal:AbortSignal.timeout(15000)});
 if(!r.ok)return {user:null,tokens:null};const d=await r.json();const user=await verifyToken(d.id_token,fetcher,now);if(!user)return {user:null,tokens:null};
 return {user,tokens:{idToken:d.id_token,refreshToken:d.refresh_token||refresh,expiresIn:Number(d.expires_in)||3600}};
 }catch{return {user:null,tokens:null};}
}
export function sessionHeaders(tokens){
 const h=new Headers({'Cache-Control':'no-store'});const cookie=(name,value,age)=>`${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
 h.append('Set-Cookie',cookie(ID_COOKIE,tokens?.idToken||'',tokens?Math.min(3600,Math.max(60,Number(tokens.expiresIn)||3600)):0));
 h.append('Set-Cookie',cookie(REFRESH_COOKIE,tokens?.refreshToken||'',tokens?2592000:0));return h;
}
