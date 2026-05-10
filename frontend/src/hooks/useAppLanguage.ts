import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

import {
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from "@utils/i18n";

const STORAGE_KEY = "app_language";

export const getStoredLanguage = (): SupportedLanguage | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)) {
    return stored as SupportedLanguage;
  }
  return null;
};

export const useAppLanguage = () => {
  const { i18n } = useTranslation();

  const language = i18n.language as SupportedLanguage;

  const changeLanguage = useCallback(
    async (lng: SupportedLanguage) => {
      await i18n.changeLanguage(lng);
      dayjs.locale(lng);
      localStorage.setItem(STORAGE_KEY, lng);
    },
    [i18n]
  );

  return { language, changeLanguage };
};
