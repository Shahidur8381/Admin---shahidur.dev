# Shahidur Rahman Portfolio — Admin Panel

A complete, ultra-aesthetic, dark-mode Content Management System (CMS) & Admin Panel for [shahidur.dev](https://shahidur.dev), built with **Next.js (App Router)**, **Tailwind CSS**, and **Shadcn UI**.

---

## Features

### 1. 🛡️ Google Authenticator (TOTP) Authentication
- **Persistent Header TOTP Input**: Enter your 6-digit Google Authenticator code in the top bar.
- **Auto-injected Auth Headers**: Every modification (`PUT`, `POST`, `DELETE`) automatically includes `Authorization: TOTP <code_here>`.
- **Active / Required Badges**: Visual indicator with real-time verification and instant 401 expiration toast alerts with pulsing red focus.
- **Auto-persisted in `localStorage`**: Survives page refreshes so you don't have to re-enter it repeatedly.

### 2. ⚡ Homepage Visibility Master Control (Critical)
- Every module (Projects, Experiences, Education, What I Built, Testimonials, Nav Links) features an **instant toggle switch**.
- Click the toggle switch to instantly trigger an optimistic update and `PUT` request to update `showOnHomepage`.
- The Dashboard Overview features a **Master Control Panel** where you can filter and toggle homepage visibility across all modules from one screen.

### 3. 👤 Personal Info Manager (`/personal`)
- Edit Name, Professional Title, Email, Salam greeting & meaning, and portrait URL.
- **Interactive Roles Tag Manager**: Add, edit, or remove rotating title tags (e.g., *An Engineer*, *A Developer*, *A Tech Innovator*).
- **Live Hero Preview**: Real-time rendering card simulating exactly how your hero bio appears to visitors.

### 4. 🚀 Portfolio Modules with Full CRUD
- **Projects (`/projects`)**: Cards & Table views, interactive tech-tag builder with gradient styling presets, source code & live demo links, search & filter.
- **Experiences (`/experiences`)**: Timeline milestones, icon emoji & background color picker, dynamic responsibilities/bullet points manager.
- **Education (`/education`)**: Degrees, institutions, GPA/grades, graduation dates, and descriptions.
- **What I Built (`/what-i-built`)**: Engineering pillars (Full-Stack, AI & ML, Blockchain & Web3), icon types, and primary highlights.
- **Testimonials (`/testimonials`)**: Client quotes, designations, companies, and avatar preview.
- **Nav Links (`/nav-links`)**: Main menu navigation links and HTML anchor IDs.

### 5. 🌐 Built-in Zero-CORS Next.js Proxy
- All client requests route through the Next.js Route Handler (`/api/backend/*`), seamlessly forwarding requests to `https://api.shahidur.dev/api/*`.
- Completely eliminates cross-origin browser CORS restrictions while allowing local development on any port.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack, TypeScript)
- **Styling**: Tailwind CSS v4 with custom dark glassmorphism & glowing accents
- **UI Components**: Shadcn UI inspired components built on Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, etc.)
- **Icons**: Lucide React
- **Data Fetching & Cache**: SWR with optimistic updates
- **Notifications**: Sonner Toasts

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev -- -p 3002
```
Open [http://localhost:3002](http://localhost:3002) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```
