import React, { useEffect, useState } from "react";
import classnames from "classnames";
import {
  addMonths,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import "./globals.scss";
import styles from "./App.module.scss";

// This print all the months between the first and last month in JSX
type PublicHoliday = {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: null | string[];
  launchYear: number | null;
  type: string;
};
type WeekDayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

function isPublicHoliday(day: Date, publicHolidays: PublicHoliday[]) {
  return publicHolidays.some((holiday) => {
    return format(day, "yyyy-MM-dd") === holiday.date;
  });
}

function MonthCalendar({
  month,
  publicHolidays,
  weekStartsOn,
}: {
  month: Date;
  publicHolidays: PublicHoliday[];
  weekStartsOn: WeekDayNumber;
}) {
  const monthInterval = { start: startOfMonth(month), end: endOfMonth(month) };
  return (
    <div>
      {/* week days */}
      <table className={styles.monthCalendar}>
        <thead>
          <tr>
            <th></th>
            <th colSpan={7} className={styles.monthCalendarTitle}>
              {format(month, "MMM yyyy")}
            </th>
          </tr>
          <tr>
            <th></th>
            {eachDayOfInterval({
              start: startOfWeek(monthInterval.start, { weekStartsOn }),
              end: endOfWeek(monthInterval.start, { weekStartsOn }),
            }).map((day) => (
              <th key={day.toISOString()}>{format(day, "E").slice(0, 2)}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {eachWeekOfInterval(monthInterval, { weekStartsOn }).map((week) => {
            const weekInterval = {
              start: week,
              end: endOfWeek(week, { weekStartsOn }),
            };
            return (
              <tr key={format(week, "ww")}>
                <td className={styles.weekNumber}>{format(week, "ww")}</td>
                {eachDayOfInterval(weekInterval).map((day) => {
                  const disabled = day.getMonth() !== month.getMonth();
                  const publicHoliday = isPublicHoliday(day, publicHolidays);
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <td
                      key={format(day, "yyyy-MM-dd")}
                      className={classnames(styles.day, {
                        [styles.disabled]: disabled,
                        [styles.weekend]: isWeekend,
                        [styles.isPublicHoliday]: publicHoliday && !disabled,
                      })}
                    >
                      <span className={styles.dayNumber}>
                        {format(day, "d")}
                      </span>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const PublicCalendarCache: Record<number, unknown> = {};

async function fetchPublicHolidaysForYear(year: number) {
  if (PublicCalendarCache[year]) {
    return Promise.resolve(PublicCalendarCache[year]);
  }
  const response = await fetch(
    `https://date.nager.at/api/v3/PublicHolidays/${year}/FR`
  );
  const json = await response.json();
  PublicCalendarCache[year] = json;
  return json;
}

function usePublicHolidays(years: number[]) {
  const [publicHolidays, setPublicHolidays] = useState<PublicHoliday[]>([]);
  const key = years.join("-");

  useEffect(() => {
    const yearsToFetch = key.split("-").map(Number);
    const fetchPublicHolidays = async () => {
      const publicHolidays = await Promise.all(
        yearsToFetch.map((year) => fetchPublicHolidaysForYear(year))
      ).then((res) => res.flat());
      setPublicHolidays(publicHolidays);
    };
    fetchPublicHolidays();
  }, [key]);

  return publicHolidays;
}

function converToWeekDayNumber(weekStartsOn: string): WeekDayNumber {
  const n = Number(weekStartsOn);
  if (n >= 0 && n <= 6) return n as WeekDayNumber;
  return 1;
}

function App() {
  const [startDate, setStartDate] = useState(new Date());
  const [countryCode, setCountryCode] = useState("FR");
  const [weekStartsOn, setWeekStartsOn] = useState<WeekDayNumber>(1);
  const interval = { start: startDate, end: addMonths(startDate, 11) };

  const months = eachMonthOfInterval(interval);
  const years = eachYearOfInterval(interval).map((x) => x.getFullYear());
  const publicHolidays = usePublicHolidays(years);

  const publicHolidaysInInterval = publicHolidays.filter((holiday) => {
    return (
      isWithinInterval(new Date(holiday.date), interval) &&
      holiday.counties === null
    );
  });
  return (
    <>
      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="startDate">Start date</label>
          <input
            type="date"
            id="startDate"
            value={format(startDate, "yyyy-MM-dd")}
            onChange={(e) => setStartDate(new Date(e.target.value))}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="countryCode">Country code</label>
          <input
            type="text"
            id="countryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="weekStartsOn">Week starts on</label>
          <select
            id="weekStartsOn"
            value={weekStartsOn}
            onChange={(e) =>
              setWeekStartsOn(converToWeekDayNumber(e.target.value))
            }
          >
            <option value={0}>Sunday</option>
            <option value={1}>Monday</option>
            <option value={2}>Tuesday</option>
            <option value={3}>Wednesday</option>
            <option value={4}>Thursday</option>
            <option value={5}>Friday</option>
            <option value={6}>Saturday</option>
          </select>
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
      <h2 className={styles.publicHolidaysTitle}>Public Holidays</h2>
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
