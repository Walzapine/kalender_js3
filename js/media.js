import { currentMonth, monthVideos } from "./config.js";

function convertPexelsUrl(url) {
  if (!url) return "";
 //Wandelt die PexelsURL in eine MP4-Video URL um
  if (url.includes("videos.pexels.com/video-files/")) { //Wenn schon video Datei dann direkt zurück geben
    return url;
  }
  //Eventuell abschließende Zeichen entfernen
  const cleanUrl = url.replace(/\/+$/, "");
  const match = cleanUrl.match(/-(\d+)$/) || cleanUrl.match(/\/(\d+)$/);

  if (!match) {
    return url;
  }

  const id = match[1];

  return `https://videos.pexels.com/video-files/${id}/${id}-hd_1920_1080_30fps.mp4`;
}

export function updateMonthVideo() {
  const video = document.getElementById("month-video");

  if (!video) {
    return;
  }

  const rawSrc = monthVideos[currentMonth];
  const newSrc = convertPexelsUrl(rawSrc);
  const currentSrc = video.querySelector("source")?.getAttribute("src");

  if (currentSrc === newSrc) {
    return;
  }

  video.innerHTML = `<source src="${newSrc}" type="video/mp4">`;
  video.load();

  video.play().catch(error => {
    console.error("Video konnte nicht automatisch gestartet werden:", error);
  });
}