# 🛡️ Shahidur's Portfolio - Admin Panel

A comprehensive, ultra-aesthetic, dark-mode Content Management System (CMS) tailored specifically for managing my developer portfolio. Built with modern web technologies, it provides complete control over every aspect of the portfolio website.

🌐 **Live Admin**: [admin.shahidur.dev](https://admin.shahidur.dev)

---

## ✨ Key Features

### 🔐 Secure TOTP Authentication
- **Google Authenticator Integration**: Time-based One-Time Password (TOTP) authentication for secure access.
- **Persistent Auth State**: Sessions are stored securely and headers are auto-injected into every API request.
- **Real-time Validation**: Instant visual feedback on token expiration with automatic UI locking.

### 🖱️ Native Drag-and-Drop Reordering
- Zero-dependency, lightweight HTML5 drag-and-drop implementation.
- Intuitive drag handles to instantly reorder items across all collections (Projects, Experiences, Education, Testimonials, etc.).
- Optimistic UI updates for immediate feedback before the server responds.

### 👁️ Homepage Visibility Master Control
- Global master control to easily toggle the visibility of any item on the live homepage.
- Instant, optimistic toggle switches across all modules.

### 📝 Comprehensive CRUD Modules
Full control over all portfolio content areas:
- **Personal Info**: Manage name, titles, rotating roles, portrait, and resume/CV URL.
- **Projects**: Detailed project management with interactive tech-tag builders, gradient styling, and live demo links.
- **Experiences & Education**: Timeline management with customizable icons, background colors, and detailed descriptions.
- **"What I Built" Pillars**: Highlight core engineering strengths (e.g., Full-Stack, AI & ML).
- **Testimonials & Social Links**: Manage client feedback and all social/contact links dynamically.

### ⚡ Built-in Zero-CORS Proxy
- Seamless Next.js Route Handler proxy (`/api/backend/*`) to bypass CORS restrictions during local development and production.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (Custom glassmorphism & dark UI tokens)
- **Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix UI primitives)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Fetching**: [SWR](https://swr.vercel.app/) (Optimistic UI caching)

---

## 🚀 Setup & Deployment

### Prerequisites
- Node.js (v18+)
- Backend API running locally or remotely.

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/Shahidur8381/Admin---shahidur.dev.git
   cd Admin---shahidur.dev
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=https://api.shahidur.dev/api
   ```

3. **Run the Server**
   ```bash
   npm run dev
   ```
   The admin panel will be available at `http://localhost:3000`.

### Deployment
Easily deployable on Vercel:
1. Push your code to GitHub.
2. Import the project in Vercel.
3. Set the `NEXT_PUBLIC_API_URL` environment variable.
4. Deploy!
