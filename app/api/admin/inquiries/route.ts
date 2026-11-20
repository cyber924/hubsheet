import { checkOrigin, fail } from '../../../../lib/server';
import { requireAdmin } from '../../../../lib/ads';
import { hubsheetApiReply } from '../../../../lib/vercel-api';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await requireAdmin();
    return await hubsheetApiReply('/api/admin/inquiries');
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(req: Request) {
  try {
    await checkOrigin(req);
    await requireAdmin();
    const body = z.object({
      id: z.string().uuid(),
      status: z.enum(['new', 'reviewing', 'resolved']),
    }).parse(await req.json());

    return await hubsheetApiReply('/api/admin/inquiries', {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: '문의 처리 정보를 확인해주세요.' }, { status: 400 });
    }
    return fail(error);
  }
}
