
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Linkedin, Zap } from 'lucide-react';

const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-transparent text-white mt-16 border-t border-gray-cyan/30">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
             <Link to="/" className="flex items-center text-white space-x-2">
              <Zap size={32} className="text-gray-cyan"/>
              <span className="font-bold text-2xl">Makina Elektrike</span>
            </Link>
            <p className="text-gray-300 text-base">{t('footer.description')}</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-cyan transition-colors"><span className="sr-only">Facebook</span><Facebook /></a>
              <a href="#" className="text-gray-400 hover:text-gray-cyan transition-colors"><span className="sr-only">Instagram</span><Instagram /></a>
              <a href="#" className="text-gray-400 hover:text-gray-cyan transition-colors"><span className="sr-only">Twitter</span><Twitter /></a>
              <a href="#" className="text-gray-400 hover:text-gray-cyan transition-colors"><span className="sr-only">LinkedIn</span><Linkedin /></a>
            </div>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">{t('footer.explore')}</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/dealers" className="text-base text-gray-300 hover:text-white">{t('header.dealers')}</Link></li>
                  <li><Link to="/models" className="text-base text-gray-300 hover:text-white">{t('header.models')}</Link></li>
                  <li><Link to="/blog" className="text-base text-gray-300 hover:text-white">{t('header.blog')}</Link></li>
                </ul>
              </div>
              <div className="mt-12 md:mt-0">
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">{t('footer.services')}</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/register" className="text-base text-gray-300 hover:text-white">{t('footer.userSignup')}</Link></li>
                  <li><Link to="/register-dealer" className="text-base text-gray-300 hover:text-white">{t('footer.dealerSignup')}</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1 md:gap-8">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">{t('footer.aboutUs')}</h3>
                <ul className="mt-4 space-y-4">
                  <li><Link to="/about" className="text-base text-gray-300 hover:text-white">{t('header.about')}</Link></li>
                  <li><Link to="/contact" className="text-base text-gray-300 hover:text-white">{t('footer.contact')}</Link></li>
                  <li><Link to="/sitemap" className="text-base text-gray-300 hover:text-white">{t('footer.sitemap')}</Link></li>
                </ul>
              </div>
            </div>
            <div className="md:grid md:grid-cols-1">
              <div>
                <h3 className="text-sm font-semibold text-white tracking-wider uppercase">{t('footer.legal')}</h3>
                <ul className="mt-4 space-y-4">
                  <li><a href="#" className="text-base text-gray-300 hover:text-white">{t('footer.privacy')}</a></li>
                  <li><a href="#" className="text-base text-gray-300 hover:text-white">{t('footer.terms')}</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-500/50 pt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-base text-gray-400">&copy; {new Date().getFullYear()} Makina Elektrike. {t('footer.rightsReserved')}</p>
          <p className="text-base text-gray-400">
            {t('footer.credits')} <a href="https://kejsan-coku.netlify.app/" target="_blank" rel="noreferrer" className="text-gray-cyan hover:text-white">Kejsan Coku</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
