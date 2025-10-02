import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMapsApi } from '../hooks/useGoogleMapsApi';

interface MarkerData {
  lat: number;
  lng: number;
  title?: string;
}

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  markers?: MarkerData[];
  className?: string;
  enableClustering?: boolean;
}

// Dark theme for Google Maps
// FIX: Use 'any' type for map styles as 'google' namespace is not available at compile time.
const darkMapStyle: any[] = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];

const GoogleMap: React.FC<GoogleMapProps> = ({ center, zoom, markers = [], className = 'h-96 w-full', enableClustering = false }) => {
  const { isLoaded, loadError } = useGoogleMapsApi();
  const mapRef = useRef<HTMLDivElement>(null);
  // FIX: Use 'any' type for map instance as 'google.maps.Map' is not available at compile time.
  const [map, setMap] = useState<any | null>(null);
  // FIX: Use 'any' type for marker instances as 'google.maps.Marker' is not available at compile time.
  const markerInstances = useRef<any[]>([]);
  const clustererRef = useRef<any | null>(null);

  useEffect(() => {
    if (isLoaded && mapRef.current && !map) {
      // FIX: Cast window to 'any' to access 'google.maps.Map' without TypeScript error.
      const newMap = new (window as any).google.maps.Map(mapRef.current, {
        center,
        zoom,
        styles: darkMapStyle,
        disableDefaultUI: true,
        zoomControl: true,
        backgroundColor: '#00001a',
      });
      setMap(newMap);
    }
  }, [isLoaded, mapRef, center, zoom, map]);
  
  useEffect(() => {
    if (map && isLoaded) {
      // Clear previous markers from map and clusterer
      markerInstances.current.forEach(marker => marker.setMap(null));
      markerInstances.current = [];
      clustererRef.current?.clearMarkers();

      const newMarkers = markers.map(markerInfo => {
        // Create marker instances without adding them to the map directly
        // FIX: Cast window to 'any' to access 'google.maps.Marker' without TypeScript error.
        return new (window as any).google.maps.Marker({
            position: { lat: markerInfo.lat, lng: markerInfo.lng },
            title: markerInfo.title,
            icon: {
              // FIX: Cast window to 'any' to access 'google.maps.SymbolPath' without TypeScript error.
              path: (window as any).google.maps.SymbolPath.CIRCLE,
              scale: 7,
              fillColor: '#fb6163',
              fillOpacity: 1,
              strokeWeight: 1.5,
              strokeColor: '#ffffff'
            }
        });
      });
      markerInstances.current = newMarkers;

      if (enableClustering) {
        // FIX: Cast window to 'any' to access 'markerClusterer' without TypeScript error.
        if (typeof (window as any).markerClusterer === 'object') {
          clustererRef.current = new (window as any).markerClusterer.MarkerClusterer({ markers: newMarkers, map });
        } else {
          console.warn("MarkerClusterer library not available. Displaying markers without clustering.");
          newMarkers.forEach(marker => marker.setMap(map));
        }
      } else {
        newMarkers.forEach(marker => marker.setMap(map));
      }
    }
  }, [map, markers, isLoaded, enableClustering]);


  if (loadError) return <div className="text-center p-4 bg-red-900/50 rounded-lg text-white">Error loading maps. Please check your API key and connection.</div>;
  if (!isLoaded) return <div className="text-center p-4 bg-white/5 rounded-lg text-white animate-pulse">Loading Map...</div>;

  return <div ref={mapRef} className={`${className} rounded-lg border border-white/10 shadow-lg`} />;
};

export default GoogleMap;