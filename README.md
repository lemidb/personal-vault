# 🔒 DuwaVault - Personal Vault

Securely store and manage your sensitive data with a true **Zero-Knowledge Architecture**.  
DuwaVault provides a robust dashboard for managing encrypted entries including passwords, notes, cards, and files — ensuring your private information stays completely inaccessible to anyone but you.

---

## ✨ Features

- **Zero-Knowledge Architecture**: Your data is encrypted locally using Envelope Encryption. The server never sees or stores your raw Master Keys or Vault Passwords.
- **Secure Authentication**: Powered by Supabase Auth with email/password and session management.
- **Client-Side Encryption**: Sensitive data is encrypted before leaving your browser using the modern Web Crypto API (AES-GCM 256-bit).
- **Vault Management**: Create, view, update, and delete vault entries with categorized types (Login, Note, Card, File, etc.).
- **Real-Time Synchronization**: Instant updates across devices using Supabase Realtime.
- **Secure File Storage**: Upload and manage files within your vault, protected by unique per-file Data Encryption Keys (DEKs).

---

## 🛠️ Tech Stack

- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Database & Auth**: [Supabase](https://supabase.com/)
- **Cryptography**: Native Web Crypto API (`window.crypto.subtle`)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/) or [pnpm](https://pnpm.io/)
- A Supabase project

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/lemidb/personal-vault
   cd personal-vault
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Database Migration:**
   Apply the SQL migrations located in `supabase/migrations/` to your Supabase project using the Supabase CLI or SQL Editor to create the necessary cryptographic tracking tables:
   - `user_vault_keys`
   - `file_data_keys`

4. **Environment Setup:**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   # or
   pnpm run dev
   ```

---

## 🔒 Security Approach

DuwaVault prioritizes your absolute privacy.

We utilize an **Envelope Encryption** model using `PBKDF2` and `AES-GCM`. Your Vault Password is used to locally derive a Key Encryption Key (KEK) which wraps a master encryption key. All vault entry data, including files and text inputs, is encrypted on the client side before being sent to the database. Your raw Vault Password, Master Key, and sensitive data mathematically *cannot* be decrypted by the server or database administrators.

---

## 📄 License

This project is open-source and available publicly for anyone to use, explore, and contribute.
See the [LICENSE](LICENSE) file for details.
