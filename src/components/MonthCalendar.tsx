import classnames from "classnames";
import {
  eachDayOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";

import { useDateFormatting } from "../i18next";
import { PublicHoliday, WeekDayNumber } from "../types";

import styles from "./MonthCalendar.module.scss";

function isPublicHoliday(day: Date, publicHolidays: PublicHoliday[]) {
  return publicHolidays.some((holiday) => {
    return isSameDay(day, new Date(holiday.date));
  });
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function MonthCalendar({
  month,
  publicHolidays,
  weekStartsOn,
}: {
  month: Date;
  publicHolidays: PublicHoliday[];
  weekStartsOn: WeekDayNumber;
}) {
  const monthInterval = { start: startOfMonth(month), end: endOfMonth(month) };
  const { format } = useDateFormatting();
  return (
    <div>
      {/* week days */}
      <table className={styles.monthCalendar}>
        <thead>
          <tr>
            <th></th>
            <th colSpan={7} className={styles.monthCalendarTitle}>
              {capitalizeFirst(format(month, "MMMM yyyy"))}
            </th>
          </tr>
          <tr>
            <th></th>
            {eachDayOfInterval({
              start: startOfWeek(monthInterval.start, { weekStartsOn }),
              end: endOfWeek(monthInterval.start, { weekStartsOn }),
            }).map((day) => (
              <th key={day.toISOString()}>
                {capitalizeFirst(format(day, "E").slice(0, 2))}
              </th>
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
