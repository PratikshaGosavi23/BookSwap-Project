# 📚 BookSwap — AI-Powered Book Exchange Platform
> Final Year Project | MERN Stack + AI Recommendations

---

## 🗂️ Project Structure

```
bookswap/
├── client/          # React frontend (Vite + React 18)
└── server/          # Node.js + Express backend
```

---

## ⚡ Quick Start (Step-by-Step)

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB (local) → https://www.mongodb.com/try/download/community
  OR MongoDB Atlas (free cloud) → https://www.mongodb.com/atlas
- Git

---

### 1. Clone / Extract the project

```bash
# If using git
git clone <your-repo-url> bookswap
cd bookswap

# Or just extract the ZIP and cd into it
cd bookswap
```

---

### 2. Set up the Backend

```bash
cd server

# Install dependencies
npm install

# Create your environment file
cp .env.example .env
```

**Edit `server/.env`:**

```env
PORT=5000
NODE_ENV=development

# Local MongoDB:
MONGO_URI=mongodb://localhost:27017/bookswap

# OR MongoDB Atlas:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/bookswap

JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

CLIENT_URL=http://localhost:5173

# Optional: OpenAI for AI-enhanced recommendations
# OPENAI_API_KEY=sk-your-key-here
```

**Seed sample data (optional but recommended):**

```bash
npm run seed
```

This creates 4 demo users and 12 sample books.

**Test accounts created by seeder:**
| Email | Password |
|-------|----------|
| arjun@bookswap.com | password123 |
| priya@bookswap.com | password123 |
| rohan@bookswap.com | password123 |
| sneha@bookswap.com | password123 |

**Start the backend:**

```bash
npm run dev     # Development (nodemon, auto-restart)
# OR
npm start       # Production
```

Server runs at: http://localhost:5000

---

### 3. Set up the Frontend

```bash
# Open a new terminal tab
cd client

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend runs at: http://localhost:5173

> The Vite proxy is configured in `vite.config.js` to forward `/api` and `/uploads` requests to `localhost:5000` automatically.

---

### 4. Open in Browser

```
http://localhost:5173
```

---

## 🔑 API Reference

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/signup` | Public | Register new user |
| POST | `/api/auth/login`  | Public | Login |
| GET  | `/api/auth/me`     | Private | Get current user |

### Books
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET  | `/api/books`             | Public  | List books (search, filter, paginate) |
| GET  | `/api/books/:id`         | Public  | Get single book |
| GET  | `/api/books/my-books`    | Private | Current user's books |
| POST | `/api/books`             | Private | Add book (multipart/form-data) |
| PUT  | `/api/books/:id`         | Private | Update book |
| DELETE| `/api/books/:id`        | Private | Delete book |

### Swaps
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/swaps`                | Private | Create swap request |
| GET  | `/api/swaps/incoming`       | Private | Incoming requests |
| GET  | `/api/swaps/outgoing`       | Private | Outgoing requests |
| GET  | `/api/swaps/stats`          | Private | Dashboard stats |
| PUT  | `/api/swaps/:id/accept`     | Private | Accept request |
| PUT  | `/api/swaps/:id/reject`     | Private | Reject request |
| PUT  | `/api/swaps/:id/complete`   | Private | Mark completed |
| PUT  | `/api/swaps/:id/cancel`     | Private | Cancel request |

### AI
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET  | `/api/ai/recommendations`        | Private | Personalized recommendations |
| GET  | `/api/ai/similar/:bookId`         | Public  | Similar books |
| POST | `/api/ai/generate-description`    | Private | AI book description |

### Messages
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/messages`                     | Private | Send message |
| GET  | `/api/messages/inbox`               | Private | All conversations |
| GET  | `/api/messages/conversation/:userId`| Private | Thread with user |
| GET  | `/api/messages/unread-count`        | Private | Unread count |

### Users
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/users/:id`     | Public  | Public profile |
| PUT | `/api/users/profile` | Private | Update profile |
| PUT | `/api/users/password`| Private | Change password |

---

## 🤖 AI Recommendation System

### How it works (no OpenAI key needed!)

The system uses **Content-Based Filtering**:

1. **User profile signals** — categories they've added books in + explicit interests
2. **Search history** — categories they've browsed
3. **Category similarity matrix** — knows that Fantasy readers often enjoy Sci-Fi
4. **Popularity boost** — trending books get slightly higher scores
5. **Recency boost** — new listings get surfaced

### With OpenAI key (optional upgrade)

If you add `OPENAI_API_KEY` to your `.env`, the system:
- Uses GPT-3.5-turbo to generate personalized reason strings
- Falls back silently to content-based if API fails

### AI Description Generator

On the Add Book page, click **✨ AI Generate** to auto-write a description using GPT-3.5. Falls back to a template if no API key.

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Primary font | Playfair Display (headings) |
| Body font | DM Sans |
| Primary color | `#C8853A` (warm amber) |
| Background | `#FAF7F2` (cream) |
| Dark mode | Full support via CSS variables |

---

## 📦 Dependencies

### Backend
| Package | Purpose |
|---------|---------|
| express | Web framework |
| mongoose | MongoDB ODM |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT auth |
| multer | File uploads |
| openai | AI descriptions (optional) |
| cors | Cross-origin |
| dotenv | Environment variables |

### Frontend
| Package | Purpose |
|---------|---------|
| react + react-dom | UI framework |
| react-router-dom | Routing |
| axios | HTTP client |
| react-hot-toast | Notifications |
| react-icons | Icon library |
| framer-motion | Animations (installed, available) |

---

## 🚀 Production Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables in dashboard
2. Use MongoDB Atlas connection string
3. Set `NODE_ENV=production`
4. Deploy from GitHub

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` if your API is on a different domain
2. Update `vite.config.js` proxy or use env variable in `axios.js`
3. Deploy `client/` folder

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED 27017` | Start MongoDB locally or use Atlas |
| `jwt malformed` | Clear localStorage and login again |
| Images not showing | Check `/uploads` folder exists in `server/` |
| CORS error | Ensure `CLIENT_URL` in `.env` matches your frontend URL |
| Port in use | Change `PORT` in `.env` |

---

## 📝 Features Checklist

- [x] JWT Authentication (signup / login / protected routes)
- [x] User profile with avatar, bio, interests, location
- [x] Book CRUD (add, edit, delete, view)
- [x] Book search (full-text), filter by category/condition, sort, paginate
- [x] Swap request system (create, accept, reject, complete, cancel)
- [x] AI recommendations (content-based + optional OpenAI enhancement)
- [x] AI book description generator
- [x] Messaging system (send, inbox, conversation thread)
- [x] Dark mode toggle
- [x] Responsive mobile design
- [x] Loading skeletons
- [x] Toast notifications
- [x] Image upload (local storage)
- [x] Database seeder with sample data

---

*Built as a Final Year Project demonstrating full-stack MERN development with AI integration.*
