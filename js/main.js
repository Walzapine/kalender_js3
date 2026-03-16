import {
  currentMonth,
  currentYear,
  selectedDate,
  setCurrentMonth,
  setCurrentYear,
  setSelectedDate
} from "./config.js";

import {
  loadHistoricalEvents,
  preloadMonthEvents
} from "./api.js";

import { renderCalendar } from "./calendar.js";
import { updateMonthVideo } from "./media.js";
//Einen Monat weiter
async function nextMonth() {
  let newMonth = currentMonth + 1;
  let newYear = currentYear;
  //Wenn Dezember überschritten, dannmit nächstem Jahr starten
  if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }
  //Neue Werte setzen
  setCurrentMonth(newMonth);
  setCurrentYear(newYear);
  setSelectedDate(new Date(newYear, newMonth, 1));
  //Kalender neu aufbauen
  await renderCalendar();
  updateMonthVideo();
  loadHistoricalEvents(selectedDate);
  preloadMonthEvents(newYear, newMonth);
}
//einen Monat zurück
async function prevMonth() {
  let newMonth = currentMonth - 1;
  let newYear = currentYear;
 //Wenn vor Januar dann Dezember vom Vorjahr
  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  }

  setCurrentMonth(newMonth);
  setCurrentYear(newYear);
  setSelectedDate(new Date(newYear, newMonth, 1));
  //Kalender neu zeichnen
  await renderCalendar();
  updateMonthVideo();
  loadHistoricalEvents(selectedDate);
  preloadMonthEvents(newYear, newMonth);
}
//Warten bis HTML vollständig geladen ist
document.addEventListener("DOMContentLoaded", async function () {
  const nextButton = document.getElementById("next-month");         //Buttons holen
  const prevButton = document.getElementById("prev-month");
  const nextYearButton = document.getElementById("next-year");
  const prevYearButton = document.getElementById("prev-year");

  if (nextButton) {
    nextButton.addEventListener("click", nextMonth);
  }

  if (prevButton) {
    prevButton.addEventListener("click", prevMonth);
  }

  if (nextYearButton) {
    nextYearButton.addEventListener("click", nextYear);          //Buttons für nächstes Jahr
  }

  if (prevYearButton) {
    prevYearButton.addEventListener("click", prevYear);
  }



  await renderCalendar();
  updateMonthVideo();
  loadHistoricalEvents(selectedDate);
  preloadMonthEvents(currentYear, currentMonth);
});

//neue Buttons für ein jahr weiter
async function nextYear() {
  const newYear = currentYear +1;
  const newMonth = currentMonth;

  //Gleiches Datum im nächsten Jahr
  const newDate = new Date(newYear, newMonth, 1);

  setCurrentYear(newYear);
  setSelectedDate(newDate);

  await renderCalendar();
  updateMonthVideo();
  loadHistoricalEvents(newDate);
  preloadMonthEvents(newYear, newMonth);
}

//ein Jahr zurück
async function prevYear() {
  const newYear = currentYear -1;
  const newMonth = currentMonth;

  //gleiches Datum im vorherigen Jahr
  const newDate = new Date(newYear, newMonth, 1);

  setCurrentYear(newYear);
  setSelectedDate(newDate);

  await renderCalendar();
  updateMonthVideo();
  loadHistoricalEvents(newYear, newMonth);
}