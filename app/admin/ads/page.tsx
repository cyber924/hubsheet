import {requirePageUser} from '../../../lib/page-auth';import {canAdmin} from '../../../lib/project-policy.mjs';import {AdsAdmin,AdminAccess} from '../../ads-admin-client';
export const dynamic='force-dynamic';export const metadata={title:'광고 관리',robots:{index:false,follow:false}};
export default async function Page(){const u=await requirePageUser('/admin/ads');return canAdmin(u)?<AdsAdmin/>:<AdminAccess email={u.email||''}/>}
