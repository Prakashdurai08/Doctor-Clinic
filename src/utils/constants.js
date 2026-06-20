// ─── Clinic Constants ─────────────────────────────────────────
// Edit CLINIC details and SHEET_URL to configure your clinic

// ★ STEP 1: Paste your Google Apps Script Web App URL below ★
export const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbwMS-c22pTzIQI3CWE_15FnGjo1AIcJUcAi9xFCkcDs_eWLydAa43vHKMUAzSbP44Q/exec";

export const CLINIC = {
  name: "MediCare Clinic",
  phone: "+91-9629622076",
  whatsapp: "919629622076",
  email: "selvaprakash4000@gmail.com",
  address: "12, Health Avenue, Anna Nagar, Chennai – 600 040, Tamil Nadu",
};

// ─── Google Sheets Storage Layer ─────────────────────────────
export const LS = {
  isAvailable: () => {
    const v = localStorage.getItem("clinic_availability");
    return v === null ? true : v === "true";
  },
  setAvailability: (b) => localStorage.setItem("clinic_availability", String(b)),

  addBooking: async (data) => {
    const entry = {
      ...data,
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      status: "Pending",
      createdAt: new Date().toISOString(),
      arrived: false,
      token: null,
      visitType: "Online",
      checkedInAt: null,
      completedAt: null,
      action: "add",
    };
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error("Failed to save booking:", err);
      throw new Error("Could not save booking. Please try again.");
    }
    return entry;
  },

  fetchBookings: async () => {
    try {
      const res = await fetch(SHEET_URL + "?t=" + Date.now());
      const data = await res.json();
      return data.map((b) => ({
        ...b,
        arrived: b.arrived === true || b.arrived === "TRUE" || b.arrived === "true",
        token: b.token === "" || b.token === null ? null : Number(b.token) || null,
      }));
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      return [];
    }
  },

  updateBooking: async (id, fields) => {
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "update", id, ...fields }),
      });
    } catch (err) {
      console.error("Failed to update booking:", err);
    }
  },

  deleteBooking: async (id) => {
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "delete", id }),
      });
    } catch (err) {
      console.error("Failed to delete booking:", err);
    }
  },

  deleteAll: async () => {
    try {
      await fetch(SHEET_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ action: "deleteAll" }),
      });
    } catch (err) {
      console.error("Failed to clear bookings:", err);
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────
export const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : "—";

export function openWhatsApp(data) {
  const msg = encodeURIComponent(
    `🏥 *New Appointment – ${CLINIC.name}*\n\n👤 ${data.name}\n🎂 Age: ${data.age}\n📞 ${data.phone}\n✉️ ${data.email || "—"}\n📅 ${fmtDate(data.datetime)}\n📝 ${data.notes || "N/A"}\n\n_Sent via website_`
  );
  window.open(`https://wa.me/${CLINIC.whatsapp}?text=${msg}`, "_blank");
}

export function openEmail(data) {
  const s = encodeURIComponent(`Appointment Request – ${data.name}`);
  const b = encodeURIComponent(
    `Name: ${data.name}\nAge: ${data.age}\nPhone: ${data.phone}\nEmail: ${data.email || "—"}\nDateTime: ${data.datetime}\nNotes: ${data.notes || "N/A"}`
  );
  window.location.href = `mailto:${CLINIC.email}?subject=${s}&body=${b}`;
}