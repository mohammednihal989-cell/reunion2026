/* ==========================================================================
   NEMS BATCH 2024-2025 REUNION CELEBRATION - ADMIN LOGIC
   ========================================================================== */

// ---------------------------------------------------------------------------
// CONFIGURATION
// ---------------------------------------------------------------------------

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxdY3I7QLB94axMWn6V857CBIaKNKRbP4dSRBT4kMKGe9hM3qt-tYYdNPS2ZT2V_GPN/exec";

const PASSCODE = "Thum2024";

let rsvpData = [];
let activeFilter = "ALL";

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
});

/* --------------------------------------------------------------------------
   1. AUTHENTICATION LOGIC
   -------------------------------------------------------------------------- */
function initAuth() {
  const loginForm = document.getElementById('loginForm');
  const authModal = document.getElementById('authModal');
  const adminContent = document.getElementById('adminContent');

  if (sessionStorage.getItem('nems_admin_authed') === 'true') {
    if (authModal) {
      authModal.classList.remove('active');
    }

    if (adminContent) {
      adminContent.style.display = 'block';
    }

    loadDashboardData();
    initFilters();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const input =
        document.getElementById('passcode')?.value.trim() || '';

      if (input === PASSCODE) {
        sessionStorage.setItem(
          'nems_admin_authed',
          'true'
        );

        if (authModal) {
          authModal.classList.remove('active');
        }

        if (adminContent) {
          adminContent.style.display = 'block';
        }

        loadDashboardData();
        initFilters();

      } else {
        alert(
          'Incorrect passcode! Please try again.'
        );
      }
    });
  }
}

/* --------------------------------------------------------------------------
   2. LOAD DASHBOARD DATA
   -------------------------------------------------------------------------- */
async function loadDashboardData() {
  const localData = JSON.parse(
    localStorage.getItem('nems_rsvp_responses') || '[]'
  );

  // Start with local backup
  rsvpData = [...localData];

  try {
    const response = await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {
        method: 'GET',
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP error: ${response.status}`
      );
    }

    const remoteData = await response.json();

    if (Array.isArray(remoteData)) {
      /*
       * Google Sheet is the main source.
       * Local data is merged only as a fallback
       * for submissions that may exist locally.
       */
      rsvpData = mergeResponses(
        localData,
        remoteData
      );
    }

  } catch (err) {
    console.warn(
      'Unable to fetch Google Sheet data:',
      err
    );
  }

  renderDashboard();
}

/* --------------------------------------------------------------------------
   3. MERGE LOCAL + REMOTE DATA
   -------------------------------------------------------------------------- */
function mergeResponses(local, remote) {
  const map = new Map();

  local.forEach(item => {
    const key =
      `${item.fullName || ''}_${item.phone || ''}`;

    map.set(key, item);
  });

  remote.forEach(item => {
    const key =
      `${item.fullName || ''}_${item.phone || ''}`;

    // Remote data takes priority
    map.set(key, item);
  });

  return Array.from(map.values());
}

/* --------------------------------------------------------------------------
   4. RENDER DASHBOARD
   -------------------------------------------------------------------------- */
function renderDashboard() {
  const tableBody =
    document.getElementById('rsvpTableBody');

  const searchInput =
    document.getElementById('searchInput');

  const query =
    searchInput
      ? searchInput.value.toLowerCase()
      : '';

  let filtered = rsvpData.filter(item => {

    const matchesFilter =
      activeFilter === "ALL" ||
      (
        activeFilter === "ATTENDING" &&
        item.attendanceStatus === "Attending"
      ) ||
      (
        activeFilter === "DECLINED" &&
        item.attendanceStatus === "Declined"
      );

    const matchesQuery =
      (item.fullName || '')
        .toLowerCase()
        .includes(query) ||

      (item.phone || '')
        .toLowerCase()
        .includes(query) ||

      (item.notes || '')
        .toLowerCase()
        .includes(query);

    return matchesFilter && matchesQuery;
  });

  /* ------------------------------------------------------------------------
     METRICS
     ------------------------------------------------------------------------ */

  const totalCount = rsvpData.length;

  const attendingList =
    rsvpData.filter(
      i => i.attendanceStatus === "Attending"
    );

  const gpayCount =
    rsvpData.filter(
      i =>
        (i.paymentMethod || 'GPay')
          .toLowerCase()
          .includes('gpay')
    ).length;

  const cashCount =
    rsvpData.filter(
      i =>
        (i.paymentMethod || '')
          .toLowerCase()
          .includes('cash')
    ).length;

  const totalEl =
    document.getElementById('totalRsvpCount');

  const attendingEl =
    document.getElementById('attendingCount');

  const gpayEl =
    document.getElementById('gpayCount');

  const cashEl =
    document.getElementById('cashCount');

  if (totalEl) {
    totalEl.textContent = totalCount;
  }

  if (attendingEl) {
    attendingEl.textContent =
      attendingList.length;
  }

  if (gpayEl) {
    gpayEl.textContent = gpayCount;
  }

  if (cashEl) {
    cashEl.textContent = cashCount;
  }

  /* ------------------------------------------------------------------------
     TABLE
     ------------------------------------------------------------------------ */

  if (!tableBody) return;

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td
          colspan="7"
          style="
            text-align:center;
            color:var(--text-muted);
            padding:30px;
          "
        >
          No RSVP responses found.
        </td>
      </tr>
    `;

    return;
  }

  tableBody.innerHTML =
    filtered.map((item, idx) => {

      const isAttending =
        item.attendanceStatus === "Attending";

      const statusBadge =
        isAttending
          ? `<span class="badge badge-attending">Attending</span>`
          : `<span class="badge badge-declined">Declined</span>`;

      return `
        <tr>

          <td>
            ${idx + 1}
          </td>

          <td style="font-weight:600;">
            ${escapeHtml(
        item.fullName || '-'
      )}
          </td>

          <td>
            ${escapeHtml(
        item.phone || '-'
      )}
          </td>

          <td>
            ${statusBadge}
          </td>

          <td>
            <span
              style="
                font-weight:600;
                color:var(--gold-light);
              "
            >
              ${escapeHtml(
        item.paymentMethod || 'GPay'
      )}
            </span>
          </td>

          <td style="max-width:250px;">
            ${escapeHtml(
        item.notes || '-'
      )}
          </td>

          <td
            style="
              color:var(--text-muted);
              font-size:0.8rem;
            "
          >
            ${escapeHtml(
        item.timestamp || '-'
      )}
          </td>

        </tr>
      `;
    }).join('');
}

/* --------------------------------------------------------------------------
   5. HTML ESCAPE
   -------------------------------------------------------------------------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* --------------------------------------------------------------------------
   6. FILTERS, SEARCH & CSV EXPORT
   -------------------------------------------------------------------------- */
function initFilters() {

  const filterAll =
    document.getElementById('filterAll');

  const filterAttending =
    document.getElementById('filterAttending');

  const filterDeclined =
    document.getElementById('filterDeclined');

  const searchInput =
    document.getElementById('searchInput');

  const exportCsvBtn =
    document.getElementById('exportCsvBtn');

  if (filterAll) {
    filterAll.addEventListener(
      'click',
      () => {
        activeFilter = "ALL";
        renderDashboard();
      }
    );
  }

  if (filterAttending) {
    filterAttending.addEventListener(
      'click',
      () => {
        activeFilter = "ATTENDING";
        renderDashboard();
      }
    );
  }

  if (filterDeclined) {
    filterDeclined.addEventListener(
      'click',
      () => {
        activeFilter = "DECLINED";
        renderDashboard();
      }
    );
  }

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      () => {
        renderDashboard();
      }
    );
  }

  if (exportCsvBtn) {
    exportCsvBtn.addEventListener(
      'click',
      exportToCsv
    );
  }
}

/* --------------------------------------------------------------------------
   7. CSV EXPORT
   -------------------------------------------------------------------------- */
function exportToCsv() {

  if (rsvpData.length === 0) {
    alert(
      "No RSVP data available to export."
    );

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

  const rows =
    rsvpData.map(i => [

      `"${(i.fullName || '')
        .replace(/"/g, '""')}"`,

      `"${(i.phone || '')
        .replace(/"/g, '""')}"`,

      `"${(i.attendanceStatus || '')
        .replace(/"/g, '""')}"`,

      `"${(i.paymentMethod || 'GPay')
        .replace(/"/g, '""')}"`,

      `"${(i.notes || '')
        .replace(/"/g, '""')}"`,

      `"${(i.timestamp || '')
        .replace(/"/g, '""')}"`
    ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(","),
      ...rows.map(
        r => r.join(",")
      )
    ].join("\n");

  const encodedUri =
    encodeURI(csvContent);

  const link =
    document.createElement("a");

  link.setAttribute(
    "href",
    encodedUri
  );

  link.setAttribute(
    "download",
    `NEMS_Reunion_RSVPs_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
  );

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);
}