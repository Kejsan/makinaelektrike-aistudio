import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Zap, Settings } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const languages = {
    en: 'English',
    sq: 'Shqip',
    it: 'Italiano',
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-gray-cyan transition-colors"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe size={20} />
        <span className="hidden md:inline">Language</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-md shadow-lg py-1 z-20">
          {Object.entries(languages).map(([code, name]) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-cyan/20 ${
                i18n.language === code ? 'text-gray-cyan font-semibold' : 'text-gray-200'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Header: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  const navLinkClasses = (path: string) => 
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path 
        ? 'text-gray-cyan' 
        : 'text-white hover:text-gray-cyan'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-navy-blue/50 backdrop-blur-md border-b border-gray-cyan/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-white space-x-2">
              <Zap className="text-gray-cyan" size={28}/>
              <span className="font-bold text-xl">Makina Elektrike</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            <Link to="/" className={navLinkClasses('/')}>{t('header.home')}</Link>
            <Link to="/dealers" className={navLinkClasses('/dealers')}>{t('header.dealers')}</Link>
            <Link to="/models" className={navLinkClasses('/models')}>{t('header.models')}</Link>
            <Link to="/favorites" className={navLinkClasses('/favorites')}>{t('header.favorites')}</Link>
            <Link to="/blog" className={navLinkClasses('/blog')}>{t('header.blog')}</Link>
            <Link to="/about" className={navLinkClasses('/about')}>{t('header.about')}</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="text-white hover:text-gray-cyan transition-colors" aria-label={t('header.admin') as string}>
                <Settings size={20} />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;