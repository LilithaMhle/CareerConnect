# CareerConnect AI 🚀

A full-stack AI-powered job search and recruitment platform built with **Node.js**, **Express**, **React**, and **SQLite**.

---

## 🏗️ Project Architecture

```
CareerConnect/
├── server/                 # Node.js + Express backend (PORT 3001)
│   ├── index.js            # Entry point – serves API + built frontend
│   ├── db/
│   │   └── database.js     # SQLite setup, schema, seed data
│   ├── routes/
│   │   ├── auth.js         # POST /api/auth/register, /login, /me
│   │   ├── jobs.js         # GET/POST/PUT/DELETE /api/jobs
│   │   ├── applications.js # Full CRUD for job applications
│   │   ├── nlp.js          # AI/NLP features (resume analysis, matching)
│   │   └── analytics.js    # Platform and user analytics
│   ├── middleware/
│   │   └── middleware.js   # JWT auth, role guard, logging, error handler
│   └── package.json
│
└── client/                 # React + Vite frontend
    ├── src/
    │   ├── App.jsx
    │   ├── context/
    │   │   └── AppContext.jsx  # Global state + real API integration
    │   ├── pages/
    │   │   ├── Landing.jsx
    │   │   ├── BrowseJobs.jsx
    │   │   ├── JobDetail.jsx
    │   │   ├── SeekerDashboard.jsx
    │   │   ├── EmployerDashboard.jsx
    │   │   ├── InterviewPrep.jsx
    │   │   ├── Analytics.jsx
    │   │   ├── Login.jsx
    │   │   └── SignUp.jsx
    │   └── components/
    │       └── Shared.jsx
    ├── vite.config.js      # Dev: port 3000, proxy /api → 3001
    └── package.json
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+ (v20+ recommended)
- npm v9+
- Git

### Option A – Development Mode (recommended, hot-reload)

Open **two terminals**:

**Terminal 1 – Backend:**
```bash
cd server
npm install
npm run dev
# API running at http://localhost:3001
```

**Terminal 2 – Frontend:**
```bash
cd client
npm install
npm run dev
# UI running at http://localhost:3000  ← OPEN THIS IN BROWSER
```

### Option B – Production Mode (single port)

```bash
# 1. Build the frontend
cd client
npm install
npm run build

# 2. Start the server (serves API + built frontend on same port)
cd ../server
npm install
npm start
# Everything at http://localhost:3001  ← OPEN THIS IN BROWSER
```

---

## 🌐 How the Port Issue Was Fixed

**The problem:** The original `vite.config.js` set the frontend dev server on port 5000 AND proxied `/api` to `localhost:5000` — creating a self-loop. The backend also ran on 5000. This caused the `ERR_HTTP_RESPONSE_CODE_FAILURE` and 404 errors.

**The fix:**
- **Development:** Vite dev server runs on **port 3000**, proxies `/api/*` to the Express backend on **port 3001** — no port collision.
- **Production:** `npm run build` compiles React to `client/dist/`. The Express server uses `express.static('dist')` to serve those files on **port 3001**, so both frontend and backend run on a **single port**.

```js
// vite.config.js (fixed)
export default defineConfig({
  server: {
    port: 3000,          // Frontend dev server
    proxy: {
      '/api': 'http://localhost:3001'  // Proxy to backend
    }
  }
});
```

---

## 📡 REST API Reference

### Authentication
| Method | Endpoint | Body | Auth |
|--------|----------|------|------|
| POST | `/api/auth/register` | `{email, password, role}` | — |
| POST | `/api/auth/login` | `{email, password}` | — |
| GET | `/api/auth/me` | — | Bearer |
| PUT | `/api/auth/profile` | `{name, bio, skills}` | Bearer |

### Jobs
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/jobs` | List all (filter: `?q=react&type=Full-time`) | — |
| GET | `/api/jobs/featured` | Featured jobs | — |
| GET | `/api/jobs/:id` | Single job | — |
| POST | `/api/jobs` | Create listing | Employer |
| PUT | `/api/jobs/:id` | Update listing | Employer |
| DELETE | `/api/jobs/:id` | Delete listing | Employer |

### Applications
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/applications` | Apply to a job | Seeker |
| GET | `/api/applications/mine` | My applications | Seeker |
| GET | `/api/applications` | All applications | Employer |
| PATCH | `/api/applications/:id/status` | Update status | Employer |
| DELETE | `/api/applications/:id` | Withdraw | Seeker |
| GET | `/api/applications/saved` | Saved jobs | Seeker |
| POST | `/api/applications/saved` | Save/unsave job | Seeker |

### AI / NLP
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/nlp/analyse-resume` | Extract skills, score resume | Bearer |
| POST | `/api/nlp/match-jobs` | Rank jobs by skill match | — |
| POST | `/api/nlp/interview-coach` | Generate practice questions | — |
| GET | `/api/nlp/trending-skills` | Market skill demand | — |

### Analytics
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/overview` | Platform-wide stats | — |
| GET | `/api/analytics/seeker` | Personal application stats | Bearer |
| GET | `/api/analytics/employer` | Hiring pipeline | Bearer |

---

## 🧠 Learning Unit Coverage

| Learning Unit | How It's Demonstrated |
|---|---|
| **Web Foundations & Node.js** | Express server, async/await, ES Modules, routing |
| **RESTful APIs** | Full CRUD endpoints with correct HTTP methods and status codes |
| **UX & Responsive Interfaces** | React + Tailwind responsive UI, mobile-friendly layouts |
| **Full-Stack Integration** | React ↔ Express ↔ SQLite data flow via `/api` |
| **Database Design & CRUD** | SQLite with 5 tables, full Create/Read/Update/Delete operations |
| **Intelligent / AI Features** | Rule-based NLP: keyword extraction, TF-IDF scoring, resume analysis, job matching, interview question generation |
| **Security** | JWT authentication, bcrypt password hashing, role-based access control, input validation, CORS configuration |
| **Deployment Readiness** | Single-port production build, environment variables, `express.static` for SPA serving |

---

## 🔐 Security Features

- **Passwords**: hashed with `bcryptjs` (salt rounds: 10)
- **Authentication**: JWT tokens (7-day expiry, stored in `localStorage`)
- **Authorisation**: Role-based middleware (`seeker` vs `employer`)
- **Input validation**: Email format, password length, allowed status values
- **CORS**: Configured to allow only known origins
- **Error handling**: Global error handler — no stack traces in production
- **SQL injection**: Protected by parameterised queries (sql.js prepared statements)

---

## 💡 Entrepreneurship & Reflection

**Problem addressed:** South African graduates and job-seekers face fragmented job search experiences — multiple platforms, no intelligent matching, no interview preparation tools.

**Our solution:** A unified platform with AI-driven features that:
- Matches candidates to jobs based on skill analysis
- Provides real-time application status tracking
- Coaches candidates for interviews using NLP question generation
- Gives employers a streamlined pipeline view

**Challenges encountered:**
- Native SQLite bindings (`better-sqlite3`) required a C++ build chain unavailable in some environments — solved by switching to `sql.js` (pure JavaScript)
- React + Vite port collision with Express — resolved by separating dev ports and using `express.static` for production

**Scale-up potential:**
- Replace `sql.js` with PostgreSQL for multi-user concurrency
- Add real ML (embeddings/cosine similarity) for semantic job matching
- Integrate email notifications via SendGrid
- Deploy to Railway, Render, or AWS with environment-based config
- Monetise via employer subscription tiers (freemium model)

---

## 📝 Demo Accounts

Register at `/signup` with any email. Choose **Seeker** or **Employer** role.

Demo flow:
1. Register as a **Seeker** → browse jobs → apply → track status in dashboard
2. Register as an **Employer** → view applications → update candidate status
3. Try the **Interview Prep** page for AI-generated questions
4. Use **Analytics** to view platform insights
