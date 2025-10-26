import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient, BlogPostItem, BlogComment } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  User, 
  ArrowLeft, 
  MessageCircle,
  Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const BlogPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [blogPost, setBlogPost] = useState<BlogPostItem | null>(null);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch blog post and comments
  useEffect(() => {
    const fetchData = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const [postResponse, commentsResponse] = await Promise.all([
          apiClient.getBlogPost(parseInt(postId)),
          apiClient.getBlogPostComments(parseInt(postId))
        ]);
        
        setBlogPost(postResponse.data);
        setComments(commentsResponse.data);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching blog post data:', err);
        setError(err.message || 'Failed to fetch blog post data');
        toast({
          title: "Error",
          description: "Failed to load blog post. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.author_name || !newComment.author_email || !newComment.content) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newComment.author_email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      // Note: In a real implementation, you would submit the comment to the backend
      // For now, we'll just add it to the local state to simulate the behavior
      const newCommentObj: BlogComment = {
        id: Date.now(), // Temporary ID
        post_id: parseInt(postId || '0'),
        author_name: newComment.author_name,
        author_email: newComment.author_email,
        content: newComment.content,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setComments([...comments, newCommentObj]);
      setNewComment({
        author_name: '',
        author_email: '',
        content: ''
      });
      
      toast({
        title: "Success",
        description: "Comment submitted successfully. It will be visible after moderation.",
      });
    } catch (err: any) {
      console.error('Error submitting comment:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to submit comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Blog Post</h2>
          <p className="text-red-600 mb-4">{error || 'Blog post not found'}</p>
          <Button onClick={() => navigate('/blog')} variant="outline">
            Back to Blog
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <div className="bg-white py-6">
        <div className="container mx-auto px-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/blog')}
            className="mb-4 flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
          
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-green-600">
              {typeof blogPost.category === 'object' && blogPost.category !== null 
                ? (blogPost.category as any).name || (blogPost.category as any).id 
                : blogPost.category}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">{blogPost.title}</h1>
            
            <div className="flex flex-wrap items-center text-gray-600 mb-6">
              <div className="flex items-center mr-6 mb-2">
                <User className="h-4 w-4 mr-2" />
                <span>{blogPost.author}</span>
              </div>
              <div className="flex items-center mr-6 mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{new Date(blogPost.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 mr-2" />
                <span>{blogPost.readTime}</span>
              </div>
            </div>
            
            <img 
              src={blogPost.image} 
              alt={blogPost.title} 
              className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-green max-w-none mb-12">
            <p className="text-lg text-gray-700 mb-6">{blogPost.excerpt}</p>
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blogPost.content }}
            />
          </div>

          {/* Tags */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-2">
              {blogPost.tags && Array.isArray(blogPost.tags) ? blogPost.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="text-sm py-1 px-3">
                  {tag}
                </Badge>
              )) : null}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              Comments ({comments.filter(c => c.status === 'approved').length})
            </h2>
            
            {/* Comment Form */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Leave a Comment</h3>
                <form onSubmit={handleCommentSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="author_name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <Input
                        id="author_name"
                        value={newComment.author_name}
                        onChange={(e) => setNewComment({...newComment, author_name: e.target.value})}
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="author_email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <Input
                        id="author_email"
                        type="email"
                        value={newComment.author_email}
                        onChange={(e) => setNewComment({...newComment, author_email: e.target.value})}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                      Comment *
                    </label>
                    <Textarea
                      id="content"
                      value={newComment.content}
                      onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                      placeholder="Write your comment here..."
                      rows={4}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Comment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Comments List */}
            {comments.filter(c => c.status === 'approved').length > 0 ? (
              <div className="space-y-6">
                {comments
                  .filter(comment => comment.status === 'approved')
                  .map(comment => (
                  <Card key={comment.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-green-800">{comment.author_name}</h4>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No comments yet</h3>
                <p className="text-gray-500">Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;