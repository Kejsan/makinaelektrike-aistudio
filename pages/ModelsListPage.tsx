import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { getModels } from '../services/api';
import { Model } from '../types';
import ModelCard from '../components/ModelCard';
import CustomSelect from '../components/CustomSelect';
import { Car, Tag, Gauge, ListFilter, Scale } from 'lucide-react';
import ComparisonModal from '../components/ComparisonModal';

const ModelsListPage: React.FC = () => {
    const { t } = useTranslation();
    const [allModels, setAllModels] = useState<Model[]>([]);
    const [filteredModels, setFilteredModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    // Filter states
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedBodyType, setSelectedBodyType] = useState('');
    const [minRange, setMinRange] = useState('');
    const [sortBy, setSortBy] = useState('model_asc');

    useEffect(() => {
        setLoading(true);
        getModels().then(data => {
            setAllModels(data);
            setLoading(false);
        });
    }, []);

    const filterOptions = useMemo(() => {
        const brands = [...new Set(allModels.map(m => m.brand))].sort();
        const bodyTypes = [...new Set(allModels.map(m => m.body_type).filter(bt => bt))].sort() as string[];
        return { brands, bodyTypes };
    }, [allModels]);

    useEffect(() => {
        let models = [...allModels];

        if (selectedBrand) {
            models = models.filter(m => m.brand === selectedBrand);
        }
        if (selectedBodyType) {
            models = models.filter(m => m.body_type === selectedBodyType);
        }
        if (minRange) {
            models = models.filter(m => m.range_wltp && m.range_wltp >= parseInt(minRange, 10));
        }

        models.sort((a, b) => {
            switch (sortBy) {
                case 'model_desc':
                    return b.model_name.localeCompare(a.model_name);
                case 'brand_asc':
                    return a.brand.localeCompare(b.brand);
                case 'brand_desc':
                    return b.brand.localeCompare(a.brand);
                case 'range_desc':
                    return (b.range_wltp || 0) - (a.range_wltp || 0);
                case 'range_asc':
                    return (a.range_wltp || 0) - (b.range_wltp || 0);
                case 'model_asc':
                default:
                    return a.model_name.localeCompare(b.model_name);
            }
        });

        setFilteredModels(models);
    }, [allModels, selectedBrand, selectedBodyType, minRange, sortBy]);

    const clearFilters = () => {
        setSelectedBrand('');
        setSelectedBodyType('');
        setMinRange('');
        setSortBy('model_asc');
    };

    const rangeOptions = [
        { value: '', label: 'Any Range' },
        { value: '300', label: '300+ km' },
        { value: '400', label: '400+ km' },
        { value: '500', label: '500+ km' },
        { value: '600', label: '600+ km' },
    ];
    
    const sortOptions = [
        { value: 'model_asc', label: t('modelsPage.sortOptions.model_asc') },
        { value: 'model_desc', label: t('modelsPage.sortOptions.model_desc') },
        { value: 'brand_asc', label: t('modelsPage.sortOptions.brand_asc') },
        { value: 'brand_desc', label: t('modelsPage.sortOptions.brand_desc') },
        { value: 'range_desc', label: t('modelsPage.sortOptions.range_desc') },
        { value: 'range_asc', label: t('modelsPage.sortOptions.range_asc') },
    ];

    if (loading) {
        return <div className="text-center py-10 text-white">Loading models...</div>;
    }

    return (
        <>
            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold text-white">{t('modelsPage.title')}</h1>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 p-6 mb-12">
                        <h2 className="text-xl font-bold text-white mb-4">{t('modelsPage.filters')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end">
                            <CustomSelect
                                icon={<Car size={16} />}
                                placeholder={t('modelsPage.allBrands')}
                                options={[{ value: '', label: t('modelsPage.allBrands') }, ...filterOptions.brands.map(b => ({ value: b, label: b }))]}
                                value={selectedBrand}
                                onChange={setSelectedBrand}
                            />
                            <CustomSelect
                                icon={<Tag size={16} />}
                                placeholder={t('modelsPage.allBodyTypes')}
                                options={[{ value: '', label: t('modelsPage.allBodyTypes') }, ...filterOptions.bodyTypes.map(bt => ({ value: bt, label: bt }))]}
                                value={selectedBodyType}
                                onChange={setSelectedBodyType}
                            />
                            <CustomSelect
                                icon={<Gauge size={16} />}
                                placeholder={t('modelsPage.range')}
                                options={rangeOptions}
                                value={minRange}
                                onChange={setMinRange}
                            />
                            <CustomSelect
                                icon={<ListFilter size={16} />}
                                placeholder={t('modelsPage.sortBy')}
                                options={sortOptions}
                                value={sortBy}
                                onChange={setSortBy}
                            />
                            <button onClick={() => setIsCompareModalOpen(true)} className="bg-gray-cyan text-white font-bold py-2.5 px-6 rounded-md hover:bg-opacity-90 transition-colors h-[46px] flex items-center justify-center gap-2">
                                <Scale size={16} />
                                {t('modelsPage.compare')}
                            </button>
                            <button onClick={clearFilters} className="bg-vivid-red text-white font-bold py-2.5 px-6 rounded-md hover:bg-opacity-90 transition-colors h-[46px]">
                                {t('modelsPage.clearFilters')}
                            </button>
                        </div>
                    </div>

                    {filteredModels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredModels.map(model => <ModelCard key={model.id} model={model} />)}
                        </div>
                    ) : (
                        <p className="text-center text-gray-400 py-10">{t('modelsPage.noResults')}</p>
                    )}
                </div>
            </div>
            <ComparisonModal 
                isOpen={isCompareModalOpen}
                onClose={() => setIsCompareModalOpen(false)}
                allModels={allModels}
            />
        </>
    );
};

export default ModelsListPage;