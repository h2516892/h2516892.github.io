document.addEventListener("DOMContentLoaded", () => {
  initializeCard();
});

document.addEventListener("pjax:complete", () => {
  initializeCard();
});

function initializeCard() {
  cardTimes();
  cardRefreshTimes();
}

let year,
  month,
  week,
  date,
  dates,
  weekStr,
  monthStr,
  asideTime,
  asideDay,
  asideDayNum,
  animalYear,
  ganzhiYear,
  lunarMon,
  lunarDay;
const DAY_MS = 24 * 60 * 60 * 1000;
const CNY_DATE_MAP = {
  2024: "2024-02-10",
  2025: "2025-01-29",
  2026: "2026-02-17",
  2027: "2027-02-06",
  2028: "2028-01-26",
  2029: "2029-02-13",
  2030: "2030-02-03",
  2031: "2031-01-23",
  2032: "2032-02-11",
  2033: "2033-01-31",
  2034: "2034-02-19",
  2035: "2035-02-08",
};

function formatDate(value) {
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getChineseNewYearDate(targetYear) {
  const hasLunarLib =
    typeof window !== "undefined" &&
    window.chineseLunar &&
    typeof chineseLunar.solarToLunar === "function";
  if (hasLunarLib) {
    const start = new Date(targetYear, 0, 20);
    const end = new Date(targetYear, 1, 25);
    for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const lunar = chineseLunar.solarToLunar(d);
      if (
        chineseLunar.format(lunar, "M") === "正月" &&
        chineseLunar.format(lunar, "d") === "初一"
      ) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      }
    }
  }

  const fallback = CNY_DATE_MAP[targetYear];
  if (fallback) {
    return new Date(`${fallback}T00:00:00`);
  }

  return null;
}

function getLunarInfo(solarDate) {
  const hasLunarLib =
    typeof window !== "undefined" &&
    window.chineseLunar &&
    typeof chineseLunar.solarToLunar === "function";
  if (!hasLunarLib) {
    return null;
  }

  const lunarDate = chineseLunar.solarToLunar(solarDate);
  return {
    animalYear: chineseLunar.format(lunarDate, "A"),
    ganzhiYear: chineseLunar.format(lunarDate, "T").slice(0, -1),
    lunarMon: chineseLunar.format(lunarDate, "M"),
    lunarDay: chineseLunar.format(lunarDate, "d"),
  };
}

function getUpcomingChuxiDate(currentDate) {
  const today = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  const thisYearCny = getChineseNewYearDate(today.getFullYear());
  if (thisYearCny) {
    const thisYearChuxi = new Date(thisYearCny);
    thisYearChuxi.setDate(thisYearChuxi.getDate() - 1);
    if (today <= thisYearChuxi) {
      return thisYearChuxi;
    }
  }

  const nextYearCny = getChineseNewYearDate(today.getFullYear() + 1);
  if (nextYearCny) {
    const nextYearChuxi = new Date(nextYearCny);
    nextYearChuxi.setDate(nextYearChuxi.getDate() - 1);
    return nextYearChuxi;
  }

  return null;
}

function cardRefreshTimes() {
  const now = new Date();
  const e = document.getElementById("card-widget-schedule");
  if (e) {
    const yearDays =
      (new Date(now.getFullYear() + 1, 0, 1) -
        new Date(now.getFullYear(), 0, 1)) /
      DAY_MS;
    asideDay = (now - asideTime) / 1e3 / 60 / 60 / 24;
    e.querySelector("#pBar_year").max = yearDays;
    e.querySelector("#pBar_year").value = asideDay;
    e.querySelector("#p_span_year").innerHTML =
      ((asideDay / yearDays) * 100).toFixed(1) + "%";
    e.querySelector(
      ".schedule-r0 .schedule-d1 .aside-span2"
    ).innerHTML = `还剩<a> ${(yearDays - asideDay).toFixed(0)} </a>天`;
    e.querySelector("#pBar_month").value = date;
    e.querySelector("#pBar_month").max = dates;
    e.querySelector("#p_span_month").innerHTML =
      ((date / dates) * 100).toFixed(1) + "%";
    e.querySelector(
      ".schedule-r1 .schedule-d1 .aside-span2"
    ).innerHTML = `还剩<a> ${dates - date} </a>天`;
    e.querySelector("#pBar_week").value = week === 0 ? 7 : week;
    e.querySelector("#p_span_week").innerHTML =
      (((week === 0 ? 7 : week) / 7) * 100).toFixed(1) + "%";
    e.querySelector(
      ".schedule-r2 .schedule-d1 .aside-span2"
    ).innerHTML = `还剩<a> ${7 - (week === 0 ? 7 : week)} </a>天`;
  }
}

function cardTimes() {
  const now = new Date();
  year = now.getFullYear();
  month = now.getMonth();
  week = now.getDay();
  date = now.getDate();

  const e = document.getElementById("card-widget-calendar");
  if (e) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    weekStr = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][week];
    const monthData = [
      { month: "1月", days: 31 },
      { month: "2月", days: isLeapYear ? 29 : 28 },
      { month: "3月", days: 31 },
      { month: "4月", days: 30 },
      { month: "5月", days: 31 },
      { month: "6月", days: 30 },
      { month: "7月", days: 31 },
      { month: "8月", days: 31 },
      { month: "9月", days: 30 },
      { month: "10月", days: 31 },
      { month: "11月", days: 30 },
      { month: "12月", days: 31 },
    ];
    monthStr = monthData[month].month;
    dates = monthData[month].days;

    const t = (week + 8 - (date % 7)) % 7;
    let n = "",
      d = false,
      s = 7 - t;
    const o =
      (dates - s) % 7 === 0
        ? Math.floor((dates - s) / 7) + 1
        : Math.floor((dates - s) / 7) + 2;
    const c = e.querySelector("#calendar-main");
    const l = e.querySelector("#calendar-date");

    l.style.fontSize = ["64px", "48px", "36px"][Math.min(o - 3, 2)];

    for (let i = 0; i < o; i++) {
      if (!c.querySelector(`.calendar-r${i}`)) {
        c.innerHTML += `<div class='calendar-r${i}'></div>`;
      }
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j === t) {
          n = 1;
          d = true;
        }
        const r = n === date ? " class='now'" : "";
        if (!c.querySelector(`.calendar-r${i} .calendar-d${j} a`)) {
          c.querySelector(
            `.calendar-r${i}`
          ).innerHTML += `<div class='calendar-d${j}'><a${r}>${n}</a></div>`;
        }
        if (n >= dates) {
          n = "";
          d = false;
        }
        if (d) {
          n += 1;
        }
      }
    }

    const lunarInfo = getLunarInfo(new Date(year, month, date));
    if (lunarInfo) {
      animalYear = lunarInfo.animalYear;
      ganzhiYear = lunarInfo.ganzhiYear;
      lunarMon = lunarInfo.lunarMon;
      lunarDay = lunarInfo.lunarDay;
      e.querySelector(
        "#calendar-lunar"
      ).innerHTML = `${ganzhiYear}${animalYear}年&nbsp;${lunarMon}${lunarDay}`;
    } else {
      e.querySelector("#calendar-lunar").textContent = "";
    }

    const chuxiDate = getUpcomingChuxiDate(now);
    const today = new Date(year, month, date);
    const daysUntilNewYear = chuxiDate
      ? Math.floor((chuxiDate - today) / DAY_MS)
      : 0;
    const scheduleDateEl = document.getElementById("schedule-date");
    if (scheduleDateEl) {
      scheduleDateEl.textContent = chuxiDate ? formatDate(chuxiDate) : "--";
    }

    asideTime = new Date(year, 0, 1);
    asideDay = (now - asideTime) / 1e3 / 60 / 60 / 24;
    asideDayNum = Math.floor(asideDay);
    const weekNum =
      week - (asideDayNum % 7) >= 0
        ? Math.ceil(asideDayNum / 7)
        : Math.ceil(asideDayNum / 7) + 1;

    e.querySelector(
      "#calendar-week"
    ).innerHTML = `第${weekNum}周&nbsp;${weekStr}`;
    e.querySelector("#calendar-date").innerHTML = date
      .toString()
      .padStart(2, "0");
    e.querySelector(
      "#calendar-solar"
    ).innerHTML = `${year}年${monthStr}&nbsp;第${asideDay.toFixed(0)}天`;
    document.getElementById("schedule-days").textContent = String(
      Math.max(0, daysUntilNewYear)
    );
  }
}
