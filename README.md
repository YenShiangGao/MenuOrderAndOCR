# Restaurant System

外包餐廳形象網站 + 後台管理系統。

- **M1(已完成)**:形象網站 + 公開菜單(ISR)+ 後台(分類 / 菜品 CRUD + 圖片上傳)
- **M2(規劃中)**:LIFF 線上點餐 + 訂單管理 + LINE 通知老闆
- **M3(規劃中)**:成本 / 薪資 / 房租後台 + Google Sheets 同步 + LINE Bot 手寫帳本 OCR

**Production**:https://menu-order-and-ocr.vercel.app
**Repo**:https://github.com/YenShiangGao/MenuOrderAndOCR

---

## 技術棧

| 層 | 選擇 |
|---|---|
| Framework | Next.js 16 App Router(注意:`middleware` 在 16 改名為 `proxy.ts`) |
| Runtime | React 19 / TypeScript 5 |
| UI | Tailwind CSS v4 + shadcn/ui(`base-nova` style,底層是 `@base-ui/react`,**不是** Radix) |
| ORM | Prisma 7(新版 `prisma-client` generator + `@prisma/adapter-pg`) |
| DB / Storage | Supabase Postgres(Session Pooler)+ Supabase Storage |
| Auth(後台) | iron-session(加密 cookie,7 天 TTL) |
| 驗證 / 表單 | Zod + React Hook Form |
| 圖示 / Toast | lucide-react / sonner |
| 部署 | Vercel |

> ⚠️ 不要把 `asChild` 寫在 shadcn 元件上 — 我們用的是 base-ui,要用 `render={...}` 或 `buttonVariants()` 套在 `Link` 上。

---

## 本機開發

```bash
# 1. 安裝依賴(會自動 prisma generate)
pnpm install

# 2. 複製 env 範本並填入連線資訊
cp .env.example .env
# 編輯 .env,至少要有 DATABASE_URL / SESSION_SECRET / NEXT_PUBLIC_SUPABASE_URL
#                 / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_STORAGE_BUCKET

# 3. 套用 schema 到資料庫(第一次或 schema 改動)
pnpm db:push

# 4. 塞入種子資料(只需第一次,會建立預設 admin + 範例分類)
pnpm db:seed

# 5. 啟動 dev server
pnpm dev
```

預設後台帳號:`owner@example.com` / `ChangeMe123!`
覆蓋方式:`.env` 設 `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 後再跑 `pnpm db:seed`。

---

## 常用指令

| 指令 | 說明 |
|---|---|
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 產線構建(本機 sanity check 用) |
| `pnpm lint` | ESLint |
| `pnpm db:push` | 把 schema 推到資料庫(開發用,不產 migration 檔) |
| `pnpm db:migrate` | 建立並套用 migration(以後上正式 prod 改 schema 用) |
| `pnpm db:studio` | 開啟 Prisma Studio(GUI 看 DB 資料) |
| `pnpm db:seed` | 跑種子腳本 |
| `pnpm db:generate` | 重新產生 Prisma Client(`pnpm install` 已自動跑) |
| `pnpm exec tsx scripts/check-bucket.mjs` | 確認 Supabase Storage bucket 存在且 public |
| `pnpm exec tsx scripts/test-upload.mjs` | 端到端測試 Storage 上傳 / 公開讀取 / 刪除 |

---

## 專案結構

```
restaurant-system/
├── prisma/
│   ├── schema.prisma             AdminUser / MenuCategory / MenuItem
│   └── seed.ts                   建初始 admin + 3 個範例分類
├── prisma.config.ts              Prisma 7 datasource(讀 DATABASE_URL)
├── next.config.ts                images.remotePatterns(whitelist Supabase host)
├── scripts/                      ops 用 mjs(check-bucket / test-upload)
└── src/
    ├── app/
    │   ├── layout.tsx            根 layout(metadata、metadataBase、lang=zh-Hant)
    │   ├── globals.css           Tailwind + shadcn theme tokens + smooth scroll
    │   ├── sitemap.ts            動態 sitemap(/、/menu)
    │   ├── robots.ts             allow / disallow /admin /login /api
    │   ├── (public)/             route group(共用 SiteHeader / SiteFooter)
    │   │   ├── layout.tsx
    │   │   ├── page.tsx          形象首頁(Hero / About / Specialties / Contact)
    │   │   └── menu/page.tsx     公開菜單(ISR=60s)
    │   ├── admin/                後台(layout 內驗證 session)
    │   │   ├── layout.tsx        sidebar + 真正 session 檢查 + Toaster
    │   │   ├── page.tsx          dashboard(計數卡片)
    │   │   └── menu/
    │   │       ├── categories/page.tsx
    │   │       └── items/page.tsx
    │   └── login/                登入(已登入會自動跳 /admin)
    ├── proxy.ts                  Next.js 16 中介層,做 cheap cookie check
    ├── components/
    │   ├── ui/                   shadcn 產的 primitives(Button/Card/Dialog 等)
    │   ├── admin/                後台元件(sidebar、category/item table & dialog)
    │   └── site/                 形象網站元件
    │       ├── site-header.tsx
    │       ├── site-footer.tsx
    │       ├── placeholder-image.tsx   零素材依賴的 CSS 佔位塊
    │       └── sections/         hero / about / specialties / contact
    ├── lib/
    │   ├── prisma.ts             Prisma singleton + PrismaPg adapter
    │   ├── session.ts            iron-session 設定 + getSession()
    │   ├── supabase-admin.ts     service_role client(server-only)
    │   ├── env.ts                Zod 驗證的環境變數
    │   ├── site-content.ts       ★ 形象網站文案 / 招牌料理 / 聯絡資訊「唯一真相」
    │   └── utils.ts              cn helper
    ├── server/                   "use server" 業務邏輯
    │   ├── auth.ts               loginAction / logoutAction
    │   ├── menu.ts               分類 / 菜品 CRUD server actions
    │   └── storage.ts            uploadMenuImage / deleteMenuImage
    └── generated/prisma/         Prisma client 產出(.gitignore)
```

---

## Production 部署(Vercel)

正式 URL:https://menu-order-and-ocr.vercel.app

### 環境變數(Vercel Project Settings → Environment Variables)

| Key | Production / Preview 都要設 |
|---|---|
| `DATABASE_URL` | Supabase Session Pooler URL(IPv4 OK) |
| `SESSION_SECRET` | 至少 32 byte 隨機字串(`openssl rand -base64 48`),**跟 local 不同** |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role JWT(API Keys 分頁) |
| `SUPABASE_STORAGE_BUCKET` | `menu-images` |
| `NEXT_PUBLIC_SITE_URL` | 部署後的 URL,例如 `https://menu-order-and-ocr.vercel.app` |

> Vercel 會自動設 `NODE_ENV=production`,不需手動填。

### 部署流程

- Push 到 `main` → Vercel 自動 build & deploy(production)
- PR → 自動產生 preview URL(`*-git-*.vercel.app`)
- Build 由 `pnpm install`(觸發 `postinstall: prisma generate`)+ `next build` 組成

### 切到客戶域名

1. Vercel Project → **Settings → Domains** → 加客戶網域(例如 `yourrestaurant.com.tw`)
2. 客戶 DNS 設 CNAME 指向 Vercel 提供的目標
3. **更新 `NEXT_PUBLIC_SITE_URL`** 為新網域 → 觸發 redeploy(讓 sitemap / robots / OG meta 跟著換)

---

## 維運操作(Ops)

### 重設 Supabase 密碼或 service_role key

1. Supabase Dashboard → **Project Settings → Database / API Keys** → Reset
2. 更新本機 `.env`(密碼有特殊字元記得 URL-encode)
3. 更新 Vercel env vars(`DATABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY`)
4. Vercel **Redeploy**(取消「Use existing Build Cache」)

### 新增 / 重設後台 admin 帳號

目前沒有後台 UI 做這件事(M1 範圍外)。最快做法:

```bash
# 在本機(連到 production DB)
# 1. 暫時把 DATABASE_URL 改成 production 那條
# 2. 跑 prisma studio 從 GUI 改 admin_users.passwordHash
pnpm db:studio
```

或寫一支臨時腳本(參考 `prisma/seed.ts`)用 bcrypt 產 hash 後 upsert。

### 看 production logs

Vercel Dashboard → 對應 deployment → **Functions** / **Build Logs**。
Server actions 跟 Prisma query 都會印在 Functions tab。

### Storage 容量檢查

Supabase Dashboard → **Storage → menu-images**。免費方案 1 GB,大概可塞 ~1000 張正常壓縮的菜品照。
M1 沒實作刪舊圖時的 orphan cleanup,客戶頻繁換圖才會堆積。

---

## 架構重點筆記

### Auth(M1 用 iron-session 而非 Auth.js)

- `proxy.ts` 只做 **optimistic** cookie 存在檢查(沒 cookie → 重導 /login)
- **真正驗證**在 `app/admin/layout.tsx`(server component)讀 session 物件
- Session 是加密 cookie,7 天 TTL,production 自動 `secure: true`

### 售完(`MenuItem.soldOutAt`)

- 不是 boolean,是 DateTime 戳記
- 前台顯示時比對「戳記日期 === 今天」才算售完
- 過 0 點自動失效,**不需 cron**

### Sheets 同步(M3 才會做)

- 設計上**單向** DB → Sheet,不雙向
- 雙向會吃掉 1/3 工時處理衝突,且老闆塗色加欄位會把 mapping 弄壞

---

## 形象網站內容怎麼改

`src/lib/site-content.ts` 是唯一真相。改完那一個檔案,push 到 main,Vercel 會自動 deploy。

照片到位後:

1. 把照片放 `public/images/`(或之後改放 Supabase Storage)
2. 把對應 section(`hero.tsx` / `about.tsx` / `specialties.tsx`)裡的 `<PlaceholderImage>` 換成 `<Image src="..." />`
3. `Image` 從 `next/image` import,記得設 `width`/`height` 或包在固定大小容器內配 `fill`

---

## 客戶交付素材清單

見專案根目錄上一層的 `CLIENT_CHECKLIST.md`。

## 客戶後台操作手冊

給餐廳老闆 / 員工的「怎麼用後台」說明:`docs/admin-guide.md`(繁中,非技術語言)。

---

## Troubleshooting

| 症狀 | 怎麼查 |
|---|---|
| `P1001: Can't reach database server` | 你用了 IPv6-only 的 Direct connection。改用 Session Pooler URL(host 含 `pooler.supabase.com`) |
| Login 後立刻又被踢回 `/login` | `SESSION_SECRET` 短於 32 字 / Production cookie 沒被瀏覽器接受(檢查 HTTPS) |
| 圖片上傳 500 | `SUPABASE_SERVICE_ROLE_KEY` 沒設、bucket 不是 public、或 file > 5 MB |
| `/menu` 圖片 404 | bucket 不是 public(去 Supabase Storage → 該 bucket → Edit → Public ON) |
| `/menu` 改完不更新 | ISR 60 秒,或 push 後等 Vercel build 完;急的話強制重整 (Cmd+Shift+R) |
| Build 卡 `Cannot find module '@/generated/prisma/client'` | `pnpm install` 沒跑(或 lockfile 異常)— `postinstall` 會 `prisma generate` |
| `asChild does not exist on type` | 寫到 base-ui 元件了;改用 `render={<Link/>}` 或 `buttonVariants()` 套 className |
