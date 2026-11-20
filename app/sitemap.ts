import type {MetadataRoute} from 'next';
import {getPublicProjects} from '../lib/vercel-public-server';
import {ORIGIN} from '../lib/types';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{const rows=await getPublicProjects();return [{url:ORIGIN+'/about',changeFrequency:'monthly',priority:.9},{url:ORIGIN+'/market',changeFrequency:'daily',priority:1},{url:ORIGIN+'/market/sample-fashion',changeFrequency:'monthly',priority:.7},...rows.map(r=>({url:`${ORIGIN}/market/${encodeURIComponent(r.id)}`,lastModified:r.updatedAt,changeFrequency:'weekly' as const,priority:.8}))];}
