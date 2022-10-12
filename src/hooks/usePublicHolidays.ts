import React from "react";

import { PublicHoliday } from "../types";

const PublicCalendarCache: Record<string, unknown> = {};

async function fetchPublicHolidaysForYear(
  year: number,
  { countryCode }: { countryCode: string }
) {
  const url = `https://date.nager.at/api/v2/PublicHolidays/${year}/${countryCode}`;
  if (PublicCalendarCache[url]) {
    return Promise.resolve(PublicCalendarCache[url]);
  }
  const response = await fetch(url);
  const json = await response.json();
  PublicCalendarCache[url] = json;
  return json;
}

export default function usePublicHolidays(
  years: number[],
  { countryCode = "FR" }: { countryCode?: string } = {}
) {
  const [publicHolidays, setPublicHolidays] = React.useState<PublicHoliday[]>(
    []
  );

  // Small workaround to avoid infinite loop
  const key = years.join("-");

  React.useEffect(() => {
    const yearsToFetch = key.split("-").map(Number);
    const fetchPublicHolidays = async () => {
      const publicHolidays = await Promise.all(
        yearsToFetch.map((year) =>
          fetchPublicHolidaysForYear(year, { countryCode })
        )
      ).then((res) => res.flat());
      setPublicHolidays(publicHolidays);
    };
    fetchPublicHolidays();
  }, [key, countryCode]);

  return publicHolidays;
}
