import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';

interface LegalSection {
  title: string;
  items: string[];
}

const PrivacyPolicyPage: React.FC = () => {
  const { t } = useTranslation();
  const sections = t('legal.privacy.sections', { returnObjects: true }) as LegalSection[];

  return (
    <div className="py-12">
      <SEO
        title={t('legal.privacy.metaTitle')}
        description={t('legal.privacy.metaDescription')}
        keywords={t('legal.privacy.metaKeywords', { returnObjects: true }) as string[]}
        canonical={`${BASE_URL}/privacy`}
        openGraph={{
          title: t('legal.privacy.metaTitle'),
          description: t('legal.privacy.metaDescription'),
          url: `${BASE_URL}/privacy`,
          type: 'article',
          images: [DEFAULT_OG_IMAGE],
        }}
        twitter={{
          title: t('legal.privacy.metaTitle'),
          description: t('legal.privacy.metaDescription'),
          image: DEFAULT_OG_IMAGE,
          site: '@makinaelektrike',
        }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="space-y-3 text-center md:text-left">
          <h1 className="text-4xl font-extrabold text-white">{t('legal.privacy.title')}</h1>
          <p className="text-sm uppercase tracking-wide text-gray-400">{t('legal.privacy.updated')}</p>
          <p className="text-lg text-gray-300">{t('legal.privacy.intro')}</p>
        </header>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-white">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-gray-300">
                {section.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-gray-cyan" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
