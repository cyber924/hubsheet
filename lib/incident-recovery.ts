import {env} from 'cloudflare:workers';
// Non-destructive, idempotent repair for the confirmed category-overwrite incident.
// Runs outside schema migrations. Existing projects and all old snapshots stay intact.
import {INCIDENT_PROJECT_ID,RECOVERED_FOOD_ID,RECOVER_FOOD_SQL} from './incident-recovery-policy.mjs';
export async function ensureIncidentRecovery(){const existing=await env.DB!.prepare('SELECT id FROM projects WHERE id=?').bind(RECOVERED_FOOD_ID).first();if(existing)return;await env.DB!.batch([env.DB!.prepare(RECOVER_FOOD_SQL).bind(RECOVERED_FOOD_ID,new Date().toISOString(),INCIDENT_PROJECT_ID),env.DB!.prepare("INSERT OR IGNORE INTO project_versions (id,project_id,owner_id,revision,data,label,created_at) SELECT id||':1',id,owner_id,1,data,'기존 식품 작업 복구',updated_at FROM projects WHERE id=?").bind(RECOVERED_FOOD_ID)]);}
