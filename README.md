# 🏭 StockFlow IMS — Installation Guide

## Complete Step-by-Step Setup on Your PC

---

## 📋 Prerequisites

Before you begin, make sure you have these installed on your computer:

### 1. Node.js (v18 or higher)

**Check if installed:**
```bash
node --version
```

**If NOT installed:**
- Go to: https://nodejs.org/
- Download the **LTS version** (recommended)
- Run the installer → click "Next" through everything
- Restart your terminal after installation

### 2. npm (comes with Node.js)

**Check if installed:**
```bash
npm --version
```
Should show version 9+ or higher.

### 3. Git

**Check if installed:**
```bash
git --version
```

**If NOT installed:**
- Go to: https://git-scm.com/downloads
- Download and install for your OS
- Restart your terminal

### 4. Code Editor (Recommended)

- **VS Code**: https://code.visualstudio.com/
- Install extensions: ES7 React Snippets, Tailwind CSS IntelliSense, Prettier

---

## 🚀 Installation Steps

### Step 1: Create the Project Folder

Open your terminal (Command Prompt / PowerShell / Terminal) and run:

```bash
mkdir stockflow-ims
cd stockflow-ims
```

### Step 2: Initialize the Project

```bash
npm create vite@latest . -- --template react-ts
```

When prompted:
- If it asks "Current directory is not empty", select **Yes** (or delete contents first)
- Select **React**
- Select **TypeScript**

### Step 3: Install Dependencies

```bash
npm install
```

Then install the additional packages used by StockFlow:

```bash
npm install react-router-dom zustand recharts lucide-react clsx tailwind-merge
```

Install Tailwind CSS v4 (Vite plugin):

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### Step 4: Configure Vite

Replace the contents of `vite.config.ts` with:

```ts
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

### Step 5: Configure TypeScript Paths

Replace the contents of `tsconfig.json` with:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": ["node"],
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
```

Also install `@types/node` if not already present:

```bash
npm install -D @types/node
```

### Step 6: Set Up the CSS

Replace `src/index.css` with:

```css
@import "tailwindcss";

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-slate-50 text-slate-900 antialiased;
    font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  }
}

@theme {
  --color-border: oklch(0.922 0.004 286.32);
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-success: #16a34a;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #94a3b8;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* Smooth transitions */
.sidebar-link {
  @apply flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200;
}

/* Table row hover */
tr:hover td {
  background-color: #f8fafc;
}
```

### Step 7: Create the Folder Structure

```bash
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/store
mkdir -p src/components
mkdir -p src/pages
```

### Step 8: Create Source Files

Now you need to create each source file. Copy the contents from the project:

**Files to create (in order):**

```
src/types/index.ts          → TypeScript interfaces for all entities
src/utils/cn.ts             → Tailwind class merge utility
src/utils/seedData.ts       → Realistic demo data (products, warehouses, etc.)
src/store/inventoryStore.ts → Zustand store (all state & actions)
src/components/Sidebar.tsx  → Navigation sidebar
src/pages/Dashboard.tsx     → Dashboard with KPIs & charts
src/pages/Products.tsx      → Product CRUD management
src/pages/Receipts.tsx      → Incoming goods management
src/pages/Deliveries.tsx    → Outgoing goods management
src/pages/Transfers.tsx     → Internal stock transfers
src/pages/Adjustments.tsx   → Stock adjustment / counting
src/pages/MoveHistory.tsx   → Full audit trail / stock ledger
src/pages/Warehouses.tsx    → Warehouse management
src/pages/Profile.tsx       → User profile
src/pages/Auth.tsx          → Login / Signup / OTP Reset
src/App.tsx                 → Main app with routing
src/main.tsx                → Entry point (usually already exists)
```

### Step 9: Update index.html

Replace `index.html` in the root folder:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>StockFlow IMS — Inventory Management System</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### Step 10: Run the Application

```bash
npm run dev
```

This will output something like:

```
  VITE v7.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

**Open your browser and go to: http://localhost:5173/**

### Step 11: Login

Use the default credentials:

| Field    | Value                |
|----------|---------------------|
| Email    | `alex@stockflow.com` |
| Password | `admin123`           |

---

## 🏗️ Build for Production

To create a production build:

```bash
npm run build
```

The output will be in the `dist/` folder. You can serve it with:

```bash
npm run preview
```

---

## 📁 Final Folder Structure

```
stockflow-ims/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   └── vite.svg
├── src/
│   ├── main.tsx                    ← Entry point
│   ├── App.tsx                     ← Root component + routing
│   ├── index.css                   ← Global styles + Tailwind
│   ├── types/
│   │   └── index.ts                ← All TypeScript interfaces
│   ├── utils/
│   │   ├── cn.ts                   ← Class name merge utility
│   │   └── seedData.ts             ← Demo/seed data
│   ├── store/
│   │   └── inventoryStore.ts       ← Zustand state management
│   ├── components/
│   │   └── Sidebar.tsx             ← Navigation sidebar
│   └── pages/
│       ├── Auth.tsx                ← Login/Signup/Reset
│       ├── Dashboard.tsx           ← KPIs & Charts
│       ├── Products.tsx            ← Product CRUD
│       ├── Receipts.tsx            ← Incoming stock
│       ├── Deliveries.tsx          ← Outgoing stock
│       ├── Transfers.tsx           ← Internal moves
│       ├── Adjustments.tsx         ← Stock corrections
│       ├── MoveHistory.tsx         ← Audit trail
│       ├── Warehouses.tsx          ← Warehouse settings
│       └── Profile.tsx             ← User profile
```

---

## ❓ Troubleshooting

### "Module not found" errors
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 already in use
```bash
# Kill the process or use a different port
npm run dev -- --port 3000
```

### Tailwind styles not applying
Make sure your `src/index.css` starts with:
```css
@import "tailwindcss";
```

### TypeScript path alias errors (@/)
Make sure both `tsconfig.json` AND `vite.config.ts` have the path alias configured as shown in Steps 4 and 5.

### Blank page after login
Open browser DevTools (F12) → Console tab → check for errors.
Try clearing localStorage:
```javascript
// In browser console
localStorage.clear()
```
Then refresh the page.

### Build fails
```bash
# Check for TypeScript errors
npx tsc --noEmit
```

---

## 🔄 Git Setup (Optional but Recommended)

```bash
# Initialize git
git init

# Create .gitignore
echo "node_modules/
dist/
.env
.DS_Store" > .gitignore

# First commit
git add .
git commit -m "feat: initial StockFlow IMS setup"

# Connect to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/stockflow-ims.git
git branch -M main
git push -u origin main
```

### Branch Strategy for Team

```bash
# Create develop branch
git checkout -b develop
git push -u origin develop

# Each feature gets its own branch
git checkout -b feat/products
# ... make changes ...
git add .
git commit -m "feat(products): add CRUD with validation"
git push origin feat/products
# Then create a Pull Request on GitHub
```

---

## 🎯 Quick Reference

| Command            | What it does                    |
|--------------------|---------------------------------|
| `npm run dev`      | Start development server        |
| `npm run build`    | Build for production            |
| `npm run preview`  | Preview production build        |
| `npx tsc --noEmit` | Check TypeScript errors         |

---

## 🎉 You're Done!

Your StockFlow IMS should now be running at **http://localhost:5173/**

Login with `alex@stockflow.com` / `admin123` and explore:
- 📊 Dashboard with KPIs and charts
- 📦 Products with stock per warehouse
- 📥 Receipts (incoming goods)
- 🚚 Deliveries (outgoing goods)
- 🔄 Internal Transfers
- 📋 Stock Adjustments
- 📜 Move History (audit trail)
- 🏭 Warehouse Management
- 👤 User Profile