# 🏭 StockFlow IMS — Complete Setup Guide for Your PC

## Prerequisites

Install these first:

| Tool | Download | Verify |
|------|----------|--------|
| **Node.js v18+** | https://nodejs.org/ (LTS) | `node --version` |
| **Git** (optional) | https://git-scm.com/ | `git --version` |

---

## ⚡ Quick Setup (Copy-Paste Ready)

### Step 1 — Create project folder

```bash
mkdir StockFlow
cd StockFlow
npm init -y
```

### Step 2 — Install ALL dependencies (pinned compatible versions)

```bash
npm install react@19 react-dom@19 react-router-dom zustand recharts lucide-react clsx tailwind-merge
```

```bash
npm install -D vite@7 @vitejs/plugin-react typescript @tailwindcss/vite@4 tailwindcss@4 @types/react @types/react-dom @types/node
```

> ⚠️ **IMPORTANT:** Must use `vite@7` (NOT vite@8). Vite 8 is incompatible with @tailwindcss/vite.

### Step 3 — Create folder structure

**Windows (CMD):**
```cmd
mkdir src\types src\utils src\store src\components src\pages
```

**Mac/Linux:**
```bash
mkdir -p src/types src/utils src/store src/components src/pages
```

### Step 4 — Create config files

Create each file below. You can use VS Code or any editor.

---

## 📄 Config Files

### `package.json` — Replace the scripts section

Open `package.json` and make sure the scripts block looks like:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### `tsconfig.json` — Create this file in root

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"]
}
```

### `vite.config.ts` — Create this file in root

```typescript
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

### `index.html` — Create this file in root

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StockFlow IMS - Inventory Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `src/index.css`

```css
@import "tailwindcss";
```

### `src/main.tsx`

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

---

## 📁 Source Files — Create Each One

Create these files in order. Copy the FULL content from the project.

| # | File Path | What it does |
|---|-----------|-------------|
| 1 | `src/types/index.ts` | TypeScript interfaces for all entities |
| 2 | `src/utils/cn.ts` | Tailwind class merge utility |
| 3 | `src/utils/seedData.ts` | Demo data (products, warehouses, etc.) |
| 4 | `src/store/inventoryStore.ts` | Zustand store — ALL business logic |
| 5 | `src/components/Sidebar.tsx` | Navigation sidebar component |
| 6 | `src/pages/Auth.tsx` | Login / Signup / OTP Reset |
| 7 | `src/pages/Dashboard.tsx` | KPI cards + charts |
| 8 | `src/pages/Products.tsx` | Product CRUD + stock view |
| 9 | `src/pages/Receipts.tsx` | Incoming goods management |
| 10 | `src/pages/Deliveries.tsx` | Outgoing goods management |
| 11 | `src/pages/Transfers.tsx` | Internal stock transfers |
| 12 | `src/pages/Adjustments.tsx` | Stock corrections |
| 13 | `src/pages/MoveHistory.tsx` | Audit trail / stock ledger |
| 14 | `src/pages/Warehouses.tsx` | Warehouse settings |
| 15 | `src/pages/Profile.tsx` | User profile page |
| 16 | `src/App.tsx` | Main app with routing logic |

---

## ▶️ Run the App

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

### Login Credentials

| Field | Value |
|-------|-------|
| Email | `alex@stockflow.com` |
| Password | `admin123` |

---

## 🏗️ Build for Production

```bash
npm run build
npm run preview
```

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ERESOLVE unable to resolve dependency` | Use `vite@7` not `vite@8` |
| Module not found errors | `rm -rf node_modules && npm install` (or `rmdir /s /q node_modules` on Windows) |
| Port 5173 already in use | `npm run dev -- --port 3000` |
| Blank white page | Open F12 → Console tab → check for errors |
| Data seems stuck/corrupted | Open F12 → Console → type `localStorage.clear()` → refresh |
| Styles not loading | Ensure `src/index.css` has `@import "tailwindcss";` |

---

## 📂 Final Folder Structure

```
StockFlow/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── node_modules/
└── src/
    ├── main.tsx
    ├── index.css
    ├── App.tsx
    ├── types/
    │   └── index.ts
    ├── utils/
    │   ├── cn.ts
    │   └── seedData.ts
    ├── store/
    │   └── inventoryStore.ts
    ├── components/
    │   └── Sidebar.tsx
    └── pages/
        ├── Auth.tsx
        ├── Dashboard.tsx
        ├── Products.tsx
        ├── Receipts.tsx
        ├── Deliveries.tsx
        ├── Transfers.tsx
        ├── Adjustments.tsx
        ├── MoveHistory.tsx
        ├── Warehouses.tsx
        └── Profile.tsx
```
