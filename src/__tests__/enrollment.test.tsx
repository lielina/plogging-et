import { render, screen, act } from '@testing-library/react';
import { apiClient } from '@/lib/api';
import Events from '@/pages/Events';
import { useToast } from '@/hooks/use-toast';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn()
}));

// Mock the apiClient
jest.mock('@/lib/api', () => ({
  apiClient: {
    getAvailableEvents: jest.fn(),
    enrollInEvent: jest.fn()
  }
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => <a href={to}>{children}</a>
}));

describe('Events Enrollment', () => {
  const mockToast = jest.fn();
  
  beforeEach(() => {
    (useToast as jest.Mock).mockReturnValue({ toast: mockToast });
    jest.clearAllMocks();
  });

  it('should display events correctly', async () => {
    const mockEvents = [
      {
        event_id: 1,
        event_name: 'Test Event',
        description: 'Test Description',
        event_date: '2023-12-01',
        start_time: '09:00:00',
        end_time: '12:00:00',
        location_name: 'Test Location',
        latitude: 9.0,
        longitude: 38.0,
        estimated_duration_hours: 3,
        max_volunteers: 20,
        status: 'Active'
      }
    ];

    (apiClient.getAvailableEvents as jest.Mock).mockResolvedValue({ data: mockEvents });

    await act(async () => {
      render(<Events />);
    });

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('should handle enrollment success', async () => {
    const mockEvents = [
      {
        event_id: 1,
        event_name: 'Test Event',
        description: 'Test Description',
        event_date: '2023-12-01',
        start_time: '09:00:00',
        end_time: '12:00:00',
        location_name: 'Test Location',
        latitude: 9.0,
        longitude: 38.0,
        estimated_duration_hours: 3,
        max_volunteers: 20,
        status: 'Active',
        is_enrolled: false,
        can_enroll: true
      }
    ];

    (apiClient.getAvailableEvents as jest.Mock).mockResolvedValue({ data: mockEvents });
    (apiClient.enrollInEvent as jest.Mock).mockResolvedValue({});

    await act(async () => {
      render(<Events />);
    });

    const enrollButton = screen.getByText('Enroll Now');
    await act(async () => {
      enrollButton.click();
    });

    expect(apiClient.enrollInEvent).toHaveBeenCalledWith(1);
    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Enrollment Successful!",
      variant: "default"
    }));
  });

  it('should handle "Already enrolled" error', async () => {
    const mockEvents = [
      {
        event_id: 1,
        event_name: 'Test Event',
        description: 'Test Description',
        event_date: '2023-12-01',
        start_time: '09:00:00',
        end_time: '12:00:00',
        location_name: 'Test Location',
        latitude: 9.0,
        longitude: 38.0,
        estimated_duration_hours: 3,
        max_volunteers: 20,
        status: 'Active',
        is_enrolled: false,
        can_enroll: true
      }
    ];

    (apiClient.getAvailableEvents as jest.Mock).mockResolvedValue({ data: mockEvents });
    (apiClient.enrollInEvent as jest.Mock).mockRejectedValue(new Error('Already enrolled in this event'));

    await act(async () => {
      render(<Events />);
    });

    const enrollButton = screen.getByText('Enroll Now');
    await act(async () => {
      enrollButton.click();
    });

    expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({
      title: "Already Enrolled",
      variant: "destructive"
    }));
  });
});