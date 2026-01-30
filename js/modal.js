import { artists } from "./artists-data.js";
import { initPlayer } from "./player.js";

const modal = document.getElementById("artistModal");

if (!modal) {
    window.openGenreModal = () => console.log("Модалка отсутствует на этой странице");
} else {
    const modalTitle = modal.querySelector(".modal-title");
    const modalTracks = modal.querySelector(".modal-tracks");
    const modalClose = modal.querySelector(".modal-close");
    const playBtn = modal.querySelector(".play-btn");
    const timeline = modal.querySelector(".timeline");
    const progress = modal.querySelector(".progress");
    const currentTimeEl = modal.querySelector(".time.current");
    const durationEl = modal.querySelector(".time.duration");

    const audio = initPlayer();
    let currentArtist = null;
    let currentList = [];
    let currentIndex = 0;

    // Формат времени
    function formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? "0" : ""}${s}`;
    }

    // Обновление активного трека
    function updateActiveTrack() {
        modalTracks.querySelectorAll("li").forEach((li, i) => {
            li.classList.toggle("active", i === currentIndex);
        });
    }

    // Воспроизведение трека
    function playTrack(index) {
        if (!currentList.length) return;
        currentIndex = index;
        audio.src = currentList[currentIndex].src;
        audio.play().then(() => {
            if (playBtn) playBtn.textContent = "⏸";
        }).catch(err => console.log("Ошибка воспроизведения:", err));
        updateActiveTrack();
    }

    // Кнопка play/pause
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            if (audio.paused) {
                audio.play().catch(err => console.log("Ошибка воспроизведения:", err));
                playBtn.textContent = "⏸";
            } else {
                audio.pause();
                playBtn.textContent = "▶";
            }
        });
    }

    // Открытие модалки
    function openModal(artistName) {
        currentArtist = artistName;
        modalTitle.textContent = artistName;
        modalTracks.innerHTML = "";
        currentList = artists[artistName] || [];
        currentIndex = 0;

        if (currentList.length > 0) {
            audio.src = currentList[0].src;
            audio.pause();
            if (playBtn) playBtn.textContent = "▶";

            currentList.forEach((track, index) => {
                const li = document.createElement("li");
                li.textContent = track.title;
                li.addEventListener("click", () => playTrack(index));
                modalTracks.appendChild(li);
            });

            updateActiveTrack();
        }

        modal.classList.add("active");
        document.body.classList.add("modal-open");
    }

    // Закрытие модалки
    function closeModal() {
        modal.classList.remove("active");
        audio.pause();
        if (playBtn) playBtn.textContent = "▶";
        document.body.classList.remove("modal-open");
    }

    // Автоплей следующего трека
    audio.addEventListener("ended", () => {
        if (currentList.length === 0) return;
        currentIndex++;
        if (currentIndex >= currentList.length) {
            currentIndex = 0;
            audio.pause();
            if (playBtn) playBtn.textContent = "▶";
            updateActiveTrack();
            return;
        }
        playTrack(currentIndex);
    });

    // Таймлайн и время
    audio.addEventListener("loadedmetadata", () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
        if (!audio.duration) return;
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = progressPercent + "%";
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    timeline.addEventListener("click", (e) => {
        const rect = timeline.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        audio.currentTime = (clickX / width) * audio.duration;
    });

    // Навешиваем клик на артистов
    document.querySelectorAll(".artist").forEach(artist => {
        artist.addEventListener("click", () => {
            const name = artist.querySelector(".artist-name")?.textContent.trim();
            if (name) openModal(name);
        });
    });

    // Закрытие модалки
    modalClose.addEventListener("click", closeModal);
    modal.addEventListener("click", e => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener("keydown", e => {
        if (e.key === "Escape" && modal.classList.contains("active")) {
            closeModal();
        }
    });

    // Для открытия жанров
    window.openGenreModal = (genre) => {
        openModal(genre.title);
        modalTracks.innerHTML = "";
        currentList = genre.tracks || [];
        currentIndex = 0;

        currentList.forEach((track, index) => {
            const li = document.createElement("li");
            li.textContent = track.title;
            li.addEventListener("click", () => playTrack(index));
            modalTracks.appendChild(li);
        });

        updateActiveTrack();
    };
}
