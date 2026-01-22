import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import ta from './translations/ta.json';
import hi from './translations/hi.json';

const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';

const initI18n = () => {
  if (!i18n.isInitialized) {
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          en: { translation: en },
          ta: { translation: ta },
          hi: { translation: hi },
        },
        lng: savedLanguage,
        fallbackLng: 'en',
        interpolation: {
          escapeValue: false,
        },
        react: {
          useSuspense: false,
        },
      });
  }
  return i18n;
};

export default initI18n();
