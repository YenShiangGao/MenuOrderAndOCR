# Restaurant System

外包餐廳形象網站 + 後台管理系統。分三個 Milestone:

- **M1**:形象網站 + 菜單後台(進行中)
- **M2**:LIFF 線上點餐 + 訂單管理 + LINE 通知
- **M3**:成本/薪資/房租後台 + Google Sheets 同步 + LINE Bot 手寫帳本 OCR

## 技術棧

- Next.js 16(App Router)+ TypeScript
- Tailwind CSS v4 + shadcn/ui(base-ui)
- Prisma 7 + PostgreSQL(Supabase)
- NextAuth(後台帳號 / Credentials)
- Zod + React Hook Form
- 部署:Vercel

## 開發

```bash
# 1. 安裝依賴
pnpm install

# 2. 複製 env 範本並填入 Supabase 連線字串
cp .env.example .env

# 3. 套用 schema 到資料庫(第一次)
pnpm db:push

# 4. 塞入種子資料(會建立預設 admin 帳號)
pnpm db:seed

# 5. 啟動 dev server
pnpm dev
```

預設後台帳號:`owner@example.com` / `ChangeMe123!`(可由 `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 環境變數覆蓋)。

## 常用指令

| 指令 | 說明 |
|---|---|
| `pnpm dev` | 啟動開發伺服器 |
| `pnpm build` | 產線構建 |
| `pnpm db:push` | 把 schema 推到資料庫(開發階段用) |
| `pnpm db:migrate` | 建立並套用 migration(正式環境用) |
| `pnpm db:studio` | 開啟 Prisma Studio(GUI 看資料) |
| `pnpm db:seed` | 跑種子腳本 |
| `pnpm db:generate` | 重新產生 Prisma Client |

## 專案結構

```
src/
├── app/                      Next.js App Router(routes + RSC)
│   ├── (public)/             顧客面網頁(形象站、菜單)
│   ├── admin/                後台(需登入)
│   └── api/                  API routes
├── components/
│   ├── ui/                   shadcn/ui 元件
│   ├── public/               顧客面元件
│   └── admin/                後台元件
├── lib/
│   ├── prisma.ts             Prisma client 單例
│   ├── env.ts                環境變數驗證
│   └── utils.ts              cn 等工具
├── server/                   server-only 業務邏輯(actions, services)
└── generated/prisma/         Prisma client 產出(gitignored)
```

## 客戶交付素材清單

見專案根目錄上一層的 `CLIENT_CHECKLIST.md`。

## 環境

- **本機**:`http://localhost:3000`
- **預覽**:每個 PR 自動在 Vercel 產生(`*-git-*.vercel.app`)
- **Staging**:`<staging-domain>.vercel.app`(待設定)
- **Production**:客戶域名上線前用 Vercel 預設域名
