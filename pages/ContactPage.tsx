
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin } from 'lucide-react';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';

const ContactPage: React.FC = () => {
  const { t } = useTranslation();
  const supportHighlights = t('contactPage.highlights', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const faqItems = t('contactPage.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: t('contactPage.metaTitle'),
      description: t('contactPage.metaDescription'),
      url: `${BASE_URL}/contact/`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Makina Elektrike',
      url: BASE_URL,
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: 'info@makinaelektrike.al',
        telephone: '+35512345678',
        areaServed: 'AL',
      },
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
        title={t('contactPage.metaTitle')}
        description={t('contactPage.metaDescription')}
        keywords={t('contactPage.metaKeywords', { returnObjects: true }) as string[]}
        canonical={`${BASE_URL}/contact/`}
        openGraph={{
          title: t('contactPage.metaTitle'),
          description: t('contactPage.metaDescription'),
          url: `${BASE_URL}/contact/`,
          type: 'website',
          images: [DEFAULT_OG_IMAGE],
        }}
        twitter={{
          title: t('contactPage.metaTitle'),
          description: t('contactPage.metaDescription'),
          image: DEFAULT_OG_IMAGE,
          site: '@makinaelektrike',
        }}
        structuredData={structuredData}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            {t('contactPage.title')}
          </h1>
          <p className="mt-4 text-xl text-gray-400">
            {t('contactPage.p1')}
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {supportHighlights.map(highlight => (
            <div key={highlight.title} className="bg-white/5 border border-white/10 rounded-xl p-6 text-center">
              <h3 className="text-xl font-semibold text-white">{highlight.title}</h3>
              <p className="mt-3 text-gray-300 leading-relaxed">{highlight.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-8">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-cyan text-white">
                            <Mail size={24} />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">{t('contactPage.email')}</h3>
                        <p className="mt-1 text-gray-300">
                            <a href="mailto:info@makinaelektrike.al" className="hover:underline">info@makinaelektrike.al</a>
                        </p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-cyan text-white">
                            <Phone size={24} />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">{t('contactPage.phone')}</h3>
                        <p className="mt-1 text-gray-300">
                            <a href="tel:+35512345678" className="hover:underline">+355 12 345 678</a>
                        </p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gray-cyan text-white">
                            <MapPin size={24} />
                        </div>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-medium text-white">{t('contactPage.address')}</h3>
                        <p className="mt-1 text-gray-300">{t('contactPage.addressDetails')}</p>
                    </div>
                </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-4">Send us a message</h3>
              <form action="#" method="POST" className="space-y-4">
                <div>
                  <label htmlFor="name" className="sr-only">Name</label>
                  <input type="text" name="name" id="name" autoComplete="name" className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 bg-white/10 border-gray-600 focus:ring-gray-cyan focus:border-gray-cyan rounded-md text-white" placeholder="Full name"/>
                </div>
                 <div>
                  <label htmlFor="email" className="sr-only">Email</label>
                  <input type="email" name="email" id="email" autoComplete="email" className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 bg-white/10 border-gray-600 focus:ring-gray-cyan focus:border-gray-cyan rounded-md text-white" placeholder="Email address"/>
                </div>
                 <div>
                  <label htmlFor="message" className="sr-only">Message</label>
                  <textarea id="message" name="message" rows={4} className="block w-full shadow-sm py-3 px-4 placeholder-gray-400 bg-white/10 border-gray-600 focus:ring-gray-cyan focus:border-gray-cyan rounded-md text-white" placeholder="Your message"></textarea>
                </div>
                <div>
                  <button type="submit" className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-vivid-red hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-vivid-red transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-vivid-red/50">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <section className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center">{t('contactPage.faqTitle')}</h2>
          <p className="mt-3 text-gray-300 text-center">{t('contactPage.faqSubtitle')}</p>
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

export default ContactPage;
