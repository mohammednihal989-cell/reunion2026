/* ==========================================================================
   NEMS BATCH 2024–2025 REUNION
   MAIN WEBSITE JAVASCRIPT
   ========================================================================== */

/* ==========================================================================
   CONFIGURATION
   ========================================================================== */

const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxdY3I7QLB94axMWn6V857CBIaKNKRbP4dSRBT4kMKGe9hM3qt-tYYdNPS2ZT2V_GPN/exec";


/* ==========================================================================
   INITIALIZE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {

  initCountdown();

  initModals();

  initRsvpForm();

  initCalendarAndShare();

  initPhotoGallery();

});


/* ==========================================================================
   COUNTDOWN
   ========================================================================== */

function initCountdown() {

  const targetDate =
    new Date("2026-08-29T13:30:00+05:30").getTime();

  const daysEl =
    document.getElementById("days");

  const hoursEl =
    document.getElementById("hours");

  const minutesEl =
    document.getElementById("minutes");

  const secondsEl =
    document.getElementById("seconds");

  if (
    !daysEl ||
    !hoursEl ||
    !minutesEl ||
    !secondsEl
  ) {
    return;
  }

  function updateTimer() {

    const now = Date.now();

    const difference =
      targetDate - now;

    if (difference <= 0) {

      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";

      return;
    }

    const days =
      Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
      );

    const hours =
      Math.floor(
        (
          difference %
          (1000 * 60 * 60 * 24)
        ) /
        (1000 * 60 * 60)
      );

    const minutes =
      Math.floor(
        (
          difference %
          (1000 * 60 * 60)
        ) /
        (1000 * 60)
      );

    const seconds =
      Math.floor(
        (
          difference %
          (1000 * 60)
        ) /
        1000
      );

    daysEl.textContent =
      String(days).padStart(2, "0");

    hoursEl.textContent =
      String(hours).padStart(2, "0");

    minutesEl.textContent =
      String(minutes).padStart(2, "0");

    secondsEl.textContent =
      String(seconds).padStart(2, "0");
  }

  updateTimer();

  setInterval(updateTimer, 1000);
}


/* ==========================================================================
   MODALS
   ========================================================================== */

function initModals() {

  const rsvpModal =
    document.getElementById("rsvpModal");

  const openRsvpBtn =
    document.getElementById("openRsvpBtn");

  const closeRsvpBtn =
    document.getElementById("closeRsvpBtn");

  const posterModal =
    document.getElementById("posterModal");

  const openPosterLightbox =
    document.getElementById("openPosterLightbox");

  const closePosterBtn =
    document.getElementById("closePosterBtn");


  /* RSVP OPEN */

  if (
    openRsvpBtn &&
    rsvpModal
  ) {

    openRsvpBtn.addEventListener(
      "click",
      () => {

        rsvpModal.classList.add("active");

        document.body.style.overflow = "hidden";

      }
    );

  }


  /* RSVP CLOSE */

  if (
    closeRsvpBtn &&
    rsvpModal
  ) {

    closeRsvpBtn.addEventListener(
      "click",
      () => {

        rsvpModal.classList.remove("active");

        document.body.style.overflow = "";

      }
    );

  }


  if (rsvpModal) {

    rsvpModal.addEventListener(
      "click",
      event => {

        if (
          event.target === rsvpModal
        ) {

          rsvpModal.classList.remove("active");

          document.body.style.overflow = "";

        }

      }
    );

  }


  /* POSTER OPEN */

  if (
    openPosterLightbox &&
    posterModal
  ) {

    openPosterLightbox.addEventListener(
      "click",
      () => {

        posterModal.classList.add("active");

        document.body.style.overflow = "hidden";

      }
    );

  }


  /* POSTER CLOSE */

  if (
    closePosterBtn &&
    posterModal
  ) {

    closePosterBtn.addEventListener(
      "click",
      () => {

        posterModal.classList.remove("active");

        document.body.style.overflow = "";

      }
    );

  }


  if (posterModal) {

    posterModal.addEventListener(
      "click",
      event => {

        if (
          event.target === posterModal
        ) {

          posterModal.classList.remove("active");

          document.body.style.overflow = "";

        }

      }
    );

  }

}


/* ==========================================================================
   RSVP
   ========================================================================== */

function initRsvpForm() {

  const form =
    document.getElementById("rsvpForm");

  if (!form) {
    return;
  }


  form.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const submitBtn =
        document.getElementById("submitRsvpBtn");


      const fullName =
        document
          .getElementById("fullName")
          ?.value
          .trim() || "";


      const phone =
        document
          .getElementById("phone")
          ?.value
          .trim() || "";


      const attendanceStatus =
        document.querySelector(
          'input[name="attendanceStatus"]:checked'
        )?.value ||
        "Attending";


      const paymentMethod =
        document.querySelector(
          'input[name="paymentMethod"]:checked'
        )?.value ||
        "GPay";


      const notes =
        document
          .getElementById("notes")
          ?.value
          .trim() || "";


      if (
        !fullName ||
        !phone
      ) {

        showToast(
          "Please enter your name and phone number."
        );

        return;

      }


      const payload = {

        action: "rsvp",

        fullName: fullName,

        phone: phone,

        attendanceStatus: attendanceStatus,

        paymentMethod: paymentMethod,

        notes: notes,

        timestamp:
          new Date().toLocaleString(
            "en-IN",
            {
              timeZone: "Asia/Kolkata"
            }
          )

      };


      if (submitBtn) {

        submitBtn.disabled = true;

        submitBtn.textContent =
          "Submitting...";

      }


      try {

        await fetch(
          GOOGLE_APPS_SCRIPT_URL,
          {

            method: "POST",

            mode: "no-cors",

            headers: {
              "Content-Type":
                "text/plain;charset=utf-8"
            },

            body:
              JSON.stringify(payload)

          }
        );


        saveResponseLocally(payload);

        triggerConfetti();


        showToast(
          "✨ Thank you! Your RSVP has been recorded."
        );


        form.reset();


        const modal =
          document.getElementById("rsvpModal");


        if (modal) {

          modal.classList.remove("active");

        }


        document.body.style.overflow = "";

      } catch (error) {

        console.error(
          "RSVP error:",
          error
        );


        saveResponseLocally(payload);


        showToast(
          "Your response was saved locally. Please try again."
        );

      }


      if (submitBtn) {

        submitBtn.disabled = false;

        submitBtn.textContent =
          "Submit RSVP";

      }

    }
  );

}


/* ==========================================================================
   LOCAL RSVP BACKUP
   ========================================================================== */

function saveResponseLocally(data) {

  try {

    const existing =
      JSON.parse(
        localStorage.getItem(
          "nems_rsvp_responses"
        ) || "[]"
      );


    existing.push(data);


    localStorage.setItem(
      "nems_rsvp_responses",
      JSON.stringify(existing)
    );

  } catch (error) {

    console.warn(
      "Local backup failed:",
      error
    );

  }

}


/* ==========================================================================
   CONFETTI
   ========================================================================== */

function triggerConfetti() {

  if (
    typeof confetti !== "function"
  ) {
    return;
  }


  confetti({

    particleCount: 120,

    spread: 80,

    origin: {
      y: 0.6
    }

  });

}


/* ==========================================================================
   TOAST
   ========================================================================== */

function showToast(message) {

  const oldToast =
    document.querySelector(".toast-msg");


  if (oldToast) {
    oldToast.remove();
  }


  const toast =
    document.createElement("div");


  toast.className =
    "toast-msg";


  toast.innerHTML =
    `<span>${escapeHtml(message)}</span>`;


  document.body.appendChild(toast);


  setTimeout(
    () => {

      toast.style.opacity = "0";

      toast.style.transition =
        "opacity .5s ease";


      setTimeout(
        () => toast.remove(),
        500
      );

    },
    3500
  );

}


/* ==========================================================================
   CALENDAR & SHARE
   ========================================================================== */

function initCalendarAndShare() {

  const addToCalBtn =
    document.getElementById("addToCalBtn");

  const shareBtn =
    document.getElementById("shareBtn");


  if (addToCalBtn) {

    addToCalBtn.addEventListener(
      "click",
      () => {

        const title =
          encodeURIComponent(
            "Reunion Celebration | NEMS Batch 2024-2025"
          );


        const details =
          encodeURIComponent(
            "Reunion celebration for NEMS Batch 2024-2025 at MIZHI, Karuvarakundu."
          );


        const location =
          encodeURIComponent(
            "MIZHI, Karuvarakundu"
          );


        const startDate =
          "20260829T080000Z";


        const endDate =
          "20260829T143000Z";


        const url =
          "https://calendar.google.com/calendar/render" +
          "?action=TEMPLATE" +
          `&text=${title}` +
          `&dates=${startDate}/${endDate}` +
          `&details=${details}` +
          `&location=${location}`;


        window.open(
          url,
          "_blank"
        );

      }
    );

  }


  if (shareBtn) {

    shareBtn.addEventListener(
      "click",
      async () => {

        const data = {

          title:
            "NEMS Batch 2024–2025 Reunion",

          text:
            "Join us for the NEMS Batch 2024–2025 Reunion Celebration on August 29, 2026 at Mizhi, Karuvarakundu!",

          url:
            window.location.href

        };


        if (
          navigator.share
        ) {

          try {

            await navigator.share(data);

          } catch (_) { }

        } else {

          try {

            await navigator.clipboard.writeText(
              window.location.href
            );


            showToast(
              "📋 Invitation link copied!"
            );

          } catch (_) {

            showToast(
              "Please copy the website link manually."
            );

          }

        }

      }
    );

  }

}


/* ==========================================================================
   PHOTO GALLERY
   ========================================================================== */

async function initPhotoGallery() {

  const gallery =
    document.getElementById("photoGallery");

  const loading =
    document.getElementById("galleryLoading");

  const empty =
    document.getElementById("galleryEmpty");


  if (!gallery) {
    return;
  }


  try {

    const response =
      await fetch(
        `${GOOGLE_APPS_SCRIPT_URL}?action=gallery&_=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        `HTTP ${response.status}`
      );

    }


    const result =
      await response.json();


    console.log(
      "NEMS Gallery API:",
      result
    );


    const photos =
      Array.isArray(result)
        ? result
        : Array.isArray(result.photos)
          ? result.photos
          : [];


    if (loading) {

      loading.style.display = "none";

    }


    if (!photos.length) {

      if (empty) {

        empty.style.display = "block";

      }

      return;

    }


    if (empty) {

      empty.style.display = "none";

    }


    renderGallery(photos);

  } catch (error) {

    console.error(
      "Gallery loading failed:",
      error
    );


    if (loading) {

      loading.style.display = "none";

    }


    if (empty) {

      empty.style.display = "block";


      empty.innerHTML = `

        <div class="gallery-empty-icon">
          📸
        </div>

        <h3>
          Photos Coming Soon
        </h3>

        <p>
          Event photos will appear here once uploaded.
        </p>

      `;

    }

  }

}


/* ==========================================================================
   GOOGLE DRIVE URL HELPERS
   ========================================================================== */

function getDriveThumbnailUrl(fileId) {

  if (!fileId) {
    return "";
  }


  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(fileId) +
    "&sz=w2000"
  );

}


function getDriveViewUrl(fileId) {

  if (!fileId) {
    return "";
  }


  return (
    "https://drive.google.com/uc?export=view&id=" +
    encodeURIComponent(fileId)
  );

}


function getDriveDownloadUrl(fileId) {

  if (!fileId) {
    return "";
  }


  return (
    "https://drive.google.com/uc?export=download&id=" +
    encodeURIComponent(fileId)
  );

}


/* ==========================================================================
   RENDER GALLERY
   ========================================================================== */

function renderGallery(photos) {

  const gallery =
    document.getElementById("photoGallery");


  if (!gallery) {
    return;
  }


  gallery.innerHTML =
    photos
      .map(
        photo => {

          const id =
            photo.id || "";


          const thumbnailUrl =
            photo.thumbnailUrl ||
            getDriveThumbnailUrl(id);


          const imageUrl =
            photo.url ||
            getDriveViewUrl(id) ||
            thumbnailUrl;


          const downloadUrl =
            photo.downloadUrl ||
            getDriveDownloadUrl(id);


          const safeName =
            photo.name ||
            "NEMS Reunion Photo";


          return `

            <article class="photo-card">

              <div
                class="photo-image-wrap"
                role="button"
                tabindex="0"
                onclick="openPhotoLightbox(
                  '${escapeAttribute(thumbnailUrl)}',
                  '${escapeAttribute(downloadUrl)}',
                  '${escapeAttribute(imageUrl)}'
                )"
                onkeydown="
                  if(event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openPhotoLightbox(
                      '${escapeAttribute(thumbnailUrl)}',
                      '${escapeAttribute(downloadUrl)}',
                      '${escapeAttribute(imageUrl)}'
                    );
                  }
                "
              >

                <img
                  src="${escapeAttribute(thumbnailUrl)}"
                  alt="${escapeAttribute(safeName)}"
                  loading="lazy"
                  class="reunion-gallery-image"
                  draggable="false"
                  onerror="
                    this.onerror=null;
                    this.src='${escapeAttribute(imageUrl)}';
                  "
                >

                <div class="photo-overlay">

                  <span>
                    🔍 View
                  </span>

                </div>

              </div>


              <div class="photo-card-footer">

                <span class="photo-name">
                  ${escapeHtml(safeName)}
                </span>


                <a
                  href="${escapeAttribute(downloadUrl)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="photo-download-btn"
                  download
                  title="Download photo"
                  onclick="event.stopPropagation();"
                >
                  ⬇
                </a>

              </div>

            </article>

          `;

        }
      )
      .join("");

}


/* ==========================================================================
   PHOTO LIGHTBOX
   ========================================================================== */

function openPhotoLightbox(
  thumbnailUrl,
  downloadUrl,
  imageUrl
) {

  const modal =
    document.getElementById("photoLightbox");

  const image =
    document.getElementById("lightboxPhoto");

  const download =
    document.getElementById("lightboxDownload");


  if (
    !modal ||
    !image
  ) {

    return;

  }


  /*
   * IMPORTANT:
   *
   * Google Drive's direct "uc?export=view"
   * URL can sometimes return a blank/black
   * result inside a website.
   *
   * Therefore we load the Drive thumbnail
   * first. It is much more reliable for
   * browser display.
   */

  image.onload = () => {

    console.log(
      "Lightbox image loaded successfully."
    );

  };


  image.onerror = () => {

    console.warn(
      "Thumbnail failed. Trying Drive view URL."
    );


    image.onerror = () => {

      console.error(
        "Both image URLs failed."
      );

      image.alt =
        "Unable to display this photo. Please use Download Photo.";

    };


    image.src =
      imageUrl;

  };


  image.src =
    thumbnailUrl ||
    imageUrl;


  if (download) {

    download.href =
      downloadUrl ||
      imageUrl;

  }


  modal.classList.add("active");


  document.body.style.overflow =
    "hidden";

}


/* ==========================================================================
   CLOSE PHOTO LIGHTBOX
   ========================================================================== */

function closePhotoLightbox() {

  const modal =
    document.getElementById("photoLightbox");


  if (!modal) {
    return;
  }


  modal.classList.remove("active");


  document.body.style.overflow =
    "";

}


/* ==========================================================================
   PHOTO LIGHTBOX EVENTS
   ========================================================================== */

document.addEventListener(
  "click",
  event => {

    const modal =
      document.getElementById("photoLightbox");

    const close =
      document.getElementById("closePhotoLightbox");


    if (!modal) {
      return;
    }


    if (
      event.target === close ||
      event.target === modal
    ) {

      closePhotoLightbox();

    }

  }
);


/* ==========================================================================
   ESC KEY
   ========================================================================== */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Escape"
    ) {

      closePhotoLightbox();

    }

  }
);


/* ==========================================================================
   SECURITY HELPERS
   ========================================================================== */

function escapeHtml(value) {

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


function escapeAttribute(value) {

  return escapeHtml(value)

    .replace(
      /`/g,
      "&#096;"
    );

}