# Kế hoạch phát hành landing EduFlow lên Vercel theo phiên bản

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Landing EduFlow chạy trên Vercel ở team đang chứa landing DocOps; push `main` và pull request chỉ ra preview, production chỉ lên khi đẩy tag `vX.Y.Z` khớp `version` trong `package.json`, qua workflow GitHub Actions có cổng CI xanh, kiểm `/version.json` từ ngoài và đường quay lại phiên bản trước.

**Architecture:** Vercel Git integration giữ nguyên cho preview, nhưng nhánh production của project đổi sang một nhánh không ai đẩy (`production-from-tags-only`). Workflow `release.yml` (bốn job: `gate`, `deploy`, `verify`, `github-release`) kiểm tag và CI rồi chạy `vercel pull`, `vercel build --prod`, `vercel deploy --prebuilt --prod --skip-domain`, `vercel promote`. Một chốt chặn trong `lib/env.ts` làm đỏ mọi bản dựng production cho Vercel không mang `RELEASE_TAG` của workflow; route tĩnh `/version.json` khai phiên bản, commit và môi trường của bản đang chạy.

**Tech Stack:** Next.js 16.3.7 (App Router, `proxy.ts`), Vitest 5, Playwright 1.63, `yaml` 2.9 (đã có), GitHub Actions (`actions/checkout` v7.0.1, `actions/setup-node` v7.0.0, `pnpm/action-setup` v6.1.0, ghim theo sha), Vercel CLI 61.1.0 qua `npx` (không vào `package.json`), Node 24 trên runner, script Node thuần (`.mjs`, chỉ module có sẵn của Node).

**Spec:** Brief thiết kế đã chốt với PO ngày 15/10/2026 (bản gốc ở scratchpad của phiên làm việc, không bền; mục "Yêu cầu đã chốt" dưới đây chép đủ phần bắt buộc). Bối cảnh DocOps: `../docops-application/.github/workflows/release.yml`, `../docops-application/packages/desktop/scripts/releaseTag.mjs`, `../docops-landing-page/README.md` mục "Deploy Vercel". Kế hoạch chạy song song: `docs/superpowers/plans/2026-10-15-eduflow-redesign-1-foundation-seo-content.md` ("Kế hoạch 1").

## Yêu cầu đã chốt (chép từ brief)

1. Nền tảng Vercel, project đặt ở **team đang chứa landing DocOps**, không phải tài khoản `lephus` đang đăng nhập CLI trên máy dev (tài khoản đó không có project nào của DocOps hay EduFlow). Người dùng tự đăng nhập team hoặc tự import trên dashboard; kế hoạch viết sẵn từng bước.
2. Cho Google index ngay khi site lên production (không có chế độ noindex tạm).
3. Production theo phiên bản, giống `release.yml` của DocOps application:
   - Push `main` và mọi pull request chỉ ra bản preview (Vercel Git integration).
   - Production chỉ lên khi gắn tag `vX.Y.Z` khớp `version` trong `package.json`; CI đỏ khi tag lệch. Commit phát hành dạng `chore(phat-hanh): EduFlow landing X.Y.Z`.
   - GitHub Actions dựng và deploy lên Vercel.
   - Số phiên bản và commit của bản đang chạy xem được ở một URL.
   - Quay lại phiên bản trước bằng promote/rollback bản production trước, và/hoặc chạy lại workflow với tag cũ.
4. Phiên bản đầu: `1.0.0` cho landing hiện tại trên `main`.
5. Nhánh làm việc tạo từ `main` trong một git worktree dưới `../eduflow-worktrees/`, không đụng cây làm việc của Kế hoạch 1.
6. Bước chỉ người dùng làm được (đăng nhập team Vercel, tạo token, DNS, secret GitHub, đẩy `main`, đẩy tag) tách riêng, ghi rõ là bước tay; kế hoạch dừng ở đó chờ.

## Dữ kiện đã kiểm (15/10/2026)

- `main` ở máy là `cb4d4fc`; `origin/main` trên GitHub vẫn là `eff101f` ("Initial commit", chỉ README). `main` ở máy đi trước 42 commit, nối tiếp `eff101f` (đẩy được kiểu fast-forward). CI (`ci.yml`) chưa chạy lần nào. Repo chưa có tag. `package.json` `version` là `0.1.0`.
- `lib/env.ts` `assertProductionEnv` chỉ chạy khi `VERCEL_ENV === 'production'`, gọi ở đầu `next.config.ts`. `components/site/AnalyticsGate.tsx` nhúng Vercel Analytics và Speed Insights khi có `NEXT_PUBLIC_VERCEL_ENV`.
- `proxy.ts` matcher `'/((?!api|_next|_vercel|.*\\..*).*)'`: đường dẫn có dấu chấm (như `/version.json`) không đi qua next-intl.
- Domain `eduflow.agentra.io.vn` có bản ghi A trỏ VPS `42.115.41.70` (VPS chung của app EduFlow và DocOps), VPS không phục vụ tên này.
- Kế hoạch 1, quyết định 15: chuyển `*.vercel.app` về domain chính chỉ khi `VERCEL_ENV === 'production'`, preview mang `X-Robots-Tag: noindex`. Lệnh SEO-AUDIT và bước seo-audit trên CI của Kế hoạch 1 dựng với `VERCEL_ENV=production` mà **không** có `VERCEL=1`.
- Vercel CLI 61.1.0 (đọc mã đã đóng gói, nguồn [V16]): `vercel build` nạp `.vercel/.env.<target>.local` bằng `dotenv.config` (không ghi đè biến đã có trong môi trường), đặt `VERCEL=1` trước khi dựng, cảnh báo "System environment variables will not be available" khi không chạy trên Vercel; `build` nằm trong danh sách lệnh không cần token; CLI đọc `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` từ biến môi trường.

## Quyết định thiết kế

| # | Quyết định | Lý do và nguồn | Cái giá |
|---|---|---|---|
| Q1 | **Chặn production tự động bằng hai lớp.** (a) Nhánh production của project Vercel là `production-from-tags-only` (Settings, Environments, Production, Branch Tracking), một nhánh không ai đẩy: mọi nhánh khác, gồm `main`, và mọi pull request thành preview [V2]. (b) `lib/env.ts`: bản dựng production cho Vercel (`VERCEL=1` và `VERCEL_ENV=production`) dừng nếu thiếu `RELEASE_TAG` dạng `vX.Y.Z`; chỉ workflow Release đặt biến này. | Vercel không cho tắt hẳn production branch tracking [V5]. `git.deploymentEnabled` trong `vercel.json` tắt mọi deploy của nhánh, kể cả preview của `main` [V3]; công thức "deploy theo tag" của chính Vercel tắt hẳn deploy từ Git [V4], nên mất preview. Tắt "Auto-assign Custom Production Domains" (bản production chờ promote) thì push `main` vẫn dựng production: không noindex và, sau Kế hoạch 1, `*.vercel.app` chuyển về domain chính, nên không xem được bản của `main`. Lớp (b) cần vì Vercel **luôn** dựng bản đầu tiên của project mới thành production, kể cả khi import [V1], và vì Redeploy hay "Promote to Production" của bản preview dựng lại trên Vercel với biến production [V11]. | Một cài đặt dashboard phải giữ đúng (ghi ở `docs/van-hanh.md`, mục 6 và 8.1). Bản dựng đầu tiên khi import luôn đỏ (cố ý). Nút Redeploy và Promote của bản preview không còn là đường lên production. |
| Q2 | **URL phiên bản là `/version.json`**, route handler sinh tĩnh (`dynamic = 'force-static'`) ở `app/version.json/route.ts`, trả `{"version","commit","environment"}` kèm `X-Robots-Tag: noindex`. | Matcher của `proxy.ts` đã bỏ qua đường dẫn có dấu chấm, nên không phải sửa `proxy.ts` (Kế hoạch 1 cũng sửa tệp này) và không bị next-intl viết lại thành `/vi/version` (404); `/version` không có đuôi sẽ rơi vào next-intl. Đuôi `.json` nói rõ đây là dữ liệu cho máy đọc (workflow đọc nó). Sitemap liệt kê trang theo danh sách cố định nên không chứa nó. Tĩnh nên không phụ thuộc runtime. | Thêm một Route Handler (README đang ghi "không có Route Handler"). |
| Q3 | **Commit và môi trường đặt tay lúc dựng production:** bước `vercel build` của workflow đặt `VERCEL_ENV=production`, `NEXT_PUBLIC_VERCEL_ENV=production`, `VERCEL_GIT_COMMIT_SHA=<sha của tag>`, `RELEASE_TAG=<tag>`. | Với `--prebuilt`, biến hệ thống của Vercel không có lúc dựng [V6]; `vercel pull` ghi biến không mang tiền tố framework, nên không có `NEXT_PUBLIC_VERCEL_ENV` [V9]. `vercel build` nạp tệp của `vercel pull` mà không ghi đè biến sẵn có [V16], nên giá trị của workflow thắng. `/version.json` khai `environment`, và job `verify` đòi `"production"`: chứng minh từ ngoài rằng bản dựng production có `VERCEL_ENV=production` (chốt chặn của `lib/env.ts` và quyết định 15 của Kế hoạch 1 dựa vào biến này). | Bốn biến được nêu tên trong workflow; đổi tên biến ở mã thì phải sửa cả workflow (test `release-workflow` giữ chúng khớp). |
| Q4 | **Cổng CI xanh:** job `gate` gọi GitHub API (`GET /repos/{repo}/actions/workflows/ci.yml/runs?head_sha=&event=push&branch=main`, quyền `actions: read`) [G3]; lần chạy mới nhất của đúng commit phải `success`. CI còn chạy thì chờ (tối đa 45 phút; chưa thấy lần chạy nào sau 10 phút thì đỏ). `ci.yml` đổi nhóm concurrency: trên `main` mỗi commit một nhóm theo sha nên không lần chạy nào bị huỷ. | Cho phép đẩy commit phát hành và tag cùng lúc. Với `cancel-in-progress: true` theo `github.ref` như hiện nay, một push nhanh sau commit phát hành sẽ huỷ CI của commit đó và chặn phát hành. | Job `gate` giữ runner trong lúc chờ CI (repo công khai: phút chạy miễn phí). CI của `main` có thể chạy song song khi push dồn dập. |
| Q5 | **Deploy ở trạng thái chờ rồi promote:** `vercel deploy --prebuilt --prod --skip-domain`, rồi `vercel promote <url>`. | Sau Instant Rollback, Vercel tắt tự gán domain production; bản production mới không tự lên cho tới khi promote [V12]. `--skip-domain` + `promote` lên được trong mọi trạng thái, không dựng lại [V6][V11], và `promote` bật lại tự gán. | Thêm một lệnh; cửa sổ vài giây giữa deploy và promote mà domain vẫn là bản cũ. |
| Q6 | **Quay lại:** (1) Instant Rollback trên dashboard hoặc `vercel rollback <url>`, tìm URL theo `vercel list --prod -m releaseTag=vX.Y.Z` (workflow gắn `--meta releaseTag`, `releaseSha`) [V12][V13]; (2) chạy tay workflow Release với tag cũ (dựng lại mã của tag với biến hiện tại). | (1) nhanh, không dựng lại; (2) dùng khi bản cũ không còn hay khi biến môi trường đã đổi. | Gói Hobby chỉ rollback được về bản ngay trước [V12]. |
| Q7 | **Script kiểm (tag, CI, kiểm từ ngoài) là `.mjs` thuần có unit test**; `gate` và `verify` chạy script của chính commit chứa workflow, `deploy` chỉ dựng mã của commit được gắn tag và không chạy script nào của repo. | Khi chạy tay với tag cũ, workflow là của `main`: script cùng commit với workflow thì giao diện dòng lệnh luôn khớp. | Ba tệp script, ba tệp test. |
| Q8 | **Bảo mật workflow:** không trigger pull request; `permissions: {}` ở gốc, mỗi job xin đúng quyền; secret Vercel chỉ ở job `deploy` dưới environment `production` (chỉ nhận `main` và tag `v*`) [G2]; `VERCEL_TOKEN` chỉ ở bước `pull` và `deploy`/`promote` (không ở `pnpm install`, `vercel build`); action ghim theo sha 40 ký tự; không dùng cache của Actions; mọi giá trị vào shell qua `env`, không có `${{ }}` trong `run`. | Repo công khai; mã phụ thuộc chạy lúc cài và dựng không nhìn thấy token; cache dùng chung có thể bị nhiễm [G6]. | Cài sạch mỗi lần phát hành (chậm hơn khoảng một phút). |
| Q9 | **Concurrency của Release:** nhóm `release-production`, `cancel-in-progress: false`, không dùng `queue: max`. | Một lượt mỗi lần, lượt đang chạy không bị huỷ. `queue: max` giữ mọi lượt chờ nhưng thứ tự không bảo đảm [G1], có thể kết thúc ở bản cũ hơn; mặc định giữ một lượt chờ, lượt chờ cũ bị thay bằng lượt mới hơn, nên bản cuối cùng là lượt được yêu cầu sau cùng. | Lượt chờ bị thay hiện "cancelled"; chạy lại nếu cần. |
| Q10 | **GitHub Release** với `--generate-notes`, chỉ khi đẩy tag; job riêng có `contents: write`. | Lịch sử phiên bản và ghi chú tự sinh, rẻ. Chạy tay (dựng lại tag cũ) không tạo release mới. | Một job, một quyền ghi. |
| Q11 | **Token Vercel theo project** (Scope: team, rồi project) [V14]; nếu CLI báo 403 thì đổi sang token theo team. | Phạm vi hẹp nhất. | Chưa kiểm được CLI có chạy đủ lệnh với token theo project (xem "Chưa kiểm được"). |

## Global Constraints

- Node ≥ 22.18, pnpm 9.15.0. Không thêm phụ thuộc runtime hay dev nào. Vercel CLI chỉ dùng trong workflow qua `npx --yes vercel@61.1.0` (biến `VERCEL_CLI`), không vào `package.json`.
- Domain chính thức: `https://eduflow.agentra.io.vn`. Production cho Google index ngay: không thêm noindex nào cho trang; riêng `/version.json` mang `X-Robots-Tag: noindex`.
- Production chỉ lên qua workflow Release từ tag `vX.Y.Z` khớp `version` trong `package.json` của commit được gắn tag; commit đó nằm trên `main` và có CI xanh. Push `main` và pull request chỉ ra preview.
- Commit phát hành: `chore(phat-hanh): EduFlow landing X.Y.Z`. Phiên bản đầu: `1.0.0`.
- Không bao giờ đặt `RELEASE_TAG`, `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA` trong Environment Variables của Vercel.
- Tiếng Việt cho chú thích mã, tài liệu, thông điệp commit; tên test tiếng Anh. **Không ký tự U+2014 và U+2013 ở bất kỳ tệp nào** (`tests/unit/content.test.ts` quét U+2014 trong mọi tệp nguồn, kể cả `.github`).
- Commit theo kiểu repo: `feat(release): ...`, `ci(release): ...`, `docs(ops): ...`, `docs(plan): ...`, `chore(phat-hanh): ...`. Không `git add -A`: chỉ add đúng tệp của task (Next có thể tự ghi `AGENTS.md`, `CLAUDE.md`).
- `pnpm verify` xanh trước mỗi commit.
- Làm trong worktree `../eduflow-worktrees/release-vercel`, nhánh `feat/release-vercel` tạo từ `main` (`cb4d4fc`). Không sửa, không chạy lệnh ghi nào trong cây làm việc chính (`eduflow-landing-page/`, nhánh `feat/redesign-seo-docs` của Kế hoạch 1).
- Người thực thi (agent) không chạy lệnh ghi nào của Vercel hay GitHub (`vercel link`, `vercel deploy`, `vercel env add`, `gh secret set`, `git push`, tạo ruleset...). Mọi việc đó nằm ở các task "BƯỚC TAY".

## Review Focus

1. **Commit phát hành và tag được đẩy cùng lúc** (`git push origin main v1.0.1`): lúc `gate` chạy, CI của commit chưa được tạo hoặc đang chạy; mong đợi `gate` chờ (tới 10 phút để thấy lần chạy, 45 phút để xong) chứ không đỏ ngay. Test: Task 4 (`waits while CI is missing or running, then returns the green run`).
2. **CI đỏ vì lỗi thoáng qua rồi được chạy lại xanh** (cùng run, hoặc một run mới hơn cho cùng commit): `gate` coi là xanh; nếu run mới nhất đỏ thì đỏ. Test: Task 4 (`the newest run of the commit decides`).
3. **Ô `tag` khi chạy tay nhận chuỗi lạ** (`--upload-pack=...`, `v1.0.0;id`, `v1.0`, có khoảng trắng) hoặc một tag annotated: chuỗi lạ bị từ chối trước mọi lệnh git; tag annotated giải ra commit như tag thường. Test: Task 3.
4. **Project đang ở trạng thái sau Instant Rollback, và `npx` in thêm dòng trước URL:** lần phát hành kế tiếp vẫn lên production nhờ `--skip-domain` rồi `promote` đúng URL vừa tạo; không có URL thì dừng trước `promote`. Test: Task 6 (chạy bước deploy với `npx` giả).
5. **Bản dựng production ngoài Vercel** (bước seo-audit của Kế hoạch 1: `VERCEL_ENV=production`, không có `VERCEL=1`) không bị chốt chặn mới làm đỏ; còn lần dựng production Vercel tự tạo khi import (chưa có biến nào) đỏ với thông báo chỉ đúng nguyên nhân. Test: Task 1.

## Bản đồ tệp

| Tệp | Trách nhiệm | Task |
|---|---|---|
| `lib/env.ts`, `tests/unit/env.test.ts` | Chốt chặn: production cho Vercel cần `RELEASE_TAG` | 1 |
| `lib/release.ts` | `buildInfo()`: phiên bản, commit, môi trường của bản dựng | 2 |
| `app/version.json/route.ts` | Route tĩnh `/version.json` | 2 |
| `tests/unit/release-info.test.ts`, `tests/e2e/version.spec.ts` | Test của `buildInfo`, route, sitemap, bản dựng | 2 |
| `scripts/release-tag.mjs`, `tests/unit/release-tag.test.ts` | Tag đúng dạng, nằm trên `main`, khớp `package.json` | 3 |
| `scripts/release-ci.mjs`, `tests/unit/release-ci.test.ts` | Cổng CI xanh của đúng commit | 4 |
| `scripts/release-verify.mjs`, `tests/unit/release-verify.test.ts` | Kiểm `/version.json` trên domain chính | 5 |
| `.github/workflows/release.yml`, `tests/unit/release-workflow.test.ts` | Workflow phát hành và test cấu hình | 6 |
| `.github/workflows/ci.yml`, `tests/unit/ci-config.test.ts` | Concurrency của CI không huỷ lần chạy của `main` | 6 |
| `README.md`, `docs/van-hanh.md` | Thiết lập Vercel, phát hành, quay lại | 7 |
| `package.json` | `version` 1.0.0 | 8 |

## Lệnh dùng chung

Mọi lệnh chạy từ gốc worktree `../eduflow-worktrees/release-vercel`.

**CỔNG-TRỐNG.** Cổng 3200, 3300, 3301 dùng chung với cây làm việc của Kế hoạch 1 (cùng máy, cùng cổng e2e). Ở máy cục bộ Playwright dùng lại máy chủ đang nghe trên cổng đó, nên test sẽ chạy nhầm bản dựng của cây kia mà không báo gì.

```bash
lsof -nP -iTCP:3200 -iTCP:3300 -iTCP:3301 -sTCP:LISTEN    # không in gì là cả ba cổng trống
```

Có tiến trình đang nghe: xem `lsof -p <PID> | grep cwd`. Thuộc cây làm việc của Kế hoạch 1 thì **chờ**, không kill; thuộc worktree này thì dừng đúng PID đó.

**E2E-FEED:**

```bash
export NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST
# CỔNG-TRỐNG trước
node scripts/serve-fixtures.mjs & FEED_PID=$!
DOWNLOAD_FEED_URL=http://localhost:3300/ NEXT_PUBLIC_SITE_URL=https://eduflow.example.test pnpm build
E2E_MODE=feed DOWNLOAD_FEED_URL=http://localhost:3300/ pnpm e2e
kill $FEED_PID
```

Kỳ vọng: mọi test xanh. Chỉ một tệp spec: thêm đường dẫn tệp sau `pnpm e2e`.

**KHÔNG-GẠCH-DÀI** (kiểm U+2014 và U+2013 trong các tệp đã đổi so với `main`):

```bash
git diff --name-only main | xargs grep -n -e "$(printf '\xe2\x80\x94')" -e "$(printf '\xe2\x80\x93')" ; echo "grep exit=$?"
```

Kỳ vọng: không in dòng nào ngoài `grep exit=1`.

## Chuẩn bị (một lần, trước Task 1)

- [ ] **Bước 1: Tạo worktree từ `main`**

```bash
cd /Users/lehuuphu/Documents/workspace/AGENTRA-JSC/eduflow-landing-page
git worktree add ../eduflow-worktrees/release-vercel -b feat/release-vercel main
cd ../eduflow-worktrees/release-vercel
git log --oneline -1        # cb4d4fc docs(plan): phụ lục các quyết định khi thực thi (Ruling 1 tới 62)
pnpm install --frozen-lockfile
pnpm verify                 # xanh trước khi sửa gì
```

- [ ] **Bước 2: Đưa kế hoạch này vào nhánh**

Tệp kế hoạch nằm, chưa commit, ở cây làm việc chính. Chép vào worktree và commit để kế hoạch đi cùng mã:

```bash
cp /Users/lehuuphu/Documents/workspace/AGENTRA-JSC/eduflow-landing-page/docs/superpowers/plans/2026-10-15-eduflow-landing-release-vercel.md docs/superpowers/plans/
pnpm verify
git add docs/superpowers/plans/2026-10-15-eduflow-landing-release-vercel.md
git commit -m "docs(plan): kế hoạch phát hành landing lên Vercel theo phiên bản"
```

---

### Task 1: Chốt chặn: production cho Vercel chỉ dựng từ workflow Release

**Files:**
- Modify: `lib/env.ts` (toàn tệp, 19 dòng)
- Test: `tests/unit/env.test.ts` (thêm vào cuối)

**Interfaces:**
- Consumes: không.
- Produces: `assertProductionEnv(env: Record<string, string | undefined>): void` giữ nguyên chữ ký, thêm luật: khi `env.VERCEL_ENV === 'production'` và `env.VERCEL === '1'`, `env.RELEASE_TAG` phải khớp `/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/`, nếu không ném `Error` có chuỗi `workflow Release`. Hợp đồng với Task 6: bước `vercel build` của `release.yml` đặt `RELEASE_TAG` bằng tag đã kiểm.

- [ ] **Step 1: Viết test hỏng**

Thêm vào cuối `tests/unit/env.test.ts`:

```ts
// Workflow Release (docs/van-hanh.md, mục 8) là đường duy nhất lên production: bản dựng cho Vercel thiếu RELEASE_TAG thì dừng.
const vercelProduction = (tag?: string) => ({ VERCEL: '1', VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test', RELEASE_TAG: tag })

test('a production build for Vercel needs the RELEASE_TAG that only the Release workflow sets', () => {
  expect(() => assertProductionEnv(vercelProduction())).toThrow(/workflow Release/)
  expect(() => assertProductionEnv(vercelProduction('v1.0.0'))).not.toThrow()
  expect(() => assertProductionEnv(vercelProduction('v12.3.40'))).not.toThrow()
})

// Review Focus 5: Vercel luôn dựng bản đầu tiên của project mới thành production, kể cả khi import, lúc chưa có biến nào.
test('the first production build Vercel makes on import fails on the release rule, before any variable is set', () => {
  expect(() => assertProductionEnv({ VERCEL: '1', VERCEL_ENV: 'production' })).toThrow(/workflow Release/)
})

test.each(['1.0.0', 'v1.0', 'v1.0.0-rc.1', ' v1.0.0', 'v01.0.0', 'latest', ''])('a Vercel production build refuses RELEASE_TAG %j', (tag) => {
  expect(() => assertProductionEnv(vercelProduction(tag))).toThrow(/workflow Release/)
})

// Review Focus 5: bước seo-audit trên CI của đợt thiết kế lại dựng với VERCEL_ENV=production nhưng không có VERCEL=1.
test('Vercel previews and production builds outside Vercel do not need RELEASE_TAG', () => {
  expect(() => assertProductionEnv({ VERCEL: '1', VERCEL_ENV: 'preview' })).not.toThrow()
  expect(() => assertProductionEnv({ VERCEL_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://x.test' })).not.toThrow()
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/env.test.ts`
Kỳ vọng: FAIL ở `a production build for Vercel needs the RELEASE_TAG...` (dòng đầu không ném), ở `the first production build...` (ném thông báo `NEXT_PUBLIC_SITE_URL phải được đặt`, không khớp `/workflow Release/`) và ở cả bảy ca `refuses RELEASE_TAG`. Các test cũ và test cuối PASS.

- [ ] **Step 3: Viết lại `lib/env.ts`**

```ts
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '0.0.0.0'])
// Tag phát hành vX.Y.Z: không số 0 thừa ở đầu, không hậu tố. Cùng mẫu với TAG_PATTERN của scripts/release-tag.mjs.
const RELEASE_TAG_PATTERN = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

/**
 * Chốt chặn của bản dựng production, gọi ở đầu next.config.ts.
 *
 * 1. Dựng cho Vercel (`VERCEL=1`: Vercel tự dựng, hoặc `vercel build`) phải có `RELEASE_TAG` dạng vX.Y.Z, biến mà chỉ workflow
 *    Release đặt sau khi kiểm tag (docs/van-hanh.md, mục 8). Nhờ đó lần dựng production đầu tiên Vercel tự tạo khi import repo,
 *    nút Redeploy và "Promote to Production" của bản preview (cả hai dựng lại trên Vercel), và `vercel --prod` từ máy cá nhân đều
 *    dừng. Dựng production ngoài Vercel (ví dụ bước seo-audit trên CI) không có `VERCEL=1` nên không cần biến này.
 * 2. Phải có domain thật, nếu không canonical và sitemap sẽ trỏ về localhost (spec §11).
 */
export function assertProductionEnv(env: Record<string, string | undefined>): void {
  if (env.VERCEL_ENV !== 'production') return
  if (env.VERCEL === '1' && !RELEASE_TAG_PATTERN.test(env.RELEASE_TAG ?? '')) {
    throw new Error(
      'Bản production chỉ được dựng bởi workflow Release từ một tag vX.Y.Z (RELEASE_TAG thiếu hoặc sai dạng). Xem docs/van-hanh.md, mục 8.',
    )
  }
  const raw = (env.NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (!raw) throw new Error('NEXT_PUBLIC_SITE_URL phải được đặt cho build production (OQ-L01).')
  let real = false
  try {
    const { protocol, hostname } = new URL(raw)
    real = (protocol === 'http:' || protocol === 'https:') && !LOCAL_HOSTS.has(hostname) && !hostname.endsWith('.localhost')
  } catch {
    // Không phải URL: giữ real = false.
  }
  if (!real) throw new Error('NEXT_PUBLIC_SITE_URL phải là URL http(s) đầy đủ, không trỏ về localhost, cho build production (OQ-L01).')
}
```

- [ ] **Step 4: Chạy test để thấy qua**

Chạy: `pnpm vitest run tests/unit/env.test.ts`
Kỳ vọng: PASS toàn tệp (test cũ không có `VERCEL` nên không đổi kết quả).

- [ ] **Step 5: Kiểm thật qua `next.config.ts`**

```bash
VERCEL=1 VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn pnpm build 2>&1 | grep -m 1 "workflow Release"
```

Kỳ vọng: in một dòng chứa `Bản production chỉ được dựng bởi workflow Release`, build dừng trước khi biên dịch. Không in gì nghĩa là `next.config.ts` không gọi `assertProductionEnv(process.env)` ở đầu tệp: dừng và báo lại.

- [ ] **Step 6: `pnpm verify` rồi commit**

```bash
pnpm verify
git add lib/env.ts tests/unit/env.test.ts
git commit -m "feat(release): bản production cho Vercel chỉ dựng được từ workflow Release (RELEASE_TAG)"
```

---

### Task 2: `/version.json`: phiên bản, commit và môi trường của bản dựng

**Files:**
- Create: `lib/release.ts`, `app/version.json/route.ts`
- Test: `tests/unit/release-info.test.ts`, `tests/e2e/version.spec.ts`

**Interfaces:**
- Consumes: `package.json` (`version`).
- Produces:
  - `lib/release.ts`: `type BuildInfo = { version: string; commit: string | null; environment: string | null }`; `buildInfo(env?: Record<string, string | undefined>, version?: string): BuildInfo` (mặc định `process.env` và `version` của `package.json`). `commit` lấy từ `VERCEL_GIT_COMMIT_SHA` khi là sha 40 ký tự hex thường, ngược lại `null`; `environment` lấy từ `VERCEL_ENV` đã trim, rỗng thì `null`.
  - `GET /version.json`: `200`, `Content-Type: application/json`, `X-Robots-Tag: noindex`, thân đúng ba khoá `version`, `commit`, `environment`. Hợp đồng với Task 5 và Task 6: bản production do workflow dựng trả `{"version":"<X.Y.Z>","commit":"<sha của tag>","environment":"production"}`.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/release-info.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { afterEach, expect, test, vi } from 'vitest'
import { dynamic, GET } from '@/app/version.json/route'
import sitemap from '@/app/sitemap'
import { buildInfo } from '@/lib/release'

// Sitemap không đọc feed hay snapshot thật trong test này.
vi.mock('@/lib/releases/feed', () => ({ fetchFeed: async () => null }))
vi.mock('@/lib/releases/snapshot', () => ({ releaseSnapshot: { baseUrl: null, windows: null, mac: null } }))

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }
const SHA = '0123456789abcdef0123456789abcdef01234567'

afterEach(() => vi.unstubAllEnvs())

test('build info carries the package version, the commit and the Vercel environment of the build', () => {
  expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: SHA, VERCEL_ENV: 'production' }, '1.2.3')).toEqual({ version: '1.2.3', commit: SHA, environment: 'production' })
  expect(buildInfo({}).version).toBe(pkg.version)
})

test('a build outside Vercel, or with a malformed commit, reports null rather than a guess', () => {
  expect(buildInfo({}, '1.0.0')).toEqual({ version: '1.0.0', commit: null, environment: null })
  for (const bad of ['', 'abc123', SHA.toUpperCase(), `${SHA}0`]) expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: bad }, '1.0.0').commit).toBeNull()
  expect(buildInfo({ VERCEL_GIT_COMMIT_SHA: ` ${SHA}\n` }, '1.0.0').commit).toBe(SHA)
  expect(buildInfo({ VERCEL_ENV: '  ' }, '1.0.0').environment).toBeNull()
})

test('/version.json is static JSON that search engines must not index', async () => {
  vi.stubEnv('VERCEL_GIT_COMMIT_SHA', SHA)
  vi.stubEnv('VERCEL_ENV', 'preview')
  const res = GET()
  expect(dynamic).toBe('force-static')
  expect(res.headers.get('x-robots-tag')).toBe('noindex')
  expect(res.headers.get('content-type')).toContain('application/json')
  expect(await res.json()).toEqual({ version: pkg.version, commit: SHA, environment: 'preview' })
})

test('the sitemap does not list /version.json', async () => {
  const urls = (await sitemap()).map((e) => e.url)
  expect(urls.length).toBeGreaterThan(0)
  expect(urls.filter((u) => u.includes('version'))).toEqual([])
})
```

`tests/e2e/version.spec.ts`:

```ts
import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }

// docs/van-hanh.md, mục 8: workflow Release đọc tệp này trên domain chính để biết bản vừa promote đã chạy.
test('/version.json names the version of the build, outside the locale routing and the index', async ({ request }) => {
  const res = await request.get('/version.json', { maxRedirects: 0 })
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('application/json')
  expect(res.headers()['x-robots-tag']).toBe('noindex')
  const body = await res.json()
  expect(Object.keys(body).sort()).toEqual(['commit', 'environment', 'version'])
  expect(body.version).toBe(version)
  expect(body.commit === null || /^[0-9a-f]{40}$/.test(body.commit)).toBe(true)
})

test('/version.json is prerendered at build time, not rendered per request', () => {
  const manifest = JSON.parse(readFileSync('.next/prerender-manifest.json', 'utf8')) as { routes: Record<string, unknown> }
  expect(Object.keys(manifest.routes)).toContain('/version.json')
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/release-info.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/app/version.json/route"`.

- [ ] **Step 3: Viết `lib/release.ts`**

```ts
import pkg from '@/package.json'

export type BuildInfo = { version: string; commit: string | null; environment: string | null }

const COMMIT_SHA = /^[0-9a-f]{40}$/

/**
 * Phiên bản, commit và môi trường của bản dựng, trả ở /version.json (docs/van-hanh.md, mục 8). Đọc lúc dựng vì route sinh tĩnh.
 * Bản preview do Vercel dựng từ Git có sẵn VERCEL_GIT_COMMIT_SHA và VERCEL_ENV. Bản production do workflow Release dựng bằng
 * `vercel build`, nơi Vercel không cấp biến hệ thống, nên workflow tự đặt hai biến này. Dựng ở máy hay CI: commit và môi trường là null.
 */
export function buildInfo(env: Record<string, string | undefined> = process.env, version: string = pkg.version): BuildInfo {
  const commit = (env.VERCEL_GIT_COMMIT_SHA ?? '').trim()
  const environment = (env.VERCEL_ENV ?? '').trim()
  return { version, commit: COMMIT_SHA.test(commit) ? commit : null, environment: environment || null }
}
```

- [ ] **Step 4: Viết `app/version.json/route.ts`**

```ts
import { buildInfo } from '@/lib/release'

// Sinh tĩnh lúc dựng: phiên bản và commit là của bản dựng, không đổi theo request. Đường dẫn có dấu chấm nên proxy.ts (next-intl) bỏ qua.
export const dynamic = 'force-static'

export function GET() {
  // Site cho máy tìm kiếm index mọi trang; riêng tệp này thì không (và không nằm trong sitemap).
  return Response.json(buildInfo(), { headers: { 'X-Robots-Tag': 'noindex' } })
}
```

- [ ] **Step 5: Chạy unit test để thấy qua**

Chạy: `pnpm vitest run tests/unit/release-info.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.

- [ ] **Step 6: Kiểm bản dựng có biến của workflow**

```bash
# CỔNG-TRỐNG trước
VERCEL_ENV=production VERCEL_GIT_COMMIT_SHA=$(git rev-parse HEAD) NEXT_PUBLIC_SITE_URL=https://eduflow.example.test DOWNLOAD_FEED_URL= pnpm build
grep -c '"/version.json"' .next/prerender-manifest.json        # 1 hoặc hơn
pnpm start -p 3200 & APP_PID=$!
curl --retry 20 --retry-connrefused --retry-delay 1 -fsS http://localhost:3200/version.json; echo
curl -sI http://localhost:3200/version.json | grep -i x-robots-tag
kill $APP_PID
```

Kỳ vọng: dòng JSON `{"version":"0.1.0","commit":"<sha của HEAD>","environment":"production"}`; dòng header `x-robots-tag: noindex`. (Lệnh này có `VERCEL_ENV=production` mà không có `VERCEL=1`, nên chốt chặn của Task 1 chỉ đòi domain thật.) Nếu `grep -c` in `0` mà log build liệt kê `/version.json` là tĩnh (ký hiệu `○`): đổi test thứ hai của `tests/e2e/version.spec.ts` thành kiểm `existsSync('.next/server/app/version.json.body')` (import `existsSync` từ `node:fs`) và ghi lý do trong commit.

- [ ] **Step 7: E2E**

Chạy E2E-FEED (toàn bộ).
Kỳ vọng: PASS, gồm hai test của `version.spec.ts`.

- [ ] **Step 8: Commit**

```bash
git add lib/release.ts app/version.json/route.ts tests/unit/release-info.test.ts tests/e2e/version.spec.ts
git commit -m "feat(release): /version.json khai phiên bản, commit và môi trường của bản dựng"
```

---

### Task 3: `scripts/release-tag.mjs`: tag đúng dạng, nằm trên `main`, khớp `package.json`

**Files:**
- Create: `scripts/release-tag.mjs`
- Test: `tests/unit/release-tag.test.ts`

**Interfaces:**
- Consumes: không.
- Produces (Task 6 dùng):
  - `TAG_PATTERN: RegExp` (`/^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/`).
  - `tagMatchesVersion(tag: string, version: string): boolean`.
  - `checkReleaseTag(tag: string, options?: { cwd?: string; mainRef?: string }): { tag: string; sha: string; version: string }` (mặc định `cwd = process.cwd()`, `mainRef = 'origin/main'`); ném `Error` với thông báo tiếng Việt.
  - CLI: `node scripts/release-tag.mjs <tag>`: thành công thì ghi `tag=<tag>`, `sha=<sha>`, `version=<X.Y.Z>` (mỗi khoá một dòng) vào tệp `$GITHUB_OUTPUT` và thoát 0; lỗi thì in `::error::<thông báo>` ra stdout, không ghi gì, thoát 1.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/release-tag.test.ts`:

```ts
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, beforeAll, expect, test } from 'vitest'
import { checkReleaseTag, tagMatchesVersion } from '@/scripts/release-tag.mjs'

const SCRIPT = resolve('scripts/release-tag.mjs')
const GIT_ENV = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' }
// Bỏ ký commit và hook của máy dev: repo tạm phải giống nhau ở mọi máy.
const git = (cwd: string, ...args: string[]) =>
  execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'tag.gpgsign=false', '-c', 'core.hooksPath=/dev/null', ...args], {
    cwd,
    env: GIT_ENV,
    encoding: 'utf8',
  }).trim()

let root = ''
let repo = ''
const sha: Record<string, string> = {}
const OPTS = () => ({ cwd: repo, mainRef: 'main' })

function commit(version: string, message: string): string {
  writeFileSync(join(repo, 'package.json'), `${JSON.stringify({ name: 'x', version })}\n`)
  git(repo, 'add', 'package.json')
  git(repo, 'commit', '-q', '-m', message)
  return git(repo, 'rev-parse', 'HEAD')
}

beforeAll(() => {
  root = mkdtempSync(join(tmpdir(), 'release-tag-'))
  repo = join(root, 'repo')
  git(root, 'init', '-q', '-b', 'main', repo)
  sha.v100 = commit('1.0.0', 'chore(phat-hanh): 1.0.0')
  git(repo, 'tag', 'v1.0.0')
  sha.v110 = commit('1.1.0', 'chore(phat-hanh): 1.1.0')
  git(repo, 'tag', '-a', 'v1.1.0', '-m', 'EduFlow landing 1.1.0')
  sha.noBump = commit('1.1.0', 'fix: quên nâng version')
  git(repo, 'tag', 'v1.2.0')
  // origin/main như sau checkout fetch-depth 0 trên GitHub Actions: CLI mặc định đọc ref này.
  git(repo, 'update-ref', 'refs/remotes/origin/main', 'main')
  git(repo, 'checkout', '-q', '-b', 'side')
  sha.side = commit('1.3.0', 'side')
  git(repo, 'tag', 'v1.3.0')
  git(repo, 'checkout', '-q', 'main')
})
afterAll(() => rmSync(root, { recursive: true, force: true }))

test('a release tag is vX.Y.Z and must name the version package.json carries', () => {
  expect(tagMatchesVersion('v1.0.0', '1.0.0')).toBe(true)
  expect(tagMatchesVersion('v1.0.1', '1.0.0')).toBe(false)
  expect(tagMatchesVersion('1.0.0', '1.0.0')).toBe(false)
  expect(tagMatchesVersion('v1.0.0-rc.1', '1.0.0-rc.1')).toBe(false)
  expect(tagMatchesVersion('v1.0', '1.0')).toBe(false)
  expect(tagMatchesVersion('v01.0.0', '01.0.0')).toBe(false)
})

// Review Focus 3: tag annotated (git tag -a) giải ra commit như tag thường.
test('a tag on main whose package.json matches resolves to its commit, lightweight or annotated', () => {
  expect(checkReleaseTag('v1.0.0', OPTS())).toEqual({ tag: 'v1.0.0', sha: sha.v100, version: '1.0.0' })
  expect(checkReleaseTag('v1.1.0', OPTS())).toEqual({ tag: 'v1.1.0', sha: sha.v110, version: '1.1.0' })
})

test('refuses a tag off main, a tag that does not match package.json, and an unknown tag', () => {
  expect(() => checkReleaseTag('v1.3.0', OPTS())).toThrow(/không nằm trên main/)
  expect(() => checkReleaseTag('v1.2.0', OPTS())).toThrow(/không khớp version 1\.1\.0/)
  expect(() => checkReleaseTag('v9.9.9', OPTS())).toThrow(/Không thấy tag v9\.9\.9/)
})

test('refuses when the main ref is missing, as after a shallow checkout', () => {
  expect(() => checkReleaseTag('v1.0.0', { cwd: repo, mainRef: 'origin/khong-co' })).toThrow(/fetch-depth: 0/)
})

// Review Focus 3: chuỗi lạ từ ô nhập tay bị từ chối trước mọi lệnh git (cwd không tồn tại: git chạy thì lỗi đã khác).
test.each(['--upload-pack=touch x', 'v1.0.0;id', 'v1.0', 'main', '', 'v1.0.0 ', 'refs/tags/v1.0.0'])('refuses %j before running git', (tag) => {
  expect(() => checkReleaseTag(tag, { cwd: join(root, 'khong-co'), mainRef: 'main' })).toThrow(/không có dạng vX\.Y\.Z/)
})

test('the CLI writes tag, sha and version to GITHUB_OUTPUT, or prints ::error:: and writes nothing', () => {
  const output = join(root, 'github-output')
  writeFileSync(output, '')
  const ok = spawnSync(process.execPath, [SCRIPT, 'v1.0.0'], { cwd: repo, env: { ...process.env, GITHUB_OUTPUT: output }, encoding: 'utf8' })
  expect(ok.status).toBe(0)
  expect(readFileSync(output, 'utf8')).toBe(`tag=v1.0.0\nsha=${sha.v100}\nversion=1.0.0\n`)

  writeFileSync(output, '')
  const bad = spawnSync(process.execPath, [SCRIPT, 'v1.2.0'], { cwd: repo, env: { ...process.env, GITHUB_OUTPUT: output }, encoding: 'utf8' })
  expect(bad.status).toBe(1)
  expect(bad.stdout).toMatch(/^::error::Tag v1\.2\.0 không khớp version 1\.1\.0/m)
  expect(readFileSync(output, 'utf8')).toBe('')
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/release-tag.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/scripts/release-tag.mjs"`.

- [ ] **Step 3: Viết `scripts/release-tag.mjs`**

```js
// Kiểm một tag trước khi phát hành production (docs/van-hanh.md, mục 8), như releaseTag.mjs của DocOps application: tag có dạng
// vX.Y.Z, trỏ tới một commit nằm trên main, và khớp `version` trong package.json của chính commit đó. Hàm thuần cho
// tests/unit/release-tag.test.ts; CLI cho .github/workflows/release.yml:
//   node scripts/release-tag.mjs <tag>     ghi tag, sha, version vào $GITHUB_OUTPUT; sai thì in ::error:: và thoát 1
import { execFileSync } from 'node:child_process'
import { appendFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

/** vX.Y.Z, không số 0 thừa ở đầu, không hậu tố. lib/env.ts chép đúng mẫu này cho chốt chặn lúc dựng. */
export const TAG_PATTERN = /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

/**
 * @param {string} tag
 * @param {string} version
 * @returns {boolean}
 */
export function tagMatchesVersion(tag, version) {
  return TAG_PATTERN.test(tag) && tag === `v${version}`
}

/**
 * @param {string} tag
 * @param {{ cwd?: string, mainRef?: string }} [options]  mainRef: nhánh main đã fetch (trên GitHub Actions là origin/main)
 * @returns {{ tag: string, sha: string, version: string }}
 */
export function checkReleaseTag(tag, { cwd = process.cwd(), mainRef = 'origin/main' } = {}) {
  // Kiểm dạng trước mọi lệnh git: chuỗi lạ từ ô nhập tay (ví dụ bắt đầu bằng "-") không bao giờ tới git.
  if (!TAG_PATTERN.test(tag)) throw new Error(`Tag "${tag}" không có dạng vX.Y.Z (ví dụ v1.0.0).`)
  /** @param {...string} args */
  const git = (...args) => execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  /**
   * @param {string} ref
   * @returns {string | null}
   */
  const commitOf = (ref) => {
    try {
      return git('rev-parse', '--verify', '--quiet', `${ref}^{commit}`)
    } catch {
      return null
    }
  }
  const sha = commitOf(`refs/tags/${tag}`)
  if (!sha) throw new Error(`Không thấy tag ${tag} trong repo.`)
  if (!commitOf(mainRef)) throw new Error(`Không thấy ${mainRef}: checkout phải lấy đủ lịch sử và tag (fetch-depth: 0).`)
  try {
    git('merge-base', '--is-ancestor', sha, mainRef)
  } catch {
    throw new Error(`Tag ${tag} trỏ tới ${sha}, commit này không nằm trên main: hoà vào main rồi gắn tag lên commit của main.`)
  }
  const { version } = JSON.parse(git('show', `${sha}:package.json`))
  if (!tagMatchesVersion(tag, version)) {
    throw new Error(`Tag ${tag} không khớp version ${version} trong package.json của commit ${sha}: nâng version bằng commit phát hành rồi gắn tag mới.`)
  }
  return { tag, sha, version }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { tag, sha, version } = checkReleaseTag(process.argv[2] ?? '')
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `tag=${tag}\nsha=${sha}\nversion=${version}\n`)
    console.log(`Tag ${tag} khớp version ${version}; commit ${sha} nằm trên main.`)
  } catch (err) {
    console.log(`::error::${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }
}
```

- [ ] **Step 4: Chạy test để thấy qua**

Chạy: `pnpm vitest run tests/unit/release-tag.test.ts && pnpm verify`
Kỳ vọng: PASS (6 test, 7 ca của `test.each`), `pnpm verify` xanh (ESLint quét cả `scripts/`).

- [ ] **Step 5: Commit**

```bash
git add scripts/release-tag.mjs tests/unit/release-tag.test.ts
git commit -m "feat(release): kiểm tag vX.Y.Z nằm trên main và khớp package.json"
```

---

### Task 4: `scripts/release-ci.mjs`: cổng CI xanh của đúng commit

**Files:**
- Create: `scripts/release-ci.mjs`
- Test: `tests/unit/release-ci.test.ts`

**Interfaces:**
- Consumes: sha 40 ký tự từ output `sha` của Task 3.
- Produces (Task 6 dùng):
  - `ciVerdict(runs: Run[], sha: string): { verdict: 'green' | 'red' | 'pending' | 'missing'; run: Run | null }` với `Run = { id: number; head_sha: string; event: string; head_branch: string | null; status: string; conclusion: string | null; html_url: string }`.
  - `listCiRuns({ sha, repo, token, apiUrl?, fetchImpl? }): Promise<Run[]>` gọi `GET {apiUrl}/repos/{repo}/actions/workflows/ci.yml/runs?head_sha={sha}&event=push&branch=main&per_page=100`.
  - `waitForGreenCi({ sha, listRuns, wait?, now?, intervalMs? = 30000, timeoutMs? = 2700000, missingGraceMs? = 600000, log? }): Promise<Run>`.
  - CLI: `node scripts/release-ci.mjs <sha>`, đọc `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, `GITHUB_API_URL`; xanh thì thoát 0, còn lại in `::error::...` và thoát 1.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/release-ci.test.ts`:

```ts
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { ciVerdict, listCiRuns, waitForGreenCi } from '@/scripts/release-ci.mjs'

const SHA = 'c'.repeat(40)
type RunPatch = Partial<{ id: number; head_sha: string; event: string; head_branch: string | null; status: string; conclusion: string | null }>
const run = (patch: RunPatch = {}) => ({
  id: 1,
  head_sha: SHA,
  event: 'push',
  head_branch: 'main' as string | null,
  status: 'completed',
  conclusion: 'success' as string | null,
  html_url: 'https://github.com/agentra-code/eduflow-landing-page/actions/runs/1',
  ...patch,
})
// Đồng hồ giả: wait chỉ cộng thời gian, test chạy tức thì.
const fakeClock = () => {
  let t = 0
  return {
    now: () => t,
    wait: async (ms: number) => {
      t += ms
    },
  }
}

test('missing when no push run on main exists for the commit', () => {
  expect(ciVerdict([], SHA).verdict).toBe('missing')
  const others = [run({ head_sha: 'd'.repeat(40) }), run({ event: 'pull_request' }), run({ head_branch: 'feature' })]
  expect(ciVerdict(others, SHA).verdict).toBe('missing')
})

test('pending while the run is queued or in progress; green only on success', () => {
  for (const status of ['queued', 'in_progress', 'waiting']) expect(ciVerdict([run({ status, conclusion: null })], SHA).verdict).toBe('pending')
  expect(ciVerdict([run()], SHA).verdict).toBe('green')
  for (const conclusion of ['failure', 'cancelled', 'timed_out', 'skipped']) expect(ciVerdict([run({ conclusion })], SHA).verdict).toBe('red')
})

// Review Focus 2: chạy lại sau lỗi thoáng qua.
test('the newest run of the commit decides', () => {
  expect(ciVerdict([run({ id: 1, conclusion: 'failure' }), run({ id: 2 })], SHA).verdict).toBe('green')
  expect(ciVerdict([run({ id: 3, conclusion: 'failure' }), run({ id: 2 })], SHA).verdict).toBe('red')
})

// Review Focus 1: commit phát hành và tag được đẩy cùng lúc.
test('waits while CI is missing or running, then returns the green run', async () => {
  const answers = [[], [run({ status: 'queued', conclusion: null })], [run({ status: 'in_progress', conclusion: null })], [run()]]
  const clock = fakeClock()
  const lines: string[] = []
  const got = await waitForGreenCi({ sha: SHA, listRuns: async () => answers.shift() ?? [], ...clock, log: (l: string) => lines.push(l) })
  expect(got.conclusion).toBe('success')
  expect(lines).toHaveLength(3)
  expect(clock.now()).toBe(90_000)
})

test('fails at once on a red CI, naming the conclusion and the run', async () => {
  const clock = fakeClock()
  await expect(waitForGreenCi({ sha: SHA, listRuns: async () => [run({ conclusion: 'failure' })], ...clock, log: () => {} })).rejects.toThrow(
    /failure.*actions\/runs\/1/,
  )
  expect(clock.now()).toBe(0)
})

test('fails when the commit gets no CI run within the grace period', async () => {
  const clock = fakeClock()
  await expect(waitForGreenCi({ sha: SHA, listRuns: async () => [], ...clock, log: () => {} })).rejects.toThrow(
    /không có lần chạy CI nào do push lên main sau 10 phút/,
  )
  expect(clock.now()).toBe(10 * 60_000)
})

test('fails when CI is still running at the timeout', async () => {
  const clock = fakeClock()
  const running = async () => [run({ status: 'in_progress', conclusion: null })]
  await expect(waitForGreenCi({ sha: SHA, listRuns: running, ...clock, log: () => {} })).rejects.toThrow(/Hết 45 phút/)
  expect(clock.now()).toBe(45 * 60_000)
})

test('a GitHub API error is retried like a CI still running', async () => {
  const clock = fakeClock()
  let calls = 0
  const listRuns = async () => {
    calls += 1
    if (calls === 1) throw new Error('HTTP 502')
    return [run()]
  }
  await expect(waitForGreenCi({ sha: SHA, listRuns, ...clock, log: () => {} })).resolves.toMatchObject({ conclusion: 'success' })
  expect(calls).toBe(2)
})

test('lists the push runs of ci.yml on main for one commit, with the token', async () => {
  const seen: Array<{ url: string; auth: string | null }> = []
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    seen.push({ url, auth: new Headers(init?.headers).get('authorization') })
    return new Response(JSON.stringify({ total_count: 1, workflow_runs: [run()] }), { status: 200 })
  }) as unknown as typeof fetch
  const runs = await listCiRuns({ sha: SHA, repo: 'agentra-code/eduflow-landing-page', token: 't0k', fetchImpl })
  expect(runs).toHaveLength(1)
  expect(seen).toEqual([
    {
      url: `https://api.github.com/repos/agentra-code/eduflow-landing-page/actions/workflows/ci.yml/runs?head_sha=${SHA}&event=push&branch=main&per_page=100`,
      auth: 'Bearer t0k',
    },
  ])
  const denied = (async () => new Response('{}', { status: 403 })) as unknown as typeof fetch
  await expect(listCiRuns({ sha: SHA, repo: 'x/y', token: 't', fetchImpl: denied })).rejects.toThrow(/HTTP 403/)
})

test('the CLI refuses an argument that is not a commit sha', () => {
  const r = spawnSync(process.execPath, [resolve('scripts/release-ci.mjs'), 'main'], {
    encoding: 'utf8',
    env: { ...process.env, GITHUB_TOKEN: 't', GITHUB_REPOSITORY: 'x/y' },
  })
  expect(r.status).toBe(1)
  expect(r.stdout).toMatch(/^::error::"main" không phải sha/m)
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/release-ci.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/scripts/release-ci.mjs"`.

- [ ] **Step 3: Viết `scripts/release-ci.mjs`**

```js
// Cổng CI của workflow Release (docs/van-hanh.md, mục 8): commit được gắn tag phải có lần chạy workflow CI (ci.yml) do push lên
// main, và lần chạy mới nhất đó phải xanh. CI còn chạy thì chờ. Hàm thuần cho tests/unit/release-ci.test.ts; CLI cho release.yml:
//   node scripts/release-ci.mjs <sha>     đọc GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_API_URL; không xanh thì in ::error:: và thoát 1
import { setTimeout as sleep } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'

/**
 * Một lần chạy workflow, đúng các trường GitHub trả ở GET /repos/{repo}/actions/workflows/{id}/runs.
 * @typedef {{ id: number, head_sha: string, event: string, head_branch: string | null, status: string, conclusion: string | null, html_url: string }} Run
 */

/**
 * @param {Run[]} runs
 * @param {string} sha
 * @returns {{ verdict: 'green' | 'red' | 'pending' | 'missing', run: Run | null }}
 */
export function ciVerdict(runs, sha) {
  const mine = runs.filter((r) => r.head_sha === sha && r.event === 'push' && r.head_branch === 'main')
  if (mine.length === 0) return { verdict: 'missing', run: null }
  // Chạy lại (re-run) cập nhật chính lần chạy đó; nếu một commit có nhiều lần chạy thì lần mới nhất (id lớn nhất) quyết định.
  const run = mine.reduce((a, b) => (b.id > a.id ? b : a))
  if (run.status !== 'completed') return { verdict: 'pending', run }
  return { verdict: run.conclusion === 'success' ? 'green' : 'red', run }
}

/**
 * @param {{ sha: string, repo: string, token: string, apiUrl?: string, fetchImpl?: typeof fetch }} options
 * @returns {Promise<Run[]>}
 */
export async function listCiRuns({ sha, repo, token, apiUrl = 'https://api.github.com', fetchImpl = fetch }) {
  const query = new URLSearchParams({ head_sha: sha, event: 'push', branch: 'main', per_page: '100' })
  const res = await fetchImpl(`${apiUrl}/repos/${repo}/actions/workflows/ci.yml/runs?${query}`, {
    headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token}`, 'X-GitHub-Api-Version': '2022-11-28' },
    signal: AbortSignal.timeout(15_000),
  })
  if (!res.ok) throw new Error(`GitHub API trả HTTP ${res.status} khi đọc các lần chạy CI`)
  const body = await res.json()
  return body.workflow_runs ?? []
}

/**
 * @param {{ sha: string, listRuns: () => Promise<Run[]>, wait?: (ms: number) => Promise<unknown>, now?: () => number,
 *   intervalMs?: number, timeoutMs?: number, missingGraceMs?: number, log?: (line: string) => void }} options
 * @returns {Promise<Run>}
 */
export async function waitForGreenCi({
  sha,
  listRuns,
  wait = sleep,
  now = Date.now,
  intervalMs = 30_000,
  timeoutMs = 45 * 60_000,
  missingGraceMs = 10 * 60_000,
  log = console.log,
}) {
  const start = now()
  for (;;) {
    /** @type {{ verdict: string, run: Run | null }} */
    let result
    try {
      result = ciVerdict(await listRuns(), sha)
    } catch (err) {
      // Lỗi mạng hay GitHub API thoáng qua: coi như CI chưa xong, thử lại ở vòng sau.
      result = { verdict: 'pending', run: null }
      log(`Không đọc được lần chạy CI (${err instanceof Error ? err.message : err}), thử lại.`)
    }
    const { verdict, run } = result
    if (verdict === 'green' && run) return run
    if (verdict === 'red' && run) {
      throw new Error(
        `CI của ${sha} không xanh (${run.conclusion}): ${run.html_url}. Đỏ do lỗi thoáng qua thì chạy lại CI rồi chạy lại workflow Release; còn lại thì sửa trên main và phát hành phiên bản mới.`,
      )
    }
    const waited = now() - start
    if (verdict === 'missing' && waited >= missingGraceMs) {
      throw new Error(
        `Commit ${sha} không có lần chạy CI nào do push lên main sau ${missingGraceMs / 60_000} phút. CI chạy cho commit đầu của mỗi lần push: gắn tag lên commit đầu của main.`,
      )
    }
    if (waited >= timeoutMs) throw new Error(`Hết ${timeoutMs / 60_000} phút mà CI của ${sha} chưa xong${run ? `: ${run.html_url}` : ''}.`)
    log(verdict === 'missing' ? `Chưa thấy lần chạy CI của ${sha}, chờ.` : `CI của ${sha} đang ${run?.status ?? 'chưa rõ'}, chờ.`)
    await wait(intervalMs)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const sha = process.argv[2] ?? ''
  const { GITHUB_TOKEN: token, GITHUB_REPOSITORY: repo, GITHUB_API_URL: apiUrl } = process.env
  try {
    if (!/^[0-9a-f]{40}$/.test(sha)) throw new Error(`"${sha}" không phải sha của một commit.`)
    if (!token || !repo) throw new Error('Thiếu GITHUB_TOKEN hoặc GITHUB_REPOSITORY.')
    const run = await waitForGreenCi({ sha, listRuns: () => listCiRuns({ sha, repo, token, apiUrl }) })
    console.log(`CI của ${sha} xanh: ${run.html_url}`)
  } catch (err) {
    console.log(`::error::${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }
}
```

- [ ] **Step 4: Chạy test để thấy qua**

Chạy: `pnpm vitest run tests/unit/release-ci.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh. Nếu `tsc` báo lỗi kiểu ở tệp test vì JSDoc của `.mjs` (ví dụ `head_branch` hay `conclusion` không nhận `null`), sửa helper `run()` của test cho khớp typedef `Run`, không nới typedef.

- [ ] **Step 5: Commit**

```bash
git add scripts/release-ci.mjs tests/unit/release-ci.test.ts
git commit -m "feat(release): cổng CI xanh của đúng commit được gắn tag"
```

---

### Task 5: `scripts/release-verify.mjs`: kiểm `/version.json` trên domain chính

**Files:**
- Create: `scripts/release-verify.mjs`
- Test: `tests/unit/release-verify.test.ts`

**Interfaces:**
- Consumes: hợp đồng `/version.json` của Task 2; dòng `NEXT_PUBLIC_SITE_URL="..."` do `vercel pull` ghi vào `.vercel/.env.production.local` (Task 6 lấy dòng này ở job `deploy`).
- Produces (Task 6 dùng):
  - `siteUrlFromEnv(text: string): string`: origin `https://...` (bỏ khoảng trắng, dấu `/` cuối và đường dẫn); ném nếu trống, không phải URL hay không phải `https:`.
  - `versionProblems(body: unknown, expected: { version: string; commit: string; environment: string }): string[]`.
  - `verifyLive({ siteUrl, expected, fetchImpl?, wait?, attempts? = 20, intervalMs? = 15000, log? }): Promise<void>`: đúng khi `/version.json` khớp và `/` trả 2xx.
  - CLI: `node scripts/release-verify.mjs '<dòng NEXT_PUBLIC_SITE_URL=...>' <version> <sha>`; đúng thì thoát 0, còn lại in `::error::...` và thoát 1.

- [ ] **Step 1: Viết test hỏng**

`tests/unit/release-verify.test.ts`:

```ts
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { expect, test } from 'vitest'
import { siteUrlFromEnv, verifyLive, versionProblems } from '@/scripts/release-verify.mjs'

const SHA = 'e'.repeat(40)
const EXPECTED = { version: '1.0.1', commit: SHA, environment: 'production' }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

// Review Focus: dấu "/" cuối, khoảng trắng trong giá trị của Vercel.
test('the production site URL comes from the line vercel pull wrote, as a bare https origin', () => {
  expect(siteUrlFromEnv('NEXT_PUBLIC_SITE_URL="https://eduflow.agentra.io.vn/"')).toBe('https://eduflow.agentra.io.vn')
  expect(siteUrlFromEnv('VERCEL="1"\nNEXT_PUBLIC_SITE_URL=" https://eduflow.agentra.io.vn "\n')).toBe('https://eduflow.agentra.io.vn')
})

test('an empty, malformed or plain-http site URL stops the release', () => {
  expect(() => siteUrlFromEnv('')).toThrow(/đang trống/)
  expect(() => siteUrlFromEnv('NEXT_PUBLIC_SITE_URL=""')).toThrow(/đang trống/)
  expect(() => siteUrlFromEnv('NEXT_PUBLIC_SITE_URL="eduflow.agentra.io.vn"')).toThrow(/không phải URL/)
  expect(() => siteUrlFromEnv('NEXT_PUBLIC_SITE_URL="http://eduflow.agentra.io.vn"')).toThrow(/https/)
})

test('version.json must carry exactly the version, the commit and production', () => {
  expect(versionProblems(EXPECTED, EXPECTED)).toEqual([])
  expect(versionProblems({ ...EXPECTED, version: '1.0.0' }, EXPECTED)).toEqual(['version là "1.0.0", cần "1.0.1"'])
  expect(versionProblems({ ...EXPECTED, environment: 'preview', commit: null }, EXPECTED)).toHaveLength(2)
  expect(versionProblems(null, EXPECTED)).toEqual(['/version.json không phải một đối tượng JSON'])
})

test('retries until the domain serves the new release, then checks the home page', async () => {
  const answers = [new Response('', { status: 404 }), json({ ...EXPECTED, version: '1.0.0' }), json(EXPECTED), new Response('<html>', { status: 200 })]
  const urls: string[] = []
  const fetchImpl = (async (url: string) => {
    urls.push(url)
    return answers.shift()
  }) as unknown as typeof fetch
  const lines: string[] = []
  await verifyLive({ siteUrl: 'https://eduflow.agentra.io.vn', expected: EXPECTED, fetchImpl, wait: async () => {}, log: (l: string) => lines.push(l) })
  expect(urls).toEqual([
    'https://eduflow.agentra.io.vn/version.json',
    'https://eduflow.agentra.io.vn/version.json',
    'https://eduflow.agentra.io.vn/version.json',
    'https://eduflow.agentra.io.vn/',
  ])
  expect(lines).toEqual(['Lần 1/20: /version.json trả HTTP 404', 'Lần 2/20: version là "1.0.0", cần "1.0.1"'])
})

test('gives up after the last attempt with the last problem, counting network errors as attempts', async () => {
  const fetchImpl = (async () => {
    throw new Error('ECONNREFUSED')
  }) as unknown as typeof fetch
  await expect(
    verifyLive({ siteUrl: 'https://x.test', expected: EXPECTED, fetchImpl, wait: async () => {}, attempts: 3, log: () => {} }),
  ).rejects.toThrow(/chưa đúng sau 3 lần thử: không gọi được https:\/\/x\.test: ECONNREFUSED/)
})

test('a broken home page fails the check even when version.json is right', async () => {
  const fetchImpl = (async (url: string) => (url.endsWith('/version.json') ? json(EXPECTED) : new Response('', { status: 500 }))) as unknown as typeof fetch
  await expect(
    verifyLive({ siteUrl: 'https://x.test', expected: EXPECTED, fetchImpl, wait: async () => {}, attempts: 1, log: () => {} }),
  ).rejects.toThrow(/trang chủ trả HTTP 500/)
})

test('the CLI stops with ::error:: when Production has no site URL', () => {
  const r = spawnSync(process.execPath, [resolve('scripts/release-verify.mjs'), 'NEXT_PUBLIC_SITE_URL=""', '1.0.1', SHA], { encoding: 'utf8' })
  expect(r.status).toBe(1)
  expect(r.stdout).toMatch(/^::error::NEXT_PUBLIC_SITE_URL của môi trường Production trên Vercel đang trống/m)
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/release-verify.test.ts`
Kỳ vọng: FAIL, `Failed to resolve import "@/scripts/release-verify.mjs"`.

- [ ] **Step 3: Viết `scripts/release-verify.mjs`**

```js
// Kiểm bản production từ bên ngoài sau khi promote (docs/van-hanh.md, mục 8): /version.json trên domain chính phải mang đúng
// version, commit và environment "production", và trang chủ trả 200. Hàm thuần cho tests/unit/release-verify.test.ts; CLI cho
// release.yml:
//   node scripts/release-verify.mjs '<dòng NEXT_PUBLIC_SITE_URL=... do vercel pull ghi>' <version> <sha>
// Thử tới 20 lần, cách nhau 15 giây: domain cần vài giây để trỏ sang bản vừa promote.
import { setTimeout as sleep } from 'node:timers/promises'
import { pathToFileURL } from 'node:url'
import { parseEnv } from 'node:util'

/**
 * @param {string} text  một dòng hay cả tệp .env do `vercel pull` ghi
 * @returns {string} origin của domain production, ví dụ https://eduflow.agentra.io.vn
 */
export function siteUrlFromEnv(text) {
  const raw = (parseEnv(text).NEXT_PUBLIC_SITE_URL ?? '').trim()
  if (!raw) throw new Error('NEXT_PUBLIC_SITE_URL của môi trường Production trên Vercel đang trống.')
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new Error(`NEXT_PUBLIC_SITE_URL của Production không phải URL: ${raw}`)
  }
  if (url.protocol !== 'https:') throw new Error(`NEXT_PUBLIC_SITE_URL của Production phải là https://, đang là ${raw}`)
  return url.origin
}

/** @typedef {{ version: string, commit: string, environment: string }} Expected */

/**
 * @param {unknown} body
 * @param {Expected} expected
 * @returns {string[]}
 */
export function versionProblems(body, expected) {
  if (!body || typeof body !== 'object') return ['/version.json không phải một đối tượng JSON']
  const got = /** @type {Record<string, unknown>} */ (body)
  /** @type {Array<keyof Expected>} */
  const keys = ['version', 'commit', 'environment']
  return keys.filter((key) => got[key] !== expected[key]).map((key) => `${key} là ${JSON.stringify(got[key])}, cần ${JSON.stringify(expected[key])}`)
}

/**
 * @param {string} siteUrl
 * @param {Expected} expected
 * @param {typeof fetch} fetchImpl
 * @returns {Promise<string[]>}
 */
async function problemsNow(siteUrl, expected, fetchImpl) {
  try {
    const res = await fetchImpl(`${siteUrl}/version.json`, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return [`/version.json trả HTTP ${res.status}`]
    const problems = versionProblems(await res.json().catch(() => null), expected)
    if (problems.length > 0) return problems
    const home = await fetchImpl(`${siteUrl}/`, { signal: AbortSignal.timeout(10_000) })
    return home.ok ? [] : [`trang chủ trả HTTP ${home.status}`]
  } catch (err) {
    return [`không gọi được ${siteUrl}: ${err instanceof Error ? err.message : err}`]
  }
}

/**
 * @param {{ siteUrl: string, expected: Expected, fetchImpl?: typeof fetch, wait?: (ms: number) => Promise<unknown>,
 *   attempts?: number, intervalMs?: number, log?: (line: string) => void }} options
 * @returns {Promise<void>}
 */
export async function verifyLive({ siteUrl, expected, fetchImpl = fetch, wait = sleep, attempts = 20, intervalMs = 15_000, log = console.log }) {
  /** @type {string[]} */
  let problems = []
  for (let i = 1; i <= attempts; i++) {
    problems = await problemsNow(siteUrl, expected, fetchImpl)
    if (problems.length === 0) return
    log(`Lần ${i}/${attempts}: ${problems.join('; ')}`)
    if (i < attempts) await wait(intervalMs)
  }
  throw new Error(`${siteUrl}/version.json chưa đúng sau ${attempts} lần thử: ${problems.join('; ')}`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [line = '', version = '', commit = ''] = process.argv.slice(2)
  try {
    const siteUrl = siteUrlFromEnv(line)
    await verifyLive({ siteUrl, expected: { version, commit, environment: 'production' } })
    console.log(`${siteUrl}/version.json: ${version}, ${commit}, production.`)
  } catch (err) {
    console.log(`::error::${err instanceof Error ? err.message : err}`)
    process.exit(1)
  }
}
```

- [ ] **Step 4: Chạy test để thấy qua**

Chạy: `pnpm vitest run tests/unit/release-verify.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh.

- [ ] **Step 5: Commit**

```bash
git add scripts/release-verify.mjs tests/unit/release-verify.test.ts
git commit -m "feat(release): kiểm /version.json trên domain chính sau khi promote"
```

---

### Task 6: Workflow `release.yml`, và CI không huỷ lần chạy của `main`

**Files:**
- Create: `.github/workflows/release.yml`
- Modify: `.github/workflows/ci.yml` (khối `concurrency`, dòng 9 tới 12)
- Test: `tests/unit/release-workflow.test.ts` (mới), `tests/unit/ci-config.test.ts` (test đầu)

**Interfaces:**
- Consumes: `node scripts/release-tag.mjs "$TAG"` (outputs `tag`, `sha`, `version`, Task 3); `node scripts/release-ci.mjs "$SHA"` (Task 4); `node scripts/release-verify.mjs "$SITE_ENV_LINE" "$VERSION" "$SHA"` (Task 5); biến `RELEASE_TAG` (Task 1); `/version.json` (Task 2).
- Produces: workflow `Release` với job `gate`, `deploy`, `verify`, `github-release`; secret `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` trong environment `production` (người dùng đặt ở Task 10); deployment Vercel mang meta `releaseTag`, `releaseSha` (tài liệu Task 7 dùng để quay lại).

- [ ] **Step 1: Viết test hỏng**

`tests/unit/release-workflow.test.ts`:

```ts
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { parse } from 'yaml'

type Step = { name?: string; id?: string; uses?: string; run?: string; with?: Record<string, unknown>; env?: Record<string, string> }
type Job = {
  needs?: string | string[]
  if?: string
  environment?: unknown
  permissions?: Record<string, string>
  env?: Record<string, string>
  outputs?: Record<string, string>
  steps: Step[]
}

const text = readFileSync(new URL('../../.github/workflows/release.yml', import.meta.url), 'utf8')
const workflow = parse(text) as { on: Record<string, unknown>; permissions: unknown; concurrency: unknown; jobs: Record<string, Job> }
const jobs = workflow.jobs
// Mã của workflow, bỏ dòng chú thích: chú thích được phép nhắc tới điều mã không được làm.
const code = text
  .split('\n')
  .filter((line) => !/^\s*#/.test(line))
  .join('\n')
const step = (job: string, name: string): Step => {
  const found = jobs[job].steps.find((s) => s.name === name)
  if (!found) throw new Error(`release.yml: job ${job} không có bước "${name}"`)
  return found
}

describe('release.yml: when it runs', () => {
  test('only on a v* tag push or by hand with a tag, never on a pull request', () => {
    expect(Object.keys(workflow.on).sort()).toEqual(['push', 'workflow_dispatch'])
    expect(workflow.on.push).toEqual({ tags: ['v*'] })
    expect(workflow.on.workflow_dispatch).toMatchObject({ inputs: { tag: { required: true, type: 'string' } } })
    expect(code).not.toMatch(/pull_request|workflow_run/)
  })

  test('one release at a time, never cancelled, with a token that starts with no permission', () => {
    expect(workflow.concurrency).toEqual({ group: 'release-production', 'cancel-in-progress': false })
    expect(workflow.permissions).toEqual({})
    expect(Object.keys(jobs)).toEqual(['gate', 'deploy', 'verify', 'github-release'])
    expect(jobs.gate.permissions).toEqual({ contents: 'read', actions: 'read' })
    expect(jobs.deploy.permissions).toEqual({ contents: 'read' })
    expect(jobs.verify.permissions).toEqual({ contents: 'read' })
    expect(jobs['github-release'].permissions).toEqual({ contents: 'write' })
  })
})

describe('release.yml: secrets and supply chain', () => {
  test('Vercel secrets live only in the deploy job, under the production environment', () => {
    for (const [name, job] of Object.entries(jobs)) {
      if (name === 'deploy') continue
      expect(JSON.stringify(job), name).not.toContain('secrets.')
      expect(job.environment, name).toBeUndefined()
    }
    expect(jobs.deploy.environment).toBe('production')
    expect(JSON.stringify(jobs.deploy).match(/secrets\.\w+/g)?.sort()).toEqual([
      'secrets.VERCEL_ORG_ID',
      'secrets.VERCEL_PROJECT_ID',
      'secrets.VERCEL_TOKEN',
      'secrets.VERCEL_TOKEN',
    ])
  })

  test('the Vercel token reaches only the steps that talk to Vercel, never install or build', () => {
    expect(jobs.deploy.env).not.toHaveProperty('VERCEL_TOKEN')
    const withToken = jobs.deploy.steps.filter((s) => s.env?.VERCEL_TOKEN).map((s) => s.name)
    expect(withToken).toEqual(['Pull production settings and variables', 'Deploy staged, then promote'])
  })

  test('every action is pinned to a full commit sha, and the Vercel CLI to an exact version outside package.json', () => {
    const uses = Object.values(jobs).flatMap((j) => j.steps.map((s) => s.uses).filter((u): u is string => Boolean(u)))
    expect(uses.length).toBeGreaterThan(5)
    for (const u of uses) expect(u).toMatch(/^[\w.-]+\/[\w.-]+@[0-9a-f]{40}$/)
    expect(jobs.deploy.env?.VERCEL_CLI).toMatch(/^vercel@\d+\.\d+\.\d+$/)
    expect(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).not.toMatch(/"vercel"/)
    // Không dùng cache của Actions ở workflow có secret.
    expect(code).not.toMatch(/\bcache:/)
  })

  test('no expression inside a run script: values reach the shell through env', () => {
    for (const [name, job] of Object.entries(jobs)) {
      for (const s of job.steps) expect(s.run ?? '', `${name}: ${s.name ?? s.uses}`).not.toContain('${{')
    }
  })
})

describe('release.yml: the order of checks', () => {
  test('the gate checks the tag, main and CI with the scripts of the workflow commit, before anything is built', () => {
    expect(jobs.gate.steps[0].uses).toMatch(/^actions\/checkout@/)
    expect(jobs.gate.steps[0].with).toMatchObject({ 'fetch-depth': 0, 'persist-credentials': false })
    const tag = step('gate', 'Tag is vX.Y.Z, on main, and matches package.json')
    expect(tag.id).toBe('tag')
    expect(tag.env).toEqual({ TAG: "${{ github.event_name == 'workflow_dispatch' && inputs.tag || github.ref_name }}" })
    expect(tag.run).toBe('node scripts/release-tag.mjs "$TAG"')
    const ci = step('gate', 'CI of the tagged commit is green')
    expect(ci.env).toEqual({ GITHUB_TOKEN: '${{ github.token }}', SHA: '${{ steps.tag.outputs.sha }}' })
    expect(ci.run).toBe('node scripts/release-ci.mjs "$SHA"')
    expect(jobs.gate.outputs).toEqual({
      tag: '${{ steps.tag.outputs.tag }}',
      sha: '${{ steps.tag.outputs.sha }}',
      version: '${{ steps.tag.outputs.version }}',
    })
    expect(jobs.deploy.needs).toBe('gate')
  })

  test('deploy builds exactly the tagged commit, with VERCEL_ENV=production, the commit and the tag', () => {
    expect(jobs.deploy.steps[0].with).toMatchObject({ ref: '${{ needs.gate.outputs.sha }}', 'persist-credentials': false })
    expect(step('deploy', 'Pull production settings and variables').run).toBe('npx --yes "$VERCEL_CLI" pull --yes --environment=production')
    const build = step('deploy', 'Build for production')
    expect(build.env).toEqual({
      VERCEL_ENV: 'production',
      NEXT_PUBLIC_VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_SHA: '${{ needs.gate.outputs.sha }}',
      RELEASE_TAG: '${{ needs.gate.outputs.tag }}',
    })
    expect(build.run).toBe('npx --yes "$VERCEL_CLI" build --prod')
    expect(jobs.deploy.outputs).toEqual({ site_env_line: '${{ steps.site.outputs.line }}' })
  })

  test('verify reads /version.json after deploy; the GitHub Release follows only a tag push', () => {
    expect(jobs.verify.needs).toEqual(['gate', 'deploy'])
    const check = step('verify', '/version.json on the production domain names this release')
    expect(check.env).toEqual({
      SITE_ENV_LINE: '${{ needs.deploy.outputs.site_env_line }}',
      VERSION: '${{ needs.gate.outputs.version }}',
      SHA: '${{ needs.gate.outputs.sha }}',
    })
    expect(check.run).toBe('node scripts/release-verify.mjs "$SITE_ENV_LINE" "$VERSION" "$SHA"')
    expect(jobs['github-release'].needs).toEqual(['gate', 'verify'])
    expect(jobs['github-release'].if).toBe("github.event_name == 'push'")
    expect(jobs['github-release'].steps[0].run).toContain('gh release create "$TAG" --repo "$GITHUB_REPOSITORY" --verify-tag --generate-notes')
  })
})

// Review Focus 4: promote đúng URL vừa tạo (cả khi project đang ở trạng thái sau Instant Rollback), dừng nếu không có URL.
describe('release.yml: the deploy step, run with a fake npx', () => {
  const script = step('deploy', 'Deploy staged, then promote').run ?? ''
  const SHA = 'a'.repeat(40)
  let dir = ''
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'release-deploy-'))
    // npx giả: ghi đối số vào $CALLS; với deploy thì in một dòng thừa rồi URL (khi FAKE_URL có giá trị), như CLI thật in ra stdout.
    const fake = ['#!/bin/sh', 'echo "$*" >> "$CALLS"', 'case "$*" in', '  *" deploy "*) echo "Vercel CLI 61.1.0"; [ -n "$FAKE_URL" ] && echo "$FAKE_URL" ;;', 'esac', 'exit 0', '']
    writeFileSync(join(dir, 'npx'), fake.join('\n'), { mode: 0o755 })
  })
  afterAll(() => rmSync(dir, { recursive: true, force: true }))
  const runStep = (fakeUrl: string) => {
    const calls = join(dir, 'calls')
    const summary = join(dir, 'summary')
    writeFileSync(calls, '')
    writeFileSync(summary, '')
    const r = spawnSync('bash', ['-c', script], {
      env: { PATH: `${dir}:${process.env.PATH}`, CALLS: calls, FAKE_URL: fakeUrl, VERCEL_CLI: 'vercel@61.1.0', RELEASE_TAG: 'v1.0.0', SHA, GITHUB_STEP_SUMMARY: summary },
      encoding: 'utf8',
    })
    return { status: r.status, stdout: r.stdout, calls: readFileSync(calls, 'utf8').split('\n').filter(Boolean) }
  }

  test('deploys staged with the release metadata, then promotes that very URL', () => {
    const url = 'https://eduflow-landing-page-abc123-agentra.vercel.app'
    const r = runStep(url)
    expect(r.status).toBe(0)
    expect(r.calls).toEqual([
      `--yes vercel@61.1.0 deploy --prebuilt --prod --skip-domain --meta releaseTag=v1.0.0 --meta releaseSha=${SHA}`,
      `--yes vercel@61.1.0 promote ${url} --yes --timeout=5m`,
    ])
  })

  test('stops before promote when deploy prints no deployment URL', () => {
    const r = runStep('')
    expect(r.status).not.toBe(0)
    expect(r.calls).toHaveLength(1)
    expect(r.stdout).toContain('::error::')
  })
})
```

Trong `tests/unit/ci-config.test.ts`, thay test đầu bằng:

```ts
test('the CI token is read-only; a newer push cancels the older run on a pull request, never on main', () => {
  const ci = parse(read('.github/workflows/ci.yml'))
  expect(ci.permissions).toEqual({ contents: 'read' })
  // Trên main mỗi commit một nhóm (theo sha): workflow Release đòi CI xanh của đúng commit được gắn tag, nên không lần chạy nào của main bị huỷ.
  expect(ci.concurrency).toEqual({ group: "ci-${{ github.ref == 'refs/heads/main' && github.sha || github.ref }}", 'cancel-in-progress': true })
})
```

- [ ] **Step 2: Chạy test để thấy hỏng**

Chạy: `pnpm vitest run tests/unit/release-workflow.test.ts tests/unit/ci-config.test.ts`
Kỳ vọng: FAIL: `release-workflow.test.ts` báo `ENOENT ... release.yml`; test đầu của `ci-config.test.ts` báo nhóm concurrency khác.

- [ ] **Step 3: Viết `.github/workflows/release.yml`**

```yaml
# Phát hành production theo phiên bản (docs/van-hanh.md, mục 8), như release.yml của DocOps application: tag vX.Y.Z phải khớp
# version trong package.json. Push main và mọi pull request chỉ ra bản preview (Vercel Git integration); production chỉ đến từ đây.
#
# Kích hoạt: đẩy tag v*, hoặc chạy tay (Run workflow, Use workflow from: main) với một tag đã có để dựng lại phiên bản đó.
# Không có trigger cho pull request: repo công khai, job deploy giữ secret của Vercel.
#
# gate            không secret. Tag đúng dạng, nằm trên main, khớp package.json của commit đó (scripts/release-tag.mjs); CI
#                 (ci.yml) của đúng commit đó xanh, chờ nếu còn chạy (scripts/release-ci.mjs).
# deploy          environment production, có secret. vercel pull, vercel build --prod, vercel deploy --prebuilt --prod
#                 --skip-domain, rồi vercel promote. Dựng ở trạng thái chờ rồi promote để bản mới vẫn lên khi project đang ở
#                 trạng thái sau Instant Rollback (Vercel tắt tự gán domain production sau rollback).
# verify          không secret. /version.json trên domain chính mang đúng version, commit, environment (scripts/release-verify.mjs).
# github-release  GitHub Release với ghi chú tự sinh, chỉ khi đẩy tag (chạy tay là dựng lại một phiên bản đã có release).
#
# gate và verify chạy script của chính commit chứa workflow này; deploy chỉ dựng mã của commit được gắn tag, không chạy script nào.
name: Release
on:
  push:
    tags: ['v*']
  workflow_dispatch:
    inputs:
      tag:
        description: 'Tag đã có cần dựng lại lên production, ví dụ v1.0.0'
        required: true
        type: string

# Token không có quyền nào, trừ quyền mỗi job tự xin.
permissions: {}

# Một lượt phát hành mỗi lần, lượt đang chạy không bị huỷ. GitHub giữ tối đa một lượt chờ: lượt chờ cũ bị thay bằng lượt mới hơn.
concurrency:
  group: release-production
  cancel-in-progress: false

jobs:
  gate:
    runs-on: ubuntu-latest
    # Chờ CI tối đa 45 phút (scripts/release-ci.mjs).
    timeout-minutes: 50
    permissions:
      contents: read
      actions: read
    outputs:
      tag: ${{ steps.tag.outputs.tag }}
      sha: ${{ steps.tag.outputs.sha }}
      version: ${{ steps.tag.outputs.version }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          # Đủ lịch sử, mọi nhánh và tag: cần origin/main và commit của tag.
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
      - name: Tag is vX.Y.Z, on main, and matches package.json
        id: tag
        env:
          TAG: ${{ github.event_name == 'workflow_dispatch' && inputs.tag || github.ref_name }}
        run: node scripts/release-tag.mjs "$TAG"
      - name: CI of the tagged commit is green
        env:
          GITHUB_TOKEN: ${{ github.token }}
          SHA: ${{ steps.tag.outputs.sha }}
        run: node scripts/release-ci.mjs "$SHA"

  deploy:
    needs: gate
    runs-on: ubuntu-latest
    timeout-minutes: 30
    environment: production
    permissions:
      contents: read
    outputs:
      site_env_line: ${{ steps.site.outputs.line }}
    env:
      # Phiên bản CLI ghim; chỉ dùng qua npx, không nằm trong package.json.
      VERCEL_CLI: vercel@61.1.0
      VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
      VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          ref: ${{ needs.gate.outputs.sha }}
          persist-credentials: false
      # Không dùng cache của Actions ở workflow có secret; cài sạch mỗi lần. pnpm lấy phiên bản từ packageManager của package.json.
      - uses: pnpm/action-setup@ea17c68df8912ef543352723c149a84f56e3d413 # v6.1.0
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
      - run: pnpm install --frozen-lockfile
      # Tải CLI một lần để các lệnh sau không in thêm gì vào stdout.
      - name: Vercel CLI
        run: npx --yes "$VERCEL_CLI" --version
      - name: Pull production settings and variables
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
        run: npx --yes "$VERCEL_CLI" pull --yes --environment=production
      # Dòng NEXT_PUBLIC_SITE_URL của Production cho job verify (script của verify đọc và kiểm dòng này).
      - name: Production site URL
        id: site
        run: echo "line=$(grep -m 1 '^NEXT_PUBLIC_SITE_URL=' .vercel/.env.production.local || true)" >> "$GITHUB_OUTPUT"
      # vercel build chạy ngoài Vercel nên không có biến hệ thống: đặt tay. VERCEL_ENV bật chốt chặn của lib/env.ts và RELEASE_TAG
      # qua được chốt chặn đó; NEXT_PUBLIC_VERCEL_ENV nhúng Vercel Analytics và Speed Insights; VERCEL_GIT_COMMIT_SHA vào
      # /version.json. Không cần token: vercel build đọc cài đặt đã pull.
      - name: Build for production
        env:
          VERCEL_ENV: production
          NEXT_PUBLIC_VERCEL_ENV: production
          VERCEL_GIT_COMMIT_SHA: ${{ needs.gate.outputs.sha }}
          RELEASE_TAG: ${{ needs.gate.outputs.tag }}
        run: npx --yes "$VERCEL_CLI" build --prod
      - name: Deploy staged, then promote
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          RELEASE_TAG: ${{ needs.gate.outputs.tag }}
          SHA: ${{ needs.gate.outputs.sha }}
        run: |
          set -euo pipefail
          url="$(npx --yes "$VERCEL_CLI" deploy --prebuilt --prod --skip-domain --meta releaseTag="$RELEASE_TAG" --meta releaseSha="$SHA" | grep -E '^https://[^ ]+\.vercel\.app$' | tail -n 1 || true)"
          if [ -z "$url" ]; then
            echo "::error::vercel deploy không in URL của bản dựng: xem log của bước này."
            exit 1
          fi
          echo "Bản dựng $RELEASE_TAG: $url" >> "$GITHUB_STEP_SUMMARY"
          npx --yes "$VERCEL_CLI" promote "$url" --yes --timeout=5m
          echo "Đã promote lên production." >> "$GITHUB_STEP_SUMMARY"

  verify:
    needs: [gate, deploy]
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
        with:
          persist-credentials: false
      - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
        with:
          node-version: 24
      - name: /version.json on the production domain names this release
        env:
          SITE_ENV_LINE: ${{ needs.deploy.outputs.site_env_line }}
          VERSION: ${{ needs.gate.outputs.version }}
          SHA: ${{ needs.gate.outputs.sha }}
        run: node scripts/release-verify.mjs "$SITE_ENV_LINE" "$VERSION" "$SHA"

  github-release:
    needs: [gate, verify]
    if: github.event_name == 'push'
    runs-on: ubuntu-latest
    timeout-minutes: 5
    permissions:
      contents: write
    steps:
      - name: GitHub Release with generated notes
        env:
          GH_TOKEN: ${{ github.token }}
          TAG: ${{ needs.gate.outputs.tag }}
          VERSION: ${{ needs.gate.outputs.version }}
        run: |
          set -eu
          if gh release view "$TAG" --repo "$GITHUB_REPOSITORY" > /dev/null 2>&1; then
            echo "Release $TAG đã có, giữ nguyên."
          else
            gh release create "$TAG" --repo "$GITHUB_REPOSITORY" --verify-tag --generate-notes --title "EduFlow landing $VERSION"
          fi
```

- [ ] **Step 4: Sửa khối `concurrency` của `.github/workflows/ci.yml`**

Thay:

```yaml
# Một lần đẩy mới lên cùng nhánh hoặc cùng pull request huỷ lần chạy cũ đang dở (20 phút mỗi lần).
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
```

bằng:

```yaml
# Trên pull request, lần đẩy mới huỷ lần chạy cũ đang dở (20 phút mỗi lần). Trên main mỗi commit một nhóm riêng (theo sha) nên
# không lần chạy nào bị huỷ: workflow Release (release.yml) chỉ phát hành commit có CI xanh của chính nó.
concurrency:
  group: ci-${{ github.ref == 'refs/heads/main' && github.sha || github.ref }}
  cancel-in-progress: true
```

- [ ] **Step 5: Chạy test để thấy qua**

Chạy: `pnpm vitest run tests/unit/release-workflow.test.ts tests/unit/ci-config.test.ts && pnpm verify`
Kỳ vọng: PASS, xanh (gồm `no U+2014 em-dash in any source file`, quét cả `.github`).

- [ ] **Step 6: Lint workflow nếu máy có `actionlint`**

```bash
command -v actionlint && actionlint .github/workflows/release.yml .github/workflows/ci.yml
```

Kỳ vọng: không in lỗi. Máy không có `actionlint` thì bỏ qua bước này (không cài thêm gì).

- [ ] **Step 7: Commit**

```bash
git add .github/workflows/release.yml .github/workflows/ci.yml tests/unit/release-workflow.test.ts tests/unit/ci-config.test.ts
git commit -m "ci(release): workflow Release dựng và deploy lên Vercel theo tag; CI không huỷ lần chạy của main"
```

---

### Task 7: Tài liệu: thiết lập Vercel, phát hành, quay lại

**Files:**
- Modify: `README.md`, `docs/van-hanh.md`

**Interfaces:**
- Consumes: tên job, bước, biến, script của Task 1 tới 6; nhánh giả `production-from-tags-only`; meta `releaseTag`.
- Produces: `docs/van-hanh.md` mục 8 (8.1 tới 8.5), mà Task 9 tới 11 làm theo; README mục "Vercel và phát hành".

- [ ] **Step 1: README, năm chỗ sửa nhỏ**

1. Đoạn mở đầu: thay `không có form, không có Route Handler, không thanh toán trực tuyến (dùng thử và xin key nằm trong app).` bằng `không có form, Route Handler duy nhất là \`/version.json\` (sinh tĩnh, khai phiên bản đang chạy), không thanh toán trực tuyến (dùng thử và xin key nằm trong app).`
2. Danh sách liên kết: thay `lần chạy CI đầu tiên): \`docs/van-hanh.md\`` bằng `lần chạy CI đầu tiên, phát hành landing theo phiên bản và quay lại): \`docs/van-hanh.md\``.
3. Mục "CI", ngay sau đoạn đầu (kết thúc bằng ``rồi `pnpm lhci`.``), thêm một đoạn:

```markdown
Trên pull request, lần đẩy mới huỷ lần chạy cũ đang dở; trên `main` mỗi commit có nhóm concurrency riêng (theo sha) nên không lần chạy nào bị huỷ, vì workflow Release chỉ phát hành commit có CI xanh của chính nó. Workflow phát hành production là `.github/workflows/release.yml`, không chạy trên pull request: xem mục "Vercel và phát hành".
```

4. Cây thư mục: sau dòng `app/sitemap.ts  robots.ts  manifest.ts  icon.svg  icon.png  apple-icon.png  globals.css` thêm dòng `app/version.json/route.ts               # /version.json: phiên bản, commit, môi trường của bản dựng (sinh tĩnh)`; thay chú thích của dòng `lib/env.ts` thành `# chặn build production thiếu domain thật, hay dựng cho Vercel mà không qua workflow Release` và thêm ngay sau dòng đó `lib/release.ts                          # buildInfo() cho /version.json`; sau dòng `scripts/sync-releases.mjs  capture-product-images.mjs  serve-fixtures.mjs` thêm `scripts/release-tag.mjs  release-ci.mjs  release-verify.mjs   # các bước kiểm của workflow Release`; ở dòng cuối của khối, thay `.github/workflows/ci.yml` bằng `.github/workflows/{ci,release}.yml`.
5. Mục "Trạng thái sắp phát hành và cách kết thúc", bước 2: thay `rồi deploy lại.` bằng `rồi dựng lại production: chạy tay workflow Release với tag đang chạy (\`docs/van-hanh.md\`, mục 8.4, cách 2).`

- [ ] **Step 2: README, đoạn cuối mục "Biến môi trường"**

Thay cả đoạn (một dòng) bắt đầu bằng ``Các biến `NEXT_PUBLIC_*` được nhúng lúc dựng, và biến đặt trên Vercel chỉ áp cho bản deploy tạo sau đó`` bằng:

```markdown
Các biến `NEXT_PUBLIC_*` được nhúng lúc dựng, và biến đặt trên Vercel chỉ áp cho bản dựng tạo sau đó: đổi giá trị xong, preview đổi ở lần push sau, còn production phải dựng lại bằng workflow Release (chạy tay với tag đang chạy, `docs/van-hanh.md`, mục 8.4, cách 2). Bản preview do Vercel dựng từ Git nhận `VERCEL_ENV` và `NEXT_PUBLIC_VERCEL_ENV` khi công tắc "Enable access to System Environment Variables" (Settings, Environment Variables; trước đây ghi là "Automatically expose System Environment Variables") đang bật: giữ công tắc bật. Bản production do workflow Release dựng bằng `vercel build` trên GitHub Actions, nơi Vercel không cấp biến hệ thống, nên workflow tự đặt `VERCEL_ENV=production`, `NEXT_PUBLIC_VERCEL_ENV=production`, `VERCEL_GIT_COMMIT_SHA` và `RELEASE_TAG`. `VERCEL_ENV=production` bật chốt chặn của `lib/env.ts` (domain thật, và `RELEASE_TAG` khi dựng cho Vercel); `NEXT_PUBLIC_VERCEL_ENV` quyết định site có nhúng script Vercel Analytics và Speed Insights (ở máy dev và CI không nhúng, để khỏi 404). Không đặt bốn biến này trong Environment Variables của Vercel.
```

- [ ] **Step 3: README, thay mục "Cài đặt trên Vercel"**

Xoá từ dòng `## Cài đặt trên Vercel` tới hết bước 5 của mục đó (ngay trước `## Trạng thái sắp phát hành và cách kết thúc`), thay bằng:

```markdown
## Vercel và phát hành

Site chạy trên Vercel, ở team đang chứa landing DocOps. Hai luồng:

- **Preview:** Vercel Git integration dựng mỗi lần push `main` và mỗi pull request thành bản preview (URL riêng, header `X-Robots-Tag: noindex`, cần đăng nhập Vercel khi bật Standard Protection). Nhánh production của project là `production-from-tags-only`, một nhánh không ai đẩy, nên push không bao giờ ra production.
- **Production:** chỉ workflow `Release` (`.github/workflows/release.yml`), khi đẩy tag `vX.Y.Z` khớp `version` trong `package.json`, hoặc chạy tay với một tag đã có. Workflow kiểm tag (đúng dạng, nằm trên `main`, khớp `package.json`), chờ CI của đúng commit đó xanh, rồi `vercel pull`, `vercel build --prod`, `vercel deploy --prebuilt --prod --skip-domain`, `vercel promote`, kiểm `/version.json` trên domain chính và tạo GitHub Release.

Bản đang chạy tự khai ở `/version.json` (`version`, `commit`, `environment`); tệp này không có trong sitemap và mang `X-Robots-Tag: noindex`. Bản production dựng ngoài workflow (lần dựng đầu tiên Vercel tự tạo khi import repo, nút Redeploy, "Promote to Production" của bản preview, `vercel --prod` từ máy cá nhân) dừng ở chốt chặn của `lib/env.ts` vì thiếu `RELEASE_TAG`.

Thiết lập một lần (project, biến môi trường, domain và DNS, token, environment và secret trên GitHub), phát hành một phiên bản và quay lại phiên bản trước: `docs/van-hanh.md`, mục 8. Cài đặt Vercel cần giữ: Node.js Version 24.x; Function Regions Singapore (`sin1`); các biến ở mục trên cho Production và Preview; "Enable access to System Environment Variables" bật; Web Analytics và Speed Insights bật; Deployment Protection là Standard Protection.
```

- [ ] **Step 4: `docs/van-hanh.md`, các chỗ sửa trong mục có sẵn**

1. Bảng đầu tệp: sau hàng `| 7 | Lần chạy CI đầu tiên |` thêm hàng `| 8 | Phát hành landing lên production theo phiên bản, quay lại phiên bản trước |`.
2. Mục 1, thay cả đoạn bắt đầu bằng `**Sau khi sửa tệp hỏng:**` bằng:

```markdown
**Sau khi sửa tệp hỏng:** bản preview do Vercel dựng dùng cache dữ liệu build của Next (`.next/cache/fetch-cache`, `revalidate` 600 giây, Vercel khôi phục giữa các lần dựng), nên một bản preview dựng ngay sau khi sửa vẫn có thể lấy phản hồi cũ của feed trong khoảng 10 phút. Bản production do workflow Release dựng trên GitHub Actions từ thư mục sạch, không có cache đó. Production đang chạy tự lấy feed mới khi trang hết hạn sau 10 phút (ISR), không cần làm gì; muốn dựng lại ngay thì chạy tay workflow Release với tag đang chạy (mục 8.4, cách 2).
```

3. Mục 2, thay dòng `Thay \`<tên-miền>\` bằng domain chính thức (OQ-L01).` bằng:

```markdown
Domain chính thức là `eduflow.agentra.io.vn`; `<tên-miền>` dưới đây là tên đó. Lần đầu, bước 2 tới 4 nằm trong mục 8.1 (thiết lập một lần), bước 5 tới 8 làm sau khi phát hành `v1.0.0` (mục 8.2). Production chỉ lên bằng workflow Release, nên "dựng lại production" ở mục này nghĩa là chạy tay workflow Release với tag đang chạy (mục 8.4, cách 2).
```

4. Mục 2, bước 2, ý đầu: thay `Chốt chặn dựa vào \`VERCEL_ENV\`, nên cần công tắc "Enable access to System Environment Variables" của Vercel bật (mục 6).` bằng `Chốt chặn dựa vào \`VERCEL_ENV\`: bản production do workflow Release tự đặt biến này; bản preview do Vercel dựng cần công tắc "Enable access to System Environment Variables" bật (mục 6).`
5. Mục 2, bước 2, ý cuối: thay `\`NEXT_PUBLIC_*\` được nhúng lúc dựng: đặt xong phải deploy lại.` bằng `\`NEXT_PUBLIC_*\` được nhúng lúc dựng: đặt xong phải dựng lại (preview: lần push sau; production: mục 8.4, cách 2).`
6. Mục 2, cuối bước 4, thêm câu: `Hiện \`eduflow.agentra.io.vn\` có bản ghi A trỏ VPS \`42.115.41.70\` (VPS chung của app EduFlow và DocOps, không phục vụ tên này): xoá bản ghi đó rồi mới đặt bản ghi của Vercel; kiểm bằng \`dig +short eduflow.agentra.io.vn\`, không còn \`42.115.41.70\`.`
7. Mục 2, bước 6: thay `rồi deploy lại;` bằng `rồi dựng lại production (mục 8.4, cách 2);`.
8. Mục 6, thay ô Node.js (dòng bắt đầu `- [ ] Node.js: log build của lần deploy gần nhất`) bằng:

```markdown
- [ ] Node.js: ô Node.js Version (Settings, Build and Deployment) là 24.x. Bản production dựng trên GitHub Actions bằng Node 24 (`actions/setup-node` trong `release.yml`); bản preview dựng trên Vercel theo ô này và `engines.node` trong `package.json` (hiện `>=22.18`, **thắng** ô cài đặt). Muốn chắc, đặt tạm Build Command thành `node -v && pnpm build`, đọc `node -v` trong log của một bản preview (phải 24.x), rồi bỏ.
```

9. Mục 6, thay ô công tắc (dòng bắt đầu `- [ ] Settings, Environment Variables: **"Enable access to System Environment Variables"** đang bật`) bằng hai ô:

```markdown
- [ ] Settings, Environment Variables: **"Enable access to System Environment Variables"** đang bật (trước đây ghi là "Automatically expose System Environment Variables"). Bản preview cần công tắc này để có `VERCEL_ENV=preview` và `NEXT_PUBLIC_VERCEL_ENV` (script Vercel Analytics, Speed Insights). Bản production không phụ thuộc công tắc lúc dựng: workflow Release tự đặt các biến đó. Không đặt `RELEASE_TAG`, `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA` trong Environment Variables.
- [ ] Phát hành (mục 8.1): nhánh production của project là `production-from-tags-only`; Deployment Protection là Standard Protection (domain production công khai); environment `production` trên GitHub có ba secret và chỉ nhận `main` cùng tag `v*`; ruleset cho tag `v*` chặn cập nhật và xoá. `https://<tên-miền>/version.json` trả đúng phiên bản vừa phát hành, `"environment": "production"`.
```

- [ ] **Step 5: `docs/van-hanh.md`, thêm mục 8 ở cuối tệp (sau mục 7)**

````markdown
## 8. Phát hành landing lên production theo phiên bản

Production chỉ lên bằng workflow `Release` (`.github/workflows/release.yml`), khi đẩy tag `vX.Y.Z` khớp `version` trong `package.json`, như `release.yml` của DocOps application. Push `main` và mọi pull request chỉ ra bản preview. Bản đang chạy tự khai ở `https://eduflow.agentra.io.vn/version.json`:

```json
{"version":"1.0.0","commit":"<sha đủ 40 ký tự của commit được gắn tag>","environment":"production"}
```

Bản preview cũng có `/version.json` (`environment` là `preview`, `version` là số trong `package.json` lúc đó, `commit` là commit của bản preview). Tệp này không có trong sitemap và mang `X-Robots-Tag: noindex`.

Ba lớp giữ production đi đúng một đường:

1. **Nhánh production giả.** Vercel không cho tắt hẳn nhánh production; nhánh production của project là `production-from-tags-only`, một nhánh không ai đẩy, nên `main` và pull request đều thành preview. Không dùng `git.deploymentEnabled` của `vercel.json`: khoá đó tắt mọi deploy của nhánh, kể cả preview của `main`.
2. **Chốt chặn lúc dựng (`lib/env.ts`).** Bản dựng production cho Vercel (`VERCEL=1` và `VERCEL_ENV=production`) dừng nếu thiếu `RELEASE_TAG` dạng `vX.Y.Z`, mà chỉ workflow Release đặt biến này. Các đường production khác đều đỏ: lần dựng production đầu tiên Vercel luôn tự tạo cho project mới (kể cả khi import), nút Redeploy, "Promote to Production" của một bản preview (cả hai dựng lại trên Vercel), `vercel --prod` từ máy cá nhân. Không bao giờ đặt `RELEASE_TAG` trong Environment Variables của Vercel.
3. **Cổng của workflow.** Trước khi dựng: tag đúng dạng, commit của tag nằm trên `main`, `version` trong `package.json` của commit đó khớp tag, và CI (`ci.yml`) của đúng commit đó xanh (chờ nếu còn chạy, tối đa 45 phút).

Instant Rollback, `vercel rollback` và `vercel promote` một bản production cũ không dựng lại nên không qua chốt chặn 2: đó là các đường quay lại hợp lệ (mục 8.4).

### 8.1 Thiết lập một lần (bước tay của người có quyền)

Làm đúng thứ tự; mỗi bước có cách kiểm.

1. **Đẩy `main` lên GitHub.** Lúc viết, `origin/main` là `eff101f` (Initial commit); `main` ở máy đi trước và chứa toàn bộ landing cùng workflow này. `git push origin main`. CI chạy lần đầu: kiểm theo mục 7. Kiểm: trang Actions có lần chạy `CI` cho commit đầu của `main`.
2. **Tạo project Vercel trong team đang chứa landing DocOps** (không phải tài khoản cá nhân; tài khoản `lephus` đăng nhập CLI trên máy dev không thuộc team này). Dashboard Vercel, chọn đúng team ở bộ chọn góc trên trái, Add New, Project, Import `agentra-code/eduflow-landing-page` (cài GitHub app của Vercel cho repo nếu được hỏi). Framework Preset: Next.js; Root Directory: `./`; lệnh dựng và cài để mặc định. **Không thêm biến môi trường ở màn import.** Vercel luôn dựng bản đầu tiên của project mới thành production; bản này đỏ với thông báo `Bản production chỉ được dựng bởi workflow Release`: đúng như mong đợi, không sửa gì.
3. **Nhánh production giả.** Project, Settings, Environments, Production, Branch Tracking: nhập `production-from-tags-only`, Save. Không tạo nhánh này trên GitHub. Nếu dashboard không nhận tên nhánh chưa có: tạo nhánh ở commit `eff101f` (`git push origin eff101f:refs/heads/production-from-tags-only`; commit này chỉ có README nên không dựng được), rồi chặn cập nhật và xoá nhánh đó bằng ruleset (bước 9). Kiểm: lần push tiếp theo lên `main` tạo bản Preview (Deployments, cột Environment). Trước khi có bản production đầu tiên, Vercel có thể vẫn coi lần dựng kế tiếp là production; lần đó cũng đỏ ở chốt chặn, vô hại.
4. **Cài đặt project.**
   - Build and Deployment, Node.js Version: 24.x.
   - Functions, Function Regions: Singapore (`sin1`).
   - Environment Variables: các biến ở README, mục "Biến môi trường", cho **Production** và **Preview**; `NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn` ở cả hai. Giữ bật "Enable access to System Environment Variables". Không đặt `RELEASE_TAG`, `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`.
   - Deployment Protection: Standard Protection (domain production công khai, các URL còn lại cần đăng nhập Vercel). Không chọn All Deployments: Google không vào được domain và job `verify` đỏ với HTTP 401.
   - Git: giữ bật Git Fork Protection (pull request từ fork chỉ dựng preview khi người trong team duyệt).
   - Analytics và Speed Insights: bật.
5. **Domain và DNS.** Settings, Domains, Add: `eduflow.agentra.io.vn`, gắn với Production. Ở nơi quản lý DNS của `agentra.io.vn`: xoá bản ghi A `eduflow` đang trỏ VPS `42.115.41.70`, đặt đúng bản ghi Vercel hiện. Chờ Vercel báo cấu hình hợp lệ và cấp chứng chỉ. Tới khi có bản production đầu tiên (mục 8.2), domain trả trang 404 của Vercel: bình thường. Kiểm: `dig +short eduflow.agentra.io.vn` không còn `42.115.41.70`; `curl -sI https://eduflow.agentra.io.vn/ | head -1` có phản hồi qua HTTPS (lúc này 404 là đúng).
6. **Token Vercel.** https://vercel.com/account/tokens (ở tài khoản cá nhân, không phải trang team): Name `github-release-eduflow-landing`; Scope: chọn team, rồi chọn project `eduflow-landing-page` (token chỉ dùng được cho project này); Expiration: 1 năm; Create; chép token ngay (chỉ hiện một lần). Đặt nhắc lịch gia hạn trước ngày hết hạn. Nếu workflow báo HTTP 403 ở `vercel pull`, `vercel deploy` hay `vercel promote` với token theo project, tạo lại token với Scope là team (All Projects).
7. **Hai ID.** Team ID: team Settings, General. Project ID: project Settings, General.
8. **Environment `production` trên GitHub.** Repo Settings, Environments, New environment, tên `production`:
   - Deployment branches and tags: Selected branches and tags; Add deployment branch or tag rule: Ref type Branch, `main`; thêm rule thứ hai: Ref type Tag, `v*`.
   - Environment secrets: `VERCEL_TOKEN` (bước 6), `VERCEL_ORG_ID` (Team ID), `VERCEL_PROJECT_ID`.
   - Tuỳ chọn: Required reviewers, nếu muốn một người bấm duyệt trước mỗi lần lên production.
9. **Ruleset cho tag.** Repo Settings, Rules, Rulesets, New tag ruleset: Enforcement status Active; Target tags: Include by pattern `v*`; bật Restrict updates và Restrict deletions; bật Restrict creations và thêm Repository admin (hoặc Maintain) vào Bypass list nếu chỉ người phát hành được gắn tag. Tag đã phát hành không dời được sang commit khác, nên chạy lại workflow với một tag cũ luôn dựng đúng mã cũ. Nếu bước 3 phải tạo nhánh giả: thêm branch ruleset cho `production-from-tags-only` với Restrict updates và Restrict deletions.
10. **Tuỳ chọn: bảo vệ `main`.** Branch ruleset cho `main`: Require a pull request before merging, Require status checks to pass với check `verify` (job của CI). Đội đang đẩy thẳng lên `main` thì có thể bỏ qua: workflow Release vẫn đòi CI xanh của commit được gắn tag.
11. **Fork.** Settings, Actions, General, mục phê duyệt workflow của pull request từ fork: giữ "Require approval for first-time contributors" hoặc chặt hơn. Workflow Release không có trigger cho pull request nên secret không bao giờ tới mã của fork.

### 8.2 Phát hành một phiên bản

Số phiên bản theo SemVer: sửa lỗi, sửa chữ, cập nhật snapshot: tăng PATCH (`1.0.1`); thêm trang, khối hay tính năng: MINOR (`1.1.0`); đổi lớn như giao diện mới hay bản đồ URL mới: MAJOR (`2.0.0`), PO chọn.

```bash
git switch main && git pull --ff-only
npm pkg set version=1.0.1                    # chỉ đổi "version" trong package.json, không cài gì
pnpm verify
git add package.json
git commit -m "chore(phat-hanh): EduFlow landing 1.0.1"
git tag -a v1.0.1 -m "EduFlow landing 1.0.1"
git push origin main v1.0.1                  # commit và tag cùng lúc; workflow chờ CI của commit này
```

Theo dõi ở GitHub, Actions, `Release`: `gate` (kiểm tag, rồi chờ CI của commit, thường 15 tới 25 phút), `deploy`, `verify`, `github-release`. Xanh cả bốn: production là bản mới và trang Releases có `v1.0.1` với ghi chú tự sinh.

Khi workflow đỏ:

| Job, thông báo | Nghĩa và việc cần làm |
|---|---|
| `gate`: `Tag "..." không có dạng vX.Y.Z` | Tag sai dạng (thiếu `v`, có hậu tố). Gắn tag đúng dạng. Tag sai chỉ xoá được bằng quyền vượt ruleset: `git push origin :refs/tags/<tag>`. |
| `gate`: `không nằm trên main` | Tag gắn lên commit chưa vào `main`. Hoà vào `main`, gắn tag mới lên commit của `main`. |
| `gate`: `không khớp version` | Commit được gắn tag chưa nâng `version`. Làm commit phát hành như trên với số mới, gắn tag mới. |
| `gate`: `CI của ... không xanh` | CI của commit đó đỏ hoặc bị huỷ. Lỗi thoáng qua: chạy lại CI của commit đó (Re-run jobs), rồi Re-run workflow Release. Lỗi thật: sửa trên `main`, phát hành số mới. |
| `gate`: `không có lần chạy CI nào do push lên main` | CI chỉ chạy cho commit đầu của mỗi lần push, nên commit ở giữa không có CI. Gắn tag lên commit đầu của `main`. |
| `gate`: `Hết 45 phút` | CI quá chậm hoặc kẹt hàng chờ. Khi CI xanh, Re-run workflow Release. |
| `deploy`: `Bản production chỉ được dựng bởi workflow Release` | `RELEASE_TAG` không tới bước dựng: `release.yml` bị sửa sai. |
| `deploy`: `NEXT_PUBLIC_SITE_URL phải ...` | Biến Production trên Vercel trống hoặc sai (mục 2). Sửa rồi Re-run. |
| `deploy`: HTTP 401 hay 403 ở `vercel pull`, `deploy`, `promote` | Token hết hạn hoặc thiếu quyền (8.1 bước 6), hoặc secret của environment `production` sai. |
| `verify`: `chưa đúng sau 20 lần thử` | Domain chưa trỏ Vercel hay chưa có chứng chỉ (8.1 bước 5), hoặc promote chưa xong. Xem log `deploy`, rồi Re-run riêng job `verify` (Re-run failed jobs). |

### 8.3 Kiểm sau mỗi lần phát hành

```bash
curl -s https://eduflow.agentra.io.vn/version.json                              # đúng version, commit, "production"
git rev-parse 'v1.0.1^{commit}'                                                  # phải bằng "commit" ở trên
curl -sI https://eduflow.agentra.io.vn/version.json | grep -i x-robots-tag     # x-robots-tag: noindex
curl -sI https://eduflow.agentra.io.vn/ | grep -i x-robots-tag                 # không in gì: trang chủ cho index
```

Lần phát hành đầu (`1.0.0`): làm thêm mục 2, bước 5 tới 8, và danh sách mục 6.

Bản preview của `main`: Vercel, Deployments, lọc Environment là Preview và nhánh `main`; URL theo nhánh có dạng `<project>-git-main-<team>.vercel.app` và luôn trỏ bản mới nhất của `main`.

### 8.4 Quay lại phiên bản trước

Hai cách; cách 1 nhanh hơn và không dựng lại.

**Cách 1: Instant Rollback (gán domain về một bản production cũ, không dựng lại).**

- Dashboard: project, ô Production Deployment, Instant Rollback, chọn bản cần về, Confirm. Gói Hobby chỉ về được bản ngay trước; Pro về được mọi bản từng là production.
- CLI (đăng nhập một tài khoản thuộc team; `<team-slug>` ở URL của team trên dashboard):

```bash
vercel list eduflow-landing-page --prod -m releaseTag=v1.0.0 --scope <team-slug>   # URL bản production của v1.0.0
vercel rollback <URL ở trên> --scope <team-slug>
curl -s https://eduflow.agentra.io.vn/version.json                                  # "version": "1.0.0"
```

Sau rollback, Vercel tắt tự gán domain production cho bản mới. Workflow Release không bị ảnh hưởng vì nó luôn dựng ở trạng thái chờ rồi `vercel promote` (lệnh này cũng bật lại tự gán).

**Cách 2: dựng lại một tag.** GitHub, Actions, Release, Run workflow, Use workflow from: `main`, ô `tag`: ví dụ `v1.0.0`, Run. Workflow kiểm lại tag và CI, dựng mã của tag đó với biến môi trường hiện tại trên Vercel, promote và kiểm `/version.json`. Không tạo GitHub Release mới. Dùng khi bản cũ không còn trên Vercel, khi cần dựng lại với biến môi trường đã đổi, hoặc để dựng lại chính phiên bản đang chạy (ví dụ sau khi đổi một biến `NEXT_PUBLIC_*`).

Sau khi quay lại, sửa tiến bằng một số PATCH mới (mục 8.2); không xoá hay dời tag đã phát hành.

### 8.5 Việc định kỳ

- Token Vercel: tạo token mới trước ngày hết hạn (8.1 bước 6), cập nhật secret `VERCEL_TOKEN` của environment `production`, rồi xoá token cũ.
- Vercel CLI ghim ở `VERCEL_CLI` trong `release.yml`, các action ghim theo sha kèm chú thích phiên bản: khi nâng, chọn bản đã ra ít nhất hai tuần, sửa số, sha và chú thích cùng lúc, chạy `pnpm verify` (test `release-workflow`), rồi phát hành một bản PATCH để chạy thử.
````

- [ ] **Step 6: Kiểm và commit**

```bash
grep -n "deploy lại\|Push \`main\` thì ra production" README.md docs/van-hanh.md      # không in gì
pnpm verify
git add README.md docs/van-hanh.md
git commit -m "docs(ops): thiết lập Vercel, phát hành landing theo phiên bản và quay lại"
```

Kỳ vọng: `grep` không in dòng nào; `pnpm verify` xanh.

---

### Task 8: Phiên bản 1.0.0 và kiểm cuối

**Files:**
- Modify: `package.json` (`"version": "0.1.0"` thành `"version": "1.0.0"`)

**Interfaces:**
- Consumes: mọi task trước.
- Produces: commit `chore(phat-hanh): EduFlow landing 1.0.0` ở đầu nhánh `feat/release-vercel`; đây là commit sẽ được gắn tag `v1.0.0` ở Task 11.

- [ ] **Step 1: Nâng version**

```bash
npm pkg set version=1.0.0
git diff package.json        # đúng một dòng đổi: "version": "1.0.0"
pnpm verify
```

- [ ] **Step 2: Commit phát hành**

```bash
git add package.json
git commit -m "chore(phat-hanh): EduFlow landing 1.0.0"
```

- [ ] **Step 3: Kiểm bản dựng giống workflow, ở máy**

```bash
# CỔNG-TRỐNG trước
VERCEL=1 VERCEL_ENV=production NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn pnpm build 2>&1 | grep -m 1 "workflow Release"
VERCEL=1 VERCEL_ENV=production RELEASE_TAG=v1.0.0 VERCEL_GIT_COMMIT_SHA=$(git rev-parse HEAD) NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn DOWNLOAD_FEED_URL= pnpm build
pnpm start -p 3200 & APP_PID=$!
curl --retry 20 --retry-connrefused --retry-delay 1 -fsS http://localhost:3200/version.json; echo
kill $APP_PID
```

Kỳ vọng: lệnh đầu in dòng `Bản production chỉ được dựng bởi workflow Release...`; lệnh dựng thứ hai qua; `curl` in `{"version":"1.0.0","commit":"<sha của HEAD>","environment":"production"}`. (Không đặt `NEXT_PUBLIC_VERCEL_ENV` ở máy để site không nhúng script `/_vercel/*`.)

- [ ] **Step 4: E2E và gạch dài**

Chạy E2E-FEED (toàn bộ), rồi KHÔNG-GẠCH-DÀI.
Kỳ vọng: PASS; `grep exit=1`.

- [ ] **Step 5: Trạng thái nhánh**

```bash
git log --oneline main..HEAD     # 9 commit: docs(plan), 5 feat(release), ci(release), docs(ops), chore(phat-hanh)
git status --short               # trống
```

Dừng ở đây và báo người dùng: nhánh `feat/release-vercel` sẵn sàng; các task còn lại là bước tay.

---

### Task 9: BƯỚC TAY: hoà vào `main`, đẩy `main`, CI lần đầu

**Người làm:** người dùng (hoặc agent nếu người dùng cho phép riêng phần hoà ở máy; `git push` luôn là người dùng).

- [ ] **Step 1: Hoà nhánh vào `main` ở máy (fast-forward)**

```bash
cd ../eduflow-worktrees/release-vercel
git fetch . feat/release-vercel:main      # chỉ chạy khi fast-forward được; main không được checkout ở cây nào
git log --oneline -1 main                 # chore(phat-hanh): EduFlow landing 1.0.0
```

- [ ] **Step 2: Đẩy `main`** (BƯỚC TAY)

```bash
git push origin main
```

- [ ] **Step 3: CI lần đầu**

GitHub, Actions, `CI`: lần chạy cho commit `chore(phat-hanh): EduFlow landing 1.0.0`. Kiểm theo `docs/van-hanh.md`, mục 7. CI đỏ: dừng, sửa trên một nhánh mới từ `main` (ngoài kế hoạch này), đẩy lại; commit sửa vẫn mang `version` 1.0.0 nên tag ở Task 11 gắn lên commit xanh mới nhất của `main`.

**DỪNG.** Chờ người dùng báo CI xanh trên `main`.

---

### Task 10: BƯỚC TAY: thiết lập Vercel và GitHub

**Người làm:** người dùng, theo `docs/van-hanh.md` mục 8.1 bước 2 tới 11 (đã viết ở Task 7). Tóm tắt để đánh dấu:

- [ ] Project Vercel trong team đang chứa landing DocOps, import `agentra-code/eduflow-landing-page`, không biến môi trường ở màn import; bản dựng đầu đỏ ở chốt chặn (đúng).
- [ ] Branch Tracking của Production: `production-from-tags-only`.
- [ ] Node 24.x, `sin1`, biến môi trường Production và Preview (`NEXT_PUBLIC_SITE_URL=https://eduflow.agentra.io.vn`), công tắc biến hệ thống bật, Standard Protection, Git Fork Protection, Analytics và Speed Insights.
- [ ] Domain `eduflow.agentra.io.vn` gắn Production; DNS đổi từ VPS `42.115.41.70` sang bản ghi Vercel; chứng chỉ đã cấp.
- [ ] Token theo project, hạn 1 năm; Team ID; Project ID.
- [ ] Environment `production` trên GitHub: rule `main` và tag `v*`; secret `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- [ ] Tag ruleset `v*` (chặn cập nhật, xoá; tuỳ chọn chặn tạo); tuỳ chọn ruleset cho `main`; phê duyệt workflow từ fork.

Kiểm được từ máy (chỉ đọc, agent làm được khi người dùng báo xong):

```bash
dig +short eduflow.agentra.io.vn                      # không còn 42.115.41.70
curl -sI https://eduflow.agentra.io.vn/ | head -1     # có phản hồi HTTPS (404 của Vercel là đúng trước khi phát hành)
```

**DỪNG.** Chờ người dùng báo xong cả danh sách.

---

### Task 11: BƯỚC TAY: phát hành `v1.0.0` và kiểm

- [ ] **Step 1: Gắn và đẩy tag** (BƯỚC TAY)

```bash
git tag -a v1.0.0 -m "EduFlow landing 1.0.0" main
git push origin v1.0.0
```

- [ ] **Step 2: Theo dõi workflow `Release`**

`gate`, `deploy`, `verify`, `github-release` xanh. Đỏ thì tra bảng ở `docs/van-hanh.md`, mục 8.2.

- [ ] **Step 3: Kiểm từ ngoài** (agent làm được, chỉ đọc)

```bash
curl -s https://eduflow.agentra.io.vn/version.json; echo                # "version":"1.0.0", "environment":"production"
git rev-parse 'v1.0.0^{commit}'                                          # bằng "commit" ở trên
curl -sI https://eduflow.agentra.io.vn/version.json | grep -i x-robots-tag
curl -sI https://eduflow.agentra.io.vn/ | grep -i x-robots-tag           # không in gì
```

Rồi `docs/van-hanh.md`, mục 2 bước 5 tới 8 (HTTPS, header bảo mật, robots, sitemap 24 URL, canonical, Search Console, Analytics) và danh sách mục 6.

- [ ] **Step 4: Thử preview của `main`**

Một commit nhỏ bất kỳ lên `main` (ví dụ sửa chữ trong tài liệu) phải tạo bản Preview trên Vercel, không đổi `https://eduflow.agentra.io.vn/version.json`.

**DỪNG.** Báo người dùng kết quả kiểm.

---

## Hoà với Kế hoạch 1 (nhánh `feat/redesign-seo-docs`)

Khi nhánh này đã vào `main`, người thực thi Kế hoạch 1 hoà `main` vào `feat/redesign-seo-docs` ở một điểm dừng giữa hai task (không giữa một task).

**Trước khi hoà:** ở cây làm việc chính, tệp `docs/superpowers/plans/2026-10-15-eduflow-landing-release-vercel.md` là bản chưa commit của kế hoạch này; `main` đã có bản đã commit cùng đường dẫn, nên git sẽ từ chối hoà. So hai bản (`diff`), giống nhau thì xoá bản chưa commit rồi mới hoà.

| Tệp | Kế hoạch này đổi | Kế hoạch 1 đổi | Cách hoà |
|---|---|---|---|
| `README.md` | Câu Route Handler ở đoạn mở đầu; danh sách liên kết; một đoạn trong mục CI; cây thư mục (4 dòng); đoạn cuối mục "Biến môi trường"; thay mục "Cài đặt trên Vercel" bằng "Vercel và phát hành"; bước 2 của "Trạng thái sắp phát hành" | Task 4: đường dẫn mới; Task 11, 18, 24: mục mới, đoạn mở đầu (58 URL, Route Handler cho `llms.txt`, `llms-full.txt`, `/og/docs/[slug]`), bảng lệnh, mục CI (bước seo-audit) | Giữ cả hai. Đoạn mở đầu: gộp thành một câu "Route Handler: `/version.json` (tĩnh), `llms.txt`, `llms-full.txt`, `/og/docs/[slug]`". Cây thư mục và mục CI: giữ mọi dòng thêm của hai bên. |
| `docs/van-hanh.md` | Hàng 8 ở bảng đầu; đoạn "Sau khi sửa tệp hỏng" (mục 1); mục 2 (dẫn, bước 2, 4, 6); mục 6 (hai ô thay, một ô thêm); mục 8 cuối tệp | Task 4: đường dẫn mới; Task 24: hai mục cuối "Ngày ra mắt trên domain thật" và "Theo dõi hằng tháng", 8 URL Lighthouse thành 10 | Cuối tệp: mục 8 trước, hai mục của Kế hoạch 1 sau. Chữ "deploy lại" nào Kế hoạch 1 thêm thì đổi theo mục 8.4, cách 2. |
| `.github/workflows/ci.yml` | Khối `concurrency` | Task 24: bước seo-audit, đường dẫn artifact | Hai khối khác nhau; xung đột thì giữ cả hai. |
| `tests/unit/ci-config.test.ts` | Test đầu (concurrency) | Task 4: danh sách Lighthouse; Task 24: thay test Lighthouse, thêm test seo-audit | Giữ test concurrency của kế hoạch này và các test của Kế hoạch 1. |
| `package.json` | `version` 1.0.0 | Không đổi | Tự hoà. |
| `lib/env.ts`, `tests/unit/env.test.ts` | Chốt chặn `RELEASE_TAG` | Không đổi | Tự hoà. Lệnh SEO-AUDIT và bước seo-audit của CI dựng với `VERCEL_ENV=production` mà không có `VERCEL=1`, nên không cần `RELEASE_TAG`: **không** thêm `VERCEL=1` vào các lệnh đó. |
| `next.config.ts`, `proxy.ts` | Không đổi | Task 4 viết lại `headers()` và thêm `redirects()`; Task 17 thêm `og/` vào matcher | Không xung đột. `/version.json` nằm ngoài matcher nhờ dấu chấm. Bản production do workflow dựng có `VERCEL_ENV=production`, nên chuyển hướng `*.vercel.app` của quyết định 15 có hiệu lực ở production, còn preview thì không. |

Sau khi hoà: `pnpm verify`, E2E-FEED, lệnh SEO-AUDIT của Kế hoạch 1, rồi `grep -n "deploy lại\|Push \`main\` thì ra production" README.md docs/van-hanh.md` (không in gì). Kế hoạch 3 (ra mắt giao diện mới) lên production bằng một phiên bản mới theo mục 8.2 (PO chọn `1.1.0` hay `2.0.0`); không có đường deploy nào khác.

## Chưa kiểm được

1. Dashboard Vercel có nhận Production Branch là một nhánh chưa tồn tại không (có đường dự phòng ở mục 8.1 bước 3).
2. Bản dựng đầu tiên khi import bị đỏ có được Vercel tính là "bản production đầu tiên" không; nếu không, các push tiếp theo lên `main` có thể vẫn là production và đỏ ở chốt chặn cho tới khi `v1.0.0` lên (vô hại, nhưng `main` chưa có preview tới lúc đó).
3. Token theo project (ra mắt 30/07/2026) có chạy đủ `vercel pull`, `vercel deploy --prebuilt`, `vercel promote` không; tài liệu không nói (dự phòng: token theo team).
4. Header `X-Robots-Tag` của route tĩnh `/version.json` còn nguyên khi Vercel phục vụ từ CDN (mới kiểm trên `next start`; mục 8.3 có lệnh kiểm).
5. `next.config.ts` không chạy lại lúc runtime trên Vercel (hàm của Next ở chế độ tối giản đọc cấu hình đã tuần tự hoá lúc dựng): dựa vào hiểu biết về `@vercel/next`, chưa kiểm trên bản deploy thật. Nếu sai, chốt chặn sẽ ném lúc runtime vì thiếu `RELEASE_TAG`; job `verify` gọi `/` và `/version.json` (đều tĩnh) nên có thể không bắt được; kiểm thêm một trang ISR như `/tai-ve` sau lần phát hành đầu.
6. Gói của team (Hobby hay Pro): quyết định độ sâu của Instant Rollback và sự kiện tuỳ chỉnh của Vercel Analytics.
7. `pnpm/action-setup` v6.1.0 với `packageManager: pnpm@9.15.0`, và Function Regions `sin1` có áp cho bản `--prebuilt` không: chỉ lần chạy thật đầu tiên trả lời.
8. Không đăng nhập được `gh` trên máy này nên chưa xem cài đặt repo trên GitHub (Actions, rulesets, environment); `origin/main` đọc bằng `git ls-remote`.

## Nguồn đã kiểm (15/10/2026)

- [V1] https://vercel.com/docs/deployments/environments : bản đầu tiên của project mới luôn là production, kể cả khi import hay dựng từ nhánh không phải production; preview cho nhánh khác nhánh production và pull request.
- [V2] https://vercel.com/kb/guide/can-i-use-a-non-default-branch-for-production : đổi nhánh production ở Settings, Environments, Production, Branch Tracking; mọi nhánh khác thành preview.
- [V3] https://vercel.com/docs/project-configuration/git-configuration : `git.deploymentEnabled` theo nhánh tắt mọi deploy tự động của nhánh đó.
- [V4] https://vercel.com/kb/guide/can-you-deploy-based-on-tags-releases-on-vercel : công thức của Vercel (tắt deploy từ Git, rồi `vercel pull`, `vercel build --prod`, `vercel deploy --prebuilt --prod` khi đẩy tag).
- [V5] https://community.vercel.com/t/disable-production-branch-tracking/23996 : nhân viên Vercel (03/10/2025): không tắt hẳn được production branch tracking.
- [V6] https://vercel.com/docs/cli/deploy : với `--prebuilt`, biến hệ thống không có lúc dựng; `--skip-domain` (chỉ với `--prod`) rồi `vercel promote`; stdout là URL của bản dựng; `--meta`.
- [V7] https://vercel.com/docs/cli/build : `--prod` dựng với biến của Production.
- [V8] https://vercel.com/docs/cli/pull : ghi `.vercel/.env.$target.local` và cài đặt project.
- [V9] https://vercel.com/docs/environment-variables/framework-environment-variables : biến kéo về máy không mang tiền tố framework (`VERCEL_ENV` không thành `NEXT_PUBLIC_VERCEL_ENV`).
- [V10] https://vercel.com/docs/environment-variables/system-environment-variables : `VERCEL`, `VERCEL_ENV`, `VERCEL_GIT_COMMIT_SHA`, công tắc "Enable access to System Environment Variables".
- [V11] https://vercel.com/docs/deployments/promoting-a-deployment : promote bản preview là dựng lại với biến production; promote bản production đang chờ không dựng lại; bản đã từng promote thì phải rollback.
- [V12] https://vercel.com/docs/instant-rollback : sau rollback, Vercel tắt tự gán domain production; `vercel promote` hoàn tác và bật lại; Hobby chỉ về bản ngay trước.
- [V13] https://vercel.com/docs/cli/rollback , https://vercel.com/docs/cli/promote , https://vercel.com/docs/cli/list : cú pháp, `--timeout`, `--yes`, `vercel list --prod -m key=value`.
- [V14] https://vercel.com/docs/accounts/access-tokens , https://vercel.com/changelog/project-scoped-tokens : token theo Full Account, team hay project.
- [V15] https://vercel.com/docs/deployment-protection : Standard Protection bảo vệ mọi URL trừ domain production.
- [V16] Mã Vercel CLI 61.1.0 (`npm pack vercel@61.1.0`, `dist/commands/build/index.js`, `dist/index.js`): `dotenv.config` không `override`; `process.env.VERCEL="1"` trước khi dựng; `SUBCOMMANDS_WITHOUT_TOKEN` có `build`; đọc `VERCEL_TOKEN` từ môi trường. Phiên bản 61.1.0 ra 29/09/2026 (`npm view vercel time`).
- [G1] https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency : tối đa một lượt chờ mỗi nhóm, lượt chờ cũ bị thay; `queue: max` không bảo đảm thứ tự.
- [G2] https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments : Deployment branches and tags, rule theo tag.
- [G3] https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow : tham số `head_sha`, `event`, `branch`, `per_page`.
- [G4] https://github.blog/changelog/2025-09-19-deprecation-of-node-20-on-github-actions-runners/ : runner chuyển action sang Node 24, nên dùng các bản major chạy `node24`.
- [G5] Bản phát hành và sha (đọc bằng `git ls-remote` và API công khai của GitHub): `actions/checkout` v7.0.1 (20/07/2026) `3d3c42e5aac5ba805825da76410c181273ba90b1`; `actions/setup-node` v7.0.0 (14/07/2026) `820762786026740c76f36085b0efc47a31fe5020`; `pnpm/action-setup` v6.1.0 (05/09/2026) `ea17c68df8912ef543352723c149a84f56e3d413` (commit của tag annotated).
- [G6] Ghi chú phát hành `actions/setup-node` v7.0.0 (mục tài liệu "Update caching recommendations to mitigate cache poisoning risks").
