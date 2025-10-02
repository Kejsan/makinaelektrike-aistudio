import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'makinaElektrikeFavorites';

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        try {
            const storedFavorites = localStorage.getItem(FAVORITES_KEY);
            if (storedFavorites) {
                setFavorites(JSON.parse(storedFavorites));
            }
        } catch (error) {
            console.error('Error reading favorites from localStorage', error);
        }
    }, []);

    const updateLocalStorage = (newFavorites: string[]) => {
        try {
            localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
        } catch (error) {
            console.error('Error saving favorites to localStorage', error);
        }
    };
    
    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prevFavorites => {
            const isCurrentlyFavorite = prevFavorites.includes(id);
            const newFavorites = isCurrentlyFavorite
                ? prevFavorites.filter(favId => favId !== id)
                : [...prevFavorites, id];
            
            updateLocalStorage(newFavorites);
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((id: string) => {
        return favorites.includes(id);
    }, [favorites]);

    return { favorites, isFavorite, toggleFavorite };
};
