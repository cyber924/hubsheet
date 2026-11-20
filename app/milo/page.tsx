import {requirePageUser} from '../../lib/page-auth';
export const dynamic='force-dynamic';
import {MiloPage} from '../studio-client';export const metadata={title:'마일로 에이전트',robots:{index:false,follow:false}};export default async function Page(){await requirePageUser('/milo');return <MiloPage/>}
