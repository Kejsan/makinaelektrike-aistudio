import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dealer } from '../types';
import { MapPin, Heart, ArrowRight } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';

const DealerCard: React.FC<{ dealer: Dealer }> = ({ dealer }) => {
    const { t } = useTranslation();
    const { isFavorite, toggleFavorite } = useFavorites();
    const favorited = isFavorite(dealer.id);

    return (
        <div className="relative bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-neon-cyan h-full flex flex-col overflow-hidden">
            <button
                onClick={() => toggleFavorite(dealer.id)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full text-white hover:text-vivid-red transition-colors"
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
            >
                <Heart size={20} className={`${favorited ? 'fill-vivid-red text-vivid-red' : 'fill-transparent'}`} />
            </button>
            <Link to={`/dealers/${dealer.id}`} className="flex flex-col h-full">
                <div className="relative h-48 overflow-hidden">
                    <img 
                        src={dealer.image_url || 'https://picsum.photos/seed/placeholder/800/600'} 
                        alt={dealer.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white pr-10">{dealer.name}</h3>
                        <p className="text-gray-400 flex items-center mt-2 text-sm">
                            <MapPin size={14} className="mr-2 text-gray-cyan" />
                            {dealer.city}
                        </p>
                        <div className="mt-4">
                            <h4 className="text-sm font-semibold text-gray-400 mb-2">Brands</h4>
                            <div className="flex flex-wrap gap-2">
                                {dealer.brands.slice(0, 3).map(brand => (
                                    <span key={brand} className="text-xs bg-gray-700/50 rounded-full px-3 py-1">{brand}</span>
                                ))}
                                {dealer.brands.length > 3 && <span className="text-xs bg-gray-700/50 rounded-full px-3 py-1">+{dealer.brands.length - 3} more</span>}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/10 text-right">
                        <span className="text-gray-cyan font-semibold group-hover:text-white transition-colors flex items-center justify-end text-sm">
                            {t('dealersPage.viewDetails')} <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default DealerCard;