import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, MapPin } from 'lucide-react';
import '@/styles/gallery.css';

// Define types for gallery items
interface GalleryItem {
  id: number;
  title: string;
  description: string;
  file_path: string;
  album_id: number | null;
  created_at: string;
  updated_at: string;
  album?: {
    id: number;
    name: string;
  };
}

const Gallery: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery items from API
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAllGalleryImages();
        // Handle the response structure correctly
        // The response format is { data: [...] }
        const imagesData = Array.isArray(response.data) ? response.data : [];
        setGalleryItems(imagesData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching gallery items:', err);
        setError(err.message || 'Failed to fetch gallery items');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  // Get unique categories (albums)
  const categories = ['All', ...Array.from(new Set(galleryItems.map(item => item.album?.name || 'Uncategorized')))];

  // Filter items based on category and search query
  useEffect(() => {
    let result = galleryItems;
    
    if (selectedCategory !== 'All') {
      result = result.filter(item => (item.album?.name || 'Uncategorized') === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(result);
  }, [selectedCategory, searchQuery, galleryItems]);

  const handleLike = (id: number) => {
    // In a real implementation, this would send a request to the backend
    console.log(`Liked image with ID: ${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center gallery-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center gallery-container">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Gallery</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 gallery-container">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Gallery</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore moments from our plogging events and community activities. 
            See how we're making a difference in Ethiopia, one step at a time.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6 gallery-filter-bar">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Filter className="text-green-600 h-5 w-5" />
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={selectedCategory === category ? "bg-green-600 hover:bg-green-700" : ""}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="w-full md:w-auto">
              <input
                type="text"
                placeholder="Search gallery..."
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 gallery-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 gallery-card">
                <div className="relative">
                  <img 
                    src={item.file_path} 
                    alt={item.title} 
                    className="w-full h-48 object-cover gallery-image"
                  />
                  {item.album && (
                    <Badge className="absolute top-2 right-2 bg-green-600 gallery-badge">
                      {item.album.name}
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-green-800">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  
                  <div className="flex items-center text-gray-500 text-xs mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleLike(item.id)}
                    >
                      ❤️ Like
                    </Button>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No images found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
            Load More Images
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;