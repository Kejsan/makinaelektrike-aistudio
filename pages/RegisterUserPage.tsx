import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const RegisterUserPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-10 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-4">{t('authPages.registerUserTitle')}</h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-8">
            {t('authPages.registerUserSubtitle')}
          </p>
          <p className="text-gray-400 mb-10">
            {t('authPages.comingSoon')}
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-5 py-3 rounded-lg bg-gray-cyan text-navy-blue font-semibold hover:bg-white transition-colors"
          >
            {t('authPages.contactSupport')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RegisterUserPage;
