/* ==========================================================================
   NEMS BATCH 2024-2025 REUNION CELEBRATION - JAVASCRIPT LOGIC
   ========================================================================== */

// --- CONFIGURATION ---
// Permanent Google Apps Script Web App URL
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxdY3I7QLB94axMWn6V857CBIaKNKRbP4dSRBT4kMKGe9hM3qt-tYYdNPS2ZT2V_GPN/exec";

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initModals();
  initRsvpForm();
  initCalendarAndShare();
  initEmbeddedAdminModal();
});

/* --------------------------------------------------------------------------
   1. COUNTDOWN TIMER
   -------------------------------------------------------------------------- */
function initCountdown() {
  const targetDate = new Date('2026-08-29T13:30:00+05:30').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateTimer() {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (difference % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor(
      (difference % (1000 * 60)) / 1000
    );

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* --------------------------------------------------------------------------
   2. MODALS (RSVP & LIGHTBOX)
   -------------------------------------------------------------------------- */
function initModals() {
  const rsvpModal = document.getElementById('rsvpModal');
  const openRsvpBtn = document.getElementById('openRsvpBtn');
  const closeRsvpBtn = document.getElementById('closeRsvpBtn');

  const posterModal = document.getElementById('posterModal');
  const openPosterLightbox = document.getElementById('openPosterLightbox');
  const closePosterBtn = document.getElementById('closePosterBtn');

  if (openRsvpBtn && rsvpModal) {
    openRsvpBtn.addEventListener('click', () => {
      rsvpModal.classList.add('active');
    });
  }

  if (closeRsvpBtn && rsvpModal) {
    closeRsvpBtn.addEventListener('click', () => {
      rsvpModal.classList.remove('active');
    });
  }

  if (rsvpModal) {
    rsvpModal.addEventListener('click', (e) => {
      if (e.target === rsvpModal) {
        rsvpModal.classList.remove('active');
      }
    });
  }

  if (openPosterLightbox && posterModal) {
    openPosterLightbox.addEventListener('click', () => {
      posterModal.classList.add('active');
    });
  }

  if (closePosterBtn && posterModal) {
    closePosterBtn.addEventListener('click', () => {
      posterModal.classList.remove('active');
    });
  }

  if (posterModal) {
    posterModal.addEventListener('click', (e) => {
      if (e.target === posterModal) {
        posterModal.classList.remove('active');
      }
    });
  }
}

/* --------------------------------------------------------------------------
   3. RSVP FORM HANDLING
   -------------------------------------------------------------------------- */
function initRsvpForm() {
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpModal = document.getElementById('rsvpModal');
  const submitBtn = document.getElementById('submitRsvpBtn');

  if (!rsvpForm) return;

  rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName =
      (document.getElementById('fullName')?.value || '').trim();

    const phone =
      (document.getElementById('phone')?.value || '').trim();

    const attendanceStatus =
      document.querySelector(
        'input[name="attendanceStatus"]:checked'
      )?.value || 'Attending';

    const paymentMethod =
      document.querySelector(
        'input[name="paymentMethod"]:checked'
      )?.value ||
      document.getElementById('paymentMethod')?.value ||
      'GPay';

    const notes =
      (document.getElementById('notes')?.value || '').trim();

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata'
    });

    if (!fullName || !phone) {
      showToast('Please fill in your name and phone number.');
      return;
    }

    const payload = {
      fullName,
      phone,
      attendanceStatus,
      paymentMethod,
      notes,
      timestamp
    };

    // Save locally as backup
    saveResponseLocally(payload);

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
    }

    try {
      /*
       * Google Apps Script Web App
       *
       * mode: no-cors is required for this type of Google Apps Script POST.
       * The Apps Script receives the request through doPost().
       */
      await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      console.log('RSVP sent to Google Apps Script.');
    } catch (err) {
      console.warn(
        'Google Apps Script submission failed. Local backup retained.',
        err
      );
    }

    triggerConfetti();

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit RSVP';
    }

    if (rsvpModal) {
      rsvpModal.classList.remove('active');
    }

    rsvpForm.reset();

    showToast('✨ Thank you! Your RSVP response has been recorded.');
  });
}

/* --------------------------------------------------------------------------
   LOCAL BACKUP
   -------------------------------------------------------------------------- */
function saveResponseLocally(data) {
  try {
    const existing = JSON.parse(
      localStorage.getItem('nems_rsvp_responses') || '[]'
    );

    existing.push(data);

    localStorage.setItem(
      'nems_rsvp_responses',
      JSON.stringify(existing)
    );
  } catch (error) {
    console.warn('Unable to save RSVP locally:', error);
  }
}

/* --------------------------------------------------------------------------
   CONFETTI
   -------------------------------------------------------------------------- */
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }
}

/* --------------------------------------------------------------------------
   TOAST
   -------------------------------------------------------------------------- */
function showToast(message) {
  const existing = document.querySelector('.toast-msg');

  if (existing) {
    existing.remove();
  }

  const toast = document.createElement('div');

  toast.className = 'toast-msg';
  toast.innerHTML = `<span>${message}</span>`;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.5s ease';

    setTimeout(() => toast.remove(), 500);
  }, 3500);
}

/* --------------------------------------------------------------------------
   4. ADD TO CALENDAR & SHARE
   -------------------------------------------------------------------------- */
function initCalendarAndShare() {
  const addToCalBtn = document.getElementById('addToCalBtn');
  const shareBtn = document.getElementById('shareBtn');

  if (addToCalBtn) {
    addToCalBtn.addEventListener('click', () => {
      const title = encodeURIComponent(
        "Reunion Celebration | NEMS Batch 2024-2025"
      );

      const details = encodeURIComponent(
        "Reunion celebration for NEMS Batch 2024-2025 at MIZHI, Karuvarakundu."
      );

      const location = encodeURIComponent(
        "MIZHI, Karuvarakundu"
      );

      const startDate = "20260829T080000Z";
      const endDate = "20260829T143000Z";

      const calUrl =
        `https://calendar.google.com/calendar/render?action=TEMPLATE` +
        `&text=${title}` +
        `&dates=${startDate}/${endDate}` +
        `&details=${details}` +
        `&location=${location}`;

      window.open(calUrl, '_blank');
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'Reunion Celebration | NEMS Batch 2024–2025',
        text:
          'Join us for the NEMS Batch 2024–2025 Reunion Celebration on August 29, 2026 at Mizhi, Karuvarakundu!',
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          console.log('Share dismissed');
        }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('📋 Invitation link copied to clipboard!');
        } catch (err) {
          console.warn('Unable to copy link:', err);
        }
      }
    });
  }
}

/* --------------------------------------------------------------------------
   5. EMBEDDED ADMIN MODAL
   -------------------------------------------------------------------------- */
function initEmbeddedAdminModal() {
  const modal = document.getElementById('embeddedAdminModal');
  const openBtns = document.querySelectorAll('.admin-login-btn');
  const closeBtn = document.getElementById('closeEmbeddedAdminBtn');
  const loginForm = document.getElementById('modalLoginForm');
  const authScreen = document.getElementById('modalAuthScreen');
  const dashScreen = document.getElementById('modalDashboardScreen');
  const searchInput = document.getElementById('modalSearchInput');
  const exportBtn = document.getElementById('modalExportCsvBtn');

  if (!modal) return;

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      modal.classList.add('active');

      checkAuthStatus();
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  function checkAuthStatus() {
    if (sessionStorage.getItem('nems_admin_authed') === 'true') {
      if (authScreen) authScreen.style.display = 'none';
      if (dashScreen) dashScreen.style.display = 'block';

      renderModalDashboard();
    } else {
      if (authScreen) authScreen.style.display = 'block';
      if (dashScreen) dashScreen.style.display = 'none';
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const code =
        (document.getElementById('modalPasscode')?.value || '').trim();

      if (code === "Thum2024") {
        sessionStorage.setItem('nems_admin_authed', 'true');

        if (authScreen) authScreen.style.display = 'none';
        if (dashScreen) dashScreen.style.display = 'block';

        await renderModalDashboard();
      } else {
        alert("Incorrect passcode!");
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderModalDashboard);
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      let data = [];

      try {
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL);
        const remoteData = await response.json();

        if (Array.isArray(remoteData)) {
          data = remoteData;
        }
      } catch (error) {
        console.warn('Unable to fetch remote data:', error);

        data = JSON.parse(
          localStorage.getItem('nems_rsvp_responses') || '[]'
        );
      }

      if (data.length === 0) {
        alert("No RSVP data available to export.");
        return;
      }

      const headers = [
        "Full Name",
        "Phone",
        "Status",
        "Payment Method",
        "Notes",
        "Submitted At"
      ];

      const rows = data.map(i => [
        `"${(i.fullName || '').replace(/"/g, '""')}"`,
        `"${(i.phone || '').replace(/"/g, '""')}"`,
        `"${(i.attendanceStatus || '').replace(/"/g, '""')}"`,
        `"${(i.paymentMethod || 'GPay').replace(/"/g, '""')}"`,
        `"${(i.notes || '').replace(/"/g, '""')}"`,
        `"${(i.timestamp || '').replace(/"/g, '""')}"`
      ]);

      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...rows.map(r => r.join(","))
        ].join("\n");

      const link = document.createElement("a");

      link.setAttribute(
        "href",
        encodeURI(csvContent)
      );

      link.setAttribute(
        "download",
        `NEMS_Reunion_RSVPs_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`
      );

      document.body.appendChild(link);

      link.click();

      link.remove();
    });
  }
}

/* --------------------------------------------------------------------------
   LOAD REMOTE RSVP DATA
   -------------------------------------------------------------------------- */
async function getRemoteRsvpData() {
  try {
    const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(
      'Unable to load Google Sheet data:',
      error
    );

    return JSON.parse(
      localStorage.getItem('nems_rsvp_responses') || '[]'
    );
  }
}

/* --------------------------------------------------------------------------
   EMBEDDED DASHBOARD
   -------------------------------------------------------------------------- */
async function renderModalDashboard() {
  const data = await getRemoteRsvpData();

  const searchInput =
    document.getElementById('modalSearchInput');

  const query =
    (searchInput?.value || '').toLowerCase();

  const filtered = data.filter(i =>
    (i.fullName || '').toLowerCase().includes(query) ||
    (i.phone || '').toLowerCase().includes(query) ||
    (i.notes || '').toLowerCase().includes(query)
  );

  const total = data.length;

  const attending =
    data.filter(
      i => i.attendanceStatus === "Attending"
    ).length;

  const gpay =
    data.filter(
      i =>
        (i.paymentMethod || 'GPay')
          .toLowerCase()
          .includes('gpay')
    ).length;

  const cash =
    data.filter(
      i =>
        (i.paymentMethod || '')
          .toLowerCase()
          .includes('cash')
    ).length;

  const mTotal = document.getElementById('mTotal');
  const mAttending = document.getElementById('mAttending');
  const mGpay = document.getElementById('mGpay');
  const mCash = document.getElementById('mCash');

  if (mTotal) mTotal.textContent = total;
  if (mAttending) mAttending.textContent = attending;
  if (mGpay) mGpay.textContent = gpay;
  if (mCash) mCash.textContent = cash;

  const tbody =
    document.getElementById('modalRsvpTableBody');

  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6"
            style="text-align:center;color:var(--text-muted);padding:20px;">
          No responses recorded yet.
        </td>
      </tr>
    `;

    return;
  }

  tbody.innerHTML = filtered.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>

      <td style="font-weight:600;">
        ${escapeHtml(item.fullName || '-')}
      </td>

      <td>
        ${escapeHtml(item.phone || '-')}
      </td>

      <td>
        <span class="badge ${item.attendanceStatus === 'Attending'
      ? 'badge-attending'
      : 'badge-declined'
    }">
          ${escapeHtml(item.attendanceStatus || '-')}
        </span>
      </td>

      <td>
        <span style="font-weight:600;color:var(--gold-light);">
          ${escapeHtml(item.paymentMethod || 'GPay')}
        </span>
      </td>

      <td style="max-width:200px;">
        ${escapeHtml(item.notes || '-')}
      </td>
    </tr>
  `).join('');
}

/* --------------------------------------------------------------------------
   HTML ESCAPE HELPER
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}