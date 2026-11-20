import {AuthPage} from '../auth-client';import {identity} from '../../lib/server';import {safeReturnTo} from '../../lib/firebase-auth.mjs';import {redirect} from 'next/navigation';
export const dynamic='force-dynamic';export const metadata={title:'회원가입',robots:{index:false,follow:false}};
export default async function Page({searchParams}:any){const params=await searchParams;const returnTo=safeReturnTo(params?.returnTo);const user=await identity();if(user.id)redirect(returnTo);return <AuthPage mode="signup" returnTo={returnTo}/>}
