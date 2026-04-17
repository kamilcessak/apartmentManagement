import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en";
import pl from "./locales/pl";

export const SUPPORTED_LANGUAGES = ["en", "pl"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: SupportedLanguage = "pl";
export const FALLBACK_LANGUAGE: SupportedLanguage = "en";

i18n.use(initReactI18next).init({
  resources: {
    en,
    pl,
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: FALLBACK_LANGUAGE,
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
