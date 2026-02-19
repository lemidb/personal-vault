# 🔒 Personal Vault

Securely store and manage your sensitive data with **client-side encryption**.  
Personal Vault provides a robust dashboard for managing encrypted entries including passwords, notes, cards, and files — ensuring your private information stays private.

---

## ✨ Features

- **Secure Authentication**: Powered by Supabase Auth with email/password and session management.
- **Client-Side Encryption**: Sensitive data is encrypted before leaving your browser using industry-standard protocols.
- **Vault Management**: Create, view, update, and delete vault entries with categorized types (Login, Note, Card, File, etc.).
- **Real-Time Synchronization**: Instant updates across devices using Supabase Realtime.
- **Dashboard Analytics**: Statistical overview of your vault entries and security status.
- **Secure File Storage**: Upload and manage encrypted files within your vault.

---

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/)
- A Supabase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd personal-vault
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

---

## 🔒 Security

Personal Vault prioritizes your privacy.
All vault entry data is encrypted on the client side using crypto-js before being sent to the database. Your raw passwords and sensitive data are never stored in plain text on the server.

---

## 📄 License

This project is open-source and available publicly for anyone to use, explore, and contribute.
See the [LICENSE](LICENSE) file for details.
