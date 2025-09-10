import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
  isLocationPicker?: boolean;
  className?: string;
  showSearch?: boolean; // New prop to show search functionality
  searchCountry?: string; // New prop to restrict search to a specific country
}

const Map: React.FC<MapProps> = ({
  center = [9.145, 40.4897], // Default to Ethiopia
  zoom = 6,
  height = '400px',
  onLocationSelect,
  selectedLocation,
  isLocationPicker = false,
  className = '',
  showSearch = false,
  searchCountry = 'Ethiopia'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler for location picking
    if (isLocationPicker) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        
        // Remove existing marker
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Add new marker
        const marker = L.marker([lat, lng]).addTo(map);
        markerRef.current = marker;

        // Call callback
        onLocationSelect?.(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, isLocationPicker, onLocationSelect]);

  // Update marker when selectedLocation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedLocation) return;

    const map = mapInstanceRef.current;
    const [lat, lng] = selectedLocation;

    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    // Add new marker
    const marker = L.marker([lat, lng]).addTo(map);
    markerRef.current = marker;

    // Center map on selected location
    map.setView([lat, lng], Math.max(zoom, 13));
  }, [selectedLocation, zoom]);

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height: height || '100%' }} 
        className={`rounded-lg border w-full ${className}`}
      />
    </div>
  );
};

export default Map;