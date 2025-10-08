import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { DataContext } from '../contexts/DataContext';
import DealerCard from '../components/DealerCard';
import CustomSelect from '../components/CustomSelect';
import GoogleMap from '../components/GoogleMap';
import { Building, Car, Globe, ListFilter } from 'lucide-react';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';

const DealersListPage: React.FC = () => {
    const { t } = useTranslation();
    const { dealers: allDealers, loading } = useContext(DataContext);
    const [filteredDealers, setFilteredDealers] = useState(allDealers);
    const insights = t('dealersPage.insights', { returnObjects: true }) as Array<{ title: string; description: string }>;
    const faqItems = t('dealersPage.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>;

    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: t('dealersPage.metaTitle'),
        description: t('dealersPage.metaDescription'),
        itemListElement: allDealers.map((dealer, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: dealer.name,
            url: `${BASE_URL}/#/dealers/${dealer.id}`,
        })),
    };

    // Filter states
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [sortBy, setSortBy] = useState('name_asc');

    const filterOptions = useMemo(() => {
        const cities = [...new Set(allDealers.map(d => d.city))].sort();
        const brands = [...new Set(allDealers.flatMap(d => d.brands))].sort();
        const languages = [...new Set(allDealers.flatMap(d => d.languages))].sort();
        return { cities, brands, languages };
    }, [allDealers]);

    useEffect(() => {
        let dealers = [...allDealers];

        if (selectedCity) {
            dealers = dealers.filter(d => d.city === selectedCity);
        }
        if (selectedBrand) {
            dealers = dealers.filter(d => d.brands.includes(selectedBrand));
        }
        if (selectedLanguage) {
            dealers = dealers.filter(d => d.languages.includes(selectedLanguage));
        }

        dealers.sort((a, b) => {
            switch (sortBy) {
                case 'name_desc':
                    return b.name.localeCompare(a.name);
                case 'city_asc':
                    return a.city.localeCompare(b.city);
                case 'city_desc':
                    return b.city.localeCompare(a.city);
                case 'name_asc':
                default:
                    return a.name.localeCompare(b.name);
            }
        });

        setFilteredDealers(dealers);
    }, [allDealers, selectedCity, selectedBrand, selectedLanguage, sortBy]);

    const clearFilters = () => {
        setSelectedCity('');
        setSelectedBrand('');
        setSelectedLanguage('');
        setSortBy('name_asc');
    };

    const sortOptions = [
        { value: 'name_asc', label: t('dealersPage.sortOptions.name_asc') },
        { value: 'name_desc', label: t('dealersPage.sortOptions.name_desc') },
        { value: 'city_asc', label: t('dealersPage.sortOptions.city_asc') },
        { value: 'city_desc', label: t('dealersPage.sortOptions.city_desc') },
    ];
    
    const mapMarkers = useMemo(() => 
        filteredDealers.map(d => ({ lat: d.lat, lng: d.lng, title: d.name })),
        [filteredDealers]
    );

    if (loading) {
        return <div className="text-center py-10 text-white">Loading dealers...</div>;
    }

    return (
        <div className="py-12">
            <SEO
                title={t('dealersPage.metaTitle')}
                description={t('dealersPage.metaDescription')}
                keywords={t('dealersPage.metaKeywords', { returnObjects: true }) as string[]}
                canonical={`${BASE_URL}/#/dealers`}
                openGraph={{
                    title: t('dealersPage.metaTitle'),
                    description: t('dealersPage.metaDescription'),
                    url: `${BASE_URL}/#/dealers`,
                    type: 'website',
                    images: [DEFAULT_OG_IMAGE],
                }}
                twitter={{
                    title: t('dealersPage.metaTitle'),
                    description: t('dealersPage.metaDescription'),
                    image: DEFAULT_OG_IMAGE,
                    site: '@makinaelektrike',
                }}
                structuredData={structuredData}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-white">{t('dealersPage.title')}</h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">{t('dealersPage.subtitle')}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-12 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white text-center">{t('dealersPage.introTitle')}</h2>
                    <p className="mt-4 text-gray-300 leading-relaxed text-center max-w-4xl mx-auto">{t('dealersPage.introSubtitle')}</p>
                </div>

                <div className="relative z-20 bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6 mb-12">
                    <h2 className="text-xl font-bold text-white mb-4">{t('dealersPage.filters')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <CustomSelect
                            icon={<Building size={16} />}
                            placeholder={t('dealersPage.allCities')}
                            options={[{ value: '', label: t('dealersPage.allCities') }, ...filterOptions.cities.map(c => ({ value: c, label: c }))]}
                            value={selectedCity}
                            onChange={setSelectedCity}
                        />
                        <CustomSelect
                            icon={<Car size={16} />}
                            placeholder={t('dealersPage.allBrands')}
                            options={[{ value: '', label: t('dealersPage.allBrands') }, ...filterOptions.brands.map(b => ({ value: b, label: b }))]}
                            value={selectedBrand}
                            onChange={setSelectedBrand}
                        />
                        <CustomSelect
                             icon={<Globe size={16} />}
                            placeholder={t('dealersPage.allLanguages')}
                            options={[{ value: '', label: t('dealersPage.allLanguages') }, ...filterOptions.languages.map(l => ({ value: l, label: l }))]}
                            value={selectedLanguage}
                            onChange={setSelectedLanguage}
                        />
                        <CustomSelect
                            icon={<ListFilter size={16} />}
                            placeholder={t('dealersPage.sortBy')}
                            options={sortOptions}
                            value={sortBy}
                            onChange={setSortBy}
                        />
                        <button onClick={clearFilters} className="bg-vivid-red text-white font-bold py-2.5 px-6 rounded-md hover:bg-opacity-90 transition-colors h-[46px]">
                            {t('dealersPage.clearFilters')}
                        </button>
                    </div>
                </div>

                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-white mb-4 text-center">{t('dealersPage.mapTitle')}</h2>
                    <GoogleMap
                        center={{ lat: 41.3275, lng: 19.8187 }} // Centered on Tirana
                        zoom={8}
                        markers={mapMarkers}
                        className="h-[500px] w-full"
                        enableClustering={true}
                    />
                </div>

                {filteredDealers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredDealers.map(dealer => <DealerCard key={dealer.id} dealer={dealer} />)}
                    </div>
                ) : (
                    <p className="text-center text-gray-400 py-10">{t('dealersPage.noResults')}</p>
                )}

                <section className="mt-16">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-10 shadow-2xl">
                        <h2 className="text-3xl font-bold text-white text-center">{t('dealersPage.insightsTitle')}</h2>
                        <p className="mt-4 text-gray-300 text-center max-w-4xl mx-auto">{t('dealersPage.insightsSubtitle')}</p>
                        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                            {insights.map(item => (
                                <div key={item.title} className="bg-black/30 border border-gray-800 rounded-xl p-6">
                                    <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                                    <p className="mt-3 text-gray-300 leading-relaxed">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold text-white text-center">{t('dealersPage.faqTitle')}</h2>
                        <p className="mt-3 text-gray-300 text-center">{t('dealersPage.faqSubtitle')}</p>
                        <div className="mt-8 space-y-6">
                            {faqItems.map(faq => (
                                <div key={faq.question} className="bg-white/5 border border-white/10 rounded-xl p-6 shadow-lg">
                                    <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                                    <p className="mt-2 text-gray-300 leading-relaxed">{faq.answer}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default DealersListPage;