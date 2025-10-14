
import React from 'react';
import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';
import { SITE_LOGO, SITE_LOGO_ALT } from '../constants/media';

const AboutPage: React.FC = () => {
  const { t } = useTranslation();
  const pillars = t('aboutPage.pillars', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const faqItems = t('aboutPage.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: t('aboutPage.metaTitle'),
      description: t('aboutPage.metaDescription'),
      url: `${BASE_URL}/about/`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Makina Elektrike',
      url: BASE_URL,
      description: t('aboutPage.metaDescription'),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <div className="py-16">
      <SEO
        title={t('aboutPage.metaTitle')}
        description={t('aboutPage.metaDescription')}
        keywords={t('aboutPage.metaKeywords', { returnObjects: true }) as string[]}
        canonical={`${BASE_URL}/about/`}
        openGraph={{
          title: t('aboutPage.metaTitle'),
          description: t('aboutPage.metaDescription'),
          url: `${BASE_URL}/about/`,
          type: 'website',
          images: [DEFAULT_OG_IMAGE],
        }}
        twitter={{
          title: t('aboutPage.metaTitle'),
          description: t('aboutPage.metaDescription'),
          image: DEFAULT_OG_IMAGE,
          site: '@makinaelektrike',
        }}
        structuredData={structuredData}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
                <img
                  src={SITE_LOGO}
                  alt={SITE_LOGO_ALT}
                  className="mx-auto h-16 w-auto rounded"
                />
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl mt-4">
                  {t('aboutPage.title')}
                </h1>
            </div>
            <div className="mt-8 text-lg text-gray-300 space-y-6 prose prose-lg prose-invert max-w-none">
              <p>{t('aboutPage.p1')}</p>
              <p>{t('aboutPage.p2')}</p>
              <p>{t('aboutPage.p3')}</p>
              <p>{t('aboutPage.p4')}</p>
            </div>
            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
              {pillars.map(pillar => (
                <div key={pillar.title} className="bg-black/30 border border-white/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-3 text-gray-300 leading-relaxed">{pillar.description}</p>
                </div>
              ))}
            </div>
            <section className="mt-12 bg-black/30 border border-white/10 rounded-xl p-6 text-left space-y-4">
              <h2 className="text-2xl font-semibold text-white">Transparency &amp; Responsible Use of Information</h2>
              <p className="text-gray-300 leading-relaxed">
                We work diligently to vet the specifications, dealership details, pricing indicators, and charging ecosystem data that we
                publish. Even so, EV technology and market availability evolve quickly, so every visitor should treat the information on
                Makina Elektrike as guidance rather than a guaranteed promise. Listings, incentives, and technical specifications can change
                without notice, and delays in third-party updates may mean that some pages display data that is no longer current.
              </p>
              <p className="text-gray-300 leading-relaxed">
                By using our platform, you acknowledge that the content is offered on an "as is, as available" basis without warranties of
                any kind. We encourage shoppers, dealers, and partners to contact manufacturers or official representatives to confirm
                critical facts before making purchasing or operational decisions. Trademarks and logos referenced throughout the site remain
                the property of their respective owners, and no endorsement or partnership should be inferred unless explicitly stated.
              </p>
              <p className="text-gray-300 leading-relaxed">
                If you discover an omission or inaccuracy, please let us know through our contact page. We continually refine our editorial
                process to keep the community informed while respecting ownership rights, and we may update or remove materials at any time
                if we believe doing so protects the integrity of the information we provide.
              </p>
            </section>
          </div>
          <div className="mt-8">
              <img src="https://picsum.photos/seed/about-us/1024/400" alt="Electric car charging" className="w-full object-cover" />
          </div>
        </div>
        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center">{t('aboutPage.faqTitle')}</h2>
          <p className="mt-3 text-gray-300 text-center">{t('aboutPage.faqSubtitle')}</p>
          <div className="mt-8 space-y-6">
            {faqItems.map(faq => (
              <div key={faq.question} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
