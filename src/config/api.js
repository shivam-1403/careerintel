// Central API configuration.
// VITE_API_URL is set per-environment via .env files:
//   .env            → http://localhost:8000  (local dev, gitignored)
//   .env.production → https://careerintel-w10f.onrender.com  (Vercel / production)
const API_BASE = import.meta.env.VITE_API_URL || "https://careerintel-w10f.onrender.com";

export default API_BASE;
