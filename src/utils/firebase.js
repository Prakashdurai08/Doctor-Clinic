// ─── Firebase Configuration ───────────────────────────────────
// This file initializes Firebase and exports the auth instance.
// Google Sign-In is used to protect the Staff Dashboard.
//
// ⚠️  ALLOWED EMAILS — only these Gmail accounts can access dashboard
// Add or remove emails here to control staff access.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ── Firebase project config (doctor-clinics-08) ───────────────
const firebaseConfig = {
  apiKey:            "AIzaSyCuM4brxfm7bwfzbCbe-sr5oqBri-1uyy0",
  authDomain:        "doctor-clinics-08.firebaseapp.com",
  projectId:         "doctor-clinics-08",
  storageBucket:     "doctor-clinics-08.firebasestorage.app",
  messagingSenderId: "223242777444",
  appId:             "1:223242777444:web:c6603ecc03a76e281fc071",
  measurementId:     "G-W7DPHNDJKL",
};

// ── Initialize Firebase ───────────────────────────────────────
const app = initializeApp(firebaseConfig);

// ── Auth instance & Google provider ──────────────────────────
export const auth     = getAuth(app);
export const provider = new GoogleAuthProvider();

// ── Allowed staff emails — EDIT THIS LIST to add/remove staff ─
// Only Gmail accounts listed here can unlock the dashboard.
export const ALLOWED_EMAILS = [
  "duraiprakash08@gmail.com",   // Doctor / Admin
  "selvaprakash4000@gmail.com", // Staff
];