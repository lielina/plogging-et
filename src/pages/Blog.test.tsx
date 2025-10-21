import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Blog from './Blog';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Search: () => <div data-testid="search-icon" />,
  Tag: () => <div data-testid="tag-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  User: () => <div data-testid="user-icon" />,
  Leaf: () => <div data-testid="leaf-icon" />,
  ChevronRight: () => <div data-testid="chevron-right-icon" />,
  ArrowUp: () => <div data-testid="arrow-up-icon" />,
}));

describe('Blog', () => {
  const renderWithRouter = (component: React.ReactNode) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  test('renders blog page with title', () => {
    renderWithRouter(<Blog />);
    
    // Check if the main title is rendered
    expect(screen.getByText('Plogging Blog')).toBeInTheDocument();
    
    // Check if the description is rendered
    expect(screen.getByText(/Discover stories, tips, and insights/i)).toBeInTheDocument();
  });

  test('renders search and filter section', () => {
    renderWithRouter(<Blog />);
    
    // Check if search icon is rendered
    expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    
    // Check if tag icon is rendered
    expect(screen.getByTestId('tag-icon')).toBeInTheDocument();
    
    // Check if category buttons are rendered
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Environment')).toBeInTheDocument();
  });

  test('renders blog posts', () => {
    renderWithRouter(<Blog />);
    
    // Check if at least one blog post is rendered
    expect(screen.getByText('The Environmental Impact of Plogging')).toBeInTheDocument();
    
    // Check if image is rendered
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });

  test('renders featured posts section', () => {
    renderWithRouter(<Blog />);
    
    // Check if featured articles section is rendered
    expect(screen.getByText('Featured Articles')).toBeInTheDocument();
    
    // Check if featured post is rendered
    expect(screen.getByText('The Environmental Impact of Plogging')).toBeInTheDocument();
  });
});