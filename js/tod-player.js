import { tracksData } from "./tracks-data.js";

const audio = new Audio();
audio.volume = 1;

let currentCard = null;
let isFading = false;

// ========= Вспомогательные функции =========
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

// ========= Плавное затухание =========
function fadeOut(callback) {
  if (isFading) return;
  isFading = true;

  const fade = setInterval(() => {
    if (audio.volume > 0.05) {
      audio.volume -= 0.05;
    } else {
      clearInterval(fade);
      audio.pause();
      audio.volume = 1;
      isFading = false;
      if (callback) callback();
    }
  }, 40);
}

// ========= Плавное включение =========
function fadeIn() {
  audio.volume = 0;
  audio.play().catch(() => {});
  const fade = setInterval(() => {
    if (audio.volume < 0.95) {
      audio.volume += 0.05;
    } else {
      clearInterval(fade);
      audio.volume = 1;
    }
  }, 40);
}

// ========= Подгрузка длительности трека =========
function setDuration(card, src) {
  const durationEl = card.querySelector(".tod-duration, .top-item .tod-duration");
  const tempAudio = new Audio(src);
  tempAudio.addEventListener("loadedmetadata", () => {
    if (durationEl) durationEl.textContent = formatTime(tempAudio.duration);
  });
}

// ========= TOD CARDS =========
const todCards = Array.from(document.querySelectorAll(".tod-card"));
todCards.forEach(card => {
  const btn = card.querySelector(".tod-play");
  const progress = card.querySelector(".tod-progress");
  const timeline = card.querySelector(".tod-timeline");
  const currentTimeEl = card.querySelector(".tod-current");
  const cardId = card.id;
  const track = tracksData.tod ? tracksData.tod[cardId] : null;

  if (!track) return;
  setDuration(card, track.src);

  btn.addEventListener("click", () => playCard(card, track.src, btn));
  timeline.addEventListener("click", e => seekCard(e, card));
});

// ========= TOP ITEMS =========
const topItems = Array.from(document.querySelectorAll(".top-item"));
topItems.forEach(item => {
  const btn = item.querySelector(".top-play");
  const progress = item.querySelector(".tod-progress");
  const timeline = item.querySelector(".tod-timeline");
  const currentTimeEl = item.querySelector(".tod-current");
  const itemId = item.id;
  const track = tracksData.top ? tracksData.top[itemId] : null;

  if (!track) return;
  setDuration(item, track.src);

  btn.addEventListener("click", () => playCard(item, track.src, btn));
  timeline?.addEventListener("click", e => seekCard(e, item));
});

// ========= PLAY / PAUSE =========
function playCard(card, src, btn) {
  // Если нажали на текущую карточку
  if (currentCard === card) {
    if (audio.paused) {
      audio.play();
      card.classList.add("playing");
      btn.textContent = "⏸";
    } else {
      audio.pause();
      card.classList.remove("playing");
      btn.textContent = "▶";
    }
    return;
  }

  // Играет другой трек
  fadeOut(() => {
    resetAllCards();
    currentCard = card;
    audio.src = src;
    card.classList.add("playing");
    btn.textContent = "⏸";
    fadeIn();
  });
}

// ========= SEEK =========
function seekCard(e, card) {
  if (card !== currentCard || !audio.duration) return;
  const timeline = card.querySelector(".tod-timeline");
  const rect = timeline.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  audio.currentTime = percent * audio.duration;
}

// ========= TIMEUPDATE =========
audio.addEventListener("timeupdate", () => {
  if (!currentCard) return;
  const progress = currentCard.querySelector(".tod-progress");
  const currentTimeEl = currentCard.querySelector(".tod-current");
  if (!progress || !currentTimeEl) return;
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = percent + "%";
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

// ========= TRACK ENDED =========
audio.addEventListener("ended", () => {
  if (!currentCard) return;
  currentCard.classList.remove("playing");
  const btn = currentCard.querySelector(".tod-play, .top-play");
  if (btn) btn.textContent = "▶";

  // Переход на следующую карточку (только TOD)
  const cards = Array.from(document.querySelectorAll(".tod-card"));
  const idx = cards.indexOf(currentCard);
  if (idx + 1 < cards.length) {
    const nextCard = cards[idx + 1];
    const nextTrack = tracksData.tod[nextCard.id];
    if (!nextTrack) return;

    fadeOut(() => {
      resetAllCards();
      currentCard = nextCard;
      audio.src = nextTrack.src;
      const nextBtn = nextCard.querySelector(".tod-play");
      nextCard.classList.add("playing");
      if (nextBtn) nextBtn.textContent = "⏸";
      fadeIn();
    });
  } else {
    currentCard = null;
    audio.pause();
    audio.src = "";
  }
});
