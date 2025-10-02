import { useState, useEffect } from 'react';

// IMPORTANT: This key should be set in the environment variables as GOOGLE_MAPS_API_KEY.
const GOOGLE_MAPS_API_KEY = 'AIzaSyB7j8tjYnSW69sG1D4yLpNVdoIKdzht3HY'; 

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
            if (typeof (window as any).google === 'object' && typeof (window as any).google.maps === 'object' && (window as any).markerClusterer) {
                scriptStatus.isLoaded = true;
                resolve();
                return;
            }

            const mapsScript = document.createElement('script');
            mapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
            mapsScript.async = true;
            mapsScript.defer = true;
            
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
                    reject(new Error("Google Maps MarkerClusterer script failed to load."));
                };
                
                document.head.appendChild(clustererScript);
            };
            
            mapsScript.onerror = () => {
                scriptStatus.isErrored = true;
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