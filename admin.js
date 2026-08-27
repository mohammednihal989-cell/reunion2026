/* ==========================================================================
   NEMS REUNION 2026
   ADMIN DASHBOARD
   ========================================================================== */


/* --------------------------------------------------------------------------
   CONFIGURATION
--------------------------------------------------------------------------- */

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxdY3I7QLB94axMWn6V857CBIaKNKRbP4dSRBT4kMKGe9hM3qt-tYYdNPS2ZT2V_GPN/exec";


const PASSCODE =
  "Thum2024";


let rsvpData = [];

let activeFilter =
  "ALL";


document.addEventListener(
  "DOMContentLoaded",
  () => {

    initAuth();

  }
);


/* --------------------------------------------------------------------------
   AUTHENTICATION
--------------------------------------------------------------------------- */

function initAuth() {

  const loginForm =
    document.getElementById(
      "loginForm"
    );


  if (
    sessionStorage.getItem(
      "nems_admin_authed"
    ) === "true"
  ) {

    unlockDashboard();

  }


  if (!loginForm) return;


  loginForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();


      const code =
        document
          .getElementById("passcode")
          .value
          .trim();


      if (code === PASSCODE) {

        sessionStorage.setItem(
          "nems_admin_authed",
          "true"
        );


        unlockDashboard();

      } else {

        alert(
          "Incorrect passcode!"
        );

      }

    }
  );

}


/* --------------------------------------------------------------------------
   UNLOCK
--------------------------------------------------------------------------- */

function unlockDashboard() {

  const auth =
    document.getElementById(
      "authModal"
    );


  const content =
    document.getElementById(
      "adminContent"
    );


  if (auth) {

    auth.classList.remove(
      "active"
    );

  }


  if (content) {

    content.style.display =
      "block";

  }


  loadDashboardData();

  initFilters();

  initPhotoUpload();

  loadAdminPhotos();

}


/* --------------------------------------------------------------------------
   RSVP DATA
--------------------------------------------------------------------------- */

async function loadDashboardData() {

  const localData =
    JSON.parse(
      localStorage.getItem(
        "nems_rsvp_responses"
      ) || "[]"
    );


  rsvpData =
    [...localData];


  try {

    const response =
      await fetch(
        `${GOOGLE_APPS_SCRIPT_URL}?action=rsvps&_=${Date.now()}`,
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const remote =
      await response.json();


    if (Array.isArray(remote)) {

      rsvpData =
        mergeResponses(
          localData,
          remote
        );

    }


  } catch (error) {

    console.warn(
      "Remote RSVP loading failed:",
      error
    );

  }


  renderDashboard();

}


/* --------------------------------------------------------------------------
   MERGE RSVP
--------------------------------------------------------------------------- */

function mergeResponses(
  local,
  remote
) {

  const map =
    new Map();


  local.forEach(item => {

    const key =
      `${item.fullName || ""}_${item.phone || ""}`;

    map.set(
      key,
      item
    );

  });


  remote.forEach(item => {

    const key =
      `${item.fullName || ""}_${item.phone || ""}`;

    map.set(
      key,
      item
    );

  });


  return Array.from(
    map.values()
  );

}


/* --------------------------------------------------------------------------
   DASHBOARD
--------------------------------------------------------------------------- */

function renderDashboard() {

  const query =
    (
      document
        .getElementById("searchInput")
        ?.value || ""
    ).toLowerCase();


  const filtered =
    rsvpData.filter(
      item => {

        const matchesFilter =

          activeFilter === "ALL" ||

          (
            activeFilter ===
            "ATTENDING" &&
            item.attendanceStatus ===
            "Attending"
          ) ||

          (
            activeFilter ===
            "DECLINED" &&
            item.attendanceStatus ===
            "Declined"
          );


        const text =
          [
            item.fullName,
            item.phone,
            item.notes
          ]
            .join(" ")
            .toLowerCase();


        return (
          matchesFilter &&
          text.includes(query)
        );

      }
    );


  updateMetrics();

  renderRsvpTable(
    filtered
  );

}


/* --------------------------------------------------------------------------
   METRICS
--------------------------------------------------------------------------- */

function updateMetrics() {

  const total =
    rsvpData.length;


  const attending =
    rsvpData.filter(
      item =>
        item.attendanceStatus ===
        "Attending"
    ).length;


  const gpay =
    rsvpData.filter(
      item =>
        String(
          item.paymentMethod || ""
        )
          .toLowerCase()
          .includes("gpay")
    ).length;


  const cash =
    rsvpData.filter(
      item =>
        String(
          item.paymentMethod || ""
        )
          .toLowerCase()
          .includes("cash")
    ).length;


  document.getElementById(
    "totalRsvpCount"
  ).textContent =
    total;


  document.getElementById(
    "attendingCount"
  ).textContent =
    attending;


  document.getElementById(
    "gpayCount"
  ).textContent =
    gpay;


  document.getElementById(
    "cashCount"
  ).textContent =
    cash;

}


/* --------------------------------------------------------------------------
   RSVP TABLE
--------------------------------------------------------------------------- */

function renderRsvpTable(
  data
) {

  const tbody =
    document.getElementById(
      "rsvpTableBody"
    );


  if (!tbody) return;


  if (!data.length) {

    tbody.innerHTML = `

      <tr>

        <td
          colspan="7"
          style="
            text-align:center;
            padding:40px;
            color:var(--text-muted);
          "
        >
          No RSVP responses found.
        </td>

      </tr>

    `;

    return;

  }


  tbody.innerHTML =
    data
      .map(
        (item, index) => {

          const attending =
            item.attendanceStatus ===
            "Attending";


          return `

            <tr>

              <td>
                ${index + 1}
              </td>

              <td
                style="font-weight:600;"
              >
                ${escapeHtml(
            item.fullName || "-"
          )}
              </td>

              <td>
                ${escapeHtml(
            item.phone || "-"
          )}
              </td>

              <td>

                <span
                  class="badge ${attending
              ? "badge-attending"
              : "badge-declined"
            }"
                >
                  ${escapeHtml(
              item.attendanceStatus ||
              "-"
            )}
                </span>

              </td>

              <td>

                <span
                  style="
                    color:var(--gold-light);
                    font-weight:600;
                  "
                >
                  ${escapeHtml(
              item.paymentMethod ||
              "GPay"
            )}
                </span>

              </td>

              <td>
                ${escapeHtml(
              item.notes || "-"
            )}
              </td>

              <td
                style="
                  color:var(--text-muted);
                  font-size:.8rem;
                "
              >
                ${escapeHtml(
              item.timestamp || "-"
            )}
              </td>

            </tr>

          `;

        }
      )
      .join("");

}


/* --------------------------------------------------------------------------
   FILTERS
--------------------------------------------------------------------------- */

function initFilters() {

  const all =
    document.getElementById(
      "filterAll"
    );


  const attending =
    document.getElementById(
      "filterAttending"
    );


  const declined =
    document.getElementById(
      "filterDeclined"
    );


  const search =
    document.getElementById(
      "searchInput"
    );


  const exportBtn =
    document.getElementById(
      "exportCsvBtn"
    );


  const refresh =
    document.getElementById(
      "refreshDashboardBtn"
    );


  all?.addEventListener(
    "click",
    () => {

      activeFilter =
        "ALL";

      renderDashboard();

    }
  );


  attending?.addEventListener(
    "click",
    () => {

      activeFilter =
        "ATTENDING";

      renderDashboard();

    }
  );


  declined?.addEventListener(
    "click",
    () => {

      activeFilter =
        "DECLINED";

      renderDashboard();

    }
  );


  search?.addEventListener(
    "input",
    renderDashboard
  );


  exportBtn?.addEventListener(
    "click",
    exportToCsv
  );


  refresh?.addEventListener(
    "click",
    async () => {

      await loadDashboardData();

      await loadAdminPhotos();

    }
  );

}


/* --------------------------------------------------------------------------
   CSV
--------------------------------------------------------------------------- */

function exportToCsv() {

  if (!rsvpData.length) {

    alert(
      "No RSVP data available."
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
    rsvpData.map(
      item => [

        item.fullName || "",

        item.phone || "",

        item.attendanceStatus || "",

        item.paymentMethod || "",

        item.notes || "",

        item.timestamp || ""

      ]
    );


  const csv =
    [
      headers,
      ...rows
    ]
      .map(
        row =>
          row
            .map(
              value =>
                `"${String(value)
                  .replace(/"/g, '""')}"`
            )
            .join(",")
      )
      .join("\n");


  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );


  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    `NEMS_Reunion_RSVPs_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;


  link.click();


  URL.revokeObjectURL(
    url
  );

}


/* --------------------------------------------------------------------------
   PHOTO UPLOAD
--------------------------------------------------------------------------- */

function initPhotoUpload() {

  const input =
    document.getElementById(
      "photoInput"
    );


  if (!input) return;


  input.addEventListener(
    "change",
    async event => {

      const files =
        Array.from(
          event.target.files || []
        );


      if (!files.length) {
        return;
      }


      await uploadPhotos(
        files
      );


      input.value =
        "";

    }
  );

}


/* --------------------------------------------------------------------------
   UPLOAD MULTIPLE PHOTOS
--------------------------------------------------------------------------- */

async function uploadPhotos(
  files
) {

  const status =
    document.getElementById(
      "uploadStatus"
    );


  const title =
    document.getElementById(
      "uploadStatusTitle"
    );


  const text =
    document.getElementById(
      "uploadStatusText"
    );


  const bar =
    document.getElementById(
      "uploadProgressBar"
    );


  status.style.display =
    "block";


  let completed =
    0;


  for (
    const originalFile
    of files
  ) {

    try {

      title.textContent =
        `Uploading ${originalFile.name}`;


      const optimized =
        await optimizeImage(
          originalFile
        );


      const base64 =
        await fileToBase64(
          optimized
        );


      const payload = {

        action:
          "upload",

        fileName:
          originalFile.name,

        mimeType:
          optimized.type ||
          "image/jpeg",

        base64:
          base64

      };


      await fetch(
        GOOGLE_APPS_SCRIPT_URL,
        {

          method:
            "POST",

          mode:
            "no-cors",

          headers: {
            "Content-Type":
              "text/plain;charset=utf-8"
          },

          body:
            JSON.stringify(
              payload
            )

        }
      );


      completed++;


      const percent =
        Math.round(
          (completed /
            files.length) *
          100
        );


      bar.style.width =
        `${percent}%`;


      text.textContent =
        `${completed} / ${files.length} uploaded`;

    } catch (error) {

      console.error(
        "Photo upload failed:",
        error
      );

    }

  }


  title.textContent =
    "Upload complete";


  text.textContent =
    `${completed} of ${files.length} photos uploaded`;


  setTimeout(
    () => {

      status.style.display =
        "none";

    },
    2000
  );


  await loadAdminPhotos();

}


/* --------------------------------------------------------------------------
   IMAGE OPTIMIZATION
--------------------------------------------------------------------------- */

function optimizeImage(
  file
) {

  return new Promise(
    resolve => {

      const reader =
        new FileReader();


      reader.onload =
        event => {

          const image =
            new Image();


          image.onload =
            () => {

              const maxSize =
                2200;


              let width =
                image.width;


              let height =
                image.height;


              if (
                width >
                maxSize ||
                height >
                maxSize
              ) {

                if (
                  width >
                  height
                ) {

                  height =
                    Math.round(
                      height *
                      (maxSize /
                        width)
                    );

                  width =
                    maxSize;

                } else {

                  width =
                    Math.round(
                      width *
                      (maxSize /
                        height)
                    );

                  height =
                    maxSize;

                }

              }


              const canvas =
                document.createElement(
                  "canvas"
                );


              canvas.width =
                width;


              canvas.height =
                height;


              const context =
                canvas.getContext(
                  "2d"
                );


              context.drawImage(
                image,
                0,
                0,
                width,
                height
              );


              canvas.toBlob(
                blob => {

                  resolve(blob);

                },
                "image/jpeg",
                0.85
              );

            };


          image.src =
            event.target.result;

        };


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* --------------------------------------------------------------------------
   FILE → BASE64
--------------------------------------------------------------------------- */

function fileToBase64(
  file
) {

  return new Promise(
    (resolve, reject) => {

      const reader =
        new FileReader();


      reader.onload =
        () => {

          const result =
            reader.result;


          resolve(
            String(result)
              .split(",")[1]
          );

        };


      reader.onerror =
        reject;


      reader.readAsDataURL(
        file
      );

    }
  );

}


/* --------------------------------------------------------------------------
   LOAD ADMIN PHOTOS
--------------------------------------------------------------------------- */

async function loadAdminPhotos() {

  const gallery =
    document.getElementById(
      "adminPhotoGallery"
    );


  if (!gallery) return;


  gallery.innerHTML = `

    <div
      class="gallery-status"
    >

      <div class="gallery-loader"></div>

      <p>
        Loading photos...
      </p>

    </div>

  `;


  try {

    const response =
      await fetch(
        `${GOOGLE_APPS_SCRIPT_URL}?action=gallery&_=${Date.now()}`,
        {
          cache:
            "no-store"
        }
      );


    const result =
      await response.json();


    const photos =
      Array.isArray(result)
        ? result
        : result.photos || [];


    if (!photos.length) {

      gallery.innerHTML = `

        <div
          class="gallery-empty"
          style="
            grid-column:1/-1;
          "
        >

          <div class="gallery-empty-icon">
            📸
          </div>

          <h3>
            No Photos Uploaded
          </h3>

          <p>
            Click ＋ Upload Photos to add reunion memories.
          </p>

        </div>

      `;

      return;

    }


    gallery.innerHTML =
      photos
        .map(
          photo => `

            <article
              class="admin-photo-card"
            >

              <img
                src="${escapeAttribute(
            photo.url
          )}"
                alt="${escapeAttribute(
            photo.name
          )}"
                loading="lazy"
              >


              <div
                class="admin-photo-info"
              >

                <div
                  class="admin-photo-name"
                >
                  ${escapeHtml(
            photo.name ||
            "Photo"
          )}
                </div>


                <button
                  class="delete-photo-btn"
                  onclick="deletePhoto(
                    '${escapeAttribute(
            photo.id
          )}'
                  )"
                >
                  🗑 Delete
                </button>

              </div>

            </article>

          `
        )
        .join("");

  } catch (error) {

    console.error(
      "Unable to load photos:",
      error
    );


    gallery.innerHTML = `

      <div
        class="gallery-empty"
        style="
          grid-column:1/-1;
        "
      >

        <h3>
          Unable to load gallery
        </h3>

        <p>
          Check your Apps Script deployment.
        </p>

      </div>

    `;

  }

}


/* --------------------------------------------------------------------------
   DELETE PHOTO
--------------------------------------------------------------------------- */

async function deletePhoto(
  fileId
) {

  if (
    !confirm(
      "Delete this photo permanently?"
    )
  ) {

    return;

  }


  try {

    await fetch(
      GOOGLE_APPS_SCRIPT_URL,
      {

        method:
          "POST",

        mode:
          "no-cors",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify({

            action:
              "delete",

            fileId

          })

      }
    );


    alert(
      "Photo deleted."
    );


    await loadAdminPhotos();

  } catch (error) {

    console.error(
      error
    );


    alert(
      "Unable to delete photo."
    );

  }

}


/* --------------------------------------------------------------------------
   ESCAPE
--------------------------------------------------------------------------- */

function escapeHtml(
  value
) {

  return String(value || "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  ).replace(
    /`/g,
    "&#096;"
  );

}