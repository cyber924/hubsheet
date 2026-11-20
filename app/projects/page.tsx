import {requirePageUser} from '../../lib/page-auth';
import {hubsheetApi} from '../../lib/vercel-api';
import {Projects} from '../projects-client';
import type {ProjectData} from '../../lib/types';

export const dynamic='force-dynamic';
export const metadata={title:'내 프로젝트',robots:{index:false,follow:false}};

export default async function Page(){
  await requirePageUser('/projects');
  // D1 belongs to the Cloudflare API; Vercel must not access env.DB.
  const data=await hubsheetApi<{projects:ProjectData[]}>('/api/projects');
  return <Projects initialProjects={data.projects}/>;
}
