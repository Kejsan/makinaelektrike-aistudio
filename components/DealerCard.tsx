import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Dealer } from '../types';
import { MapPin, Heart, ArrowRight, ShieldAlert } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { DEALERSHIP_PLACEHOLDER_IMAGE } from '../constants/media';

interface DealerCardProps {
  dealer?: Dealer | null;
  isLoading?: boolean;
}

const DealerCard: React.FC<DealerCardProps> = ({ dealer, isLoading = false }) => {
  const { t } = useTranslation();
  const { isFavorite, toggleFavorite } = useFavorites();

  if (isLoading || !dealer) {
    return (
      <div className="relative flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-white/5 bg-white/5 p-6 backdrop-blur-md">
        <div className="mb-4 h-40 w-full rounded-lg bg-white/10" />
        <div className="h-6 w-3/4 rounded bg-white/10" />
        <div className="mt-3 h-4 w-1/2 rounded bg-white/10" />
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="h-6 w-16 rounded-full bg-white/10" />
          <span className="h-6 w-20 rounded-full bg-white/10" />
          <span className="h-6 w-14 rounded-full bg-white/10" />
        </div>
      </div>
    );
  }

  const favorited = isFavorite(dealer.id);
  const imageUrl = dealer.image_url || dealer.imageGallery?.[0] || DEALERSHIP_PLACEHOLDER_IMAGE;
  const city = dealer.city || t('common.unknownCity', { defaultValue: 'Unknown location' });
  const approved = dealer.approved ?? true;

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-neon-cyan">
      <button
        onClick={() => toggleFavorite(dealer.id)}
        className="absolute right-4 top-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:text-vivid-red"
        aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart size={20} className={`${favorited ? 'fill-vivid-red text-vivid-red' : 'fill-transparent'}`} />
      </button>
      <Link to={`/dealers/${dealer.id}`} className="flex h-full flex-col">
        <div className="relative h-48 overflow-hidden">
          <img
            src={imageUrl}
            alt={dealer.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {!approved && (
            <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
              <ShieldAlert size={14} />
              {t('dealersPage.pendingApproval', { defaultValue: 'Pending approval' })}
            </div>
          )}
        </div>
        <div className="flex flex-grow flex-col p-6">
          <div className="flex-grow">
            <h3 className="pr-10 text-xl font-bold text-white">{dealer.name}</h3>
            <p className="mt-2 flex items-center text-sm text-gray-400">
              <MapPin size={14} className="mr-2 text-gray-cyan" />
              {city}
            </p>
            {dealer.brands?.length ? (
              <div className="mt-4">
                <h4 className="mb-2 text-sm font-semibold text-gray-400">{t('dealerDetails.brandsSold')}</h4>
                <div className="flex flex-wrap gap-2">
                  {dealer.brands.slice(0, 3).map(brand => (
                    <span key={brand} className="rounded-full bg-gray-700/50 px-3 py-1 text-xs">
                      {brand}
                    </span>
                  ))}
                  {dealer.brands.length > 3 && (
                    <span className="rounded-full bg-gray-700/50 px-3 py-1 text-xs">+{dealer.brands.length - 3}</span>
                  )}
                </div>
              </div>
            ) : null}
          </div>
          <div className="mt-6 border-t border-white/10 pt-4 text-right">
            <span className="flex items-center justify-end text-sm font-semibold text-gray-cyan transition-colors group-hover:text-white">
              {t('dealersPage.viewDetails')}{' '}
              <ArrowRight size={16} className="ml-2 transition-transform group-hover:-translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default DealerCard;
