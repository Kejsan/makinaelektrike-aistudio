import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../hooks/useFavorites';
import { Dealer, Model } from '../types';
import DealerCard from '../components/DealerCard';
import ModelCard from '../components/ModelCard';
import { Heart } from 'lucide-react';
import { DataContext } from '../contexts/DataContext';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';

const FavoritesPage: React.FC = () => {
    const { t } = useTranslation();
    const { favorites, loading: favoritesLoading } = useFavorites();
    const { dealers, models, loading: dataLoading } = useContext(DataContext);
    const insights = t('favoritesPage.insights', { returnObjects: true }) as Array<{ title: string; description: string }>;
    const faqItems = t('favoritesPage.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>;

    const favoriteDealers = useMemo<Dealer[]>(() => {
        if (!favorites.length) {
            return [];
        }

        const favoriteIds = new Set(favorites);
        return dealers.filter(dealer => favoriteIds.has(dealer.id));
    }, [dealers, favorites]);

    const favoriteModels = useMemo<Model[]>(() => {
        if (!favorites.length) {
            return [];
        }

        const favoriteIds = new Set(favorites);
        return models.filter(model => favoriteIds.has(model.id));
    }, [favorites, models]);

    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: t('favoritesPage.metaTitle'),
            description: t('favoritesPage.metaDescription'),
            url: `${BASE_URL}/favorites/`,
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Favorite Dealers',
            itemListElement: favoriteDealers.map((dealer, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: dealer.name,
                url: `${BASE_URL}/dealers/${dealer.id}`,
            })),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Favorite Models',
            itemListElement: favoriteModels.map((model, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: `${model.brand} ${model.model_name}`,
                url: `${BASE_URL}/models/${model.id}`,
            })),
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
        <div className="min-h-screen py-12">
            <SEO
                title={t('favoritesPage.metaTitle')}
                description={t('favoritesPage.metaDescription')}
                keywords={t('favoritesPage.metaKeywords', { returnObjects: true }) as string[]}
                canonical={`${BASE_URL}/favorites/`}
                openGraph={{
                    title: t('favoritesPage.metaTitle'),
                    description: t('favoritesPage.metaDescription'),
                    url: `${BASE_URL}/favorites/`,
                    type: 'website',
                    images: [DEFAULT_OG_IMAGE],
                }}
                twitter={{
                    title: t('favoritesPage.metaTitle'),
                    description: t('favoritesPage.metaDescription'),
                    image: DEFAULT_OG_IMAGE,
                    site: '@makinaelektrike',
                }}
                structuredData={structuredData}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">{t('favoritesPage.title')}</h1>
                    <p className="mt-4 text-lg text-gray-400">{t('favoritesPage.subtitle')}</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl mb-12">
                    <h2 className="text-2xl font-bold text-white text-center">{t('favoritesPage.introTitle')}</h2>
                    <p className="mt-4 text-gray-300 text-center max-w-3xl mx-auto">{t('favoritesPage.introSubtitle')}</p>
                </div>

                <section>
                    <h2 className="text-3xl font-bold text-white mb-8">{t('favoritesPage.dealers')}</h2>
                    {dataLoading || favoritesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <DealerCard key={`dealer-skeleton-${index}`} isLoading />
                            ))}
                        </div>
                    ) : favoriteDealers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {favoriteDealers.map(dealer => <DealerCard key={dealer.id} dealer={dealer} />)}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white/5 rounded-lg border border-white/10">
                            <Heart className="mx-auto text-gray-500" size={40}/>
                            <p className="mt-4 text-gray-400">{t('favoritesPage.noDealers')}</p>
                        </div>
                    )}
                </section>

                <section className="mt-16">
                     <h2 className="text-3xl font-bold text-white mb-8">{t('favoritesPage.models')}</h2>
                     {dataLoading || favoritesLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={`model-skeleton-${index}`} className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
                                    <div className="mb-4 h-40 w-full rounded-lg bg-white/10" />
                                    <div className="h-6 w-2/3 rounded bg-white/10" />
                                    <div className="mt-3 h-4 w-1/2 rounded bg-white/10" />
                                </div>
                            ))}
                        </div>
                    ) : favoriteModels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {favoriteModels.map(model => <ModelCard key={model.id} model={model} />)}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white/5 rounded-lg border border-white/10">
                            <Heart className="mx-auto text-gray-500" size={40}/>
                            <p className="mt-4 text-gray-400">{t('favoritesPage.noModels')}</p>
                        </div>
                    )}
                </section>

                <section className="mt-16">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-10 shadow-2xl">
                        <h2 className="text-3xl font-bold text-white text-center">{t('favoritesPage.insightsTitle')}</h2>
                        <p className="mt-4 text-gray-300 text-center max-w-4xl mx-auto">{t('favoritesPage.insightsSubtitle')}</p>
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

                <section className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center">{t('favoritesPage.faqTitle')}</h2>
                    <p className="mt-3 text-gray-300 text-center">{t('favoritesPage.faqSubtitle')}</p>
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

export default FavoritesPage;
