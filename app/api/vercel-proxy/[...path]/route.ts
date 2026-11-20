import {proxyToCloudflare} from "../../../../lib/vercel-backend-proxy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const VALID_ROOTS = new Set([
 "ad-assets","admin","agent-recommend","ai","assets","brand-upload",
 "brand","hub","inquiries","market","milo","product-images",
 "product-jobs","product-sets","projects"
]);
async function handle(req:Request,{params}: {params:Promise<{path:string[]}>}) {
 const {path}=await params;
 if(!path?.length || !VALID_ROOTS.has(path[0])) return Response.json({error:"Not found"},{status:404});
 return proxyToCloudflare(req,path);
}
export {handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD};
