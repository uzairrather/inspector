'use client';

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Languages, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = dir;
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSearchChange = (e) => {
    setQuery(e.target.value);
    console.log('Search:', e.target.value);
  };

  return (
    <header className="w-full px-4 sm:px-4 md:px-4 lg:px-10 py-4 border-b shadow-sm bg-blue-100">
      <div className="max-w-full flex justify-between items-center relative">
        {/* Left: Title */}
        <h1 className="text-2xl font-bold whitespace-nowrap">{t('Asset Inspecto')}</h1>

        {/* Center: Search Bar */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <div className="relative w-80 sm:w-[22rem]">
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder={t('Search...')}
              className="w-full pl-11 pr-4 py-3 text-base bg-white text-gray-900 border rounded-lg shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Right: Language Toggle */}
        <Button
          onClick={toggleLanguage}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 px-3 py-2 text-base"
        >
          <Languages className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
