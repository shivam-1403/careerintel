# Assistify / CareerIntel Workflow

This workflow follows the current `Assistify_new` implementation from browser entry to backend persistence. It separates the student journey from the developer/runtime workflow and identifies the places where the UI and API currently diverge.

## 1. Browser and Application Entry

1. Vite serves the React application.
2. `src/main.jsx` mounts `App`.
3. `App` installs theme state, browser routing, toast notifications, and scroll restoration.
4. Public routes render through `BaseLayout`.
5. Authenticated routes render through `ProtectedRoute` and `MainLayout`.
6. `ProtectedRoute` checks for `localStorage.token`; if absent, it redirects to `/login`.
7. API calls use `VITE_API_URL`, with the configured Render URL as the production fallback.

## 2. New Student Workflow

### Sign up

1. The student submits first name, last name, email, and password on `/signup`.
2. The frontend sends `POST /auth/signup`.
3. The backend rejects duplicate email addresses, hashes the password, creates the user, and issues a JWT.
4. The frontend stores the token and user payload, then navigates to the authenticated application.

### Log in

1. The student submits email and password on `/login`.
2. The frontend sends `POST /auth/login`.
3. The backend verifies the stored hash and returns a three-hour access token.
4. The frontend stores the token, fetches `/user/profile`, caches the profile, and enters the dashboard.

### Recover a password

1. The student enters an email on `/forgot-password`.
2. The frontend sends `POST /auth/forgot-password`.
3. If the account exists, the backend creates a 15-minute JWT reset token and attempts to deliver a Resend email. In development it logs the reset link when email delivery is unavailable.
4. The link opens `/reset-password?token=...`.
5. The new password is sent to `POST /auth/reset-password`.
6. The backend validates the token type and expiry, updates the password, and returns success.

## 3. Profile and Skill Workflow

1. `/profile` loads `/user/profile` and `/skills` using the bearer token.
2. The student edits first name, last name, or email.
3. `PUT /user/update` persists the changes and returns a replacement token if the email changes.
4. The student searches the controlled catalog through `/skills/search?query=...`.
5. Selecting a result sends its skill ID to `POST /skills/add`.
6. Removing a skill sends its name to `DELETE /skills/remove`.
7. These associations become the input for recommendations, gap analysis, dashboard statistics, and learning paths.

## 4. Career Discovery Workflow

1. The dashboard requests profile, skills, dashboard stats, target role, recommendations, and saved roadmaps.
2. `/career/recommend` loads the user's `UserSkill` associations.
3. The career engine compares those skills with every weighted `RoleSkill` mapping.
4. Each role receives a percentage based on matched importance weight.
5. The API returns only the top five roles at or above 40%.
6. `/career-recommendations` displays the results and lets the student set a target role through `PUT /user/target-role/{role_id}`.
7. The navbar can independently search roles and skills through `GET /search?q=...`.
8. `/career/:id` loads public role metadata and, when a valid token is available, personalized matched and missing skills.

## 5. Skill-Gap Workflow

1. The skill-gap page obtains the current target role from `/user/profile` or `/user/target-role`.
2. It requests `/career/gap/{role_id}`.
3. The backend finds the user's skills and the role's weighted requirements.
4. It calculates the readiness percentage.
5. It returns matched skills, technical gaps, soft-skill gaps, and deterministic insight cards.
6. If `GROQ_API_KEY` is available, the backend adds a short generated insight; failures fall back gracefully.
7. The UI presents the gaps as the next learning priorities.

## 6. Learning-Path Workflow

1. The learning-path page identifies the selected target role.
2. It calls `/career/gap/{role_id}` to obtain current gaps.
3. It calls `POST /roadmap/generate/{role_id}`.
4. The backend takes up to five highest-priority technical gaps and assigns them to sequential learning phases.
5. The generated roadmap is persisted in `UserRoadmap` by user and role.
6. The endpoint returns the career name, current score, and phase/skill list for display.
7. The dashboard and learning-path page can later retrieve saved entries through `/roadmap/all`.

## 7. Resume Analyzer Workflow

1. `/resume-analyzer` loads available roles from `/roles` and the user's current target role from `/user/profile`.
2. The student chooses a role and selects a PDF.
3. The frontend sends the file to `POST /resume/analyze/{role_id}` with bearer authentication.
4. `pdfplumber` extracts text from every PDF page. Empty text is rejected.
5. The backend loads the role's weighted skills.
6. The career engine performs deterministic controlled-skill matching with normalized regex boundaries.
7. For unmatched technical skills, Groq may perform semantic extraction and return only skills from the provided catalog.
8. The backend calculates resume skill evidence against role weights.
9. The ATS engine calculates structure, action-verb, quantified-achievement, and readability scores.
10. Final readiness combines 70% skill evidence and 30% resume quality.
11. A `ResumeScan` record is stored with extracted skills, role, score, and timestamp.
12. The response returns scores, breakdown, suggestions, matched skills, missing skills, rule-based insights, and optional AI insight.
13. `/resume/history` supplies prior scan scores for the progress page.

`POST /resume/upload` is a separate preview endpoint. It accepts a PDF without authentication, extracts the first 500 characters for a preview, and does not save a scan or file. The main frontend analyzer uses `/resume/analyze/{role_id}` instead.

## 8. Dashboard and Progress Workflow

### Dashboard

`/dashboard` combines:

- `/user/profile` for identity and target role.
- `/skills` for current skill names.
- `/dashboard/stats` for profile completion, scan count, and score aggregates.
- `/user/target-role` for target-role display.
- `/career/recommend` for role cards.
- `/roadmap/all` for saved roadmap status.
- `/career/gap/{role_id}` for target-role gap summaries.

Profile completion is currently calculated as `40 + 10 * skill_count`, capped at 100. Notifications and parts of the dashboard presentation are static frontend data.

### Progress

The progress page attempts to load profile, skills, target-role gaps, and resume history, then derives charts and summaries in the browser. The current implementation calls `/user/skills`; the backend exposes `/skills`, so this path should be aligned before treating the progress skill metrics as reliable.

## 9. Logout and Session Behavior

1. The sidebar logout action removes `token` and `user_skills` from local storage.
2. It navigates to `/login` with replacement history.
3. The cached `user` item is not currently removed.
4. A token's actual validity is checked by the backend only when an API request is made.

## 10. Backend Request Lifecycle

For a protected request:

1. FastAPI receives the request and extracts the bearer token through `HTTPBearer`.
2. `get_current_user` decodes the JWT with the secret and algorithm from `backend/auth.py`.
3. The token subject email is used to load the `User` record.
4. The route receives the current user and SQLAlchemy session.
5. The route reads or mutates models, commits mutations, and serializes a JSON response.
6. The frontend updates local component state, shows a toast or error state, and renders the result.

Career detail uses an optional bearer dependency so unauthenticated users can read role metadata. The frontend currently protects `/career/:id` at the route level even though the backend supports guest access.

## 11. Local Development Workflow

1. Install frontend packages with `npm install`.
2. Configure the local frontend API URL in `.env`.
3. Create/configure the backend Python environment and install `backend/requirements.txt`.
4. Provide `DATABASE_URL`; add `GROQ_API_KEY`, `RESEND_API_KEY`, and `FRONTEND_URL` when those integrations are needed.
5. Start the FastAPI backend on port 8000.
6. Run `npm run dev` for the Vite frontend.
7. Run the seed scripts in dependency order so skills, roles, and role-skill mappings exist.
8. Use `npm run lint` for static frontend checks and `npm run build` for a production build.

## 12. Deployment Workflow

1. Build the frontend with Vite.
2. Deploy the SPA to Vercel using the rewrite rules in `vercel.json` so browser routes resolve to `index.html`.
3. Configure the production `VITE_API_URL` to the deployed FastAPI service.
4. Deploy the backend with a PostgreSQL `DATABASE_URL` and required runtime dependencies.
5. Configure CORS origins to match the deployed frontend.
6. Configure optional Groq and Resend credentials only in the deployment environment.
7. Seed the production database before testing recommendations or gap analysis.
8. Verify signup, login, profile loading, role recommendation, PDF analysis, roadmap generation, and password reset against the deployed API.

## 13. Maintenance Checks

Before changing a workflow, verify the route in both the page component and `backend/main.py`. Current high-priority alignment checks are:

- Change `ProgressTracker` from `/user/skills` to `/skills`, or add a deliberate compatibility endpoint.
- Remove or implement the extra `/career/{id}/ai_insight` request in `CareerDetails`.
- Decide whether `/roadmap/save` should accept `role_id` and use the same persistence contract as roadmap generation.
- Move the JWT secret to environment configuration and rotate the existing value.
- Add backend/frontend integration tests for authentication, recommendations, resume analysis, roadmaps, and protected access.