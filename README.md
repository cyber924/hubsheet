# hubsheet

이미지 허브의 공개 사진에서 시작하는 AI 상품 상세페이지 스튜디오.

- `/studio`: 사진 1~7장, AI 상품정보, 1~7페이지 구성, 스타일 선택, 이미지 디자인/편집형 제작, 부분 수정, 저장/공개.
- `/hub`: 전체 공개 이미지 동기화, 압축 썸네일, 검색·분류·페이지네이션·원본 미리보기.
- `/projects`: 로그인별 영구 저장 프로젝트.
- `/market`: 비로그인 무료 목록·상세. 제작자가 공개한 프로젝트만 제공.
- `/milo`: 현재 작업/사진/최근 대화를 바탕으로 분석·상품정보·구성 제안. 사용자가 적용.
- `/settings`: AI 연결/모델 설정.
- `/prd`: 간단 제품 요구사항. 상세 소스 문서는 `PRD.md`.

## Runtime
Sites Vinext, D1 `DB`, R2 `BUCKET`. `.openai/hosting.json`의 Site ID 보존.

`GEMINI_API_KEY`를 Sites의 서버 secret으로 설정하면 공용 AI 연결을 사용할 수 있습니다. 키가 없으면 로그인 사용자가 설정에서 자신의 Gemini API 키를 현재 탭 세션에 입력할 수 있습니다. 키는 프로젝트/대화 DB에 기록하지 않으며 소스에도 넣지 않습니다. 공유 서버 키 운영 시 비용/이용량 제한은 출시 후속 작업입니다.

기본 텍스트 모델 `gemini-3.5-flash`, 이미지 모델 `gemini-3.1-flash-image`. 실제 계정에서 지원하는 모델 ID를 설정에서 바꿀 수 있습니다. API 실패/모델 접근 오류는 사용자에게 반환하며 성공으로 가장하지 않습니다.

## Data
이미지 허브 Firestore `images`에서 `visibility=public`인 문서만 읽습니다. 원본 DB는 변경하지 않습니다. 113개 최초 썸네일은 400×300px 이내 WebP로 캐시했습니다. 새 목록은 서버에서 재조회하며 실패 시 캐시임을 표시합니다. 새 이미지의 썸네일 요청은 원본 프록시를 사용하므로 지속적인 썸네일 최적화 파이프라인은 후속 작업입니다.

프로젝트/마일로 이력은 로그인 ID로 분리합니다. 마켓 읽기는 공개 상태만 허용합니다. 생성 이미지는 소유자 또는 공개 프로젝트에서 사용 중인 경우에만 읽을 수 있습니다. 비공개 전환 시 익명 읽기를 차단하고 브라우저·CDN 공개 캐시를 사용하지 않습니다.

## Export
이미지 포함 자체 완결 HTML, 전체 길이 PNG. 채널과 출력 폭 선택. HTML의 data URL을 허용하지 않는 마켓은 이미지 파일을 판매자 등록 화면에 별도 업로드해야 합니다. 판매 채널 API 자동 등록은 포함하지 않습니다.

## Validation
`node node_modules/typescript/bin/tsc --noEmit`
`node /root/.codex/plugins/cache/openai-curated-remote/sites/1.1.2/scripts/build-site.mjs`

실제 브라우저에서 사진 7장 제한, 7페이지 선택, 비로그인 마켓 목록/상세, 카테고리 필터, HTML 다운로드(이미지 내장), 풀 이미지 PNG 860×2580 다운로드, robots/sitemap을 확인했습니다. AI 키가 제공되지 않아 실제 사진 분석/마일로/이미지 생성 호출과 로그인 사용자 저장·공개 변경의 전체 흐름은 미검증입니다.

## Firebase 인증과 공개 마켓

2026-10-28 인증 개편: 공유 Firebase 프로젝트 `studio-9240700230-1dd9a`의 이메일/비밀번호 로그인·회원가입. `/login`, `/signup`, 비밀번호 재설정, 로그아웃 제공. 인증 정보는 Secure/HttpOnly/SameSite 쿠키로 유지하고 Firebase `accounts:lookup`으로 ID 토큰의 유효성을 확인합니다. 프로젝트/audience/issuer/만료 및 계정 사용 중지·토큰 폐기를 확인합니다. 만료 시 refresh token으로 갱신합니다. 관리 서비스 계정이나 Firestore 규칙 변경은 사용하지 않습니다.

마켓 목록·상세는 독립된 공개 헤더로 제공하며 비로그인도 열람/다운로드할 수 있습니다. 나머지 페이지와 이미지 목록 API는 서버에서 Firebase 인증을 요구합니다. `/`는 비로그인 방문자에게 `/market`으로 이동시킵니다. Sites 플랫폼 로그인 헤더는 회원 인증으로 사용하지 않습니다.

인증 테스트: `node --test tests/auth.test.mjs`. 테스트에서 Firebase 응답을 대체하여 서명 검증 서비스의 거절, 잘못된 프로젝트, 만료, 폐기, 갱신, 안전한 쿠키와 리다이렉트를 확인합니다. 실제 사용자의 계정/비밀번호를 사용하거나 테스트용 Firebase 회원을 생성하지 않습니다.

이전 ChatGPT 로그인으로 저장된 작업은 기존 플랫폼 로그인 세션과 Firebase 세션을 모두 가진 사용자가 내 프로젝트의 ‘기존 작업 가져오기’를 선택하면 현재 Firebase UID로 연결할 수 있습니다. 이전 계정의 프로젝트/대화만 옮기고 공개 상태/콘텐츠는 유지합니다. 기존 세션이 없는 방문자에게는 연결 기능을 노출하지 않습니다.

## 상세페이지 편집 고도화
- 웹진 상세 상단을 작은 제목 박스로 정리하고 ‘나도 만들기’ 버튼 제거. 목록 이미지에 카테고리 배지 추가.
- 프리텐다드 / Noto Sans KR / 나눔명조를 자체 호스팅. 제목·본문별 글꼴·크기 선택과 전체 페이지 적용, HTML/PNG 출력에 반영.
- 신규 AI 디자인은 문자가 없는 배경 이미지로 생성하고 글자는 별도 레이어로 표시. 기존 통합 이미지는 그대로 유지하며, 글자 편집 시 원본 사진 기반 편집형으로 전환. 원본 이미지 보기와 되돌리기 제공.
- 변경 후 1.5초 뒤 초안 자동 저장. 되돌리기/다시 실행과 최근 30개 서버 저장 기록 복원. revision 조건으로 다른 창의 저장 충돌을 막음.
- `published_data`에 공개본을 따로 저장. 자동 저장/복원은 초안만 바꾸고 ‘공개본 업데이트’로 공개 스냅샷을 교체. 이전 공개 프로젝트는 첫 수정 시 기존 공개 상태를 보존.
- 375px 모바일 미리보기. 표지 원본(페이지/상품 사진)과 세로 크롭 위치 선택.
- 다운로드 바로 아래에 광고 표시. 광고는 상품 HTML/PNG에 포함하지 않음. `/admin/ads`에서 노출·카테고리·우선순위·문구·이미지 업로드·연결 주소 관리. 검증된 `cyber924@naver.com` 관리자만 변경 가능.
- 광고 기본 이미지: 내장 imagegen으로 제작한 크림색 상품 촬영 스튜디오 배경. 편집 가능한 문구는 HTML 레이어로 표시. `/public/ads/hubsheet-studio.webp`에 보관. 원본 생성 프롬프트 요약: 스킨케어 보틀·니트·시트러스·상품 사진 카드, 자연광, 아이보리·세이지·테라코타, 글자와 로고 없음.

## Product studio upgrade (2026-10-28)
- Titles accept manual newlines; body paragraphs are separated by a blank line. Alignment, title/body leading and paragraph spacing persist in drafts and public snapshots. HTML uses the same layout CSS as preview; PNG wraps each explicit line and paragraph with selected fonts.
- 18 category presets (3 each for fashion, food, beauty, living, digital and other) use distinct sequences of photo-first, split, framed and text-first layouts. Each page can override layout, swap its original photo without changing copy, move, duplicate or remove within 1–7 pages. Legacy baked-text images remain unchanged until edited.
- `/product-images` creates product sets anchored on one public ImageHub photo. Generation is sent server-to-server to **the existing ImageHub** `https://imagehub-2vhv.vercel.app/api/edit-image` with the reference photo and an identity-preserving shot brief. No local generation fallback disguises an upstream failure. Results are compressed to WebP under 280 KB data-URL length and saved to the same Firebase `images` collection with the signed-in user's Firebase token, `ownerId`, `visibility:public`, `productSetId`, and shot metadata. No service-account credential or shared rule change. Hub errors are shown; unsaved output remains retryable. Saved images appear immediately in the set and invalidate the local hub list cache.
- Per-set image review is explicit before using a set in the editor. Generated details are visual proposals and cannot certify unobserved product structure. Actual product photos can be uploaded to the same hub.
- Gemini photo audit compares visible product identity and suggests missing shots. It does not guarantee identity correctness. Uses the existing per-session or server Gemini configuration.
- Brands persist per account in D1 (`brand_settings`); logo assets use owner-scoped R2 paths and are publicly readable only through a published project reference. Applying a brand copies its settings into the project so later brand edits do not alter published pages.
- Project delete is a soft delete (`deleted_at`) that immediately removes the item from public listings and makes it private. Trash restores content and history as a private draft. No irreversible purge endpoint was added. Duplicate creates a separate private draft.
- Advertising requires the logged-in designated admin; **no separate email verification** is required.
- Verification: mocked upstream tests cover ImageHub request routing, reference preservation, ownership encoding and failed writes. No user credentials are embedded. Actual paid model generation and authenticated shared-Firebase writes require a signed-in user and the existing ImageHub model configuration.

## Reference analysis and recoverable hub writes (2026-10-28)
- The top reference selector now has `AI 분석·프롬프트 추천`. Gemini 3.5 Flash receives exactly one original reference photo and returns observed facts, unknowns, a common visual brief, editable shot prompts and a recommended shot list. The UI persists the edited plan with the set. Each generation sends the immutable composed prompt plus that reference to the existing ImageHub edit-image API. Empty selected prompts stop generation.
- `product_image_jobs` records the owner, set, reference, exact prompt, stage and safe error metadata. Generated bytes are persisted in owner-scoped R2 before the client compresses and saves them to ImageHub. The private `/api/product-jobs/:id/asset` route checks Firebase ownership. No raw image or private R2 path is included in the public catalog. Completed generation can be restored after reload without another model call; interrupted jobs without an output can be retried from their exact original brief.
- Shared Firebase writes now use the documented Firestore POST `documents:commit` API, bind `ownerId` from verified Firebase identity, retry transient errors once, refresh a rejected ID token once without switching users, and read back the exact image/owner/visibility before reporting success. Existing shared Firestore rules were not changed. HTTP status and a safe Firestore error code are kept for diagnosis; credentials and upstream raw messages are not logged. The old 502 log did not preserve its upstream cause, so this change does not claim an experimentally proven original root cause.
- Hub verification and local set attachment are separate stages. The set append uses a compare-and-swap retry and is idempotent. A saved-image retry retains existing review flags. Each result has a prompt history and reference/result comparison. Reference-only enlargement uses a single full-size view.
- Navigation labels stay on one line; vertical gaps and row heights are compact and the old large Milo promotion is a small link. All admin menu items were measured without inner scrolling in a 720px sidebar QA fixture. Very short screens retain accessible overflow instead of hiding functional controls.

## Project overwrite and preview incident repair (2026-10-28)
- Confirmed live state: project `1ad9cc85-eee9-49d9-bd0c-ebbf58d9b73e` originally contained the public food work; its same ID later held fashion work. Preserved food snapshots remain in `project_versions`. The cause was `ProductImages.useSet` spreading the previously cached project (including its ID/revision/publication identity) into the new product.
- Product-set use now opens `/studio?fromSet=...`; the protected server page reads only the owner's set and constructs a fresh document with no prior project ID, revision or publication fields. Sidebar/new-create links explicitly use `?new=1`. Existing projects load their authoritative saved state on the server; a resumed cached ID is re-read before editing.
- `incident-recovery.ts` performs a bounded, idempotent non-destructive data repair outside schema migrations: the latest complete food snapshot of that one confirmed incident record is inserted as a separate public recovered project, preserving the source owner. It does not alter the current fashion record, does not resurrect private/deleted source records, and keeps all original snapshots. Former food publication was observed in this conversation; the restored public copy restores that content's prior audience.
- History is no longer pruned on autosave. The dialog displays the latest 100 records while older server records remain stored.
- Draft writes are serialized by `DraftWriter`; queued snapshots share the resulting ID and incremented revision. Acknowledgements merge only metadata, retaining newer local copy/images. Each generated page is checkpointed immediately; a later generation failure preserves completed pages.
- Public projects use explicit `저장·웹진 동기화`: a manual save synchronizes the complete saved draft with its existing public snapshot. Autosaves/checkpoints remain private draft changes. New private projects remain private until explicitly published. A failed public sync still returns the successfully saved draft revision and a visible error.
- The project list and public market/detail re-read on focus, page restoration, visible-tab changes and local/cross-tab project change notices. Public refresh APIs always return only published snapshots, even for signed-in owners. The list exposes draft/public differences and an explicit sync button.
- Fixed the preview's `margin:auto` vertical centering beside a tall inspector by using top alignment and `margin:0 auto`; opening a completed editor focuses the preview. Browser QA measured a 0px difference between grid top and preview top beside a 3575px inspector.
- Generated image responses verify R2 object size before returning a URL. Public asset references are checked before a Firebase lookup; private assets still require verified ownership. Image components retry transient loads twice and also detect failure before hydration (an error event that otherwise would be missed). QA returned two 503s then a valid image: it recovered at `hubsheet_retry=2` without page reload. All temporary fixture routes were removed before publication.

## Public webzine and inquiries (2026-10-29)

- `/about`: public service introduction, category use cases, actual published examples, and anonymous inquiry form. Public copy emphasizes product quality and the production workflow; AI assistance is explained within the process.
- Search: public list/detail/about server-render their copy; raster details have a readable HTML transcript. Stable ID URLs, absolute canonical/OG/Twitter, escaped CreativeWork/BreadcrumbList/ItemList JSON-LD. URL-backed category/search/page links preserve filters and pagination. Internal search is noindex. Invalid category/page requests normalize to a valid URL.
- `sitemap.xml` queries all currently public, non-deleted snapshots (without the old 100-item cap), includes about and sample, and uses published timestamps. Database failure is not converted to a successful empty sitemap. `robots.txt` permits public pages and referenced assets and excludes workspace/private APIs. Editing routes retain noindex and authentication.
- My Projects: publish, sync and unpublish actions are owner-scoped and revision-checked. Unpublish preserves drafts/history/ID while removing anonymous detail and generated-image access plus sitemap/list membership. Delete uses recoverable trash. Consistent 33px card action buttons; native HTML dialogs replace editor `window.confirm`. Public checks validate copy/cover/page sources, probe rendered photos, and verify stored R2 files server-side before publication.
- Inquiry records live in D1 `inquiries` (schema-only migration 0004); public endpoint only accepts POST and returns a receipt. Explicit consent, schema validation, honeypot, per-IP hashed hourly rate limit, request-ID idempotency. The administrator alone can list and change statuses at `/admin/inquiries`; replies are manual via the supplied address, no automatic outbound email. Resolved records older than 365 days are purged on inquiry/admin access. No real email or paid model call is needed to test.
- Run `npm test`: existing storage/auth/generation regressions plus search HTML, metadata, pagination, JSON-LD escaping, project actions, publication validation, inquiry validation/idempotency/rate-limit/retention. Local browser QA confirmed inquiry receipt and matching D1 row, equal card action heights, public-cancel dialog and successful image preflight. Temporary QA route is removed from the release. Authenticated production publish/unpublish is not exercised against the user's real projects.
