# NEMS Batch 2024–2025 Reunion Web Invitation

A luxury, interactive single-page web application and administration portal for the **NEMS Batch 2024–2025 Reunion Celebration** held at **MIZHI, Karuvarakundu** on **Saturday, 29 August 2026**.

---

## ✨ Features

- **Hero Poster Display**: High-resolution 1080x1350 poster view with smooth interactive Lightbox.
- **Live Countdown Timer**: Real-time ticker counting down to August 29, 2026 at 1:30 PM IST.
- **Program Timelines**: Clean program cards detailing event schedules, venue locations, and activities.
- **Interactive RSVP Modal**:
  - Full Name, Phone / WhatsApp, Attendance status, Guest headcount, and personal memory text.
  - Celebratory **Confetti Explosion** animation upon submission.
  - Dual Storage: Instant local browser storage fallback + Google Apps Script Web App remote sync.
- **Convenience Actions**:
  - **Google Maps Navigation**: 1-click pin to MIZHI, Karuvarakundu.
  - **Add to Google Calendar**: Auto-fills calendar event details.
  - **Web Share API**: One-tap share to WhatsApp and mobile share sheets.
- **Admin Management Portal (`admin.html`)**:
  - Password protection (`nems2025`).
  - Analytics summary (Total Submissions, Attending Count, Declined Count, Total Guest Headcount).
  - Live search by guest name/phone and status filtering.
  - **Export to CSV** for offline spreadsheets.

---

## 📁 File Structure

```
invit/
├── index.html              # Main Web Invitation Page
├── style.css               # Luxury Dark Obsidian Design System
├── script.js               # Countdown, RSVP Form Handler, Share & Calendar Logic
├── admin.html              # Admin Portal Interface
├── admin.js                # Admin Portal Auth, Filtering & CSV Export Logic
├── assets/
│   └── poster.png          # High-Res Invitation Poster Image
├── google-apps-script/
│   └── code.gs             # Google Apps Script Backend (doPost & doGet)
└── README.md               # Documentation & Setup Instructions
```

---

## 🚀 Google Apps Script Setup (Live Google Sheets Logging)

To receive guest RSVPs directly in a Google Sheet:

1. Go to [Google Sheets](https://sheets.new) and create a sheet named **NEMS Reunion RSVPs**.
2. Click **Extensions** → **Apps Script**.
3. Copy all contents of [`google-apps-script/code.gs`](file:///c:/Users/pc/OneDrive/Desktop/invit/google-apps-script/code.gs) and paste into `Code.gs`.
4. Click **Deploy** → **New deployment**.
5. Choose type **Web App**.
6. Set:
   - **Execute as**: *Me*
   - **Who has access**: *Anyone*
7. Click **Deploy** and authorize permissions.
8. Copy the generated **Web App URL**.
9. In `script.js` or via the **Backend URL** button in `admin.html`, paste your Web App URL.

---

## 🔐 Admin Dashboard Access

- URL: Navigate to [`admin.html`](file:///c:/Users/pc/OneDrive/Desktop/invit/admin.html) in your browser.
- Passcode: `nems2025` *(You can edit this in `admin.js`)*.
