# Nestora

Your Home. Your Money. Organised.

A household expense & income tracker for a single person or household — not for
business/office accounting. Built with React 19, Vite, Tailwind CSS v4, React
Router, and Firebase (Auth + Firestore).

## Status

**All 4 phases are built.**

- **Phase 1 — Foundation:** email/password + Google sign-in, forgot password, remember me,
  email verification, collapsible sidebar + mobile nav, dark/light mode, dashboard, full
  transaction CRUD with search/filter/sort.
- **Phase 2 — Bills, Budget, Savings:** recurring bills with due dates and paid/unpaid status,
  an overall + per-category monthly budget with overspending alerts, savings goals with
  progress tracking and an "add funds" action. The Dashboard's budget/savings/bills cards
  now show real numbers instead of empty states.
- **Phase 3 — Analytics, reports, search, notifications:** six interactive charts (recharts)
  with a month filter, a Reports & Export section in Settings (CSV, Excel, and print-to-PDF),
  a global search modal (transactions, categories, notes, tags, bills), and an in-app
  notification bell.
- **Phase 4 — Polish:** toast confirmations on every save/delete, skeleton loading states,
  entrance animations on modals and dropdowns, a print stylesheet for reports.

**Two scoping notes worth knowing:**
- *Notifications* are computed live from your data and shown in-app via the bell icon
  (upcoming/overdue bills, over-budget categories, goal progress, a monthly summary) — not
  push notifications to your phone. True push notifications need a server component (Firebase
  Cloud Functions on a schedule, or similar) that a static Vercel site doesn't have; this can be
  added later if you want it.
- *PDF export* uses the browser's native print-to-PDF (a clean, hidden print view + a "Print /
  Save as PDF" button) instead of a PDF-generation library. It's more reliable and needed zero
  extra dependencies, and Safari on iPad supports "Save as PDF" from the print dialog natively.

## Folder structure

```
src/
  firebase/config.ts        Firebase init (placeholder credentials — see below)
  types/index.ts             Shared types + category/payment-method lists
  lib/
    format.ts                 Currency formatting helper
    export.ts                 CSV + Excel export helpers
  contexts/                  Auth, theme, and toast state
  hooks/                      One hook per Firestore collection + useNotifications
  components/
    ui/                      Button, Input, Card, Skeleton primitives
    layout/                  Sidebar, MobileNav, AppLayout
    auth/                    ProtectedRoute
    transactions/            TransactionModal
    bills/                   BillModal
    budget/                  BudgetModal
    savings/                 SavingsGoalModal
    search/                  GlobalSearch modal
    notifications/           NotificationCenter (bell + dropdown)
  pages/                     One file per route
```

## 1. Firebase setup

1. Go to the [Firebase console](https://console.firebase.google.com) and create a
   new project (or reuse an existing one — Nestora is fully separate from any
   other app as long as you use different collection names, which it already does
   by nesting everything under `users/{uid}/...`).
2. **Authentication** → Sign-in method → enable **Email/Password** and **Google**.
3. **Firestore Database** → Create database → start in production mode.
4. In Firestore → **Rules**, paste the contents of `firestore.rules` from this repo
   and publish.
5. Project settings → General → Your apps → Add app → Web. Copy the config object
   it gives you.
6. Open `src/firebase/config.ts` and replace the six `REPLACE_...` placeholders
   with your real values. These values are safe to commit — they're not secret;
   access control comes from the security rules you published in step 4.

## 2. Deploy on Vercel

1. Create a new GitHub repo and add these files to it (preserving the folder
   structure above).
2. On [vercel.com](https://vercel.com), **Add New → Project**, import the repo.
   Vercel auto-detects Vite — no config needed beyond the `vercel.json` already
   included (it makes page refreshes on routes like `/transactions` work correctly).
3. Deploy. Vercel runs `npm install` and `npm run build` for you — you never need
   to run these locally.
4. Every push to the main branch auto-redeploys.

If a build fails, copy the error from Vercel's deployment log back into the chat
and it can be fixed directly — since this was written without being able to run
the build locally, that's the fastest way to catch anything that slipped through.

## 3. Local development (optional)

Not required for your workflow, but if you ever have access to a machine with
Node.js installed:

```
npm install
npm run dev       # local dev server
npm run build     # production build, output in dist/
```

## Dependencies

- `react`, `react-dom` — UI
- `react-router` — routing (v7+ merged `react-router-dom` into this package)
- `firebase` — Auth + Firestore
- `lucide-react` — icons
- `recharts` — Analytics charts
- `xlsx` — Excel export
- `tailwindcss`, `@tailwindcss/vite` — styling (v4, CSS-first config in `src/index.css`)
- `vite`, `@vitejs/plugin-react`, `typescript` — build tooling
