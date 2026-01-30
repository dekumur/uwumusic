import { tracksData } from "./tracks-data.js";
import { initPlayer } from "./player.js";

const modal = document.getElementById("artistModal");
if (!modal) throw new Error("Модалка отсутствует на странице");

const modalTitle = modal.querySelector(".modal-title");
const modalTracks = modal.querySelector(".modal-tracks");
const modalClose = modal.querySelector(".modal-close");
const playBtn = modal.querySelector(".play-btn");
const timeline = modal.querySelector(".timeline");
const progressBar = timeline.querySelector(".progress");
const currentTimeEl = modal.querySelector(".time.current");
const durationEl = modal.querySelector(".time.duration");

const modalAudio = initPlayer();
let currentTracks = [];
let currentIndex = 0;

// Формат времени
function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Обновление активного трека в списке
function updateActiveTrack() {
  modalTracks.querySelectorAll("li").forEach((li, i) => {
    li.classList.toggle("active", i === currentIndex);
  });
}

// Воспроизведение трека по индексу
function playTrack(index) {
  if (!currentTracks.length) return;
  currentIndex = index;
  modalAudio.src = currentTracks[currentIndex].src;

  // Ждём, пока загружена длительность трека
  modalAudio.addEventListener("loadedmetadata", function setDuration() {
    durationEl.textContent = formatTime(modalAudio.duration);
    modalAudio.removeEventListener("loadedmetadata", setDuration);
  });

  modalAudio.play().then(() => (playBtn.textContent = "⏸")).catch(() => {});
  updateActiveTrack();
}

// Открытие модалки для любого типа: vibes, genres, purposes или random
function openModalWithTracks(title, tracks) {
  if (!tracks.length) return;

  currentTracks = tracks;
  currentIndex = 0;

  modalTitle.textContent = title;
  modalTracks.innerHTML = "";

  tracks.forEach((track, index) => {
    const li = document.createElement("li");
    li.textContent = track.title;
    li.addEventListener("click", () => playTrack(index));
    modalTracks.appendChild(li);
  });

  // Первая песня
  modalAudio.src = tracks[0].src;
  modalAudio.pause();
  playBtn.textContent = "▶";

  // Загружаем длительность первой песни
  modalAudio.addEventListener("loadedmetadata", function setDuration() {
    durationEl.textContent = formatTime(modalAudio.duration);
    currentTimeEl.textContent = "0:00";
    modalAudio.removeEventListener("loadedmetadata", setDuration);
  });

  modal.classList.add("active");
  document.body.classList.add("modal-open");
}

// Закрытие модалки
function closeModal() {
  modal.classList.remove("active");
  modalAudio.pause();
  playBtn.textContent = "▶";
  document.body.classList.remove("modal-open");
}

// Play/Pause кнопка
playBtn.addEventListener("click", () => {
  if (modalAudio.paused) modalAudio.play().then(() => (playBtn.textContent = "⏸")).catch(() => {});
  else modalAudio.pause(), (playBtn.textContent = "▶");
});

// Обновление таймлайна и времени
modalAudio.addEventListener("timeupdate", () => {
  if (!modalAudio.duration) return;
  const percent = (modalAudio.currentTime / modalAudio.duration) * 100;
  progressBar.style.width = percent + "%";
  currentTimeEl.textContent = formatTime(modalAudio.currentTime);
});

timeline.addEventListener("click", e => {
  if (!modalAudio.duration) return;
  const rect = timeline.getBoundingClientRect();
  const percent = (e.clientX - rect.left) / rect.width;
  modalAudio.currentTime = percent * modalAudio.duration;
});

// Автоплей следующего трека
modalAudio.addEventListener("ended", () => {
  if (!currentTracks.length) return;
  currentIndex++;
  if (currentIndex >= currentTracks.length) {
    modalAudio.pause();
    playBtn.textContent = "▶";
    return;
  }
  playTrack(currentIndex);
});

// Навешиваем открытие модалки на карточки
document.querySelectorAll(".vibe-card").forEach(card => {
  card.addEventListener("click", () => {
    const vibe = card.dataset.vibe;
    if (!vibe) return;
    // Только название вайба с заглавной буквы
    openModalWithTracks(vibe[0].toUpperCase() + vibe.slice(1), tracksData.vibes[vibe] || []);
  });
});

document.querySelectorAll(".genre-card").forEach(card => {
  card.addEventListener("click", () => {
    const genre = card.dataset.genres;
    if (!genre) return;
    // Только название жанра с заглавной буквы
    openModalWithTracks(genre[0].toUpperCase() + genre.slice(1), tracksData.genres[genre] || []);
  });
});

document.querySelectorAll(".purpose-card").forEach(card => {
  card.addEventListener("click", () => {
    const purpose = card.dataset.purpose;
    const keys = tracksData.purposes?.[purpose];
    if (!keys) return;

    let mixedTracks = [];
    keys.forEach(key => {
      if (tracksData.vibes?.[key]) mixedTracks.push(...tracksData.vibes[key]);
      if (tracksData.genres?.[key]) mixedTracks.push(...tracksData.genres[key]);
    });

    openModalWithTracks(`Музыка для ${card.innerText.toLowerCase()}`, mixedTracks);
  });
});

// Открытие модалки для редакционных подборок
document.querySelectorAll(".editor-card").forEach(card => {
  card.addEventListener("click", () => {
    const key = card.dataset.tracks;
    if (!key) return;

    // Берём треки из tracksData (нужно добавить свои коллекции)
    const tracks = tracksData.editors?.[key] || [];
    if (!tracks.length) return;

    // Название берём из подписи карточки
    const title = card.querySelector("strong").innerText;
    openModalWithTracks(title, tracks);
  });
});


// Random треки
const randomBtn = document.getElementById("randomMusicBtn");
const starPreloader = document.getElementById("starPreloader");
const getRandomTracks = (tracks, count = 3) => {
  if (!Array.isArray(tracks) || !tracks.length) return [];
  return [...tracks].sort(() => 0.5 - Math.random()).slice(0, count);
};

function openRandomTracks() {
  const allCollections = [...Object.values(tracksData.vibes), ...Object.values(tracksData.genres)].flat();
  const tracks = getRandomTracks(allCollections, 3);
  openModalWithTracks("Мы выбрали это для тебя", tracks);
}

if (randomBtn) {
  randomBtn.addEventListener("click", () => {
    randomBtn.classList.add("rolling");
    starPreloader.classList.add("active");

    setTimeout(() => {
      starPreloader.classList.remove("active");
      randomBtn.classList.remove("rolling");
      openRandomTracks();
    }, 700);
  });
}

// Закрытие модалки
modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", e => e.target === modal && closeModal());
document.addEventListener("keydown", e => e.key === "Escape" && closeModal());
