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
  const searchControlRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Function to search for locations using Nominatim API
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      // Add country restriction to the query
      const searchQuery = searchCountry ? `${query}, ${searchCountry}` : query;
      
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=ET`
      );
      
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to select a search result
  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Update the map view
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lng], 15);
      
      // Remove existing marker
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Add new marker
      const marker = L.marker([lat, lng]).addTo(mapInstanceRef.current);
      markerRef.current = marker;

      // Call callback
      onLocationSelect?.(lat, lng);
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add search control if enabled
    if (showSearch && searchControlRef.current) {
      // Add search control to map
      const searchContainer = L.control({ position: 'topright' });
      searchContainer.onAdd = () => {
        return searchControlRef.current as unknown as HTMLElement;
      };
      searchContainer.addTo(map);
    }

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
  }, [center, zoom, isLocationPicker, onLocationSelect, showSearch]);

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
    <div className="relative">
      {/* Search Control */}
      {showSearch && (
        <div ref={searchControlRef} className="leaflet-control leaflet-bar p-2 bg-white rounded shadow-lg">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchLocation(e.target.value);
              }}
              placeholder={`Search in ${searchCountry}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {isSearching && (
              <div className="absolute right-2 top-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => selectSearchResult(result)}
                >
                  <div className="font-medium text-sm">{result.display_name}</div>
                  <div className="text-xs text-gray-500">
                    {result.lat}, {result.lon}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ height }} 
        className={`rounded-lg border ${className}`}
      />
    </div>
  );
};

export default Map;