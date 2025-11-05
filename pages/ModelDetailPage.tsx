import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Model, Dealer, DealerModel } from '../types';
import {
    Battery,
    Zap,
    Gauge,
    ChevronsRight,
    ArrowUpRight,
    ArrowLeft,
    Car,
    Users,
    Power,
    Bolt,
    Heart,
    Building2,
    ShieldCheck,
} from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { DataContext } from '../contexts/DataContext';
import SEO from '../components/SEO';
import { BASE_URL } from '../constants/seo';
import { MODEL_PLACEHOLDER_IMAGE } from '../constants/media';
import GallerySection from '../components/GallerySection';
import { formatCurrency, formatGuarantee, normalizePaymentMethods, formatPaymentMethodLabel, safeNumber } from '../utils/format';

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
    const { models, dealers, dealerModels: dealerModelLinks, loading } = useContext(DataContext);
    const model = useMemo<Model | null>(() => (models.find(m => m.id === id) ?? null), [models, id]);
    const dealerMap = useMemo(() => {
        const map = new Map<string, Dealer>();
        dealers.forEach(dealer => {
            map.set(dealer.id, dealer);
        });
        return map;
    }, [dealers]);
    const [scrollY, setScrollY] = useState(0);
    const { isFavorite, toggleFavorite } = useFavorites();

    type DealerAvailability = {
        dealer: Dealer;
        metadata: DealerModel;
        price: number | null;
        currency?: string;
        paymentMethods: string[];
        inactive: boolean;
    };

    const dealerAvailability = useMemo<DealerAvailability[]>(() => {
        if (!model) {
            return [];
        }

        return dealerModelLinks
            .filter(link => link.model_id === model.id)
            .map(link => {
                const dealer = dealerMap.get(link.dealer_id);
                if (!dealer) {
                    return null;
                }

                return {
                    dealer,
                    metadata: link,
                    price: safeNumber(link.price ?? null),
                    currency: link.currency ?? undefined,
                    paymentMethods: normalizePaymentMethods(link.payment_methods),
                    inactive: link.active === false || link.status === 'inactive',
                } satisfies DealerAvailability;
            })
            .filter((entry): entry is DealerAvailability => entry !== null);
    }, [dealerMap, dealerModelLinks, model]);

    const activeDealerAvailability = useMemo(
        () => dealerAvailability.filter(entry => !entry.inactive),
        [dealerAvailability],
    );

    const availableDealers = useMemo(
        () => activeDealerAvailability.map(entry => entry.dealer),
        [activeDealerAvailability],
    );

    const averagePriceValue = useMemo(() => {
        const prices = activeDealerAvailability
            .map(entry => entry.price)
            .filter((price): price is number => price !== null);
        if (prices.length === 0) {
            return null;
        }
        const total = prices.reduce((sum, price) => sum + price, 0);
        return total / prices.length;
    }, [activeDealerAvailability]);

    const averagePriceCurrency = activeDealerAvailability.find(entry => entry.price !== null)?.currency ?? 'EUR';
    const averagePriceLabel =
        averagePriceValue !== null ? formatCurrency(averagePriceValue, averagePriceCurrency) : null;
    const dealerCount = activeDealerAvailability.length;

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
    if (!model) {
        return (
            <div className="text-center py-10 text-white">
                <SEO
                    title="Modeli nuk u gjet | Makina Elektrike"
                    description="Modeli i kërkuar nuk ekziston më ose është zhvendosur."
                    canonical={id ? `${BASE_URL}/models/${id}/` : `${BASE_URL}/models/`}
                    openGraph={{
                        title: 'Modeli nuk u gjet | Makina Elektrike',
                        description: 'Modeli i kërkuar nuk ekziston më ose është zhvendosur.',
                        url: id ? `${BASE_URL}/models/${id}/` : `${BASE_URL}/models/`,
                        type: 'product',
                    }}
                    twitter={{
                        title: 'Modeli nuk u gjet | Makina Elektrike',
                        description: 'Modeli i kërkuar nuk ekziston më ose është zhvendosur.',
                        site: '@makinaelektrike',
                    }}
                />
                Model not found.
            </div>
        );
    }

    const imageScale = 1 + scrollY / 8000;
    const galleryImages = (model.imageGallery ?? []).filter(Boolean);
    const heroImage = model.image_url || galleryImages[0] || MODEL_PLACEHOLDER_IMAGE;
    const favorited = isFavorite(model.id);
    const canonical = `${BASE_URL}/models/${model.id}/`;
    const modelYear = model.release_year ?? model.year ?? null;
    const description = t('modelDetails.metaDescription', {
        brand: model.brand,
        model: model.model_name,
        range: model.range_wltp ?? 'N/A',
        battery: model.battery_capacity ?? 'N/A',
    });
    const keywords = [
        model.brand,
        model.model_name,
        `${model.brand} ${model.model_name}`,
        `${model.range_wltp ?? ''} km range`,
        'makina elektrike',
    ];
    const faqItems = t('modelDetails.faqItems', { returnObjects: true }) as Array<{ question: string; answer: string }>;
    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'Vehicle',
            name: `${model.brand} ${model.model_name}`,
            brand: model.brand,
            model: model.model_name,
            url: canonical,
            image: heroImage,
            description,
            fuelType: 'Electric',
            bodyType: model.body_type,
            seatingCapacity: model.seats ?? undefined,
            vehicleTransmission: model.drive_type,
            mileageFromOdometer: model.range_wltp
                ? {
                      '@type': 'QuantitativeValue',
                      value: model.range_wltp,
                      unitCode: 'KMT',
                  }
                : undefined,
            offers: availableDealers.length
                ? availableDealers.map(dealer => ({
                      '@type': 'Offer',
                      url: `${BASE_URL}/dealers/${dealer.id}/`,
                      seller: {
                          '@type': 'AutoDealer',
                          name: dealer.name,
                          address: dealer.address,
                      },
                  }))
                : undefined,
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
        <div className="">
            <SEO
                title={`${model.brand} ${model.model_name} | ${t('modelDetails.metaTitleSuffix')}`}
                description={description}
                keywords={keywords}
                canonical={canonical}
                openGraph={{
                    title: `${model.brand} ${model.model_name} | ${t('modelDetails.metaTitleSuffix')}`,
                    description,
                    url: canonical,
                    type: 'product',
                    images: [heroImage],
                }}
                twitter={{
                    title: `${model.brand} ${model.model_name} | ${t('modelDetails.metaTitleSuffix')}`,
                    description,
                    image: heroImage,
                    site: '@makinaelektrike',
                }}
                structuredData={structuredData}
            />
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
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide">
                                    {modelYear && (
                                        <span className="rounded-full bg-white/10 px-3 py-1 text-gray-200">
                                            {t('modelDetails.modelYearLabel', { defaultValue: 'Model year' })}: {modelYear}
                                        </span>
                                    )}
                                    {model.range_wltp && (
                                        <span className="rounded-full bg-gray-cyan/20 px-3 py-1 text-gray-100">
                                            WLTP {model.range_wltp} km
                                        </span>
                                    )}
                                    {dealerCount > 0 && (
                                        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">
                                            <Building2 size={14} />
                                            {t('modelDetails.dealerCount', {
                                                count: dealerCount,
                                                defaultValue: dealerCount === 1 ? '{{count}} dealer offering' : '{{count}} dealers offering',
                                            })}
                                        </span>
                                    )}
                                </div>
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
                                src={heroImage}
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
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-3xl font-bold text-white">{t('modelDetails.availableAt')}</h2>
                        <p className="mt-3 text-gray-300">
                            {t('modelDetails.availableAtDescription', {
                                defaultValue: 'Partner dealerships currently offering this model. Compare pricing, guarantees, and ways to pay.',
                            })}
                        </p>
                    </div>
                    {dealerCount > 0 ? (
                        <>
                            {averagePriceLabel && (
                                <div className="mt-8 flex justify-center">
                                    <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-left shadow-xl">
                                        <ShieldCheck size={24} className="text-emerald-300" />
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                                                {t('modelDetails.averagePriceLabel', { defaultValue: 'Average listed price' })}
                                            </p>
                                            <p className="text-2xl font-extrabold text-white">{averagePriceLabel}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
                                <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-100">
                                    <thead className="bg-white/5 text-xs uppercase tracking-wide text-gray-300">
                                        <tr>
                                            <th scope="col" className="px-6 py-4 font-semibold">
                                                {t('modelDetails.table.dealer', { defaultValue: 'Dealer' })}
                                            </th>
                                            <th scope="col" className="px-6 py-4 font-semibold">
                                                {t('modelDetails.table.price', { defaultValue: 'Price' })}
                                            </th>
                                            <th scope="col" className="px-6 py-4 font-semibold">
                                                {t('modelDetails.table.guarantee', { defaultValue: 'Guarantee' })}
                                            </th>
                                            <th scope="col" className="px-6 py-4 font-semibold">
                                                {t('modelDetails.table.payment', { defaultValue: 'Payment options' })}
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right font-semibold">
                                                {t('modelDetails.table.actions', { defaultValue: 'Contact' })}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {activeDealerAvailability.map(entry => {
                                            const priceLabel =
                                                entry.price !== null
                                                    ? formatCurrency(entry.price, entry.currency ?? 'EUR')
                                                    : t('modelDetails.priceOnRequest', { defaultValue: 'Contact for price' });
                                            const guaranteeLabel =
                                                formatGuarantee(
                                                    entry.metadata.guarantee_value,
                                                    entry.metadata.guarantee_unit,
                                                    entry.metadata.guarantee_text,
                                                ) ?? t('modelDetails.guaranteeUnavailable', { defaultValue: 'Not specified' });
                                            const paymentMethods = entry.paymentMethods;

                                            return (
                                                <tr key={entry.dealer.id} className="transition hover:bg-white/5">
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold text-white">{entry.dealer.name}</span>
                                                            <span className="text-xs text-gray-400">{entry.dealer.city}</span>
                                                        </div>
                                                        {entry.metadata.preorder_available && (
                                                            <span className="mt-2 inline-flex items-center rounded-full bg-vivid-red/90 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                                                                {t('modelDetails.preorderBadge', { defaultValue: 'Pre-order Available' })}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 align-top font-semibold text-white">{priceLabel}</td>
                                                    <td className="px-6 py-4 align-top text-gray-200">{guaranteeLabel}</td>
                                                    <td className="px-6 py-4 align-top">
                                                        {paymentMethods.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {paymentMethods.map(method => (
                                                                    <span
                                                                        key={`${entry.dealer.id}-${method}`}
                                                                        className="inline-flex items-center rounded-full bg-gray-700/60 px-2.5 py-0.5 text-xs font-semibold text-gray-100"
                                                                    >
                                                                        {formatPaymentMethodLabel(method)}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">
                                                                {t('modelDetails.paymentUnavailable', { defaultValue: 'Payment options coming soon' })}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 align-top text-right">
                                                        <Link
                                                            to={`/dealers/${entry.dealer.id}`}
                                                            className="inline-flex items-center gap-2 rounded-full border border-gray-cyan/40 px-3 py-1.5 text-sm font-semibold text-gray-cyan transition-colors hover:border-gray-cyan hover:bg-gray-cyan/10 hover:text-white"
                                                        >
                                                            {t('modelDetails.contactDealer')}
                                                            <ArrowUpRight size={16} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="mt-8 rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-gray-300">
                            <p className="text-lg font-semibold">{t('modelDetails.noDealersTitle', { defaultValue: 'No dealerships listed yet' })}</p>
                            <p className="mt-2 text-sm">{t('modelDetails.noDealersDescription', { defaultValue: 'We are working with partners to add availability. Check back soon or request a quote to be notified.' })}</p>
                        </div>
                    )}
                </div>

                <GallerySection
                    title={t('modelDetails.galleryTitle', { defaultValue: 'Model gallery' })}
                    description={t('modelDetails.gallerySubtitle', {
                        defaultValue: 'Swipe through additional photos of this EV.',
                    })}
                    images={galleryImages}
                />

                <section className="mt-16 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center">{t('modelDetails.faqTitle')}</h2>
                    <p className="mt-3 text-gray-300 text-center">{t('modelDetails.faqSubtitle')}</p>
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

export default ModelDetailPage;
