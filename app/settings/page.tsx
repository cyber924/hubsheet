import {requirePageUser} from '../../lib/page-auth';
export const dynamic='force-dynamic';
import {SettingsPage} from '../studio-client';export const metadata={title:'설정',robots:{index:false,follow:false}};export default async function Page(){await requirePageUser('/settings');return <SettingsPage/>}
