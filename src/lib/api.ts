// Frontend URL configuration
export const FRONTEND_URL = 'https://plogging-user-wyci.vercel.app';

// API Base URL configuration
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
  profile_image?: string;
  profile_image_url?: string; // Profile image URL
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
  profile_image?: string; // Profile image URL
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
  image_path?: string; // Add image_path field
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

// Add Blog and Gallery interfaces
export interface BlogPostItem {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  status?: string;
  // Tags can be at the top level (as per API requirements) or in meta_data
  tags?: string[];
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

export interface BlogComment {
  id: number;
  post_id: number;
  blog_post_id?: number; // Add this field to match backend response
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: number;
  title: string;
  description: string | null;
  image_path?: string; // raw backend field
  thumbnail_path?: string; // raw backend field
  image_url?: string; // full URL from backend
  thumbnail_url?: string; // full URL from backend
  album_id: number | null;
  event_id?: number | null;
  sort_order?: string | number;
  created_at: string;
  updated_at: string;
  album?: { id: number; name: string } | null;
  event?: any | null;
}

export interface PaginatedResponse<T> {
  status?: string;
  data: {
    current_page: number;
    data: T[];
    first_page_url?: string;
    last_page: number;
    last_page_url?: string;
    next_page_url: string | null;
    prev_page_url: string | null;
    per_page: number;
    to?: number;
    total: number;
    path?: string;
    from?: number;
    links?: Array<{ url: string | null; label: string; active: boolean }>;
  };
  message?: string;
}

export interface GalleryAlbum {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
  updated_at: string;
}

export interface EPloggingPost {
  post_id: number;
  // For admin endpoints, backend may return 'id' instead of 'post_id'
  id?: number;
  volunteer_id: number;
  quote: string;
  image_path: string;
  image_url?: string;
  location: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  // Admin endpoints may return these fields
  title?: string;
  description?: string;
  volunteer: {
    volunteer_id: number;
    first_name: string;
    last_name: string;
    profile_image?: string;
    profile_image_url?: string;
  };
}

export interface EPloggingSubmission {
  image: File;
  quote: string;
  location: string;
  
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

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body
    });

    const response = await fetch(url, {
      ...options,
      headers,
      // Remove credentials option to fix CORS issue with wildcard origin
      // credentials: 'include',
    });

    console.log('API Response:', {
      url,
      status: response.status,
      statusText: response.statusText
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: `HTTP error! status: ${response.status}` };
      }

      console.log('API Error Response:', errorData);

      // Only clear token for 401 (Unauthorized) and 403 (Forbidden) errors on profile endpoints
      // This prevents logout when accessing admin-only pages like leaderboard
      if (response.status === 401 || response.status === 403) {
        // Check if it's a profile endpoint specifically
        if (endpoint.includes('/profile')) {
          this.clearToken();
        }
      }

      // Create a more descriptive error message
      const errorMessage = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;

      // Include validation errors if present
      if (errorData.errors) {
        const validationErrors = Object.values(errorData.errors).flat().join(', ');
        throw new Error(`${errorMessage}: ${validationErrors}`);
      }

      // Include status code in error message for better debugging
      throw new Error(`${errorMessage} (Status: ${response.status})`);
    }

    const responseData = await response.json();
    console.log('API Success Response:', responseData);
    return responseData;
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

  /**
   * Fetch an image as a blob to avoid CORS issues
   * For public assets like /uploads/, tries without Authorization header first
   * since CORS preflight may not allow Authorization header
   */
  async fetchImageAsBlob(imageUrl: string): Promise<Blob> {
    // Always ensure we have the latest token from localStorage
    this.token = localStorage.getItem('token');

    // Check if the URL is a full URL or a relative path
    let url: string;
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // Full URL - extract the path part if it's from the API server
      const apiBaseMatch = imageUrl.match(/https?:\/\/[^/]+(\/.*)/);
      if (apiBaseMatch && imageUrl.includes('ploggingapi.pixeladdis.com')) {
        // Try to fetch through API base URL if it's from the same server
        const path = apiBaseMatch[1];
        // Check if path starts with /uploads or /api
        if (path.startsWith('/uploads')) {
          // Try fetching directly from the uploads path
          // The server at this path needs CORS headers configured
          url = imageUrl; // Use full URL as-is
        } else {
          url = imageUrl;
        }
      } else {
        url = imageUrl;
      }
    } else {
      // Relative path - prepend API base URL (without /api/v1 for uploads)
      if (imageUrl.startsWith('/uploads')) {
        // Construct full URL for uploads
        const baseUrl = this.baseURL.replace('/api/v1', '');
        url = `${baseUrl}${imageUrl}`;
      } else {
        url = `${this.baseURL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
      }
    }

    // Check if this is a public asset (uploads) that doesn't require auth
    const isPublicAsset = url.includes('/uploads/');

    console.log('Fetching image as blob:', url, isPublicAsset ? '(public asset, no auth)' : '(with auth)');

    try {
      // For public assets, try without Authorization header first to avoid CORS issues
      if (isPublicAsset) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            credentials: 'omit',
          });

          if (response.ok) {
            const blob = await response.blob();
            if (blob.type.startsWith('image/')) {
              return blob;
            }
          }
          // If 401/403, fall through to try with auth
          if (response.status === 401 || response.status === 403) {
            console.log('Public fetch returned 401/403, trying with auth...');
          }
        } catch (publicError: any) {
          // If CORS error on public fetch, it means we can't use Authorization header
          // Fall through to try Image element method instead
          if (publicError.message?.includes('CORS') || publicError.message?.includes('blocked')) {
            throw new Error('CORS_BLOCKED_PUBLIC');
          }
          // Other errors, try with auth
        }
      }

      // Try with Authorization header (for protected assets or if public failed with 401/403)
      const headers: Record<string, string> = {};
      if (this.token && !isPublicAsset) {
        headers.Authorization = `Bearer ${this.token}`;
      } else if (this.token && isPublicAsset) {
        // For uploads, server may block Authorization in CORS, so try without first
        // But if we're here, public fetch may have failed, so try with auth anyway
        headers.Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: Object.keys(headers).length > 0 ? headers : undefined,
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      
      // Validate it's an image
      if (!blob.type.startsWith('image/')) {
        throw new Error(`Invalid image type: ${blob.type}`);
      }

      return blob;
    } catch (error: any) {
      // Provide helpful error message for CORS issues
      const errorMessage = error.message || String(error);
      if (errorMessage === 'CORS_BLOCKED_PUBLIC' || errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch') || errorMessage.includes('blocked')) {
        // Re-throw with a clear message that the image element method should be used
        throw new Error('CORS_BLOCKED');
      }
      throw error;
    }
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
    const response = await this.request<{ data: Volunteer }>('/volunteer/profile');
    console.log('Get volunteer profile response:', response);
    return response;
  }

  async updateVolunteerProfile(data: Partial<Volunteer>): Promise<{ data: Volunteer }> {
    return this.request<{ data: Volunteer }>('/volunteer/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Profile Image Upload
  async uploadProfileImage(file: File): Promise<{ data: { profile_image: string } }> {
    const formData = new FormData();
    // Try different field names that the server might expect
    formData.append('profile_image', file);
    // formData.append('image', file);
    // formData.append('image_url', file);

    console.log('Uploading profile image with field name: profile_image');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Log FormData contents
    for (let [key, value] of formData.entries()) {
      console.log('FormData entry:', key, value);
    }

    try {
      // Use PUT request to /volunteer/profile with FormData to update profile image
      const response = await this.request<{ data: { profile_image: string } }>(
        "/volunteer/profile?_method=PUT",
        {
          method: "POST",
        body: formData,
        headers: {}, // Let the browser set Content-Type for FormData
      });

      console.log('Profile image upload response:', response);
      return response;
    } catch (error) {
      console.error('Error during profile image upload:', error);
      throw error;
    }
  }

  async deleteProfileImage(): Promise<{ message: string }> {
    // To delete profile image, send PUT request with null profile_image
    console.log("Deleting profile image by setting profile_image to null");
    const response = await this.request<{ message: string }>(
      "/volunteer/profile",
      {
        method: "POST",
      body: JSON.stringify({ profile_image: null }),
    });
    console.log('Profile image delete response:', response);
    return response;
  }

  async getVolunteerStatistics(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/volunteer/statistics');
  }

  async getAvailableEvents(page: number = 1, perPage: number = 15): Promise<{ data: Event[], pagination?: any }> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });

    return this.request<{ data: Event[], pagination?: any }>(`/volunteer/events?${params.toString()}`);
  }

  async getEventDetails(eventId: number): Promise<{ data: Event }> {
    const response = await this.request<{ data: Event }>(`/volunteer/events/${eventId}`);

    // Ensure the image_path is properly formatted in the response
    if (response.data && response.data.image_path && !response.data.image_path.startsWith('http')) {
      // If the image_path is relative, make it absolute and ensure it has a leading slash
      const imagePath = response.data.image_path.startsWith('/') ? response.data.image_path.slice(1) : response.data.image_path;
      response.data.image_path = `https://ploggingapi.pixeladdis.com/${imagePath}`;
    }

    return response;
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
    try {
      return await this.request<{ data: any }>('/volunteer/enrollments', {
        method: 'POST',
        body: JSON.stringify({ event_id: eventId, volunteer_id: volunteerId }),
      });
    } catch (error: any) {
      // Provide more specific error messages for enrollment issues
      if (error.message && (error.message.includes('404') || error.message.includes('500'))) {
        throw new Error('System limitation: Only volunteers can enroll themselves in events. Please share the event link with the volunteer so they can enroll through their dashboard.');
      }
      throw error;
    }
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

  async getVolunteerBadges(): Promise<{ data: VolunteerBadge[] }> {
    try {
      const response = await this.request<{ data: VolunteerBadge[] }>('/volunteer/badges');
      // Ensure we always return an array, even if the response is malformed
      if (!response.data || !Array.isArray(response.data)) {
        console.warn('Badges API returned invalid data structure:', response);
        return { data: [] };
      }
      return response;
    } catch (error) {
      console.error('Error fetching volunteer badges:', error);
      // Return empty array on error to prevent UI breakage
      return { data: [] };
    }
  }

  async getVolunteerCertificates(): Promise<{ data: VolunteerCertificate[] }> {
    return this.request<{ data: VolunteerCertificate[] }>('/volunteer/certificates');
  }

  async downloadCertificate(certificateId: number): Promise<Blob> {
    // Always ensure we have the latest token from localStorage
    this.token = localStorage.getItem('token');

    // First get the certificate details using the existing endpoint
    const response = await this.request<{ data: VolunteerCertificate }>(`/volunteer/certificates/${certificateId}`);

    // If there's a file_path, construct a download URL
    if (response.data && response.data.file_path) {
      // Try to construct a download URL from the file_path
      const downloadUrl = `${this.baseURL}${response.data.file_path}`;

      // For direct file download, we need to use fetch with authentication
      const downloadResponse = await fetch(downloadUrl, {
        headers: {
          'Authorization': this.token ? `Bearer ${this.token}` : '',
        },
      });

      if (!downloadResponse.ok) {
        // Handle specific error cases
        if (downloadResponse.status === 404) {
          throw new Error('Certificate file not found. Please contact an administrator to regenerate the certificate.');
        } else if (downloadResponse.status === 500) {
          throw new Error('Server error while retrieving certificate. Please try again later.');
        } else {
          throw new Error(`Failed to download certificate: ${downloadResponse.status} ${downloadResponse.statusText}`);
        }
      }

      return downloadResponse.blob();
    }

    // If no file_path, throw an error
    throw new Error('Certificate file path not available');
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
    console.log('Generating event certificate for volunteer:', volunteerId, 'event:', eventId);
    console.log('Making POST request to:', `${this.baseURL}/admin/certificates/generate-event`);

    try {
      const result = await this.request<{ data: Certificate }>('/admin/certificates/generate-event', {
        method: 'POST',
        body: JSON.stringify({ volunteer_id: volunteerId, event_id: eventId }),
      });
      console.log('Certificate generation successful:', result);
      return result;
    } catch (error) {
      console.error('Certificate generation failed:', error);
      throw error;
    }
  }

  async generateMilestoneCertificate(volunteerId: number, milestoneHours: number): Promise<{ data: Certificate }> {
    console.log('Generating milestone certificate for volunteer:', volunteerId, 'hours:', milestoneHours);
    console.log('Making POST request to:', `${this.baseURL}/admin/certificates/generate-milestone`);

    try {
      const result = await this.request<{ data: Certificate }>('/admin/certificates/generate-milestone', {
        method: 'POST',
        body: JSON.stringify({ volunteer_id: volunteerId, milestone_hours: milestoneHours }),
      });
      console.log('Milestone certificate generation successful:', result);
      return result;
    } catch (error) {
      console.error('Milestone certificate generation failed:', error);
      throw error;
    }
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
    return this.request<{ data: any }>('/reports/top-volunteers');
  }

  // Volunteer Reports (Public)
  async getPublicTopVolunteersReport(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/reports/top-volunteers');
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

  // Contact and Subscription Methods
  async submitContactForm(data: {
    name: string;
    email: string;
    message: string;
  }): Promise<{ message: string }> {
    return this.request<{ message: string }>('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async subscribeToNewsletter(email: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Add Blog Management endpoints
  async getAllBlogPosts(): Promise<{ data: BlogPostItem[] }> {
    return this.request<{ data: BlogPostItem[] }>('/blog/posts');
  }

  async getBlogPost(id: number): Promise<{ data: BlogPostItem }> {
    return this.request<{ data: BlogPostItem }>(`/blog/posts/${id}`);
  }

  async getBlogPostComments(postId: number): Promise<{ data: BlogComment[] }> {
    return this.request<{ data: BlogComment[] }>(`/blog/posts/${postId}/comments`);
  }

  async createBlogComment(postId: number, data: Partial<BlogComment>): Promise<{ data: BlogComment }> {
    return this.request<{ data: BlogComment }>(`/blog/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBlogCategories(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/blog/categories');
  }

  // Add Gallery Management endpoints
  async getGalleryAlbums(): Promise<{ data: GalleryAlbum[] }> {
    return this.request<{ data: GalleryAlbum[] }>('/gallery/albums');
  }

  async getAllGalleryImages(page: number = 1): Promise<PaginatedResponse<GalleryImage>> {
    return this.request<PaginatedResponse<GalleryImage>>(`/gallery/images?page=${page}`);
  }

  async getGalleryImagesByAlbum(albumId: number): Promise<{ data: GalleryImage[] }> {
    return this.request<{ data: GalleryImage[] }>(`/gallery/albums/${albumId}/images`);
  }

  // Add Event endpoints
  async getEventParticipants(eventId: number): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>(`/volunteer/events/${eventId}/participants`);
  }

  async getEventGallery(eventId: number): Promise<{ data: GalleryImage[] }> {
    return this.request<{ data: GalleryImage[] }>(`/volunteer/events/${eventId}/gallery`);
  }

  async submitEventFeedback(eventId: number, data: any): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Add Profile endpoints
  async updateProfileImage(file: File): Promise<{ data: { profile_image: string } }> {
    const formData = new FormData();
    formData.append('profile_image', file);

    return this.request<{ data: { profile_image: string } }>('/volunteer/profile/image', {
      method: 'PUT',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async getVolunteerHistory(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/volunteer/history');
  }

  // Add Notification endpoints
  async getNotifications(): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>('/volunteer/notifications');
  }

  async markNotificationAsRead(notificationId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/volunteer/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/volunteer/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  async markAllNotificationsAsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/volunteer/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async getUnreadNotificationsCount(): Promise<{ data: { count: number } }> {
    return this.request<{ data: { count: number } }>('/volunteer/notifications/unread-count');
  }

  // Add Contact endpoints
  async getContactInfo(): Promise<{ data: any }> {
    return this.request<{ data: any }>('/contact/info');
  }

  // Add Batch Certificate Generation endpoint
  async batchGenerateCertificates(data: {
    volunteer_ids: number[];
    certificate_type: string;
    event_id?: number;
  }): Promise<{ data: any }> {
    return this.request<{ data: any }>('/admin/certificates/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Badge-related endpoints
  async generateVolunteerBadge(volunteerId: number): Promise<{ data: any }> {
    return this.request<{ data: any }>(`/volunteer/${volunteerId}/badge`, {
      method: "POST",
    });
  }

  async shareBadge(badgeId: string, platform: string): Promise<{ data: any }> {
    return this.request<{ data: any }>(`/badge/${badgeId}/share`, {
      method: "POST",
      body: JSON.stringify({ platform }),
    });
  }

  async getVolunteerBadgesById(volunteerId: number): Promise<{ data: any[] }> {
    return this.request<{ data: any[] }>(`/volunteer/${volunteerId}/badges`);
  }

  // Get paginated ePlogging posts
  async getEPloggingPosts(page = 1, perPage = 12): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    return this.request(`/volunteer/eplogging?${params.toString()}`);
  }

  // Get only my posts
  async getMyEPloggingPosts(page = 1, perPage = 22): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    return this.request(`/volunteer/eplogging/my-posts?${params.toString()}`); 
  }

  async getEPloggingPost(post_id: number): Promise<any> {
    return this.request(`/volunteer/eplogging/${post_id}`);
  }

  async createEPloggingPost(data: EPloggingSubmission): Promise<any> {
    const formData = new FormData();
    formData.append("location", data.location);
    formData.append("quote", data.quote);
    formData.append("image", data.image);
    return this.request("/volunteer/eplogging", {
      method: "POST",
      body: formData,
    });
  }

  async updateEPloggingPost(
    post_id: number,
    data: Partial<EPloggingSubmission>
  ): Promise<any> {
    const formData = new FormData();
    if (data.quote) formData.append("quote", data.quote);
    if (data.location) formData.append("location", data.location);
    if (data.image) formData.append("image", data.image);
    // Some backends (e.g., Laravel) require method override for multipart updates
    formData.append("_method", "PUT");

    return this.request(`/volunteer/eplogging/${post_id}`, {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async deleteEPloggingPost(post_id: number): Promise<{ message: string }> {
    return this.request(`/volunteer/eplogging/${post_id}`, { method: "DELETE" });
  }

  // Admin ePlogging endpoints
  async getAllEPloggingPosts(
    page = 1,
    perPage = 15,
    status?: string
  ): Promise<any> {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (status) params.append("status", status);

    return this.request(`/admin/eplogging?${params.toString()}`);
  }
}
export const apiClient = new ApiClient(BASE_URL);