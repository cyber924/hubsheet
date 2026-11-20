import { requirePageUser } from '../../../lib/page-auth';
import { canAdmin } from '../../../lib/project-policy.mjs';
import { AdminAccess } from '../../ads-admin-client';
import { InquiryAdmin } from '../../inquiry-admin-client';
import { hubsheetApi } from '../../../lib/vercel-api';

type Inquiry = {
  id: string;
  name: string;
  email: string;
  type: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export const dynamic = 'force-dynamic';
export const metadata = { title: '문의 관리', robots: { index: false, follow: false } };

export default async function Page() {
  const user = await requirePageUser('/admin/inquiries');
  if (!canAdmin(user)) return <AdminAccess email={user.email || ''} />;

  // All inquiry records live in Cloudflare D1, not in the Vercel runtime.
  const data = await hubsheetApi<{ inquiries: Inquiry[] }>('/api/admin/inquiries');
  return <InquiryAdmin initialItems={data.inquiries} />;
}
