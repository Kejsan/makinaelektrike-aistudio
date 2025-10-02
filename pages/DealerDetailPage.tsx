import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dealer, Model } from '../types';
import { MapPin, Phone, Mail, Globe, ArrowLeft, Heart } from 'lucide-react';
import ModelCard from '../components/ModelCard';
import GoogleMap from '../components/GoogleMap';
import { useFavorites } from '../hooks/useFavorites';
import { DataContext } from '../contexts/DataContext';
import { initialDealerModels } from '../services/api';

const DealerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { dealers, models, loading } = useContext(DataContext);
    const [dealer, setDealer] = useState<Dealer | null>(null);
    const [dealerModels, setDealerModels] = useState<Model[]>([]);
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        if (id && !loading) {
            const currentDealer = dealers.find(d => d.id === id) || null;
            setDealer(currentDealer);

            if (currentDealer) {
                // This logic should ideally be in the data layer, but for now we simulate the join
                const modelIds = initialDealerModels
                    .filter(dm => dm.dealer_id === id)
                    .map(dm => dm.model_id);
                const availableModels = models.filter(m => modelIds.includes(m.id));
                setDealerModels(availableModels);
            }
        }
    }, [id, loading, dealers, models]);

    if (loading) return <div className="text-center py-10 text-white">Loading...</div>;
    if (!dealer) return <div className="text-center py-10 text-white">Dealer not found.</div>;

    const favorited = isFavorite(dealer.id);

    return (
        <div className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/dealers" className="inline-flex items-center text-gray-cyan hover:underline mb-8 group">
                    <ArrowLeft size={18} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    {t('dealerDetails.backLink')}
                </Link>

                <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                    <div className="lg:grid lg:grid-cols-3">
                        <div className="lg:col-span-2 relative">
                             <img src={dealer.image_url} alt={dealer.name} className="w-full h-64 lg:h-full object-cover"/>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:bg-gradient-to-r"></div>
                        </div>

                        <div className="p-8 space-y-6 relative">
                             <button
                                onClick={() => toggleFavorite(dealer.id)}
                                className="absolute top-6 right-6 z-10 p-3 bg-white/10 rounded-full text-white hover:text-vivid-red transition-colors"
                                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <Heart size={24} className={`${favorited ? 'fill-vivid-red text-vivid-red' : 'fill-transparent'}`} />
                            </button>
                            <h1 className="text-3xl font-extrabold text-white pr-12">{dealer.name}</h1>
                            <div className="space-y-4">
                                <h2 className="text-xl font-bold text-white">{t('dealerDetails.contactInfo')}</h2>
                                <p className="flex items-start text-gray-300"><MapPin className="text-gray-cyan mt-1 mr-3 flex-shrink-0" size={20} /><span>{dealer.address}</span></p>
                                {dealer.phone && <p className="flex items-center text-gray-300"><Phone className="text-gray-cyan mr-3" size={20} /><a href={`tel:${dealer.phone}`} className="hover:underline">{dealer.phone}</a></p>}
                                {dealer.email && <p className="flex items-center text-gray-300"><Mail className="text-gray-cyan mr-3" size={20} /><a href={`mailto:${dealer.email}`} className="hover:underline">{dealer.email}</a></p>}
                                {dealer.website && <p className="flex items-center text-gray-300"><Globe className="text-gray-cyan mr-3" size={20} /><a href={dealer.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Visit Website</a></p>}
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-white">{t('dealerDetails.brandsSold')}</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {dealer.brands.map(brand => <span key={brand} className="text-sm bg-gray-700/50 rounded-full px-3 py-1">{brand}</span>)}
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="font-semibold text-white">{t('dealerDetails.languagesSpoken')}</h3>
                                <p className="text-gray-300">{dealer.languages.join(', ')}</p>
                            </div>
                             {dealer.notes && <div>
                                <h3 className="font-semibold text-white">{t('dealerDetails.notes')}</h3>
                                <p className="text-gray-300">{dealer.notes}</p>
                            </div>}
                        </div>
                    </div>
                </div>
                 
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center mb-8 text-white">{t('dealerDetails.locationOnMap')}</h2>
                    <GoogleMap
                        center={{ lat: dealer.lat, lng: dealer.lng }}
                        zoom={15}
                        markers={[{ lat: dealer.lat, lng: dealer.lng, title: dealer.name }]}
                        className="h-96 w-full"
                    />
                </div>

                 <div className="mt-16">
                    <h2 className="text-3xl font-bold text-center mb-8 text-white">{t('dealerDetails.modelsAvailable')}</h2>
                    {dealerModels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                           {dealerModels.map(model => <ModelCard key={model.id} model={model} />)}
                        </div>
                    ) : (
                         <p className="text-center text-gray-400">No specific models listed for this dealer.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DealerDetailPage;