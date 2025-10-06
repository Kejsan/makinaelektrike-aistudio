import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Zap } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const languages = [
    { code: 'en', label: t('languages.en') },
    { code: 'sq', label: t('languages.sq') },
    { code: 'it', label: t('languages.it') },
  ];

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
        aria-label={t('header.languageSwitcherLabel')}
      >
        <Globe size={20} />
        <span className="hidden md:inline">{t('header.languageSwitcherLabel')}</span>
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-md shadow-lg py-1 z-20">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => changeLanguage(code)}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-cyan/20 ${
                i18n.language === code ? 'text-gray-cyan font-semibold' : 'text-gray-200'
              }`}
            >
              {label}
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

  const navigation = [
    { path: '/', label: t('header.home') },
    { path: '/dealers', label: t('header.dealers') },
    { path: '/models', label: t('header.models') },
    { path: '/favorites', label: t('header.favorites') },
    { path: '/blog', label: t('header.blog') },
    { path: '/about', label: t('header.about') }
  ];

  const navLinkClasses = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-gray-cyan'
        : 'text-white hover:text-gray-cyan'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-navy-blue/60 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center text-white space-x-2">
              <Zap className="text-gray-cyan" size={28} />
              <span className="font-bold text-xl tracking-tight">Makina Elektrike</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navigation.map(item => (
              <Link key={item.path} to={item.path} className={navLinkClasses(item.path)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg border border-white/20 text-sm font-medium text-white hover:border-gray-cyan hover:text-gray-cyan transition-colors"
            >
              {t('header.register')}
            </Link>
            <Link
              to="/register-dealer"
              className="hidden lg:inline-flex items-center px-3 py-2 rounded-lg border border-gray-cyan/40 text-sm font-medium text-gray-cyan hover:bg-gray-cyan hover:text-navy-blue transition-colors"
            >
              {t('header.becomeDealer')}
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-cyan text-navy-blue font-semibold hover:bg-white transition-colors"
            >
              {t('header.login')}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;