import {
  todayDay,
  todayMonth,
  todayYear,
  currentMonth,
  currentYear,
  selectedDate,
  weekdayNames,
  monthNames,
  nthWords,
  setCurrentMonth,
  setCurrentYear,
  setSelectedDate
} from "./config.js";

import {
  loadHistoricalEvents,
  loadHolidaysForYear,
  getHolidayNameFromCache
} from "./api.js";

import { updateMonthVideo } from "./media.js";

//Hilfsfunktion für Feiertagstext
function getFeiertagText(date) {
  const holidayName = getHolidayNameFromCache(date);
  return holidayName ? `ein Feiertag: ${holidayName}` : "kein gesetzlicher Feiertag";
}

export function updateHeader() {
  const currentDate = new Date(currentYear, currentMonth, 1);

  let displayDay;

  if (currentMonth === todayMonth && currentYear === todayYear) {
    displayDay = todayDay;
  } else if (
    selectedDate.getMonth() === currentMonth &&
    selectedDate.getFullYear() === currentYear
  ) {
    displayDay = selectedDate.getDate();
  } else {
    displayDay = 1;
  }

  //Tag setzten
  currentDate.setDate(displayDay);

  const day = currentDate.getDate();
  const monthIndex = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const weekdayIndex = currentDate.getDay();

  const weekdayName = weekdayNames[weekdayIndex];
  const monthName = monthNames[monthIndex];
  //Ermitteln der wievielte Wochentag im Monat ist
  const nth = Math.floor((day - 1) / 7) + 1;
  const nthWord = nthWords[nth - 1];
  const feiertagText = getFeiertagText(currentDate);

  const infoText =
    `Der ${day}. ${monthName} ${year} ist ein ${weekdayName} ` +
    `und zwar der ${nthWord} ${weekdayName} im Monat ${monthName} ` +
    `des Jahres ${year}. Heute ist ${feiertagText}.`;

  const infoElement = document.getElementById("info-text");
  const pageTitleElement = document.getElementById("page-title");
  const monthHeadingElement = document.getElementById("month-heading");

  //Text setzten falls Element vorhanden ist
  if (infoElement) {
    infoElement.textContent = infoText;
  }

  if (pageTitleElement) {
    pageTitleElement.textContent = `Kalenderblatt vom ${day}. ${monthName} ${year}`;
  }

  //Auch Browsertab Titel anpassen
  document.title = `Kalenderblatt vom ${day}. ${monthName} ${year}`;

  if (monthHeadingElement) {
    monthHeadingElement.textContent = `${monthName} ${year}`;
  }
}
//Nur die Makierung des ausgewählten Tages setzen ohne Kalender neu aufzubauen
export function updateSelectedDayOnly() {
  const allCells = document.querySelectorAll("#calendar-body td");

  allCells.forEach(cell => {
    cell.classList.remove("selected-day");

    const cellYear = Number(cell.dataset.year);
    const cellMonth = Number(cell.dataset.month);
    const cellDay = Number(cell.dataset.day);

    //Wenn Zelle dem ausgewählten Datum entspricht dann makieren
    if (
      cellDay === selectedDate.getDate() &&
      cellMonth === selectedDate.getMonth() &&
      cellYear === selectedDate.getFullYear()
    ) {
      cell.classList.add("selected-day");
    }
  });

  updateHeader();
}
//Kalender komplett neu rendern
export async function renderCalendar() {
  await loadHolidaysForYear(currentYear);

  const calendarBody = document.getElementById("calendar-body");

  if (!calendarBody) {
    return;
  }

  //vorherigen Kalender löschen
  calendarBody.innerHTML = "";
  //1.Tag des Monats bestimmen
  const firstOfMonth = new Date(currentYear, currentMonth, 1);
  let firstWeekday = firstOfMonth.getDay(); 

  firstWeekday = (firstWeekday + 6) % 7;             //Ergebnis: Montag=0, Dienstag=1

  const calendarStart = new Date(currentYear, currentMonth, 1 - firstWeekday);
  const totalDays = 42;

  let currentDate = new Date(calendarStart);
  let row;

  for (let i = 0; i < totalDays; i++) {
    if (i % 7 === 0) {                      //alle 7 Zellen eine neue Tabellenzeile erzeugen
      row = document.createElement("tr");
      calendarBody.appendChild(row);
    }

    const cell = document.createElement("td");
    const cellDate = new Date(currentDate);

    cell.textContent = cellDate.getDate();
    cell.dataset.year = cellDate.getFullYear();        //Datum in Data Attributen speichern
    cell.dataset.month = cellDate.getMonth();
    cell.dataset.day = cellDate.getDate();

    if (cellDate.getMonth() !== currentMonth) {
      cell.classList.add("other-month");
    }

    if (
      cellDate.getDate() === todayDay &&           //heutigen Tag markieren
      cellDate.getMonth() === todayMonth &&
      cellDate.getFullYear() === todayYear
    ) {
      cell.classList.add("today");
    }

    if (
      cellDate.getDate() === selectedDate.getDate() &&            //Ausgewählten Tag markieren
      cellDate.getMonth() === selectedDate.getMonth() &&
      cellDate.getFullYear() === selectedDate.getFullYear()
    ) {
      cell.classList.add("selected-day");
    }
    //Wochentag bestimmen
    const jsWeekday = cellDate.getDay();
    //Samstage blau, Sonntage rot
    if (jsWeekday === 6) {
      cell.classList.add("blue");
    } else if (jsWeekday === 0) {
      cell.classList.add("red");
    }
    //Feiertag prüfen
    const holidayName = getHolidayNameFromCache(cellDate);
    if (holidayName) {
      cell.classList.add("holiday");
      cell.title = holidayName;
    }
    //Klick auf einen Tag
    cell.addEventListener("click", async function () {
      const newSelectedDate = new Date(cellDate);
      setSelectedDate(newSelectedDate);

      const clickedMonth = newSelectedDate.getMonth();
      const clickedYear = newSelectedDate.getFullYear();
      //Prüfen ob man in einen anderen Monat geklickt hat
      const monthChanged =
        clickedMonth !== currentMonth || clickedYear !== currentYear;

      setCurrentMonth(clickedMonth);
      setCurrentYear(clickedYear);
      //Wenn Monatswechsel, dann Kalender komplett neu aufbauen
      if (monthChanged) {
        await renderCalendar();
        updateMonthVideo();
      } else {
        updateSelectedDayOnly();
      }
      
      loadHistoricalEvents(newSelectedDate);
    });

    row.appendChild(cell);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  updateHeader();
}