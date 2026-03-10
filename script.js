const revealElements = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
    const exceptionalSchedule = {
  "2026-03-15": { closed: true, label: "2026.03.15. vasárnap: ZÁRVA" },
  "2026-04-03": { closed: true, label: "2026.04.03. péntek: ZÁRVA"  },
  "2026-04-06": { closed: true, label: "2026.04.06. hétfő: ZÁRVA" }
};

function formatTimeLeft(ms) {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} óra ${minutes} perc`;
  }

  return `${minutes} perc`;
}

function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRegularSchedule(day) {
  if (day >= 1 && day <= 5) {
    return [
      { start: "07:00", end: "11:00" },
      { start: "14:00", end: "16:30" }
    ];
  }

  if (day === 6) {
    return [
      { start: "07:00", end: "11:00" }
    ];
  }

  if (day === 0) {
    return [
      { start: "07:00", end: "09:30" }
    ];
  }

  return [];
}

function getScheduleForDate(date) {
  const dateKey = formatDateKey(date);
  const exceptionalDay = exceptionalSchedule[dateKey];

  if (exceptionalDay) {
    if (exceptionalDay.closed) {
      return {
        isExceptional: true,
        closed: true,
        periods: [],
        label: exceptionalDay.label
      };
    }

    return {
      isExceptional: true,
      closed: false,
      periods: exceptionalDay.periods || [],
      label: exceptionalDay.label
    };
  }

  return {
    isExceptional: false,
    closed: false,
    periods: getRegularSchedule(date.getDay()),
    label: null
  };
}

function timeToDate(baseDate, timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function findNextOpening(now) {
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);

    const scheduleData = getScheduleForDate(checkDate);

    if (scheduleData.closed) {
      continue;
    }

    for (const period of scheduleData.periods) {
      const startDate = timeToDate(checkDate, period.start);

      if (startDate > now) {
        return startDate;
      }
    }
  }

  return null;
}

function updateStoreStatus() {
  const statusElement = document.getElementById("storeStatus");
  if (!statusElement) return;

  const now = new Date();
  const todayData = getScheduleForDate(now);

  if (todayData.isExceptional && todayData.closed) {
    statusElement.innerHTML = `
      Jelenleg: <strong><span class="status-word status-closed">ZÁRVA</span></strong> vagyunk<br>
      <span>Ma rendkívüli nyitvatartás van: zárva tartunk.</span>
    `;
    return;
  }

  let isOpen = false;
  let closingTime = null;
  let nextOpening = null;

  for (const period of todayData.periods) {
    const startDate = timeToDate(now, period.start);
    const endDate = timeToDate(now, period.end);

    if (now >= startDate && now < endDate) {
      isOpen = true;
      closingTime = endDate;
      break;
    }

    if (now < startDate && !nextOpening) {
      nextOpening = startDate;
    }
  }

  if (isOpen && closingTime) {
    const remaining = closingTime - now;
    const isClosingSoon = remaining <= 60 * 60 * 1000;

    if (isClosingSoon) {
      statusElement.innerHTML = `
        Jelenleg: <strong><span class="status-word status-warning">HAMAROSAN ZÁRUNK</span></strong><br>
        Ennyi idő múlva zárunk: ${formatTimeLeft(remaining)}
      `;
    } else {
      statusElement.innerHTML = `
        Jelenleg: <strong><span class="status-word status-open">NYITVA</span></strong> vagyunk<br>
        Ennyi idő múlva zárunk: ${formatTimeLeft(remaining)}
      `;
    }
    return;
  }

  if (!nextOpening) {
    nextOpening = findNextOpening(now);
  }

  if (nextOpening) {
    const remainingToOpen = nextOpening - now;
    const isOpeningSoon = remainingToOpen <= 60 * 60 * 1000;

    if (isOpeningSoon) {
      statusElement.innerHTML = `
        Jelenleg: <strong><span class="status-word status-warning">HAMAROSAN NYITUNK</span></strong><br>
        Nyitásig: ${formatTimeLeft(remainingToOpen)}
      `;
    } else {
      statusElement.innerHTML = `
        Jelenleg: <strong><span class="status-word status-closed">ZÁRVA</span></strong> vagyunk<br>
        Nyitásig: ${formatTimeLeft(remainingToOpen)}
      `;
    }
  } else {
    statusElement.innerHTML = `
      Jelenleg: <strong><span class="status-word status-closed">ZÁRVA</span></strong> vagyunk
    `;
  }
}

updateStoreStatus();
setInterval(updateStoreStatus, 30000);
  },
  {
    threshold: 0.15,
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});
function formatTimeLeft(ms) {
  const totalMinutes = Math.floor(ms / 1000 / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} óra ${minutes} perc`;
  }

  return `${minutes} perc`;
}

function getTodaySchedule(day) {
  // 0 = vasárnap, 1 = hétfő ... 6 = szombat
  if (day >= 1 && day <= 5) {
    return [
      { start: "07:00", end: "11:00" },
      { start: "14:00", end: "16:30" }
    ];
  }

  if (day === 6) {
    return [
      { start: "07:00", end: "11:00" }
    ];
  }

  if (day === 0) {
    return [
      { start: "07:00", end: "09:30" }
    ];
  }

  return [];
}

function timeToDate(baseDate, timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function findNextOpening(now) {
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() + i);

    const day = checkDate.getDay();
    const schedule = getTodaySchedule(day);

    for (const period of schedule) {
      const startDate = timeToDate(checkDate, period.start);

      if (startDate > now) {
        return startDate;
      }
    }
  }

  return null;
}

function updateStoreStatus() {
  const statusElement = document.getElementById("storeStatus");
  if (!statusElement) return;

  const now = new Date();
  const todaySchedule = getTodaySchedule(now.getDay());

  let isOpen = false;
  let closingTime = null;
  let nextOpening = null;

  for (const period of todaySchedule) {
    const startDate = timeToDate(now, period.start);
    const endDate = timeToDate(now, period.end);

    if (now >= startDate && now < endDate) {
      isOpen = true;
      closingTime = endDate;
      break;
    }

    if (now < startDate && !nextOpening) {
      nextOpening = startDate;
    }
  }

  statusElement.classList.remove("open", "closed", "warning");

  if (isOpen && closingTime) {
    const remaining = closingTime - now;
    const isClosingSoon = remaining <= 60 * 60 * 1000;

    if (isClosingSoon) {
      statusElement.classList.add("warning");
      statusElement.innerHTML = `
        <strong><span class="status-word status-warning">HAMAROSAN ZÁRUNK</span></strong><br>
        Ennyi idő múlva zárunk: ${formatTimeLeft(remaining)}
      `;
    } else {
      statusElement.classList.add("open");
      statusElement.innerHTML = `
        <strong><span class="status-word status-open">Gyere be hozzánk, NYITVA vagyunk</span></strong><br>
        Ennyi idő múlva zárunk: ${formatTimeLeft(remaining)}
      `;
    }
    return;
  }

  if (!nextOpening) {
    nextOpening = findNextOpening(now);
  }

  if (nextOpening) {
    const remainingToOpen = nextOpening - now;
    const isOpeningSoon = remainingToOpen <= 60 * 60 * 1000;

    if (isOpeningSoon) {
      statusElement.classList.add("warning");
      statusElement.innerHTML = `
        <strong><span class="status-word status-warning">HAMAROSAN NYITUNK</span></strong><br>
        Nyitásig: ${formatTimeLeft(remainingToOpen)}
      `;
    } else {
      statusElement.classList.add("closed");
      statusElement.innerHTML = `
        <strong><span class="status-word status-closed">Sajnos most ZÁRVA vagyunk</span></strong><br>
        Nyitásig: ${formatTimeLeft(remainingToOpen)}
      `;
    }
  } else {
    statusElement.classList.add("closed");
    statusElement.innerHTML = `
      <strong><span class="status-word status-closed">Sajnos most ZÁRVA vagyunk</span></strong>
    `;
  }
}

updateStoreStatus();
setInterval(updateStoreStatus, 30000);
