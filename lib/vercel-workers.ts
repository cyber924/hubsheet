// Vercel-only compile shim. The production Cloudflare Workers bindings remain
// available in the existing Cloudflare deployment; Vercel API requests are
// forwarded to that deployment instead of opening D1/R2 directly.
// Never configure database credentials in this module.
export const env: Record<string, any> = Object.freeze({
  DB: undefined,
  BUCKET: undefined,
  GEMINI_API_KEY: undefined,
});
