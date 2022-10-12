export type PublicHoliday = {
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
export type WeekDayNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;
