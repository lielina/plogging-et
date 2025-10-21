import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  author: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
  image: string;
  featured: boolean;
}

const Blog: React.FC = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([
    {
      id: 1,
      title: "The Environmental Impact of Plogging: Making a Difference One Step at a Time",
      excerpt: "Discover how plogging contributes to environmental conservation and the positive impact it has on our communities.",
      author: "Firew Kefyalew",
      date: "2024-05-15",
      readTime: "5 min read",
      category: "Environment",
      tags: ["environment", "community", "fitness"],
      image: "/story-1.png",
      featured: true
    },
    {
      id: 2,
      title: "Getting Started with Plogging: A Beginner's Guide",
      excerpt: "Learn everything you need to know to start your plogging journey and become part of the environmental solution.",
      author: "Sarah Johnson",
      date: "2024-05-10",
      readTime: "4 min read",
      category: "Guides",
      tags: ["beginners", "equipment", "tips"],
      image: "/story-2.png",
      featured: false
    },
    {
      id: 3,
      title: "Plogging Events in Addis Ababa: Join Our Community This Weekend",
      excerpt: "Join us for our upcoming plogging events and connect with like-minded environmental enthusiasts in your area.",
      author: "Michael Tesfaye",
      date: "2024-05-05",
      readTime: "3 min read",
      category: "Events",
      tags: ["events", "addis ababa", "community"],
      image: "/story-3.png",
      featured: false
    },
    {
      id: 4,
      title: "The Health Benefits of Plogging: More Than Just Exercise",
      excerpt: "Explore the physical and mental health advantages of incorporating plogging into your fitness routine.",
      author: "Dr. Amina Hassan",
      date: "2024-04-28",
      readTime: "6 min read",
      category: "Health",
      tags: ["health", "fitness", "wellness"],
      image: "/story-4.png",
      featured: true
    },
    {
      id: 5,
      title: "Youth Engagement in Environmental Conservation: The Future of Plogging",
      excerpt: "How young people are leading the charge in environmental awareness through plogging initiatives.",
      author: "Lihiq Kefyalew",
      date: "2024-04-22",
      readTime: "4 min read",
      category: "Community",
      tags: ["youth", "leadership", "future"],
      image: "/about-5.png",
      featured: false
    },
    {
      id: 6,
      title: "Sustainable Living Tips: Small Changes, Big Impact",
      excerpt: "Practical advice for incorporating sustainable practices into your daily life beyond plogging.",
      author: "Amnen Kefyalew",
      date: "2024-04-15",
      readTime: "5 min read",
      category: "Lifestyle",
      tags: ["sustainability", "tips", "lifestyle"],
      image: "/about-6.png",
      featured: false
    }
  ]);

  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(blogPosts.map(post => post.category)))];

  // Get all tags
  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  // Filter posts based on category and search query
  useEffect(() => {
    let result = blogPosts;
    
    if (selectedCategory !== 'All') {
      result = result.filter(post => post.category === selectedCategory);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredPosts(result);
  }, [selectedCategory, searchQuery, blogPosts]);

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
              
              <div className="flex flex-wrap gap-2">
                <Tag className="text-green-600 h-5 w-5" />
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
                  key={post.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="md:flex">
                    <div className="md:w-2/5">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                    <div className="md:w-3/5">
                      <CardContent className="p-6">
                        <Badge className="mb-2 bg-green-600">{post.category}</Badge>
                        <h3 className="text-xl font-bold mb-2 text-green-800">{post.title}</h3>
                        <p className="text-gray-600 mb-4">{post.excerpt}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-1" />
                          <span className="mr-4">{post.author}</span>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span className="mr-4">{new Date(post.date).toLocaleDateString()}</span>
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{post.readTime}</span>
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
                  key={post.id} 
                  className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-48 object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      {post.category}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2 text-green-800">{post.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                    
                    <div className="flex items-center text-gray-500 text-xs mb-3">
                      <User className="h-3 w-3 mr-1" />
                      <span className="mr-3">{post.author}</span>
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.readTime}
                      </span>
                      <Button variant="link" size="sm" className="text-green-600 p-0 h-auto">
                        Read more <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
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