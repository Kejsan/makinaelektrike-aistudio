import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getBlogPosts } from '../services/api';
import { BlogPost } from '../types';
import { Car, Building } from 'lucide-react';
import DealerCard from '../components/DealerCard';
import ModelCard from '../components/ModelCard';
import BlogCard from '../components/BlogCard';
import { DataContext } from '../contexts/DataContext';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { dealers, models } = useContext(DataContext);

  const [featuredDealers, setFeaturedDealers] = useState(dealers.filter(d => d.isFeatured));
  const [featuredModels, setFeaturedModels] = useState(models.filter(m => m.isFeatured));
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [searchCity, setSearchCity] = useState('');
  const [searchBrand, setSearchBrand] = useState('');
  const [filteredDealersForSearch, setFilteredDealersForSearch] = useState(dealers.filter(d => d.isFeatured));

  useEffect(() => {
    // Update featured lists when context data changes
    setFeaturedDealers(dealers.filter(d => d.isFeatured));
    setFeaturedModels(models.filter(m => m.isFeatured));

    // Initial search result should be the featured dealers
    setFilteredDealersForSearch(dealers.filter(d => d.isFeatured));
  }, [dealers, models]);

  useEffect(() => {
    getBlogPosts().then(allPosts => setLatestPosts(allPosts.slice(0, 3)));
  }, []);

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
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-110" 
          style={{ backgroundImage: "url('https://raw.githubusercontent.com/Kejsan/makinaelektrike-aistudio/refs/heads/main/BYD%20SEAL.jpg?token=GHSAT0AAAAAADHR43C7YQC32PWA4FOJV7CE2G64O2A')" }}
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

      {/* Featured Dealers */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">{t('home.featuredDealers')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredDealersForSearch.length > 0 ? (
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
    </div>
  );
};

export default HomePage;
