const WORKS = {
  dev: [
    { title: "Project One",   tag: "2D RPG game",     src: "assets/videos/gamedev.mp4", poster: "" },
    { title: "Project Two",   tag: "Minecraft modding",  src: "assets/videos/gamemodding.mp4", poster: "" }
  ],

  edit: [
    { title: "Edit One",   tag: "Brand Promo", src: "assets/videos/AI_video1.mp4", poster: "" },
    { title: "Edit Two",   tag: "Educational",      src: "assets/videos/AI_video2.mp4", poster: "" },
    { title: "Edit Three", tag: "Demo",       src: "assets/videos/DJI_SG_V2 Mini 5 pro.mp4", poster: "" },
    { title: "Edit Four",  tag: "With VFX",      src: "assets/videos/Electrolux_Aug-re_v23.mp4", poster: "" },
    { title: "Edit Five",  tag: "Trending",      src: "assets/videos/Electrolux_Oct_Vacuum Aurafarm.mp4", poster: "" },
    { title: "Edit Six",   tag: "CTA",       src: "assets/videos/Tanamera_Nov_11.11 cta.mp4", poster: "" }
  ],

  anim: [
    { title: "Animation One",   tag: "Live2D Model",src: "assets/videos/showcase1.mp4", poster: "" },
    { title: "Animation Two",   tag: "Live2D Model",src: "assets/videos/showcase2.mp4", poster: "" },
    { title: "Animation Three", tag: "Live2D Model",src: "assets/videos/showcase3.mp4", poster: "" },
    { title: "Animation Four",  tag: "Live2D Mascot model",src: "assets/videos/showcase4.mp4", poster: "" },
    { title: "Animation Five",  tag: "Live2d Model",src: "assets/videos/showcase5.mp4", poster: "" },
    { title: "Animation Six",   tag: "Animations",src: "assets/videos/showcase6.mp4", poster: "" }
  ]
};

const GRADIENTS = [
  "linear-gradient(160deg,#3a2a8f,#ff5c93)",
  "linear-gradient(160deg,#0f766e,#3de0c5)",
  "linear-gradient(160deg,#9a3412,#fbbf24)",
  "linear-gradient(160deg,#1e3a8a,#7c5cff)",
  "linear-gradient(160deg,#831843,#fb7185)",
  "linear-gradient(160deg,#064e3b,#84cc16)"
];

const ICON_PLAY =
  '<svg class="i-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

const ICON_PAUSE =
  '<svg class="i-pause" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

class Carousel {
  constructor(panel, items) {
    this.panel = panel;
    this.items = items;
    this.track = panel.querySelector(".carousel__track");
    this.titleEl = panel.querySelector(".carousel__title");
    this.prev = panel.querySelector(".carousel__arrow--prev");
    this.next = panel.querySelector(".carousel__arrow--next");
    this.cards = [];
    this.activeIndex = -1;
    this.ticking = false;

    this.build();
    this.bind();
  }

  build() {
    this.items.forEach((item, i) => {
      const card = document.createElement("article");

      card.className = "card";
      card.dataset.index = i;
      card.setAttribute("aria-label", item.title);
      card.setAttribute("role", "group");

      let media = "";

      if (item.src) {
        card.classList.add("has-video");

        media = `
          <video
            class="card__media"
            src="${item.src}"
            ${item.poster ? `poster="${item.poster}"` : ""}
            preload="metadata"
            playsinline
            loop
            muted
          ></video>
        `;
      } else {
        media = `
          <div class="card__placeholder" style="--grad:${GRADIENTS[i % GRADIENTS.length]}">
            <div>
              ${item.title}
              <small>Add your project in script.js</small>
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        ${media}

        <div class="card__shade"></div>

        <div class="card__label">
          ${item.title}
          <small>${item.tag}</small>
        </div>

        <button class="card__mute" aria-label="Toggle sound" type="button">🔇</button>

        <button class="card__play" aria-label="Play or pause video" type="button">
          ${ICON_PLAY}
          ${ICON_PAUSE}
        </button>
      `;

      this.track.appendChild(card);
      this.cards.push(card);
    });
  }

  bind() {
    this.track.addEventListener(
      "scroll",
      () => this.requestUpdate(),
      { passive: true }
    );

    window.addEventListener("resize", () => this.requestUpdate());

    this.prev.addEventListener("click", () => {
      this.goTo(this.activeIndex - 1);
    });

    this.next.addEventListener("click", () => {
      this.goTo(this.activeIndex + 1);
    });

    this.track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        this.goTo(this.activeIndex + 1);
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        this.goTo(this.activeIndex - 1);
      }
    });

    this.cards.forEach((card, i) => {
      card.addEventListener("click", (e) => {
        if (i !== this.activeIndex) {
          this.goTo(i);
          return;
        }

        if (e.target.closest(".card__mute")) {
          this.toggleMute(card);
          return;
        }

        if (
          e.target.closest(".card__play") ||
          e.target.closest("video")
        ) {
          this.togglePlay(card);
        }
      });
    });
  }

  requestUpdate() {
    if (this.ticking) return;

    this.ticking = true;

    requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  }

  update() {
    if (!this.cards.length || this.panel.hidden) return;

    const rect = this.track.getBoundingClientRect();
    const centre = rect.left + rect.width / 2;

    let best = 0;
    let bestDist = Infinity;

    this.cards.forEach((card, i) => {
      const r = card.getBoundingClientRect();
      const cardCentre = r.left + r.width / 2;
      const d = Math.abs(cardCentre - centre);

      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });

    if (best !== this.activeIndex) {
      this.setActive(best);
    }
  }

  setActive(index) {
    const previous = this.cards[this.activeIndex];

    if (previous) {
      this.pause(previous);
      previous.classList.remove("is-active");
    }

    this.activeIndex = index;

    const card = this.cards[index];

    if (!card) return;

    card.classList.add("is-active");

    const item = this.items[index];

    this.titleEl.innerHTML =
      `<strong>${item.title}</strong> · ${item.tag}`;

    this.prev.disabled = index === 0;
    this.next.disabled = index === this.cards.length - 1;

    this.prev.style.opacity = index === 0 ? 0.3 : 1;
    this.next.style.opacity =
      index === this.cards.length - 1 ? 0.3 : 1;
  }

  goTo(index) {
    if (index < 0 || index >= this.cards.length) return;

    this.cards[index].scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest"
    });
  }

  centerMiddle(instant = true) {
    const mid = Math.floor(this.cards.length / 2);
    const card = this.cards[mid];

    if (!card) return;

    const left =
      card.offsetLeft -
      (this.track.clientWidth - card.offsetWidth) / 2;

    this.track.scrollTo({
      left,
      behavior: instant ? "auto" : "smooth"
    });

    this.activeIndex = -1;
    this.update();
  }

  video(card) {
    return card.querySelector("video");
  }

  togglePlay(card) {
    const video = this.video(card);

    if (!video) return;

    if (video.paused) {
      this.play(card);
    } else {
      this.pause(card);
    }
  }

  play(card) {
    const video = this.video(card);

    if (!video) return;

    pauseAllVideos(video);

    video
      .play()
      .then(() => card.classList.add("is-playing"))
      .catch(() => {});
  }

  pause(card) {
    const video = this.video(card);

    if (!video) return;

    video.pause();
    card.classList.remove("is-playing");
  }

  toggleMute(card) {
    const video = this.video(card);

    if (!video) return;

    video.muted = !video.muted;

    const button = card.querySelector(".card__mute");

    button.textContent = video.muted ? "🔇" : "🔊";
  }

  pauseAll() {
    this.cards.forEach((card) => this.pause(card));
  }
}

function pauseAllVideos(except) {
  document.querySelectorAll(".card video").forEach((video) => {
    if (video !== except) {
      video.pause();

      const card = video.closest(".card");

      if (card) {
        card.classList.remove("is-playing");
      }
    }
  });
}

/* ============ Initialize Carousels ============ */

const carousels = {};

document.querySelectorAll(".panel").forEach((panel) => {
  const key = panel.dataset.key;

  carousels[key] = new Carousel(
    panel,
    WORKS[key] || []
  );
});

/* ============ Tabs ============ */

const tabs = [
  ...document.querySelectorAll(".tab")
];

function activateTab(tab) {
  const key = tab.dataset.target;

  tabs.forEach((currentTab) => {
    const active = currentTab === tab;

    currentTab.classList.toggle(
      "is-active",
      active
    );

    currentTab.setAttribute(
      "aria-selected",
      active
    );

    currentTab.tabIndex = active ? 0 : -1;
  });

  Object.entries(carousels).forEach(([k, carousel]) => {
    const active = k === key;

    if (!active) {
      carousel.pauseAll();
    }

    carousel.panel.hidden = !active;
    carousel.panel.classList.toggle(
      "is-active",
      active
    );
  });

  if (carousels[key]) {
    carousels[key].centerMiddle(true);
  }
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => {
    activateTab(tab);
  });

  tab.addEventListener("keydown", (e) => {
    let nextIndex = null;

    if (e.key === "ArrowRight") {
      nextIndex = (i + 1) % tabs.length;
    }

    if (e.key === "ArrowLeft") {
      nextIndex =
        (i - 1 + tabs.length) % tabs.length;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      tabs[nextIndex].focus();
      activateTab(tabs[nextIndex]);
    }
  });
});

/* ============ Initial Layout ============ */

window.addEventListener("load", () => {
  if (carousels.dev) {
    carousels.dev.centerMiddle(true);
  }
});

/* ============ Reveal on Scroll ============ */

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document
  .querySelectorAll(".reveal")
  .forEach((element) => observer.observe(element));

/* ============ Footer Year ============ */

const year = document.getElementById("year");

if (year) {
  year.textContent = new Date().getFullYear();
}
