# Blog Page Implementation

## Overview
The Blog page provides a platform for Plogging Ethiopia to share stories, tips, and insights about plogging, environmental conservation, and community wellness. It includes a main blog listing page with featured posts and filtering capabilities.

## Features
- Responsive blog listing with featured posts
- Category filtering and search functionality
- "Scroll to Top" button
- Blog preview section on the landing page

## File Structure
```
src/
├── pages/
│   ├── Blog.tsx              # Main blog listing page
│   └── Blog.test.tsx         # Unit tests for blog listing
├── styles/
│   └── blog.css              # Custom styles for blog pages
└── components/
    └── (navigation updated)   # Blog link in main navigation
```

## Components

### Blog Page (Blog.tsx)
- Displays a grid of blog posts with metadata
- Implements filtering by category
- Provides search functionality
- Shows featured posts in a special layout
- Includes "Scroll to Top" button
- Responsive design for all device sizes

### Navigation Updates
- Added Blog link to the main navigation
- Available in both desktop and mobile views

### Landing Page Integration
- Added blog preview section to showcase featured articles
- "Read More Articles" button linking to the main blog page

## Data Structure
The blog uses a simple data structure for posts:

```typescript
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
```

## Styling
Custom CSS is used to enhance the blog experience:
- Smooth animations and transitions
- Hover effects for cards and images
- Responsive grid layout
- Custom search input styling

## Future Enhancements
1. **API Integration**: Connect to a backend API to fetch real blog posts
2. **Pagination**: Implement pagination for large blog collections
3. **Advanced Filtering**: Add tag-based filtering and date range filtering
4. **SEO Optimization**: Add meta tags and structured data for better SEO

## Routes
- `/blog` - Main blog listing page
- Link from landing page blog preview section

## Dependencies
- React Router for navigation
- Lucide React for icons
- Tailwind CSS for styling
- Shadcn UI components

## Testing
Unit tests are included to verify:
- Page rendering
- Filter functionality
- Blog post display
- Navigation links