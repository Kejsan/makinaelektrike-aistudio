import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'success'>('idle');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login();
    setStatus('success');
  };

  return (
    <section className="py-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-3xl font-bold text-white mb-4">{t('authPages.loginTitle')}</h1>
          <p className="text-gray-300 mb-8">{t('authPages.loginSubtitle')}</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                {t('authPages.emailLabel')}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                required
                className="w-full rounded-lg bg-white/10 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                {t('authPages.passwordLabel')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
                className="w-full rounded-lg bg-white/10 border border-white/10 text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex justify-center px-5 py-3 rounded-lg bg-gray-cyan text-navy-blue font-semibold hover:bg-white transition-colors"
            >
              {t('authPages.loginButton')}
            </button>
          </form>

          {status === 'success' && (
            <div className="mt-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-400/40 text-emerald-200">
              {t('authPages.loginSuccess')}
            </div>
          )}

          <div className="mt-10 text-sm text-gray-400 space-y-2">
            <p>
              {t('authPages.registerUserTitle')} ·{' '}
              <Link to="/register" className="text-gray-cyan hover:text-white transition-colors">
                {t('header.register')}
              </Link>
            </p>
            <p>
              {t('authPages.registerDealerTitle')} ·{' '}
              <Link to="/register-dealer" className="text-gray-cyan hover:text-white transition-colors">
                {t('header.becomeDealer')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
