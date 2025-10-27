import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Tag, 
  ChevronRight, 
  ArrowUp,
  Leaf
} from 'lucide-react';

// Define types for blog posts
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  featured?: boolean;
  status?: string;
  meta_data?: {
    tags: string[];
    author?: string;
    read_time?: string;
  };
  slug?: string;
  featured_image?: string;
  featured_image_url?: string;
  published_at: string;
  created_at: string;
  updated_at: string;
}

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blog posts from API
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAllBlogPosts();
        
        // Handle different possible response structures
        let postsData = [];
        if (Array.isArray(response.data)) {
          postsData = response.data;
        } else if (response.data && typeof response.data === 'object') {
          const dataObj = response.data as Record<string, any>;
          // Check if posts are in a 'posts' property
          if (Object.hasOwnProperty.call(dataObj, 'posts') && Array.isArray(dataObj.posts)) {
            postsData = dataObj.posts;
          }
          // Check if posts are in a 'data' property
          else if (Object.hasOwnProperty.call(dataObj, 'data') && Array.isArray(dataObj.data)) {
            postsData = dataObj.data;
          }
          // If it's just an object with post properties, treat it as a single post in an array
          else if (Object.hasOwnProperty.call(dataObj, 'id')) {
            postsData = [dataObj];
          }
          // Log the keys to help debug
          else {
            console.log('Unknown frontend posts data structure. Keys:', Object.keys(dataObj));
            postsData = [];
          }
        }
        
        setBlogPosts(postsData);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching blog posts:', err);
        setError(err.message || 'Failed to fetch blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  // Get unique categories
  const categories = ['All'];

  // Get all tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => 
    post.meta_data?.tags && Array.isArray(post.meta_data.tags) ? post.meta_data.tags : []
  )));

  // Filter posts based on category and search query
  useEffect(() => {
    let result = blogPosts;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        (post.meta_data?.tags && Array.isArray(post.meta_data.tags) && post.meta_data.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    setFilteredPosts(result);
  }, [searchQuery, blogPosts]); // Remove selectedCategory from dependencies

  // Handle scroll to show/hide scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Blog Posts</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Leaf className="h-8 w-8 text-green-600 mr-2" />
              <h1 className="text-4xl font-bold text-green-800">Plogging Blog</h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover stories, tips, and insights about plogging, environmental conservation, 
              and community wellness from our passionate contributors.
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-green-50 rounded-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Featured Posts */}
        {selectedCategory === 'All' && !searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {blogPosts.filter(post => post.featured).map(post => (
                <Card 
                  key={post.id || Math.random()} 
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="md:flex">
                    <div className="md:w-2/5">
                      <img 
                        src={post.featured_image_url || ''} 
                        alt={post.title} 
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-3/5">
                      <CardContent className="p-6">
                        
                        <h3 className="text-xl font-bold mb-2 text-green-800">{post.title}</h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          <span className="mr-4">{post.meta_data?.author || ''}</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="mr-4">
                            {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                          </span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{post.meta_data?.read_time || ''}</span>
                        </div>
                        <div className="mt-4">
                          <Link to={`/blog/${post.id}`}>
                            <Button variant="link" className="text-green-600 p-0 h-auto">
                              Read more <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Posts */}
        <div>
          <h2 className="text-2xl font-bold text-green-800 mb-6">
            {selectedCategory !== 'All' || searchQuery ? 'Search Results' : 'All Articles'}
          </h2>
          
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map(post => (
                <Card 
                  key={post.id || Math.random()} 
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img 
                      src={post.featured_image_url || ''} 
                      alt={post.title} 
                      className="w-full h-48 object-cover"
                    />
                    
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-green-800">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                    
                    <div className="flex items-center text-gray-500 text-xs mb-3">
                      <User className="h-3 w-3 mr-1" />
                      <span className="mr-3">{post.meta_data?.author || ''}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.meta_data?.tags && Array.isArray(post.meta_data.tags) ? post.meta_data.tags.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      )) : null}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.meta_data?.read_time || ''}
                      </span>
                      <Link to={`/blog/${post.id}`}>
                        <Button variant="link" size="sm" className="text-green-600 p-0 h-auto">
                          Read more <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                View All Articles
              </Button>
            </div>
          )}
        </div>

        {/* Load More Button */}
        <div className="text-center mt-12">
          <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
            Load More Articles
          </Button>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 z-50"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default Blog;