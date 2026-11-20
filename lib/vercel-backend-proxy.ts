const BACKEND_ORIGIN = "https://hubsheet.herestay-4226.chatgpt.site";
const SESSION_NAMES = new Set(["__Host-hubsheet-id", "__Host-hubsheet-refresh"]);

export async function proxyToCloudflare(req: Request, segments: string[]): Promise<Response> {
  const origin = new URL(req.url).origin;
  const browserOrigin = req.headers.get("origin");
  if (browserOrigin && browserOrigin !== origin) {
    return Response.json({error:"허용되지 않은 요청입니다."},{status:403});
  }
  if (!segments.length || segments.some(s => !s || s === "." || s === ".." || s.includes("/") || s.includes("\\"))) {
    return Response.json({error:"잘못된 API 경로입니다."},{status:400});
  }
  const upstream = new URL("/api/" + segments.map(encodeURIComponent).join("/"), BACKEND_ORIGIN);
  upstream.search = new URL(req.url).search;
  const headers = new Headers();
  for (const name of ["accept","content-type","range","if-match","if-none-match","x-gemini-key"]) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Host-only Firebase cookies belong to Vercel in the browser and are sent
  // server-to-server to the existing Cloudflare API after local origin checks.
  const cookies = (req.headers.get("cookie") || "")
    .split(";").map(x => x.trim())
    .filter(x => SESSION_NAMES.has(x.split("=", 1)[0]));
  if (cookies.length) headers.set("cookie", cookies.join("; "));
  // The original backend validates Origin against its own host.
  if (browserOrigin) headers.set("origin", upstream.origin);
  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
    redirect: "manual",
    signal: AbortSignal.timeout(150000),
  };
  if (!["GET","HEAD"].includes(req.method)) init.body = await req.arrayBuffer();
  try {
    const response = await fetch(upstream, init);
    const outHeaders = new Headers();
    for (const name of ["content-type","content-disposition","cache-control","etag","last-modified","accept-ranges","content-range"]) {
      const value = response.headers.get(name);
      if (value) outHeaders.set(name, value);
    }
    for (const cookie of response.headers.getSetCookie()) outHeaders.append("set-cookie",cookie);
    if (!outHeaders.has("cache-control")) outHeaders.set("cache-control","private, no-store");
    return new Response(response.body,{status:response.status,headers:outHeaders});
  } catch {
    return Response.json({error:"Cloudflare 데이터 API 연결에 실패했습니다."},{status:502,headers:{"Cache-Control":"no-store"}});
  }
}
