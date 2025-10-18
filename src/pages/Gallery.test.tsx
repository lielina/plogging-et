import React from 'react';
import { render, screen } from '@testing-library/react';
import Gallery from './Gallery';

// Mock the react-router-dom hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

// Mock the lucide-react icons
jest.mock('lucide-react', () => ({
  Filter: () => <div data-testid="filter-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  MapPin: () => <div data-testid="map-pin-icon" />,
}));

describe('Gallery', () => {
  test('renders gallery page with title', () => {
    render(<Gallery />);
    
    // Check if the main title is rendered
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    
    // Check if the description is rendered
    expect(screen.getByText(/Explore moments from our plogging events/i)).toBeInTheDocument();
  });

  test('renders filter section', () => {
    render(<Gallery />);
    
    // Check if filter icon is rendered
    expect(screen.getByTestId('filter-icon')).toBeInTheDocument();
    
    // Check if category buttons are rendered
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Events')).toBeInTheDocument();
  });

  test('renders gallery items', () => {
    render(<Gallery />);
    
    // Check if at least one gallery item is rendered
    expect(screen.getByText('Community Cleanup at Entoto Park')).toBeInTheDocument();
    
    // Check if image is rendered
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
});