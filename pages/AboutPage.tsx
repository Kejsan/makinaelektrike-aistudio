
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
                <Zap className="mx-auto text-gray-cyan h-12 w-12"/>
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl mt-4">
                  {t('aboutPage.title')}
                </h1>
            </div>
            <div className="mt-8 text-lg text-gray-300 space-y-6 prose prose-lg prose-invert max-w-none">
              <p>{t('aboutPage.p1')}</p>
              <p>{t('aboutPage.p2')}</p>
              <p>{t('aboutPage.p3')}</p>
            </div>
          </div>
          <div className="mt-8">
              <img src="https://picsum.photos/seed/about-us/1024/400" alt="Electric car charging" className="w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
