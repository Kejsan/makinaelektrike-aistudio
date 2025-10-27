import React, { useMemo, useContext, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dealer, Model, DealerModel } from '../types';
import {
    MapPin,
    Phone,
    Mail,
    Globe,
    ArrowLeft,
    ArrowRight,
    Heart,
    ShieldAlert,
    ShieldCheck,
    SlidersHorizontal,
    ToggleLeft,
    ToggleRight,
    Battery,
    Gauge,
} from 'lucide-react';
import GoogleMap from '../components/GoogleMap';
import { useFavorites } from '../hooks/useFavorites';
import { DataContext } from '../contexts/DataContext';
import SEO from '../components/SEO';
import { BASE_URL } from '../constants/seo';
import { DEALERSHIP_PLACEHOLDER_IMAGE, MODEL_PLACEHOLDER_IMAGE } from '../constants/media';
import GallerySection from '../components/GallerySection';
import { useAuth } from '../contexts/AuthContext';
import {
    formatCurrency,
    formatGuarantee,
    normalizePaymentMethods,
    formatPaymentMethodLabel,
    safeNumber,
} from '../utils/format';

const DealerDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    const { dealers, loading, dealerModels: dealerModelLinks, models } = useContext(DataContext);
    const { role } = useAuth();
    const isAdmin = role === 'admin';
    const [sortOption, setSortOption] = useState<'brand' | 'price' | 'range'>('brand');
    const [showInactive, setShowInactive] = useState(false);
    const dealer = useMemo<Dealer | null>(() => (dealers.find(d => d.id === id) ?? null), [dealers, id]);
    const modelsById = useMemo(() => {
        const map = new Map<string, Model>();
        models.forEach(model => {
            map.set(model.id, model);
        });
        return map;
    }, [models]);

    type DealerModelWithMetadata = {
        model: Model;
        metadata: DealerModel;
        price: number | null;
        currency?: string;
        paymentMethods: string[];
        inactive: boolean;
    };

    const dealerModelEntries = useMemo<DealerModelWithMetadata[]>(() => {
        if (!dealer) {
            return [];
        }

        return dealerModelLinks
            .filter(link => link.dealer_id === dealer.id)
            .map(link => {
                const model = modelsById.get(link.model_id);
                if (!model) {
                    return null;
                }

                return {
                    model,
                    metadata: link,
                    price: safeNumber(link.price ?? null),
                    currency: link.currency ?? undefined,
                    paymentMethods: normalizePaymentMethods(link.payment_methods),
                    inactive: link.active === false || link.status === 'inactive',
                } satisfies DealerModelWithMetadata;
            })
            .filter((entry): entry is DealerModelWithMetadata => entry !== null);
    }, [dealer, dealerModelLinks, modelsById]);

    const hasInactiveModels = useMemo(() => dealerModelEntries.some(entry => entry.inactive), [dealerModelEntries]);

    const filteredEntries = useMemo(() => {
        if (isAdmin && showInactive) {
            return dealerModelEntries;
        }
        return dealerModelEntries.filter(entry => !entry.inactive);
    }, [dealerModelEntries, isAdmin, showInactive]);

    const sortedEntries = useMemo(() => {
        const entries = [...filteredEntries];

        switch (sortOption) {
            case 'price':
                return entries.sort((a, b) => {
                    const priceA = a.price ?? Number.POSITIVE_INFINITY;
                    const priceB = b.price ?? Number.POSITIVE_INFINITY;
                    return priceA - priceB;
                });
            case 'range':
                return entries.sort((a, b) => {
                    const rangeA = safeNumber(a.model.range_wltp ?? null) ?? -Infinity;
                    const rangeB = safeNumber(b.model.range_wltp ?? null) ?? -Infinity;
                    return rangeB - rangeA;
                });
            case 'brand':
            default:
                return entries.sort((a, b) => {
                    const brandComparison = a.model.brand.localeCompare(b.model.brand, undefined, { sensitivity: 'base' });
                    if (brandComparison !== 0) {
                        return brandComparison;
                    }
                    return a.model.model_name.localeCompare(b.model.model_name, undefined, { sensitivity: 'base' });
                });
        }
    }, [filteredEntries, sortOption]);

    const faqItems = t('dealerDetails.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>;
    const favorites = useFavorites();

    if (loading) return <div className="text-center py-10 text-white">Loading...</div>;
    if (!dealer) {
        return (
            <div className="text-center py-10 text-white">
                <SEO
                    title="Dealeri nuk u gjet | Makina Elektrike"
                    description="Dealeri i kërkuar nuk ekziston më ose është zhvendosur."
                    canonical={id ? `${BASE_URL}/dealers/${id}/` : `${BASE_URL}/dealers/`}
                    openGraph={{
                        title: 'Dealeri nuk u gjet | Makina Elektrike',
                        description: 'Dealeri i kërkuar nuk ekziston më ose është zhvendosur.',
                        url: id ? `${BASE_URL}/dealers/${id}/` : `${BASE_URL}/dealers/`,
                        type: 'business.business',
                    }}
                    twitter={{
                        title: 'Dealeri nuk u gjet | Makina Elektrike',
                        description: 'Dealeri i kërkuar nuk ekziston më ose është zhvendosur.',
                        site: '@makinaelektrike',
                    }}
                />
                Dealer not found.
            </div>
        );
    }

    const dealerFavorited = favorites.isFavorite(dealer.id);
    const galleryImages = (dealer.imageGallery ?? []).filter(Boolean);
    const heroImage = dealer.image_url || galleryImages[0] || DEALERSHIP_PLACEHOLDER_IMAGE;
    const isApproved = dealer.approved ?? true;
    const canonical = `${BASE_URL}/dealers/${dealer.id}/`;
    const description = t('dealerDetails.metaDescription', {
        name: dealer.name,
        city: dealer.city,
        brands: dealer.brands.join(', '),
    });
    const keywords = [
        dealer.name,
        dealer.city,
        ...dealer.brands,
        `${dealer.city} electric cars`,
        'Makina Elektrike dealer',
    ];
    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'AutoDealer',
            name: dealer.name,
            url: canonical,
            image: heroImage,
            telephone: dealer.phone ?? undefined,
            email: dealer.email ?? undefined,
            address: {
                '@type': 'PostalAddress',
                streetAddress: dealer.address ?? dealer.city,
                addressLocality: dealer.city,
                addressCountry: 'AL',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: dealer.lat,
                longitude: dealer.lng,
            },
            makesOffer: dealer.brands.map(brand => ({
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Product',
                    name: `${brand} electric vehicles`,
                },
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
        <div className="py-12">
            <SEO
                title={`${dealer.name} | ${t('dealerDetails.metaTitleSuffix')}`}
                description={description}
                keywords={keywords}
                canonical={canonical}
                openGraph={{
                    title: `${dealer.name} | ${t('dealerDetails.metaTitleSuffix')}`,
                    description,
                    url: canonical,
                    type: 'business.business',
                    images: [heroImage],
                }}
                twitter={{
                    title: `${dealer.name} | ${t('dealerDetails.metaTitleSuffix')}`,
                    description,
                    image: heroImage,
                    site: '@makinaelektrike',
                }}
                structuredData={structuredData}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/dealers" className="inline-flex items-center text-gray-cyan hover:underline mb-8 group">
                    <ArrowLeft size={18} className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
                    {t('dealerDetails.backLink')}
                </Link>

                <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden">
                    <div className="lg:grid lg:grid-cols-3">
                        <div className="lg:col-span-2 relative">
                             <img src={heroImage} alt={dealer.name} className="w-full h-64 lg:h-full object-cover"/>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent lg:bg-gradient-to-r"></div>
                        </div>

                        <div className="p-8 space-y-6 relative">
                             <button
                                onClick={() => favorites.toggleFavorite(dealer.id)}
                                className="absolute top-6 right-6 z-10 p-3 bg-white/10 rounded-full text-white hover:text-vivid-red transition-colors"
                                aria-label={dealerFavorited ? 'Remove from favorites' : 'Add to favorites'}
                            >
                                <Heart size={24} className={`${dealerFavorited ? 'fill-vivid-red text-vivid-red' : 'fill-transparent'}`} />
                            </button>
                            <h1 className="text-3xl font-extrabold text-white pr-12">{dealer.name}</h1>
                            <div className="flex flex-wrap gap-3">
                                {isApproved ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                                        <ShieldCheck size={14} />
                                        {t('dealerDetails.approved', { defaultValue: 'Approved dealer' })}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-300">
                                        <ShieldAlert size={14} />
                                        {t('dealerDetails.pendingApproval', { defaultValue: 'Pending approval' })}
                                    </span>
                                )}
                                {dealer.ownerUid && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                                        UID: {dealer.ownerUid}
                                    </span>
                                )}
                            </div>
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
                                <p className="text-gray-300">{dealer.languages?.length ? dealer.languages.join(', ') : t('dealerDetails.noLanguages', { defaultValue: 'No languages specified' })}</p>
                            </div>
                             {dealer.notes && <div>
                                <h3 className="font-semibold text-white">{t('dealerDetails.notes')}</h3>
                                <p className="text-gray-300">{dealer.notes}</p>
                            </div>}
                        </div>
                    </div>
                </div>
                 
                <div className="mt-16">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-white">{t('dealerDetails.modelsAvailable')}</h2>
                            <p className="mt-2 max-w-2xl text-gray-300">
                                {t('dealerDetails.modelsAvailableSubtitle', {
                                    defaultValue: 'Explore every electric model this dealership offers, including pricing, range, and available perks.',
                                })}
                            </p>
                        </div>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <label className="flex items-center gap-3 text-sm text-gray-300">
                                <SlidersHorizontal size={18} className="text-gray-cyan" />
                                <span className="whitespace-nowrap">{t('dealerDetails.sortLabel', { defaultValue: 'Sort models by' })}</span>
                                <select
                                    value={sortOption}
                                    onChange={event => setSortOption(event.target.value as 'brand' | 'price' | 'range')}
                                    className="rounded-lg border border-white/10 bg-black/40 px-4 py-2 text-sm font-semibold text-white transition focus:border-gray-cyan/60 focus:outline-none focus:ring-2 focus:ring-gray-cyan/40"
                                >
                                    <option value="brand">{t('dealerDetails.sort.brand', { defaultValue: 'Brand (A-Z)' })}</option>
                                    <option value="price">{t('dealerDetails.sort.price', { defaultValue: 'Price (low to high)' })}</option>
                                    <option value="range">{t('dealerDetails.sort.range', { defaultValue: 'Range (high to low)' })}</option>
                                </select>
                            </label>
                            {isAdmin && hasInactiveModels && (
                                <button
                                    type="button"
                                    onClick={() => setShowInactive(prev => !prev)}
                                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-gray-cyan/60 hover:text-gray-cyan"
                                >
                                    {showInactive ? <ToggleRight size={18} className="text-gray-cyan" /> : <ToggleLeft size={18} className="text-gray-400" />}
                                    {t('dealerDetails.showInactive', { defaultValue: 'Show inactive models' })}
                                </button>
                            )}
                        </div>
                    </div>

                    {sortedEntries.length > 0 ? (
                        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
                            {sortedEntries.map(entry => {
                                const image = entry.metadata.thumbnail_url || entry.model.image_url || entry.model.imageGallery?.[0] || MODEL_PLACEHOLDER_IMAGE;
                                const rangeLabel = entry.model.range_wltp ? `${entry.model.range_wltp} km` : t('modelsPage.rangeUnknown', { defaultValue: 'Unknown' });
                                const batteryLabel = entry.model.battery_capacity ? `${entry.model.battery_capacity} kWh` : t('modelsPage.rangeUnknown', { defaultValue: 'Unknown' });
                                const priceLabel = formatCurrency(entry.price, entry.currency ?? 'EUR') ?? t('dealerDetails.priceOnRequest', { defaultValue: 'Contact for pricing' });
                                const guaranteeLabel =
                                    formatGuarantee(entry.metadata.guarantee_value ?? null, entry.metadata.guarantee_unit, entry.metadata.guarantee_text) ??
                                    t('dealerDetails.guaranteeUnavailable', { defaultValue: 'Not specified' });
                                const paymentMethods = entry.paymentMethods;
                                const isModelFavorite = favorites.isFavorite(entry.model.id);
                                const updatedDate = entry.metadata.last_updated ? new Date(entry.metadata.last_updated) : null;
                                const updatedLabel = updatedDate && !Number.isNaN(updatedDate.getTime()) ? updatedDate.toLocaleDateString() : null;

                                return (
                                    <div
                                        key={entry.model.id}
                                        className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-neon-cyan/30"
                                    >
                                         <button
                                            onClick={() => favorites.toggleFavorite(entry.model.id)}
                                            className="absolute top-4 right-4 z-10 rounded-full bg-black/60 p-2 text-white transition-colors hover:text-vivid-red"
                                            aria-label={isModelFavorite ? 'Remove model from favorites' : 'Save model to favorites'}
                                        >
                                            <Heart size={20} className={`${isModelFavorite ? 'fill-vivid-red text-vivid-red' : 'fill-transparent'}`} />
                                        </button>
                                        <div className="relative h-48 w-full overflow-hidden">
                                             <img src={image} alt={`${entry.model.brand} ${entry.model.model_name}`} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                                            {entry.metadata.preorder_available && (
                                                <span className="absolute top-4 left-4 inline-flex items-center rounded-full bg-vivid-red/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                                                    {t('dealerDetails.preorderAvailable', { defaultValue: 'Pre-order Available' })}
                                                </span>
                                            )}
                                            {entry.inactive && (
                                                <span className="absolute bottom-4 left-4 inline-flex items-center rounded-full bg-amber-400/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black">
                                                    {t('dealerDetails.inactiveLabel', { defaultValue: 'Inactive' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-1 flex-col gap-5 p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">{entry.model.brand}</p>
                                                    <h3 className="text-2xl font-bold text-white">{entry.model.model_name}</h3>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs uppercase tracking-wide text-gray-400">{t('dealerDetails.priceLabel', { defaultValue: 'Price' })}</p>
                                                    <p className="text-lg font-semibold text-white">{priceLabel}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                                                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                                                    <Battery className="text-gray-cyan" size={20} />
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide text-gray-400">{t('modelDetails.battery')}</p>
                                                        <p className="font-semibold text-white">{batteryLabel}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4">
                                                    <Gauge className="text-gray-cyan" size={20} />
                                                    <div>
                                                        <p className="text-xs uppercase tracking-wide text-gray-400">{t('modelDetails.range')}</p>
                                                        <p className="font-semibold text-white">{rangeLabel}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {entry.metadata.specs_summary && (
                                                <p className="rounded-xl bg-black/30 p-4 text-sm text-gray-200">
                                                    {entry.metadata.specs_summary}
                                                </p>
                                            )}

                                            <div className="space-y-3 text-sm">
                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <span className="text-xs uppercase tracking-wide text-gray-400">{t('dealerDetails.guaranteeLabel', { defaultValue: 'Guarantee' })}</span>
                                                    <span className="font-semibold text-white">{guaranteeLabel}</span>
                                                </div>
                                                <div>
                                                    <p className="text-xs uppercase tracking-wide text-gray-400">{t('dealerDetails.paymentMethodsLabel', { defaultValue: 'Payment methods' })}</p>
                                                    {paymentMethods.length > 0 ? (
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                            {paymentMethods.map(method => (
                                                                <span
                                                                    key={`${entry.model.id}-${method}`}
                                                                    className="inline-flex items-center rounded-full bg-gray-700/60 px-3 py-1 text-xs font-semibold text-gray-100"
                                                                >
                                                                    {formatPaymentMethodLabel(method)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="mt-2 text-xs text-gray-400">
                                                            {t('dealerDetails.paymentMethodsUnavailable', { defaultValue: 'Payment options coming soon.' })}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                                                <Link
                                                    to={`/models/${entry.model.id}`}
                                                    className="group inline-flex items-center font-semibold text-gray-cyan transition-colors hover:text-white"
                                                >
                                                    {t('dealerDetails.viewModelDetails', { defaultValue: 'View model details' })}
                                                    <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-1" />
                                                </Link>
                                                {updatedLabel && (
                                                    <span className="text-xs text-gray-400">{t('dealerDetails.lastUpdated', { defaultValue: 'Updated' })}: {updatedLabel}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-gray-300">
                            <p className="text-lg font-semibold">{t('dealerDetails.noModelsTitle', { defaultValue: 'Models coming soon' })}</p>
                            <p className="mt-2 text-sm">
                                {isAdmin && hasInactiveModels && !showInactive
                                    ? t('dealerDetails.toggleInactiveNotice', { defaultValue: 'Toggle to view inactive models linked to this dealership.' })
                                    : t('dealerDetails.noModelsDescription', {
                                          defaultValue: 'This dealership has not published any specific model listings yet. Check back soon or contact them directly for availability.',
                                      })}
                            </p>
                        </div>
                    )}
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

                <div className="mt-16 bg-white/5 border border-white/10 rounded-2xl p-10 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white text-center">{t('dealerDetails.aboutTitle', { name: dealer.name })}</h2>
                    <p className="mt-4 text-gray-300 text-center max-w-4xl mx-auto">
                        {t('dealerDetails.aboutDescription', {
                            name: dealer.name,
                            city: dealer.city,
                            brands: dealer.brands.join(', '),
                        })}
                    </p>
                </div>

                <GallerySection
                    title={t('dealerDetails.galleryTitle', { defaultValue: 'Showroom gallery' })}
                    description={t('dealerDetails.gallerySubtitle', {
                        defaultValue: 'Take a closer look at the dealership environment and recent deliveries.',
                    })}
                    images={galleryImages}
                />

                <section className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center">{t('dealerDetails.faqTitle')}</h2>
                    <p className="mt-3 text-gray-300 text-center">{t('dealerDetails.faqSubtitle')}</p>
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

export default DealerDetailPage;