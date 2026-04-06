# PromptVault 🗄️⚡

<div align="center">

![PromptVault Banner](https://img.shields.io/badge/PromptVault-AI_Prompt_Manager-6366f1?style=for-the-badge&logo=lightning&logoColor=white)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/atlas)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**The ultimate AI prompt management system.** Create, organize, and instantly inject your best prompts into ChatGPT, Gemini, and Claude.

[Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Google OAuth** | One-click sign-in with Google |
| 📝 **Prompt CRUD** | Create, edit, delete, and organize prompts |
| 🔍 **Smart Search** | Full-text search across title, tags, and content |
| 🏷️ **Categories** | Coding, Content, Marketing, Design, Research, Productivity |
| ⭐ **Favorites** | Star your most-used prompts |
| 📋 **Copy to Clipboard** | One-click copy with usage tracking |
| 🌐 **Public Sharing** | Share prompts via unique public URL |
| 📦 **Export / Import** | JSON export and bulk import |
| 🕐 **Version History** | Track up to 10 previous versions of each prompt |
| 🌙 **Dark / Light Mode** | Auto-detects system preference |
| 🧩 **Chrome Extension** | Floating panel on ChatGPT, Gemini & Claude with auto-inject |

---

## 🏗️ Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + React Router v6  
**Backend:** Node.js + Express.js + MongoDB (Mongoose)  
**Auth:** Google OAuth 2.0 + JWT  
**Extension:** Chrome Manifest v3  
**Deployment:** Render (frontend + backend) + MongoDB Atlas  

---

## 📁 Project Structure

```
promptvault/
├── client/                 # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── api/            # Axios instance
│   │   ├── components/     # Sidebar, PromptCard, PromptModal, SearchBar
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── hooks/          # usePrompts custom hook
│   │   └── pages/          # Login, Dashboard, Favorites, Categories, Profile
│   └── .env.example
├── server/                 # Node.js + Express backend
│   └── src/
│       ├── controllers/    # authController, promptController
│       ├── middleware/      # JWT auth middleware
│       ├── models/         # User, Prompt (Mongoose schemas)
│       └── routes/         # auth, prompts
│   └── .env.example
├── extension/              # Chrome Extension (Manifest v3)
│   ├── background.js       # Service worker
│   ├── content.js          # Floating panel + auto-inject
│   ├── content.css         # Panel styles
│   ├── popup/              # Toolbar popup
│   └── manifest.json
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- MongoDB (local) or [MongoDB Atlas](https://mongodb.com/atlas) (free tier)
- Google OAuth credentials

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/promptvault.git
cd promptvault
```

### 2. Backend Setup
```bash
cd server
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd client
cp .env.example .env
# Edit .env with your VITE_GOOGLE_CLIENT_ID
npm install
npm run dev
```

The app runs at **http://localhost:5173** with backend at **http://localhost:5000**.

---

## 🔑 Environment Variables

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/promptvault
JWT_SECRET=your_super_secret_key_change_this
GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=xxxxxxxx.apps.googleusercontent.com
```

---

## 🔑 Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project → **APIs & Services → Credentials**
3. Click **Create Credentials → OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized JavaScript origins:
   - `http://localhost:5173`
   - `https://your-frontend.onrender.com`
6. Copy the **Client ID** → use in both `.env` files

---

## 🗄️ MongoDB Atlas Setup

1. Create a free account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a **free M0 cluster**
3. **Database Access** → Add a user with read/write permissions
4. **Network Access** → Add IP `0.0.0.0/0` (allow all, for Render)
5. **Connect** → Copy the connection string → replace in `MONGODB_URI`

---

## 🌐 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/google` | ❌ | Google OAuth login |
| `GET` | `/auth/me` | ✅ | Get current user |
| `GET` | `/prompts` | ✅ | List prompts (paginated, filterable) |
| `POST` | `/prompts` | ✅ | Create prompt |
| `PUT` | `/prompts/:id` | ✅ | Update prompt |
| `DELETE` | `/prompts/:id` | ✅ | Delete prompt |
| `GET` | `/prompts/search?q=` | ✅ | Search prompts |
| `PUT` | `/prompts/:id/favorite` | ✅ | Toggle favorite |
| `PUT` | `/prompts/:id/use` | ✅ | Increment usage count |
| `GET` | `/prompts/:id/history` | ✅ | Get version history |
| `GET` | `/prompts/export` | ✅ | Export as JSON |
| `POST` | `/prompts/import` | ✅ | Import from JSON |
| `GET` | `/prompts/share/:shareId` | ❌ | Get public prompt |

---

## 🧩 Chrome Extension Installation

1. Open Chrome → go to `chrome://extensions`
2. Enable **Developer mode** (toggle top-right)
3. Click **Load unpacked**
4. Select the `extension/` folder from this project
5. The PromptVault icon appears in your Chrome toolbar
6. Sign in via the web app first, then visit ChatGPT / Gemini / Claude
7. The **⚡ floating button** appears — click to open your prompt panel!

> **Note**: After logging into the web app, the extension automatically reads your auth token from localStorage. Reload the AI website page after first login.

---

## 🚀 Deployment on Render

### Backend
1. Push to GitHub
2. New **Web Service** on Render → connect your repo
3. **Root dir:** `server`
4. **Build command:** `npm install`
5. **Start command:** `npm start`
6. Add all environment variables from `server/.env`

### Frontend
1. New **Static Site** on Render → connect your repo
2. **Root dir:** `client`
3. **Build command:** `npm run build`
4. **Publish dir:** `dist`
5. Add `VITE_API_URL` = your backend Render URL
6. Add `VITE_GOOGLE_CLIENT_ID`
7. Add redirect rule: `/*` → `/index.html` (status 200)

### After deployment
- Update Google OAuth **Authorized origins** with your Render URLs
- Update `background.js` in extension with your backend Render URL
- Reload extension

---

## 🎯 Bonus Features Implemented

- [x] **Version History** — Stores last 10 versions, restore any version
- [x] **Export Prompts** — Download all prompts as JSON
- [x] **Import Prompts** — Bulk import from JSON file
- [x] **Public Share Link** — Generate unique shareable URL per prompt
- [x] **Usage Tracking** — Tracks how many times each prompt is used

---

## 📸 Screenshots

> Visit the live demo to see PromptVault in action!

---

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
Built with ❤️ for developers who take their AI workflows seriously.
</div>
