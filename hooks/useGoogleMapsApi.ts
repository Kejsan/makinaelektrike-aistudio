import { useState, useEffect } from 'react';

let resolvedApiKey: string | undefined;

const resolveGoogleMapsApiKey = () => {
    if (resolvedApiKey) {
        return resolvedApiKey;
    }

    const fromImportMeta =
        import.meta.env.VITE_GOOGLE_MAPS_API_KEY ??
        import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY ??
        import.meta.env.GOOGLE_MAPS_API_KEY;

    if (fromImportMeta) {
        resolvedApiKey = fromImportMeta;
        return resolvedApiKey;
    }

    if (typeof window !== 'undefined') {
        const candidates = [
            (window as Record<string, any>).GOOGLE_MAPS_API_KEY,
            (window as Record<string, any>).__GOOGLE_MAPS_API_KEY,
            (window as Record<string, any>).__ENV?.GOOGLE_MAPS_API_KEY,
            document
                ?.querySelector('meta[name="google-maps-api-key"]')
                ?.getAttribute('content') ?? undefined,
        ];

        const fromWindow = candidates.find((value): value is string => Boolean(value));
        if (fromWindow) {
            resolvedApiKey = fromWindow;
            return resolvedApiKey;
        }
    }

    return undefined;
};

// This object holds the script loading status globally to prevent multiple loads.
const scriptStatus = {
    isLoaded: false,
    isErrored: false,
    loadingPromise: null as Promise<void> | null,
};

function loadScripts() {
    if (!scriptStatus.loadingPromise) {
        scriptStatus.loadingPromise = new Promise((resolve, reject) => {
            // Check if both scripts are already loaded
            if (
                typeof (window as any).google === 'object' &&
                typeof (window as any).google.maps === 'object' &&
                (window as any).markerClusterer
            ) {
                scriptStatus.isLoaded = true;
                resolve();
                return;
            }

            const apiKey = resolveGoogleMapsApiKey();

            if (!apiKey) {
                scriptStatus.isErrored = true;
                scriptStatus.loadingPromise = null;
                console.error(
                    'Google Maps API key is not defined. Please configure VITE_GOOGLE_MAPS_API_KEY (or a compatible public key) in your environment.',
                );
                reject(new Error('Google Maps API key is not defined.'));
                return;
            }

            const mapsScript = document.createElement('script');
            const params = new URLSearchParams({
                key: apiKey,
                libraries: 'places',
                v: 'weekly',
            });
            mapsScript.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
            mapsScript.async = true;
            mapsScript.defer = true;
            mapsScript.dataset.googleMapsLoader = 'true';
            
            mapsScript.onload = () => {
                // Once Maps API is loaded, load the MarkerClusterer library
                const clustererScript = document.createElement('script');
                clustererScript.src = `https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js`;
                clustererScript.async = true;
                clustererScript.defer = true;
                
                clustererScript.onload = () => {
                    scriptStatus.isLoaded = true;
                    resolve();
                };
                
                clustererScript.onerror = () => {
                    scriptStatus.isErrored = true;
                    scriptStatus.loadingPromise = null;
                    reject(new Error("Google Maps MarkerClusterer script failed to load."));
                };
                
                document.head.appendChild(clustererScript);
            };
            
            mapsScript.onerror = () => {
                scriptStatus.isErrored = true;
                scriptStatus.loadingPromise = null;
                reject(new Error("Google Maps script failed to load."));
            };

            document.head.appendChild(mapsScript);
        });
    }
    return scriptStatus.loadingPromise;
}


export const useGoogleMapsApi = () => {
    const [isLoaded, setIsLoaded] = useState(scriptStatus.isLoaded);
    const [loadError, setLoadError] = useState(scriptStatus.isErrored);

    useEffect(() => {
        if (scriptStatus.isLoaded) {
            return;
        }

        let isMounted = true;
        loadScripts()
            .then(() => {
                if (isMounted) setIsLoaded(true);
            })
            .catch(() => {
                if (isMounted) setLoadError(true);
            });
        
        return () => {
            isMounted = false;
        };
    }, []);

    return { isLoaded, loadError };
};