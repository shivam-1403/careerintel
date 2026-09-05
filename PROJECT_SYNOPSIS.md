# Assistify / CareerIntel Project Synopsis

## 1. Purpose

Assistify, branded in the application as CareerIntel, is a student career-intelligence platform. It helps a student connect their current skills to career roles, identify gaps, create a learning roadmap, and evaluate a PDF resume against a selected role.

The repository contains a React single-page application and a FastAPI backend. The backend owns authentication, persistence, role and skill data, career calculations, resume processing, and optional AI-generated guidance.

This document describes the implementation currently present in `Assistify_new`, not the original Vite template or planned features that are not wired into the source.

## 2. Technology Stack

### Frontend

- React 19 with Vite.
- React Router for public and authenticated navigation.
- Recharts for dashboard and progress visualizations.
- Lucide React for interface icons.
- Native `fetch` calls for API communication.
- CSS files colocated with layouts, UI components, and pages.

### Backend

- FastAPI application defined in `backend/main.py`.
- SQLAlchemy ORM with PostgreSQL as the intended persistent database.
- Pydantic request models for incoming JSON payloads.
- JWT access tokens using `python-jose`.
- Password hashing through SHA-256 followed by bcrypt via Passlib.
- `pdfplumber` for PDF text extraction.
- Optional Groq integration for semantic resume skill extraction and short career insights.
- Resend integration for password-reset email delivery.

## 3. Repository Structure

```text
Assistify_new/
├── src/                         React application
│   ├── App.jsx                  Router and application providers
│   ├── config/api.js            API base URL configuration
│   ├── context/                 Theme state
│   ├── components/              Shared layouts, UI, and route guard
│   └── pages/                   Public, authentication, student, and admin screens
├── backend/
│   ├── main.py                  FastAPI app and all route handlers
│   ├── auth.py                  Hashing and JWT helpers
│   ├── database.py              SQLAlchemy engine and session dependency
│   ├── models.py                Database models
│   ├── services/                Career matching and ATS quality engines
│   └── seed_*.py                Role, skill, and role-skill seed scripts
├── public/                      Static frontend assets
├── package.json                 Frontend scripts and dependencies
├── vite.config.js               Vite configuration
├── vercel.json                  SPA deployment rewrites
└── .env / .env.production      Frontend environment configuration
```

## 4. Frontend Architecture

`src/App.jsx` wraps the application in `ThemeProvider`, `BrowserRouter`, and `ToastProvider`. Public pages use `BaseLayout`; authenticated pages use `MainLayout`, which combines the sidebar, navbar, and page content.

`ProtectedRoute` checks only whether `localStorage.token` exists. It redirects unauthenticated browser sessions to `/login`, but token validity and authorization are ultimately enforced by the backend on protected API calls.

The authenticated navigation includes:

- `/dashboard` - overview metrics, target role, recommendations, and roadmap status.
- `/profile` - personal details and controlled skill selection.
- `/resume-analyzer` - role selection and PDF resume analysis.
- `/career-recommendations` - weighted career matches and target-role selection.
- `/skill-gap` - role-specific matched skills and missing skills.
- `/learning-path` - generated roadmap phases for technical gaps.
- `/progress` - progress summaries and resume scan history.
- `/career/:id` - career detail and personalization view.

Public routes include the landing page, login, signup, password reset screens, informational pages, privacy, and terms. `/admin` exists as a protected UI route, but its metrics and activity content are currently static and there is no backend admin-role authorization.

Theme selection is stored as `theme` in local storage and applied through the document `data-theme` attribute. Login and signup store the access token and user information locally. Logout removes `token` and `user_skills`, but does not remove the cached `user` value.

## 5. Backend Architecture

The backend is a single FastAPI module. It creates database tables at import/startup with `Base.metadata.create_all(bind=engine)`, configures CORS, and registers all endpoints directly on the application. There are no separate FastAPI routers.

The backend uses required bearer authentication for most user operations and an optional bearer dependency for public career detail personalization. The token subject is the user's email. A valid token is decoded, then the matching user is loaded from the database.

## 6. Data Model

- `User`: name, unique email, password hash, and optional target role ID.
- `Skill`: controlled skill catalog with name, normalized name, and category (`technical`, `soft`, `tool`, or `certification`).
- `UserSkill`: association between a user and a predefined skill.
- `Role`: career role name, category, and description.
- `RoleSkill`: association between a role and skill, with an importance weight from 1 to 5.
- `ResumeScan`: user, role, extracted skills, score, and creation timestamp.
- `UserRoadmap`: user, role, missing skills, score, and creation timestamp.

Seed scripts populate the controlled skill catalog, career roles, and weighted role requirements. User-entered free-form skills are not stored; the UI searches and attaches existing catalog records by ID.

## 7. API Surface

### Authentication

- `POST /auth/signup` creates a user and returns a bearer token.
- `POST /auth/login` validates credentials and returns a bearer token.
- `POST /auth/forgot-password` creates a short-lived password-reset JWT and attempts to send a Resend email. It returns the same generic response whether the email exists or not.
- `POST /auth/reset-password` validates the reset-token claim, enforces an eight-character minimum, and updates the password.

### User and Skills

- `GET /user/profile` returns profile fields and target-role metadata.
- `PUT /user/update` updates name/email and returns a replacement token.
- `PUT /user/target-role/{role_id}` sets the selected target role.
- `GET /user/target-role` returns the selected role, if any.
- `GET /skills` returns the current user's skill names.
- `GET /skills/search` searches the controlled skill catalog.
- `POST /skills/add` attaches a catalog skill to the current user.
- `DELETE /skills/remove` removes a skill by name.

### Career and Search

- `GET /roles` lists available roles.
- `GET /career/recommend` returns up to five roles scoring at least 40%.
- `GET /career/gap/{role_id}` returns weighted matched skills, technical gaps, soft-skill gaps, score, and optional AI insight.
- `GET /career/{role_id}` returns role metadata and optional authenticated personalization.
- `GET /search` searches roles and skills for the navbar search UI.

### Resume, Dashboard, and Roadmaps

- `POST /resume/upload` extracts a PDF preview but does not require authentication or persist the file.
- `POST /resume/analyze/{role_id}` performs authenticated PDF analysis and stores a scan record.
- `GET /resume/history` returns authenticated scan history.
- `GET /dashboard/stats` returns scan, score, skill-count, and profile-completion metrics.
- `POST /roadmap/generate/{role_id}` builds and persists up to five phases from technical gaps.
- `POST /roadmap/save` saves a generic roadmap payload, although its current schema is inconsistent with the required `UserRoadmap.role_id` column.
- `GET /roadmap/all` returns saved roadmaps.

`GET /debug-files` is a development diagnostic for the `uploads` directory and should not be treated as a user feature.

## 8. Core Calculations

### Career matching

For every role with mapped skills, the career engine sums the importance weights of skills held by the user and divides by the total role weight:

```text
readiness = matched_role_weight / total_role_weight * 100
```

Recommendations are sorted by this score and filtered to a minimum of 40% by the API. Skill-gap results split missing skills into technical gaps and soft-skill gaps, then sort each list by importance.

### Resume analysis

The resume analyzer extracts PDF text, detects controlled skills deterministically, and optionally asks Groq to identify semantic matches among role gaps. The final readiness score is:

```text
final_score = 70% resume skill evidence + 30% resume quality
```

Resume quality equally weights four deterministic measures: section structure, strong action verbs, quantified achievements, and text length/readability. The response includes matched and missing skills, quality breakdown, suggestions, rule-based insights, and an optional Groq insight. Successful analyses are stored in `ResumeScan`.

## 9. Runtime Configuration and Deployment

The frontend reads `VITE_API_URL` from environment-specific files. Local development points to `http://localhost:8000`; production points to the Render backend URL configured in `.env.production` or the fallback in `src/config/api.js`. `vercel.json` supplies SPA rewrites for Vercel hosting.

The backend expects `DATABASE_URL` and uses PostgreSQL with `sslmode=require`. Optional integrations use `GROQ_API_KEY`, `RESEND_API_KEY`, and `FRONTEND_URL`. Python dependencies are listed in `backend/requirements.txt`.

Secrets must remain outside source control. In particular, `backend/auth.py` currently contains a hardcoded JWT secret and should be changed to environment configuration before production use. Any exposed environment files or credentials should be rotated.

## 10. Current Gaps and Risks

- The progress page calls `/user/skills`, but the implemented endpoint is `/skills`; the page can therefore show an empty skill set.
- `CareerDetails.jsx` calls `/career/{id}/ai_insight`, but that endpoint does not exist. The main career response already contains `ai_insight` when available.
- `ProtectedRoute` is presence-based and the `/admin` route has no role check.
- `/resume/upload` is unauthenticated and only previews text; the authenticated analyzer is the route that persists scan history.
- `UserRoadmap.role_id` is non-nullable, while `/roadmap/save` creates records without it.
- Score columns are integers while resume scores are calculated as decimals.
- Notifications, some dashboard/admin values, and learning-resource content are static UI data.
- The root README is still the default Vite README and does not describe this project.
- `TECHNICAL_DOCUMENTATION.md` documents several older behaviors, including OTP reset and a different Groq model; this synopsis reflects the source instead.
- There are no visible automated tests in the repository tree.

## 11. Practical Development Commands

```bash
npm install
npm run dev
npm run lint
npm run build
```

Run the FastAPI backend from `backend/` with the project's Python environment and installed `requirements.txt` dependencies. Seed the database before expecting roles, skills, and role-skill weights to produce meaningful recommendations.