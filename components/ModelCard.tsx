import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Model } from '../types';
import { Heart, ArrowRight, Battery, Gauge } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

const ModelCard: React.FC<{ model: Model }> = ({ model }) => {
    const { t } = useTranslation();
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorited = isFavorite(model.id);

    return (
        <div className="relative bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-cyan h-full flex flex-col">
             <button
                onClick={() => toggleFavorite(model.id)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:text-vivid-red transition-colors"
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
                <Heart size={20} className={`${favorited ? 'fill-vivid-red text-vivid-red' : 'fill-transparent'}`} />
            </button>
            <Link to={`/models/${model.id}`} className="flex flex-col h-full">
                <div className="relative overflow-hidden h-48">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" src={model.image_url} alt={`${model.brand} ${model.model_name}`} />
                    <div className="absolute top-4 left-4 bg-gray-cyan/80 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">{model.body_type}</div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <p className="text-sm font-semibold text-gray-400">{model.brand}</p>
                        <h3 className="text-xl font-bold text-white mt-1">{model.model_name}</h3>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <Battery className="mx-auto text-gray-cyan mb-1" size={20}/>
                                <p className="font-bold text-white">{model.battery_capacity} kWh</p>
                            </div>
                            <div className="text-center p-3 bg-white/5 rounded-lg">
                                <Gauge className="mx-auto text-gray-cyan mb-1" size={20}/>
                                <p className="font-bold text-white">{model.range_wltp} km</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10 text-right">
                        <span className="text-gray-cyan font-semibold group-hover:text-white transition-colors flex items-center justify-end text-sm">
                            {t('modelsPage.viewDetails')} <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ModelCard;