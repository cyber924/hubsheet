import {identity} from '../lib/vercel-public-server';import {redirect} from 'next/navigation';
import {Dashboard} from './ui';
export const metadata={title:'대시보드',robots:{index:false,follow:false}};
export const dynamic='force-dynamic';export default async function Page(){const u=await identity();if(!u.id)redirect('/market');return <Dashboard/>}
