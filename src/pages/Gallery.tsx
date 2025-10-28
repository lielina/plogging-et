import React, { useState, useEffect } from 'react';
import { apiClient, GalleryImage } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import '@/styles/gallery.css';

// Using GalleryImage type from API

const Gallery: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryImage[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery items from API (paginated shape)
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAllGalleryImages(page);
        const imagesData = response?.data?.data || [];
        setGalleryItems(imagesData);
        setLastPage(response?.data?.last_page || 1);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching gallery items:', err);
        setError(err.message || 'Failed to fetch gallery items');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, [page]);


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


        {/* Gallery Grid */}
        {galleryItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryItems.map(item => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 gallery-card">
                <div className="relative">
                  <img 
                    src={item.thumbnail_url || item.image_url || ''} 
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
                  
                  <div className="flex items-center text-gray-500 text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No images found</h3>
            <p className="text-gray-500">No gallery images available at the moment</p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <Button
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">Page {page} of {lastPage}</span>
          <Button
            variant="outline"
            disabled={page >= lastPage}
            onClick={() => setPage(p => Math.min(lastPage, p + 1))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;