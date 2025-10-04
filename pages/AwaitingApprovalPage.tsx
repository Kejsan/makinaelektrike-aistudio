import React from 'react';
import { useTranslation } from 'react-i18next';
import { Hourglass } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AwaitingApprovalPage: React.FC = () => {
  const { t } = useTranslation();
  const { profile } = useAuth();

  return (
    <div className="py-16">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden p-8 text-center text-white">
          <Hourglass className="mx-auto text-gray-cyan h-12 w-12" />
          <h1 className="text-3xl font-extrabold mt-6">{t('auth.awaitingApprovalTitle', 'Awaiting Approval')}</h1>
          <p className="mt-2 text-gray-300">
            {t(
              'auth.awaitingApprovalDescription',
              'Thanks for registering! Your account is pending approval. We will notify you once an administrator reviews your request.'
            )}
          </p>
          {profile?.email && (
            <p className="mt-4 text-sm text-gray-400">
              {t('auth.awaitingApprovalEmail', 'Current account')}: <span className="font-medium text-gray-200">{profile.email}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AwaitingApprovalPage;
