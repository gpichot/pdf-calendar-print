import React from "react";
import { useTranslation } from "react-i18next";
import { countries } from "countries-list";
import {
  addMonths,
  eachMonthOfInterval,
  eachYearOfInterval,
  endOfMonth,
  isWithinInterval,
} from "date-fns";

import MonthCalendar from "./components/MonthCalendar";
import usePublicHolidays from "./hooks/usePublicHolidays";
import useQueryParams from "./hooks/useQueryParams";
import i18next, { useDateFormatting } from "./i18next";
import { WeekDayNumber } from "./types";

import "./globals.scss";
import styles from "./App.module.scss";

function converToWeekDayNumber(weekStartsOn: string): WeekDayNumber {
  const n = Number(weekStartsOn);
  if (n >= 0 && n <= 6) return n as WeekDayNumber;
  return 1;
}

const Countries = [
  { ...countries.FR, code: "FR" },
  { ...countries.US, code: "US" },
  { ...countries.GB, code: "GB" },
];

const Defaults = {
  lang: "en",
  startDate: new Date().toISOString(),
  weekStartsOn: "1",
  countryCode: "FR",
};

function App() {
  const { t } = useTranslation();
  const [queryParams, setQueryParam] = useQueryParams({
    defaults: Defaults,
  });

  const lang = queryParams.lang;

  React.useEffect(() => {
    i18next.changeLanguage(lang || "en");
  }, [lang]);

  const startDate = queryParams.startDate
    ? new Date(queryParams.startDate)
    : new Date();
  const weekStartsOn = converToWeekDayNumber(queryParams.weekStartsOn || "1");
  const countryCode = queryParams.countryCode;

  const interval = {
    start: startDate,
    end: endOfMonth(addMonths(startDate, 11)),
  };

  const months = eachMonthOfInterval(interval);
  const years = eachYearOfInterval(interval).map((x) => x.getFullYear());
  const publicHolidays = usePublicHolidays(years, { countryCode });

  const publicHolidaysInInterval = publicHolidays.filter((holiday) => {
    return (
      isWithinInterval(new Date(holiday.date), interval) &&
      holiday.counties === null
    );
  });

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQueryParam("startDate", format(new Date(e.target.value), "yyyy-MM-dd"));
  };

  const handleWeekStartsOnChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setQueryParam("weekStartsOn", e.target.value);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setQueryParam("countryCode", e.target.value);
  };
  const { format } = useDateFormatting();

  return (
    <>
      <div className={styles.form}>
        <p>Customize your calendar and then print it using your browser.</p>
        <div className={styles.languageSelector}>
          <button
            disabled={lang === "en"}
            onClick={() => setQueryParam("lang", "en")}
          >
            🇬🇧
          </button>
          <button
            disabled={lang === "fr"}
            onClick={() => setQueryParam("lang", "fr")}
          >
            🇫🇷
          </button>
        </div>
        <div className={styles.options}>
          <div className={styles.formGroup}>
            <label htmlFor="startDate">{t("fields.startDate")}</label>
            <input
              type="date"
              id="startDate"
              value={format(startDate, "yyyy-MM-dd")}
              onChange={handleStartDateChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="countryCode">
              {t("fields.countryCodeForPublicHolidays")}
            </label>
            <select
              id="countryCode"
              value={countryCode}
              onChange={handleCountryCodeChange}
            >
              {Countries.map((country) => (
                <option key={country.name} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="weekStartsOn">{t("fields.weeksStartOn")}</label>
            <select
              id="weekStartsOn"
              value={weekStartsOn}
              onChange={handleWeekStartsOnChange}
            >
              {Array.from({ length: 7 }, (_, i) => i).map((n) => (
                <option key={n} value={n}>
                  {t(`weekDays.${n}`)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className={styles.gridCalendar}>
        {months.map((month) => (
          <MonthCalendar
            key={format(month, "yyyy-MM")}
            month={month}
            publicHolidays={publicHolidaysInInterval}
            weekStartsOn={weekStartsOn}
          />
        ))}
      </div>
      <h2 className={styles.publicHolidaysTitle}>{t("publicHolidays")}</h2>
      <div className={styles.publicHolidays}>
        {publicHolidaysInInterval.map((holiday) => (
          <p key={holiday.date}>
            {format(new Date(holiday.date), "yyyy MMM dd")} -{" "}
            {holiday.localName}
            {holiday.counties && holiday.counties.length > 0 && (
              <span className={styles.counties}>
                {" "}
                ({holiday.counties.join(", ")})
              </span>
            )}
          </p>
        ))}
      </div>
    </>
  );
}

export default App;
