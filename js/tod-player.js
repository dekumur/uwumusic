import { tracksData } from "./tracks-data.js";

const audio = new Audio();
audio.preload = "metadata";
audio.volume = 1;

let currentCard = null;
let isSwitching = false;

// ================= УТИЛИТЫ =================
const formatTime = sec => {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

function resetAllCards() {
  document.querySelectorAll(".tod-card, .top-item").forEach(card => {
    card.classList.remove("playing");
    const btn = card.querySelector(".tod-play, .top-play");
    if (btn) btn.textContent = "▶";
  });
}

// ================= FADE IN =================
function fadeIn() {
  audio.volume = 0;
  const fade = setInterval(() => {
    if (audio.volume < 0.95) {
      audio.volume += 0.05;
    } else {
      clearInterval(fade);
      audio.volume = 1;
    }
  }, 40);
}

// ================= ДЛИТЕЛЬНОСТЬ =================
function setDuration(card, src) {
  const durationEl = card.querySelector(".tod-duration");
  if (!durationEl) return;

  const tempAudio = new Audio(src);
  tempAudio.addEventListener("loadedmetadata", () => {
    durationEl.textContent = formatTime(tempAudio.duration);
  });
}

// ================= PLAY / PAUSE =================
function playCard(card, src, btn) {
  if (isSwitching) return;
  isSwitching = true;

  // Тот же трек
  if (currentCard === card) {
    if (audio.paused) {
      audio.play().catch(e => console.log(e.name));
      card.classList.add("playing");
      btn.textContent = "⏸";
    } else {
      audio.pause();
      card.classList.remove("playing");
      btn.textContent = "▶";
    }
    isSwitching = false;
    return;
  }

  // Новый трек
  resetAllCards();
  audio.pause();

  currentCard = card;
  audio.src = src;

  card.classList.add("playing");
  btn.textContent = "⏸";

  audio.play().then(() => {
    fadeIn();
    isSwitching = false;
  }).catch(e => {
    console.log("PLAY BLOCKED:", e.name);
    isSwitching = false;
  });
}

// ================= SEEK =================
function seekCard(e, card) {
  if (card !== currentCard || !audio.duration) return;
  const timeline = card.querySelector(".tod-timeline");
  const rect = timeline.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
}

// ================= TOD CARDS =================
document.querySelectorAll(".tod-card").forEach(card => {
  const btn = card.querySelector(".tod-play");
  const timeline = card.querySelector(".tod-timeline");
  const cardId = card.id;
  const track = tracksData.tod?.[cardId];
  if (!track) return;

  setDuration(card, track.src);

  btn.addEventListener("click", () => playCard(card, track.src, btn));
  timeline.addEventListener("click", e => seekCard(e, card));
});

// ================= TOP ITEMS =================
document.querySelectorAll(".top-item").forEach(item => {
  const btn = item.querySelector(".top-play");
  const itemId = item.id;
  const track = tracksData.top?.[itemId];
  if (!track) return;

  btn.addEventListener("click", () => playCard(item, track.src, btn));
});

// ================= TIME UPDATE =================
audio.addEventListener("timeupdate", () => {
  if (!currentCard) return;

  const progress = currentCard.querySelector(".tod-progress");
  const currentTimeEl = currentCard.querySelector(".tod-current");

  if (progress && audio.duration) {
    progress.style.width = (audio.currentTime / audio.duration) * 100 + "%";
  }

  if (currentTimeEl) {
    currentTimeEl.textContent = formatTime(audio.currentTime);
  }
});

// ================= TRACK ENDED =================
audio.addEventListener("ended", () => {
  if (!currentCard) return;

  const cards = Array.from(document.querySelectorAll(".tod-card"));
  const idx = cards.indexOf(currentCard);

  resetAllCards();

  if (idx + 1 < cards.length) {
    const nextCard = cards[idx + 1];
    const nextTrack = tracksData.tod?.[nextCard.id];
    if (!nextTrack) return;

    const nextBtn = nextCard.querySelector(".tod-play");
    playCard(nextCard, nextTrack.src, nextBtn);
  } else {
    currentCard = null;
    audio.src = "";
  }
});
