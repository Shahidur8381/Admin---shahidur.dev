# 🛡️ Shahidur Rahman | Portfolio Admin Console & CMS

<div align="center">

[![Live Admin](https://img.shields.io/badge/Live_Admin-admin.shahidur.dev-6366f1?style=for-the-badge&logo=shield&logoColor=white)](https://admin.shahidur.dev)
[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-shahidur.dev-00f59b?style=for-the-badge&logo=vercel&logoColor=black)](https://shahidur.dev)
[![Backend API](https://img.shields.io/badge/Backend_API-api.shahidur.dev-38bdf8?style=for-the-badge&logo=node.js&logoColor=white)](https://api.shahidur.dev)

[![Next.js 16](https://img.shields.io/badge/Next.js_16-App_Router-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Type_Safe-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-Cyber_Dark-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![SWR](https://img.shields.io/badge/SWR-Optimistic_Cache-black?style=flat-square&logo=vercel)](https://swr.vercel.app/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-Radix_Primitives-zinc?style=flat-square)](https://ui.shadcn.com/)

</div>

---

A high-performance, security-hardened Content Management System (CMS) and control center engineered specifically to manage the entire [shahidur.dev](https://shahidur.dev) portfolio ecosystem. Built with **Next.js 16 (App Router)**, **TypeScript**, and **Tailwind CSS v4**, it provides granular CRUD controls, intuitive drag-and-drop reordering, and multi-layered TOTP security.

🌐 **Production URL**: [admin.shahidur.dev](https://admin.shahidur.dev)

---

## ⚡ Key Capabilities & Features

### 🔐 Multi-Tier Security & TOTP Authentication
- **Google Authenticator TOTP**: Two-factor time-based one-time password verification required for administrative access.
- **60-Minute Ephemeral Sessions**: Auto-generated 3,600-second session tokens with a real-time HUD countdown timer in the header.
- **Emergency Session Killswitch**: One-click purge to instantly destroy active session tokens both locally and on the server.
- **Safe Guest View (Read-Only)**: Recruiter-friendly sandbox mode allowing visitors to explore the admin interface, inspect modules, and preview features without modification privileges.

### 🖱️ Native Drag-to-Reorder Engine
- **Universal Reordering**: Smooth drag handles across all collections (**Projects**, **Experiences**, **Education**, **"What I Built"**, **Testimonials**, **Nav Links**, and **Social Links**).
- **Optimistic UI with SWR**: The interface re-indexes instantly upon drop, providing buttery-smooth feedback before network completion.
- **Batch Endpoint Synchronization**: Efficiently pushes sequential sort order updates via dedicated batch routes (`PUT /api/admin/reorder/:table`).

### 📱 Independent Social & Contact Links Hub
- **Universal Profile Management**: Add, update, reorder, or toggle any social/contact profile (GitHub, LinkedIn, WhatsApp, Telegram, LeetCode, Codeforces, Email, Facebook, etc.).
- **Smart Placement Controls**: Independent switches to control whether a link appears in the interactive **Contact Dialog**, the **Footer**, or both.
- **Platform Presets**: Auto-completes platform iconography, URL formats, and brand colors with one click.

### 📄 Dynamic Resume / CV Manager
- **Direct PDF Upload**: Upload new Resume/CV documents directly to cloud media storage.
- **Manual URL Override**: Seamlessly link external Google Drive, Notion, or CDN resume links.
- **Instant Live Synchronization**: Updates the live `/resume` and `/cv` routes on the portfolio in real time.

### 🎛️ Full CRUD Management Suite
- **Personal Information**: Edit developer name, rotating hero roles, greetings, bio intros, and portrait avatar.
- **Featured Projects**: Configure project titles, rich descriptions, GitHub source code, live demo URLs, and interactive tech stack tags.
- **Career & Education Timelines**: Manage historical milestones with organization names, roles, date ranges, and custom badge colors.
- **"What I Built" Pillars**: Highlight core architectural strengths (Full-Stack, 3D WebGL, AI/ML, Cloud Infrastructure).
- **Client Testimonials**: Curate client feedback, designations, company names, and avatars.

### ⚡ Built-in Zero-CORS Next.js Proxy
- Built-in Next.js Route Handler (`/api/backend/[...path]`) proxies API requests to the remote backend, eliminating CORS preflight friction across development and staging environments.

---

## 🏗️ Portfolio Ecosystem Architecture

| System | Role | Repository | Live URL |
| :--- | :--- | :--- | :--- |
| **Admin Panel** *(This Repo)* | Content Management & Control Console | [Admin---shahidur.dev](https://github.com/Shahidur8381/Admin---shahidur.dev) | [`admin.shahidur.dev`](https://admin.shahidur.dev) |
| **Portfolio Frontend** | 3D Interactive Web Application | [Portfolio---shahidur.dev](https://github.com/Shahidur8381/Portfolio---shahidur.dev) | [`shahidur.dev`](https://shahidur.dev) |
| **Backend REST API** | Express & SQLite/Drizzle CMS Engine | [backend-Shahidur-s-Portfolio-Website](https://github.com/Shahidur8381/backend-Shahidur-s-Portfolio-Website) | [`api.shahidur.dev`](https://api.shahidur.dev) |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type checking)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Cyberpunk dark aesthetic, glassmorphic tokens)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
- **State & Caching**: [SWR](https://swr.vercel.app/) (Optimistic mutation caching)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/) (Dark-mode toast engine)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18.17 or later)
- npm, yarn, or pnpm

### 1. Installation

```bash
git clone https://github.com/Shahidur8381/Admin---shahidur.dev.git
cd Admin---shahidur.dev
npm install
```

### 2. Environment Configuration

Create a `.env.local` file:

```env
# URL for the proxy to forward requests to:
NEXT_PUBLIC_REMOTE_API=https://api.shahidur.dev/api

# Local API URL used by the client components:
NEXT_PUBLIC_API_URL=/api/backend
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser.

---

## 🚢 Production Deployment

Optimized for instant zero-configuration deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set `NEXT_PUBLIC_REMOTE_API` in the Environment Variables dashboard.
4. Deploy!

---

## 📄 License

Created and maintained by **Shahidur Rahman**. Distributed under the MIT License.
