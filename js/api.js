import {
  monthNames,
  historyCache,
  holidayCache,
  currentHistoryRequest,
  setCurrentHistoryRequest
} from "./config.js";

//Zahl zweistellig machen 3-03
export function pad2(number) {
  return String(number).padStart(2, "0");
}

//Datum in einen Schlüssel umwandeln
export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

//Feiertage für ein ganzes Jahr laden
export async function loadHolidaysForYear(year) {
  if (holidayCache.has(year)) {                          //prüfen ob dieses Jahr schon vorhanden ist
    return holidayCache.get(year);
  }

  //URL für die Feiertags-API
  const url =
    `https://openholidaysapi.org/PublicHolidays` +
    `?countryIsoCode=DE` +
    `&languageIsoCode=DE` +
    `&validFrom=${year}-01-01` +
    `&validTo=${year}-12-31`;
 
    //Anfrage an die API
  const response = await fetch(url, {
    headers: {
      accept: "text/json"
    }
  });

  // Fehler prüfen
  if (!response.ok) {
    throw new Error(`Feiertage konnten nicht geladen werden: ${response.status}`);
  }

  //Antwort in JSON umwandeln
  const data = await response.json();
  const holidaysByDate = {};
 
  //Alle feiertage durchlaufen
  data.forEach(holiday => {
    const dateKey = holiday.startDate;
    const holidayName = holiday.name?.[0]?.text || "Feiertag";
    holidaysByDate[dateKey] = holidayName;
  });

  holidayCache.set(year, holidaysByDate);
  return holidaysByDate;
}

//Feiertagsname aus dem Cache holen
export function getHolidayNameFromCache(date) {
  const year = date.getFullYear();
  const holidaysForYear = holidayCache.get(year);

  //Wenn das Jahr noch nicht geladen wurde
  if (!holidaysForYear) {
    return null;
  }

  //DAtum in passendes Format
  const key = formatDateKey(date);
  return holidaysForYear[key] || null;
}

//Liste historischer Ereignisse in HTML 
export function renderHistoryList(events) {
  const historyList = document.getElementById("history-list");

  if (!historyList) {
    return;
  }

  historyList.innerHTML = "";

  //Falls keine Ergebnisse vorhanden sind
  if (events.length === 0) {
    historyList.innerHTML = "<li>Keine Ereignisse gefunden.</li>";
    return;
  }

  //Für jedes Ereigniss einen Listeneintrag erzeugen
  events.forEach(event => {
    const li = document.createElement("li");

    const text = document.createElement("span");
    text.textContent = `${event.year}: ${event.text}`;
    li.appendChild(text);

    //Falls wikipedia-Seiten vorhanden sind den erste link anhängen
    if (event.pages && event.pages.length > 0) {
      const firstPage = event.pages[0];

      if (firstPage.content_urls && firstPage.content_urls.desktop) {
        const link = document.createElement("a");
        link.href = firstPage.content_urls.desktop.page;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = " Wikipedia";
        li.appendChild(link);
      }
    }

    //Listeneintrag einfügen
    historyList.appendChild(li);
  });
}

//Historische Ereignisse laden
export async function loadHistoricalEvents(date) {
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const cacheKey = `${month}-${day}`;                //Cache Schlüssel nur nach Monat und Tag

  //DOM Elemente holen
  const historyTitle = document.getElementById("history-title");
  const historyList = document.getElementById("history-list");

  if (!historyTitle || !historyList) {
    return;
  }

  //Überschrift
  historyTitle.textContent = `Historische Ereignisse am ${date.getDate()}. ${monthNames[date.getMonth()]}`;

  //Wenn schon im Cash, sofort anzeigen
  if (historyCache.has(cacheKey)) {
    renderHistoryList(historyCache.get(cacheKey));
    return;
  }

  historyList.innerHTML = "<li>Lade Ereignisse …</li>";      //Ladehinweis

  if (currentHistoryRequest) {
    currentHistoryRequest.abort();
  }

  //neuer AbortController
  const controller = new AbortController();
  setCurrentHistoryRequest(controller);

  try {
    const url = `https://api.wikimedia.org/feed/v1/wikipedia/de/onthisday/events/${month}/${day}`;

    //API Anfrage
    const response = await fetch(url, {
      headers: {
        "Api-User-Agent": "Kalenderblatt-Demo/1.0"
      },
      signal: controller.signal
    });

    //Fehlerstatus prüfen
    if (!response.ok) {
      throw new Error(`HTTP-Fehler: ${response.status}`);
    }

    const data = await response.json();
    const events = (data.events || []).slice(0, 4);        //nur 4 Ergebnisse

    //Im Cach speichern
    historyCache.set(cacheKey, events);
    renderHistoryList(events);
  } catch (error) {
    if (error.name === "AbortError") {                   //Wenn die Anfrage abgebrochen wurde, still beenden
      return;
    }

    historyList.innerHTML =
      "<li>Die Ereignisse konnten gerade nicht geladen werden.</li>";      //sonst Fehlermeldung
    console.error(error);
  }
}

//Erste Tage eines Monats vorladen
export async function preloadMonthEvents(year, month) {
  for (let day = 1; day <= 7; day++) {
    const date = new Date(year, month, day);
    const monthStr = pad2(date.getMonth() + 1);
    const dayStr = pad2(date.getDate());
    const cacheKey = `${monthStr}-${dayStr}`;

    if (historyCache.has(cacheKey)) {
      continue;
    }

    try {
      const url =
        `https://api.wikimedia.org/feed/v1/wikipedia/de/onthisday/events/${monthStr}/${dayStr}`;

      const response = await fetch(url, {
        headers: {
          "Api-User-Agent": "Kalenderblatt-Demo/1.0"
        }
      });

      //Wenn Fehler diesen Tag überspringen
      if (!response.ok) {
        continue;
      }

      const data = await response.json();
      const events = (data.events || []).slice(0, 4);
      historyCache.set(cacheKey, events);
    } catch (error) {
      console.error(error);
    }
  }
}