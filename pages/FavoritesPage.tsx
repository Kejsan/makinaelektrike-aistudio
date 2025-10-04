import React, { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFavorites } from '../hooks/useFavorites';
import { Dealer, Model } from '../types';
import DealerCard from '../components/DealerCard';
import ModelCard from '../components/ModelCard';
import { Heart } from 'lucide-react';
import { DataContext } from '../contexts/DataContext';

const FavoritesPage: React.FC = () => {
    const { t } = useTranslation();
    const { favorites, loading: favoritesLoading } = useFavorites();
    const { dealers, models, loading: dataLoading } = useContext(DataContext);

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

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white">{t('favoritesPage.title')}</h1>
                    <p className="mt-4 text-lg text-gray-400">{t('favoritesPage.subtitle')}</p>
                </div>

                {dataLoading || favoritesLoading ? (
                    <div className="text-center text-white">Loading favorites...</div>
                ) : (
                    <>
                        <section>
                            <h2 className="text-3xl font-bold text-white mb-8">{t('favoritesPage.dealers')}</h2>
                            {favoriteDealers.length > 0 ? (
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
                             {favoriteModels.length > 0 ? (
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
                    </>
                )}
            </div>
        </div>
    );
};

export default FavoritesPage;
