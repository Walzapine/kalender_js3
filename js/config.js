export const today = new Date();

export const todayDay = today.getDate();
export const todayMonth = today.getMonth();
export const todayYear = today.getFullYear();

export let currentMonth = todayMonth;
export let currentYear = todayYear;
export let selectedDate = new Date(todayYear, todayMonth, todayDay);

//Cache für historische Ereignisse Map für Schlüssel/Werte
export const historyCache = new Map();

//Cache für Feiertage
export const holidayCache = new Map();

//alte API-Anfragen abbrechen, damit nur neuste zählt
export let currentHistoryRequest = null;

export const weekdayNames = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag"
];

export const monthNames = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember"
];

export const nthWords = ["erste", "zweite", "dritte", "vierte", "fünfte"];

//Setter-Funktionen um Werte zu ändern
export function setCurrentMonth(value) {
  currentMonth = value;
}

export function setCurrentYear(value) {
  currentYear = value;
}

export function setSelectedDate(value) {
  selectedDate = value;
}

export function setCurrentHistoryRequest(value) {
  currentHistoryRequest = value;
}

//Background videos
export const monthVideos = [
  "https://www.pexels.com/de-de/video/schnee-wetter-winter-hund-11564374/",
  "https://www.pexels.com/de-de/video/schnee-bedeckt-die-niedrig-liegenden-flachen-oberflachen-auf-dem-boden-3350365/",
  "https://www.pexels.com/de-de/video/nahaufnahmevideo-des-schmetterlings-thront-auf-blume-1172092/",
  "https://www.pexels.com/de-de/video/tier-niedlich-gras-nusse-14187795/",
  "https://www.pexels.com/de-de/video/bienenbestaubung-854242/",
  "https://www.pexels.com/de-de/video/natur-sonnig-sommer-sonne-4237998/",
  "https://www.pexels.com/de-de/video/fashion-ferien-bikini-frau-5102759/",
  "https://www.pexels.com/de-de/video/hande-madchen-draussen-niedlich-6183097/",
  "https://www.pexels.com/de-de/video/herbstsaison-1580455/",
  "https://www.pexels.com/de-de/video/natur-wald-baume-herbst-6293976/",
  "https://www.pexels.com/de-de/video/strasse-natur-wasser-baume-3806213/",
  "https://www.pexels.com/de-de/video/starker-schneefall-der-den-boden-bedeckt-3147024/",
];