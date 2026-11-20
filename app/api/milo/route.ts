import {requireUser,db,fail} from '../../../lib/server';import {messages} from '../../../db/schema';import {eq,desc} from 'drizzle-orm';
export async function GET(){try{const u=await requireUser();const rows=await db().select().from(messages).where(eq(messages.ownerId,u.id)).orderBy(desc(messages.createdAt)).limit(40);return Response.json({messages:rows.reverse()});}catch(e){return fail(e);}}
