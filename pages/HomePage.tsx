import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { BlogPost } from '../types';
import { Car, Building } from 'lucide-react';
import DealerCard from '../components/DealerCard';
import ModelCard from '../components/ModelCard';
import BlogCard from '../components/BlogCard';
import { DataContext } from '../contexts/DataContext';
import heroDashboard from '../assets/BYD SEAL.jpg';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { dealers, models, blogPosts, loading: dataLoading } = useContext(DataContext);

  const [featuredDealers, setFeaturedDealers] = useState(dealers.filter(d => d.isFeatured));
  const [featuredModels, setFeaturedModels] = useState(models.filter(m => m.isFeatured));
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [filteredDealersForSearch, setFilteredDealersForSearch] = useState(dealers.filter(d => d.isFeatured));
  const valueHighlights = t('home.valueHighlights', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const insightItems = t('home.insights', { returnObjects: true }) as Array<{ title: string; description: string }>;
  const faqItems = t('home.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>;

  const heroImageUrl = typeof window !== 'undefined'
    ? new URL(heroDashboard, window.location.origin).toString()
    : heroDashboard;

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Makina Elektrike',
      url: BASE_URL,
      description: t('home.metaDescription'),
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/#/models?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Makina Elektrike',
      url: BASE_URL,
      sameAs: [
        'https://www.facebook.com',
        'https://www.instagram.com',
        'https://www.linkedin.com',
      ],
      description: t('home.metaDescription'),
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

  useEffect(() => {
    // Update featured lists when context data changes
    setFeaturedDealers(dealers.filter(d => d.isFeatured));
    setFeaturedModels(models.filter(m => m.isFeatured));

    // Initial search result should be the featured dealers
    setFilteredDealersForSearch(dealers.filter(d => d.isFeatured));
  }, [dealers, models]);

  useEffect(() => {
    setLatestPosts(blogPosts.slice(0, 3));
  }, [blogPosts]);

  useEffect(() => {
    let results = dealers;

    const city = searchCity.trim().toLowerCase();
    const brand = searchBrand.trim().toLowerCase();

    if (city === '' && brand === '') {
      setFilteredDealersForSearch(featuredDealers);
      return;
    }

    if (city) {
      results = results.filter(d => 
        d.city.toLowerCase().includes(city)
      );
    }

    if (brand) {
      results = results.filter(d => 
        d.brands.some(b => b.toLowerCase().includes(brand))
      );
    }

    setFilteredDealersForSearch(results.slice(0, 4));
  }, [searchCity, searchBrand, dealers, featuredDealers]);


  return (
    <div>
      <SEO
        title={t('home.metaTitle')}
        description={t('home.metaDescription')}
        keywords={t('home.metaKeywords', { returnObjects: true }) as string[]}
        canonical={`${BASE_URL}/#/`}
        openGraph={{
          title: t('home.metaTitle'),
          description: t('home.metaDescription'),
          url: `${BASE_URL}/#/`,
          type: 'website',
          images: [DEFAULT_OG_IMAGE, heroImageUrl],
        }}
        twitter={{
          title: t('home.metaTitle'),
          description: t('home.metaDescription'),
          image: DEFAULT_OG_IMAGE,
          site: '@makinaelektrike',
        }}
        structuredData={structuredData}
      />
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center scale-110"
          style={{ backgroundImage: `url(${heroDashboard})` }}
        ></div>
        <div className="absolute inset-0 bg-[#00001a]/60"></div>
        <div className="relative z-10 px-4 flex flex-col items-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight" style={{textShadow: '0 0 20px rgba(84, 160, 155, 0.5)'}}>{t('home.heroTitle')}</h1>
          <p className="mt-4 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">{t('home.heroSubtitle')}</p>
          <a href="#search-section" className="mt-8 inline-block bg-vivid-red text-white font-bold py-3 px-8 rounded-full hover:bg-opacity-90 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-vivid-red/50">
            {t('home.heroCta')}
          </a>
        </div>
      </section>

      {/* Search Section */}
      <section id="search-section" className="py-16 -mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-white">{t('home.searchTitle')}</h2>
          <div className="bg-white/5 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-300 mb-2">{t('home.cityPlaceholder')}</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input type="text" id="city" placeholder={t('home.cityPlaceholder')} className="pl-10 block w-full bg-white/10 border-gray-600 rounded-md shadow-sm focus:ring-gray-cyan focus:border-gray-cyan text-white py-2.5" value={searchCity} onChange={(e) => setSearchCity(e.target.value)} />
              </div>
            </div>
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-2">{t('home.brandPlaceholder')}</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <input type="text" id="brand" placeholder={t('home.brandPlaceholder')} className="pl-10 block w-full bg-white/10 border-gray-600 rounded-md shadow-sm focus:ring-gray-cyan focus:border-gray-cyan text-white py-2.5" value={searchBrand} onChange={(e) => setSearchBrand(e.target.value)} />
              </div>
            </div>
            <button className="w-full bg-gray-cyan text-white font-bold py-2.5 px-6 rounded-md hover:bg-opacity-90 transition-colors h-[46px]">
              {t('home.searchButton')}
            </button>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">{t('home.valueTitle')}</h2>
            <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">{t('home.valueSubtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {valueHighlights.map(highlight => (
              <div key={highlight.title} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-6 shadow-xl">
                <h3 className="text-xl font-semibold text-white">{highlight.title}</h3>
                <p className="mt-3 text-gray-300 leading-relaxed">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Dealers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">{t('home.featuredDealers')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dataLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <DealerCard key={`featured-dealer-skeleton-${index}`} isLoading />
              ))
            ) : filteredDealersForSearch.length > 0 ? (
              filteredDealersForSearch.map(dealer => <DealerCard key={dealer.id} dealer={dealer} />)
            ) : (
              <p className="col-span-full text-center text-gray-400">No dealers found matching your search.</p>
            )}
          </div>
          <div className="mt-12 text-center">
            <Link to="/dealers" className="inline-block bg-gray-cyan text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-gray-cyan/50">
              {t('home.seeAllDealers')}
            </Link>
          </div>
        </div>
      </section>

      {/* Market Insights */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-10 shadow-2xl">
            <div className="md:flex md:items-start md:justify-between gap-10">
              <div className="md:w-1/3 mb-8 md:mb-0">
                <h2 className="text-3xl font-bold text-white">{t('home.insightsTitle')}</h2>
                <p className="mt-4 text-gray-300 leading-relaxed">{t('home.insightsSubtitle')}</p>
              </div>
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {insightItems.map(item => (
                  <div key={item.title} className="bg-black/30 border border-gray-700 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-3 text-gray-300 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">{t('home.featuredModels')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {featuredModels.map(model => <ModelCard key={model.id} model={model} />)}
          </div>
           <div className="mt-12 text-center">
            <Link to="/models" className="inline-block bg-gray-cyan text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-gray-cyan/50">
              {t('home.seeAllModels')}
            </Link>
          </div>
        </div>
      </section>

      {/* From Our Blog */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">{t('home.fromOurBlog')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPosts.map(post => <BlogCard key={post.id} post={post} />)}
          </div>
          <div className="mt-12 text-center">
            <Link to="/blog" className="inline-block bg-gray-cyan text-white font-bold py-3 px-8 rounded-md hover:bg-opacity-90 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-gray-cyan/50">
              {t('home.seeAllPosts')}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white">{t('home.faqTitle')}</h2>
            <p className="mt-3 text-gray-300 max-w-3xl mx-auto">{t('home.faqSubtitle')}</p>
          </div>
          <div className="space-y-6">
            {faqItems.map(faq => (
              <div key={faq.question} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-white">{faq.question}</h3>
                <p className="mt-3 text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
