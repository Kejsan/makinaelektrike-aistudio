import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dealer, Model } from '../types';
import { MapPin, Phone, Mail, Globe, ArrowLeft, Heart } from 'lucide-react';
import ModelCard from '../components/ModelCard';
import { useFavorites } from '../hooks/useFavorites';
import GoogleMap from '../components/GoogleMap';
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
                const modelIds = initial