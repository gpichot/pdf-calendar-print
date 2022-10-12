import React from "react";
import { initReactI18next } from "react-i18next";
import { format } from "date-fns";
import { enGB, fr } from "date-fns/locale";
import i18next from "i18next";

const locales = {
  fr,
  en: enGB,
};
type Locale = keyof typeof locales;

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        fields: {
          startDate: "Start Date",
          countryCodeForPublicHolidays: "Country Code for Public Holidays",
          weeksStartOn: "Weeks Start On",
        },
        publicHolidays: "Public Holidays",
      },
    },
    fr: {
      translation: {
        fields: {
          startDate: "Date de début",
          countryCodeForPublicHolidays: "Code du pays pour les jours fériés",
          weeksStartOn: "Les semaines commencent le",
        },
        publicHolidays: "Jours fériés",
      },
    },
  },
  lng: "en",
  fallbackLng: "en",

  interpolation: {
    escapeValue: false,
  },
});

const listeners = new Set<(lang: Locale) => void>();

i18next.on("languageChanged", (lng: Locale) => {
  listeners.forEach((listener) => listener(lng));
});

export function useDateFormatting() {
  const [lang, setLang] = React.useState<Locale>(i18next.language as Locale);

  React.useEffect(() => {
    listeners.add(setLang);
    return () => {
      listeners.delete(setLang);
    };
  }, []);

  const i18nFormat = React.useCallback(
    (date: Date, formatStr: string) => {
      return format(date, formatStr, { locale: locales[lang] });
    },
    [lang]
  );

  return { format: i18nFormat };
}

export default i18next;
