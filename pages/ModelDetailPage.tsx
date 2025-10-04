import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Model, Dealer } from '../types';
import { Battery, Zap, Gauge, ChevronsRight, ArrowUpRight, ArrowLeft, Car, Users, Power, Bolt, Heart } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { DataContext } from '../contexts/DataContext';

const SpecItem: React.FC<{ icon: React.ReactNode, label: string, value?: string | number | null }> = ({ icon, label, value }) => (
    <div className="flex flex-col items-center justify-center p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-center transition-all duration-300 hover:bg-white/10 hover:border-gray-cyan/50">
        <div className="text-gray-cyan">{icon}</div>
        <dt className="text-sm font-medium text-gray-400 mt-2">{label}</dt>
        <dd className="mt-1 text-lg font-semibold text-white">{value || 'N/A'}</dd>
    </div>
);

const ModelDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { models, getDealersForModel, loading } = useContext(DataContext);
    const model = useMemo<Model | null>(() => (models.find(m => m.id === id) ?? null), [models, id]);
    const dealers = useMemo<Dealer[]>(() => (model ? getDealersForModel(model.id) : []), [getDealersForModel, model]);
    const [scrollY, setScrollY] = useState(0);
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    if (loading) return <div className="text-center py-10 text-white">Loading...</div>;
    if (!model) return <div className="text-center py-10 text-white">Model not found.</div>;
    
    const imageScale = 1 + scrollY / 8000;
    const favorited = isFavorite(model.id);

    return (
        <div className="">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                 <Link to="/models" className="inline-flex items-center text-gray-cyan hover:underline mb-8 group">
                    <ArrowLeft size={18} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    {t('modelDetails.backLink')}
                </Link>

                <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-start">
                    <div className="top-24 sticky">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <p className="text-lg font-semibold text-gray-cyan">{model.brand}</p>
                                <h1 className="text-4xl font-extrabold text-white mt-1">{model.model_name}</h1>
                            </div>
                             <button
                                onClick={() => toggleFavorite(model.id)}
                                className="p-3 bg-white/10 rounded-full text-white hover:text-vivid-red transition-colors flex-shrink-0"
                                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <Heart size={24} className={`${favorited ? 'fill-vivid-red text-vivid-red' : 'fill-transparent'}`} />
                            </button>
                        </div>
                        <div className="overflow-hidden mt-6 rounded-xl shadow-2xl">
                             <img 
                                src={model.image_url} 
                                alt={`${model.brand} ${model.model_name}`} 
                                className="w-full h-auto transition-transform duration-100 ease-out"
                                style={{ transform: `scale(${imageScale})` }}
                             />
                        </div>
                    </div>
                    <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-8 mt-8 lg:mt-0">
                        <h2 className="text-2xl font-bold text-white">{t('modelDetails.specifications')}</h2>
                        <dl className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <SpecItem icon={<Battery size={24} />} label={t('modelDetails.battery')} value={model.battery_capacity ? `${model.battery_capacity} kWh` : null} />
                            <SpecItem icon={<Gauge size={24} />} label={t('modelDetails.range')} value={model.range_wltp ? `${model.range_wltp} km` : null} />
                            <SpecItem icon={<Zap size={24} />} label={t('modelDetails.power')} value={model.power_kw ? `${model.power_kw} kW` : null} />
                            <SpecItem icon={<ChevronsRight size={24} />} label={t('modelDetails.torque')} value={model.torque_nm ? `${model.torque_nm} Nm` : null} />
                            <SpecItem icon={<ArrowUpRight size={24} />} label={t('modelDetails.acceleration')} value={model.acceleration_0_100 ? `${model.acceleration_0_100} s` : null} />
                            <SpecItem icon={<Gauge size={24} />} label={t('modelDetails.topSpeed')} value={model.top_speed ? `${model.top_speed} km/h` : null} />
                            <SpecItem icon={<Car size={24} />} label={t('modelDetails.drive')} value={model.drive_type} />
                            <SpecItem icon={<Users size={24} />} label={t('modelDetails.seats')} value={model.seats} />
                            <SpecItem icon={<Power size={24} />} label={t('modelDetails.chargingAC')} value={model.charging_ac} />
                            <SpecItem icon={<Bolt size={24} />} label={t('modelDetails.chargingDC')} value={model.charging_dc} />
                        </dl>
                        {model.notes && (
                             <div className="mt-8">
                                <h3 className="text-xl font-bold mb-2 text-white">{t('modelDetails.notes')}</h3>
                                <p className="text-gray-300 prose prose-invert">{model.notes}</p>
                             </div>
                         )}
                    </div>
                </div>

                <div className="mt-20">
                    <h2 className="text-2xl font-bold text-center mb-8 text-white">{t('modelDetails.availableAt')}</h2>
                    {dealers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dealers.map(dealer => (
                                <div key={dealer.id} className="bg-white/5 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-lg">
                                    <h3 className="font-bold text-lg text-white">{dealer.name}</h3>
                                    <p className="text-gray-400">{dealer.city}</p>
                                    <Link to={`/dealers/${dealer.id}`} className="mt-4 inline-block bg-vivid-red text-white font-semibold py-2 px-4 rounded-md hover:bg-opacity-90 transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-vivid-red/50">
                                        {t('modelDetails.contactDealer')}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-gray-400">Information on availability coming soon.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModelDetailPage;
