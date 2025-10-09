import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import sqTranslations from './locales/sq.json';
import itTranslations from './locales/it.json';

const resources = {
  en: { translation: enTranslations },
  sq: { translation: sqTranslations },
  it: { translation: itTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })
  .then(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.language;
    }
  });

i18n.on('languageChanged', lng => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lng;
  }
});

export default i18n;
