import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface Translations {
  [key: string]: string;
}

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  translations: Translations;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>('en');
  const [translations, setTranslations] = useState<Translations>({});
  const [allTranslations, setAllTranslations] = useState<{ [lang: string]: Translations }>({});

  // Define supported languages based on your i18n files
  // This could also be derived or managed more dynamically if needed.
  const PREDEFINED_SUPPORTED_LANGUAGES = ['en', 'ar'];

  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const enRes = await fetch('/i18n/en.json');
        const enData = await enRes.json();
        const arRes = await fetch('/i18n/ar.json');
        const arData = await arRes.json();
        setAllTranslations({ en: enData, ar: arData });
        // Removed: setTranslations(enData); // Default to English
        // The useEffect below will handle setting translations based on the current language
      } catch (error) {
        console.error('Failed to load translations:', error);
        setAllTranslations({ en: {}, ar: {} });
        setTranslations({});
      }
    };
    fetchTranslations();
  }, []);

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    setTranslations(allTranslations[language] || {});
  }, [language, allTranslations]);

  const setLanguage = (lang: string) => {
    // Validate against the predefined list of supported languages
    if (PREDEFINED_SUPPORTED_LANGUAGES.includes(lang)) {
      setLanguageState(lang);
    } else {
      console.warn(`Attempted to set unsupported language: '\${lang}'. Defaulting to '\${PREDEFINED_SUPPORTED_LANGUAGES[0] || 'en'}'.`);
      // Default to the first supported language or 'en' as a fallback
      setLanguageState(PREDEFINED_SUPPORTED_LANGUAGES[0] || 'en');
    }
  };

  const t = (key: string): string => {
    if (!translations || Object.keys(translations).length === 0) return '...';
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};