import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Filter, Calendar, MapPin } from 'lucide-react';
import '@/styles/gallery.css';

// Define types for gallery items
interface GalleryItem {
  id: number;
  src: string;
  alt: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  likes: number;
}

const Gallery: React.FC = () => {
  // Sample gallery data - in a real app, this would come from an API
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([
    {
      id: 1,
      src: '/story-1.png',
      alt: 'Plogging event at Entoto Park',
      title: 'Community Cleanup at Entoto Park',
      description: 'Volunteers collecting litter during our monthly cleanup event',
      date: '2024-05-15',
      location: 'Entoto Park, Addis Ababa',
      category: 'Events',
      likes: 24
    },
    {
      id: 2,
      src: '/story-2.png',
      alt: 'Plogging team in action',
      title: 'Team Plogging Action',
      description: 'Our dedicated volunteers in action during the morning cleanup',
      date: '2024-05-10',
      location: 'Bole Road, Addis Ababa',
      category: 'Activities',
      likes: 18
    },
    {
      id: 3,
      src: '/story-3.png',
      alt: 'Plogging group photo',
      title: 'Volunteer Group Photo',
      description: 'Celebrating our successful cleanup with a group photo',
      date: '2024-04-28',
      location: 'Unity Park, Addis Ababa',
      category: 'Events',
      likes: 32
    },
    {
      id: 4,
      src: '/story-4.png',
      alt: 'Before and after cleanup',
      title: 'Before and After Transformation',
      description: 'Amazing transformation after our cleanup efforts',
      date: '2024-04-22',
      location: 'Meskel Square, Addis Ababa',
      category: 'Impact',
      likes: 41
    },
    {
      id: 5,
      src: '/about-5.png',
      alt: 'Youth participation in plogging',
      title: 'Youth Engagement',
      description: 'Young volunteers making a difference in their community',
      date: '2024-04-15',
      location: 'Addis Ababa University',
      category: 'Youth',
      likes: 29
    },
    {
      id: 6,
      src: '/about-6.png',
      alt: 'Plogging equipment',
      title: 'Essential Plogging Gear',
      description: 'Our volunteers equipped with gloves and bags for cleanup',
      date: '2024-04-08',
      location: 'Plogging Ethiopia HQ',
      category: 'Preparation',
      likes: 15
    },
    {
      id: 7,
      src: '/founder-photo.png',
      alt: 'Founder Firew Kefyalew',
      title: 'Founder Firew Kefyalew',
      description: 'Our founder leading by example in environmental conservation',
      date: '2024-03-30',
      location: 'Entoto Park',
      category: 'Leadership',
      likes: 37
    },
    {
      id: 8,
      src: '/header-left.png',
      alt: 'Plogging in action',
      title: 'Plogging in Action',
      description: 'Volunteers jogging while collecting litter in the neighborhood',
      date: '2024-03-22',
      location: 'Bole Subcity',
      category: 'Activities',
      likes: 26
    }
  ]);

  const [filteredItems, setFilteredItems] = useState<GalleryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(galleryItems.map(item => item.category)))];

  // Filter items based on category and search query
  useEffect(() => {
    let result = galleryItems;
    
    if (selectedCategory !== 'All') {
      result = result.filter(item => item.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredItems(result);
  }, [selectedCategory, searchQuery, galleryItems]);

  const handleLike = (id: number) => {
    setGalleryItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );
  };

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
                    src={item.src} 
                    alt={item.alt} 
                    className="w-full h-48 object-cover gallery-image"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600 gallery-badge">
                    {item.category}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-2 text-green-800">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                  
                  <div className="flex items-center text-gray-500 text-xs mb-2">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 text-xs mb-3">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{item.location}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleLike(item.id)}
                    >
                      ❤️ Like ({item.likes})
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