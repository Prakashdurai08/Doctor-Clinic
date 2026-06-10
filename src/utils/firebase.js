// ─── Firebase Configuration ───────────────────────────────────
// CHANGED: All keys moved to .env — safe to commit this file now.
// To add/remove staff, edit VITE_ALLOWED_EMAILS in .env

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ── Firebase config — reads from .env (Vite exposes VITE_ prefix) ─
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ── Initialize Firebase ───────────────────────────────────────
const app = initializeApp(firebaseConfig);

// ── Auth instance & Google provider ──────────────────────────
export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();

// ── Allowed staff emails — edit VITE_ALLOWED_EMAILS in .env ──
// Comma-separated list: "email1@gmail.com,email2@gmail.com"
export const ALLOWED_EMAILS = import.meta.env.VITE_ALLOWED_EMAILS
  ? import.meta.env.VITE_ALLOWED_EMAILS.split(",").map(e => e.trim())
  : [];