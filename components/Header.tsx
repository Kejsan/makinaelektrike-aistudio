import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SITE_LOGO, SITE_LOGO_ALT } from '../constants/media';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
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
        <span className="hidden md:inline">{t('header.language')}</span>
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
  const navigate = useNavigate();
  const { user, role, logout, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };
  
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinkClasses = (path: string) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'text-gray-cyan'
        : 'text-white hover:text-gray-cyan'
    }`;

  const mobileNavLinkClasses = (path: string) =>
    `block rounded-md px-3 py-2 text-base font-medium transition-colors ${
      location.pathname === path
        ? 'text-gray-cyan bg-white/5'
        : 'text-white hover:text-gray-cyan hover:bg-white/5'
    }`;

  const navigationItems = [
    { to: '/', label: t('header.home') },
    { to: '/dealers', label: t('header.dealers') },
    { to: '/models', label: t('header.models') },
    { to: '/albania-charging-stations', label: t('header.chargingStations') },
    { to: '/favorites', label: t('header.favorites') },
    { to: '/blog', label: t('header.blog') },
    { to: '/about', label: t('header.about') },
  ];

  return (
    <header className="sticky top-0 z-[1200] bg-navy-blue/50 backdrop-blur-md border-b border-gray-cyan/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between gap-4 py-3 lg:py-4">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center text-white" aria-label={t('header.home')}>
              <img
                src={SITE_LOGO}
                alt={SITE_LOGO_ALT}
                className="h-14 w-auto rounded sm:h-16 lg:h-20"
              />
            </Link>
          </div>
          <nav className="hidden lg:flex items-center gap-2">
            {navigationItems.map((item) => (
              <Link key={item.to} to={item.to} className={navLinkClasses(item.to)}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-3">
              {!user ? (
                <>
                  <Link to="/register" className="btn btn-outline">
                    {t('header.register')}
                  </Link>
                  <Link to="/register-dealer" className="btn btn-outline">
                    {t('header.becomeDealer')}
                  </Link>
                  <Link to="/login" className="btn btn-primary">
                    {t('header.login')}
                  </Link>
                </>
              ) : (
                <>
                  {role === 'admin' && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center text-white hover:text-gray-cyan transition-colors"
                      aria-label={t('header.admin') as string}
                    >
                      <Settings size={20} />
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    type="button"
                    className="inline-flex items-center space-x-1 text-white hover:text-gray-cyan transition-colors disabled:opacity-60"
                    disabled={loading}
                    aria-label={t('header.logout') as string}
                  >
                    <LogOut size={18} />
                    <span className="hidden md:inline text-sm font-medium">{t('header.logout')}</span>
                  </button>
                </>
              )}
            </div>
            <div className="hidden lg:block">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center rounded-md p-2 text-white hover:text-gray-cyan hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-cyan lg:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? (t('header.closeMenu') as string) : (t('header.openMenu') as string)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
          {mobileMenuOpen && (
            <>
              <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />
              <div className="absolute left-0 top-16 z-50 w-full rounded-b-lg border border-t-0 border-gray-cyan/20 bg-navy-blue/95 backdrop-blur-md shadow-xl lg:hidden">
                <nav className="max-h-[calc(100vh-4rem)] overflow-y-auto px-4 pt-4 pb-6 space-y-3">
                {navigationItems.map((item) => (
                  <Link key={item.to} to={item.to} className={mobileNavLinkClasses(item.to)}>
                    {item.label}
                  </Link>
                ))}
                {!user ? (
                  <div className="pt-2 space-y-3">
                    <Link to="/login" className="btn btn-primary w-full justify-center">
                      {t('header.login')}
                    </Link>
                    <Link to="/register" className="btn btn-outline w-full justify-center">
                      {t('header.register')}
                    </Link>
                    <Link to="/register-dealer" className="btn btn-outline w-full justify-center">
                      {t('header.becomeDealer')}
                    </Link>
                  </div>
                ) : (
                  <div className="pt-2 space-y-3">
                    {role === 'admin' && (
                      <Link to="/admin" className="btn btn-outline w-full justify-center">
                        {t('header.admin')}
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      type="button"
                      className="btn btn-outline w-full justify-center disabled:opacity-60"
                      disabled={loading}
                    >
                      {t('header.logout')}
                    </button>
                  </div>
                )}
              </nav>
              <div className="border-t border-white/10 px-4 py-3">
                <LanguageSwitcher />
              </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;