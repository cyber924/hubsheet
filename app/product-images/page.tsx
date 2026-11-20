import {requirePageUser} from '../../lib/page-auth';
import {ProductImages} from '../product-images-client';
import {hubsheetApi} from '../../lib/vercel-api';
import type {ProductSet} from '../../lib/product-shots';

export const dynamic='force-dynamic';
export const metadata={title:'상세페이지 전용 이미지',robots:{index:false,follow:false}};

export default async function Page(){
  await requirePageUser('/product-images');
  // Use the existing authenticated Cloudflare D1 API instead of env.DB.
  const data=await hubsheetApi<{sets:ProductSet[]}>('/api/product-sets');
  return <ProductImages initialSets={data.sets}/>;
}
