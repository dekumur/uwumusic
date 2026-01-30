export function initPlayer() {
    const audio = document.getElementById("audioPlayer");
    audio.preload = "metadata";
    return audio;
}
