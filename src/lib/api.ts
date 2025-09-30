const BASE_URL = 'https://ploggingapi.pixeladdis.com/api/v1';

// Additional Types from Postman Collection
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface EnrollmentRequest {
  event_id: number;
}

export interface AttendanceRequest {
  event_id: number;
  qr_code: string;
}

export interface SurveyRequest {
  event_id?: number;
  plogging_location: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  education_level: string;
  residence_area: string;
  employment_status: string;
  main_reason: string;
  main_reason_other?: string | null;
  future_participation_likelihood: number;
  participation_factors: string[];
  barriers_to_participation: string[];
  barriers_to_participation_other?: string | null;
  overall_satisfaction: string;
}

// Types
export interface Volunteer {
  volunteer_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  qr_code_path: string;
  total_hours_contributed: number;
  image_url?: string; // Profile image URL
}

export interface DetailedVolunteer extends Volunteer {
  registration_date: string;
  last_login: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  enrollments: VolunteerEnrollment[];
  badges: VolunteerBadge[];
  certificates: VolunteerCertificate[];
}

export interface VolunteerEnrollment {
  enrollment_id: number;
  volunteer_id: string;
  event_id: string;
  signup_date: string;
  status: string;
  created_at: string;
  updated_at: string;
  event: Event;
}

export interface VolunteerBadge {
  badge_id: number;
  badge_name: string;
  description: string;
  image_url: string;
  criteria_type: string;
  criteria_value: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  pivot: {
    volunteer_id: string;
    badge_id: string;
    earned_date: string;
    created_at: string;
    updated_at: string;
  };
}

export interface VolunteerCertificate {
  certificate_id: number;
  volunteer_id: string;
  event_id?: string;
  certificate_type: string;
  hours_on_certificate: string;
  generation_date: string;
  file_path: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Admin {
  admin_id: number;
  username: string;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  image_url?: string; // Profile image URL
}

export interface Event {
  event_id: number;
  event_name: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  latitude: number | string;
  longitude: number | string;
  estimated_duration_hours: number | string;
  max_volunteers: number;
  status: string;
  qr_code_path?: string;
  // Enrollment information that may be returned for volunteers
  is_enrolled?: boolean;
  enrollment_status?: string;
  can_enroll?: boolean;
  enrollment_id?: number;
}

export interface Badge {
  badge_id: number;
  badge_name: string;
  description: string;
  image_url: string;
  criteria_type: string;
  criteria_value: number;
}

export interface Certificate {
  certificate_id: number;
  volunteer_id: number;
  event_id?: number;
  certificate_type: string;
  issued_date: string;
  download_url: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    volunteer?: Volunteer;
    admin?: Admin;
    token: string;
  };
}

// API Client
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Always ensure we have the latest token from localStorage
    this.token = localStorage.getItem('token');

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      // Add credentials option to ensure cookies are sent with requests
      credentials: 'include',
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }

      // Only clear token for 401 (Unauthorized) and 403 (Forbidden) errors
      if (response.status === 401 || response.status === 403) {
        this.clearToken();
      }

      // Create a more descriptive error message
      const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;

      // Include validation errors if present
      if (errorData.errors) {
        const validationErrors = Object.values(errorData.errors).flat().join(', ');
        throw new Error(`${errorMessage}: ${validationErrors}`);
      }

      throw new Error(errorMessage);
    }

    return response.json();
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    // Clear user-specific data on logout
    localStorage.removeItem('userEnrollments');
    localStorage.removeItem('userType');
  }

  // Health Check
  async healthCheck() {
    return this.request<{ status: string }>('/health');
  }

  // Authentication
  async volunteerLogin(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/volunteer/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async volunteerRegister(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
  }): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/volunteer/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async adminLogin(username: string, password: string): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.data.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout() {
    try {
      await this.request('/volunteer/logout', { method: 'POST' });
    } catch (error) {
      // Ignore logout errors
    } finally {
      this.clearToken();
    }
  }

  // New Methods from Postman Collection
  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/volunteer/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Password Reset Functionality
  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  }

  async submitSurvey(data: SurveyRequest): Promise<{ message: string }> {
    return this.request<{ message: string }>('/volunteer/surveys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAllSurveys(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/admin/surveys');
  }

  async checkOut(eventId: number, qrCode: string): Promise<{ data: any }> {
    return this.request<{ data: any }>('/volunteer/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, qr_code: qrCode }),
    });
  }

  // Volunteer Endpoints
  async getVolunteerProfile(): Promise<{ data: Volunteer }> {
    return this.request<{ data: Volunteer }>('/volunteer/profile');
  }

  async updateVolunteerProfile(data: Partial<Volunteer>): Promise<{ data: Volunteer }> {
    return this.request<{ data: Volunteer }>('/volunteer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Profile Image Upload
  async uploadProfileImage(file: File): Promise<{ data: { image_url: string } }> {
    const formData = new FormData();
    formData.append('profile_image', file);

    return this.request<{ data: { image_url: string } }>('/volunteer/profile/image', {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set Content-Type for FormData
    });
  }

  async deleteProfileImage(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/volunteer/profile/image', {
      method: 'DELETE',
    });
  }

  async getVolunteerStatistics(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/volunteer/statistics');
  }

  async getAvailableEvents(): Promise<{ data: Event[] }> {
    return this.request<{ data: Event[] }>('/volunteer/events');
  }

  async getEventDetails(eventId: number): Promise<{ data: Event }> {
    return this.request<{ data: Event }>(`/volunteer/events/${eventId}`);
  }

  async getEventQRCode(eventId: number): Promise<{ data: { qr_code_path: string } }> {
    return this.request<{ data: { qr_code_path: string } }>(`/admin/events/${eventId}/qr-code`);
  }

  async enrollInEvent(eventId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>('/volunteer/enrollments', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId }),
    });
  }

  async enrollVolunteerInEvent(eventId: number, volunteerId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>('/volunteer/enrollments', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, volunteer_id: volunteerId }),
    });
  }

  async cancelEnrollment(enrollmentId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>(`/volunteer/enrollments/${enrollmentId}`, {
      method: 'DELETE',
    });
  }

  async checkIn(eventId: number, qrCode: string): Promise<{ data: any }> {
    return this.request<{ data: any }>('/volunteer/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ event_id: eventId, qr_code: qrCode }),
    });
  }

  async getVolunteerBadges(): Promise<{ data: Badge[] }> {
    return this.request<{ data: Badge[] }>('/volunteer/badges');
  }

  async getVolunteerCertificates(): Promise<{ data: VolunteerCertificate[] }> {
    return this.request<{ data: VolunteerCertificate[] }>('/volunteer/certificates');
  }

  // Admin Endpoints
  async getAdminDashboard(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/dashboard');
  }

  async getAdminProfile(): Promise<{ data: Admin }> {
    return this.request<{ data: Admin }>('/admin/profile');
  }

  async updateAdminProfile(data: Partial<Admin>): Promise<{ data: Admin }> {
    return this.request<{ data: Admin }>('/admin/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Volunteer Management (Admin)
  async getAllVolunteers(page: number = 1, perPage: number = 15, search?: string): Promise<{ data: Volunteer[], pagination: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    return this.request<{ data: Volunteer[], pagination: any }>(`/admin/volunteers?${params.toString()}`);
  }

  async createVolunteer(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
  }): Promise<{ data: Volunteer }> {
    return this.request<{ data: Volunteer }>('/admin/volunteers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVolunteerDetails(volunteerId: number): Promise<{ data: DetailedVolunteer }> {
    return this.request<{ data: DetailedVolunteer }>(`/admin/volunteers/${volunteerId}`);
  }

  async updateVolunteer(volunteerId: number, data: Partial<Volunteer>): Promise<{ data: Volunteer }> {
    return this.request<{ data: Volunteer }>(`/admin/volunteers/${volunteerId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVolunteer(volunteerId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>(`/admin/volunteers/${volunteerId}`, {
      method: 'DELETE',
    });
  }

  // Event Management (Admin)
  async getAllEvents(page: number = 1, perPage: number = 15): Promise<{ data: Event[], pagination: any }> {
    return this.request<{ data: Event[], pagination: any }>(`/admin/events?page=${page}&per_page=${perPage}`);
  }

  async createEvent(data: {
    event_name: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location_name: string;
    latitude: number;
    longitude: number;
    estimated_duration_hours: number;
    max_volunteers: number;
    status: string; // Add status field
  }): Promise<{ data: Event }> {
    return this.request<{ data: Event }>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(eventId: number, data: Partial<Event>): Promise<{ data: Event }> {
    return this.request<{ data: Event }>(`/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(eventId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>(`/admin/events/${eventId}`, {
      method: 'DELETE',
    });
  }

  // Badge Management (Admin)
  async getAllBadges(): Promise<{ data: Badge[] }> {
    return this.request<{ data: Badge[] }>('/admin/badges');
  }

  async createBadge(data: {
    badge_name: string;
    description: string;
    image_url: string;
    criteria_type: string;
    criteria_value: number;
  }): Promise<{ data: Badge }> {
    return this.request<{ data: Badge }>('/admin/badges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async awardBadge(volunteerId: number, badgeId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/badges/award', {
      method: 'POST',
      body: JSON.stringify({ volunteer_id: volunteerId, badge_id: badgeId }),
    });
  }

  // Certificate Management (Admin)
  async getAllCertificates(page: number = 1, perPage: number = 15): Promise<{ data: Certificate[], pagination: any }> {
    return this.request<{ data: Certificate[], pagination: any }>(`/admin/certificates?page=${page}&per_page=${perPage}`);
  }

  async generateEventCertificate(volunteerId: number, eventId: number): Promise<{ data: Certificate }> {
    return this.request<{ data: Certificate }>('/admin/certificates/generate-event', {
      method: 'POST',
      body: JSON.stringify({ volunteer_id: volunteerId, event_id: eventId }),
    });
  }

  async generateMilestoneCertificate(volunteerId: number, milestoneHours: number): Promise<{ data: Certificate }> {
    return this.request<{ data: Certificate }>('/admin/certificates/generate-milestone', {
      method: 'POST',
      body: JSON.stringify({ volunteer_id: volunteerId, milestone_hours: milestoneHours }),
    });
  }

  // Reports & Analytics (Admin)
  async getPlatformStats(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/reports/platform-stats');
  }

  async getVolunteerActivityReport(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/reports/volunteer-activity');
  }

  async getEventPerformanceReport(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/reports/event-performance');
  }

  async getTopVolunteersReport(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/reports/top-volunteers');
  }

  async getBadgeDistributionReport(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/reports/badge-distribution');
  }

  // Admin Management (Admin)
  async getAllAdmins(): Promise<{ data: Admin[] }> {
    return this.request<{ data: Admin[] }>('/admin/admins');
  }

  async createAdmin(data: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
  }): Promise<{ data: Admin }> {
    return this.request<{ data: Admin }>('/admin/admins', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdmin(adminId: number, data: Partial<Admin>): Promise<{ data: Admin }> {
    return this.request<{ data: Admin }>(`/admin/admins/${adminId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdmin(adminId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>(`/admin/admins/${adminId}`, {
      method: 'DELETE',
    });
  }

  async resetAdminPassword(adminId: number, newPassword: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/admin/admins/${adminId}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ new_password: newPassword }),
    });
  }
}

export const apiClient = new ApiClient(BASE_URL);