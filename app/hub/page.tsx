import {requirePageUser} from '../../lib/page-auth';
export const dynamic='force-dynamic';
import {HubPage} from '../ui';export const metadata={title:'이미지 허브',robots:{index:false,follow:false}};export default async function Page(){await requirePageUser('/hub');return <HubPage/>}
