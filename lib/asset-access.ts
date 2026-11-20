import {env} from 'cloudflare:workers';
import {PUBLIC_ASSET_SQL,OWNED_ASSET_SQL,OWNED_VERSION_ASSET_SQL,generatedOwner} from './asset-policy.mjs';
export async function canReadGeneratedAsset(path:string,userId?:string|null){
 const owner=generatedOwner(path);if(!owner)return false;
 if(userId&&owner===userId.replace(/[^\w-]/g,''))return true;
 if(userId){const owned=await env.DB!.prepare(OWNED_ASSET_SQL).bind(userId,'/api/assets/'+path).first();if(owned)return true;const version=await env.DB!.prepare(OWNED_VERSION_ASSET_SQL).bind(userId,'/api/assets/'+path).first();if(version)return true;}
 const row=await env.DB!.prepare(PUBLIC_ASSET_SQL).bind('/api/assets/'+path).first();
 return !!row;
}
