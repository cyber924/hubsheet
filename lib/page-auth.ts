import {identity} from './server';import {redirect} from 'next/navigation';
export async function requirePageUser(returnTo:string){const user=await identity();if(!user.id)redirect('/login?returnTo='+encodeURIComponent(returnTo));return user;}
