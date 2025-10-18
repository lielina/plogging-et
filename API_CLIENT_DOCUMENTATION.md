# Plogging Ethiopia API Client Documentation

## Overview

The Plogging Ethiopia frontend application includes a comprehensive API client implementation that simplifies interactions with the backend API. The client is implemented as a TypeScript class (`ApiClient`) and provides methods for all available API endpoints.

## File Location

The API client is located at:
```
src/lib/api.ts
```

## Initialization

The API client is instantiated as a singleton:
```typescript
import { apiClient } from './lib/api';

// The client is automatically initialized with the base URL
// No additional setup is required
```

## Base URL Configuration

The API client uses a predefined base URL:
```typescript
const BASE_URL = 'https://ploggingapi.pixeladdis.com/api/v1';
```

## Authentication

The API client automatically handles authentication by:
1. Storing the JWT token in localStorage upon login
2. Including the token in the Authorization header for authenticated requests
3. Automatically clearing the token on logout or authentication errors

### Login Methods

```typescript
// Volunteer login
const loginResponse = await apiClient.volunteerLogin(email, password);

// Admin login
const loginResponse = await apiClient.adminLogin(username, password);
```

### Logout Method

```typescript
// Logout (clears token and user data)
await apiClient.logout();
```

## Error Handling

The API client includes built-in error handling that:
1. Parses error responses
2. Provides descriptive error messages
3. Handles validation errors
4. Automatically clears tokens for 401/403 errors on profile endpoints

## Available Methods

### Authentication Methods

```typescript
// Volunteer authentication
async volunteerLogin(email: string, password: string): Promise<LoginResponse>
async volunteerRegister(data: VolunteerRegistrationData): Promise<LoginResponse>
async logout(): Promise<void>

// Admin authentication
async adminLogin(username: string, password: string): Promise<LoginResponse>

// Password reset
async requestPasswordReset(email: string): Promise<{ message: string }>
async resetPassword(token: string, newPassword: string): Promise<{ message: string }>
```

### Volunteer Profile Methods

```typescript
// Get volunteer profile
async getVolunteerProfile(): Promise<{ data: Volunteer }>

// Update volunteer profile
async updateVolunteerProfile(data: Partial<Volunteer>): Promise<{ data: Volunteer }>

// Change password
async changePassword(data: ChangePasswordRequest): Promise<{ message: string }>

// Profile image management
async uploadProfileImage(file: File): Promise<{ data: { profile_image: string } }>
async deleteProfileImage(): Promise<{ message: string }>
```

### Volunteer Statistics Methods

```typescript
// Get volunteer statistics
async getVolunteerStatistics(): Promise<{ data: any }>
```

### Event Methods

```typescript
// Get available events
async getAvailableEvents(page?: number, perPage?: number): Promise<{ data: Event[], pagination?: any }>

// Get event details
async getEventDetails(eventId: number): Promise<{ data: Event }>
```

### Enrollment Methods

```typescript
// Enroll in event
async enrollInEvent(eventId: number): Promise<{ data: any }>

// Cancel enrollment
async cancelEnrollment(enrollmentId: number): Promise<{ data: any }>
```

### Attendance Methods

```typescript
// Check in to event
async checkIn(eventId: number, qrCode: string): Promise<{ data: any }>

// Check out from event
async checkOut(eventId: number, qrCode: string): Promise<{ data: any }>
```

### Badge Methods

```typescript
// Get volunteer badges
async getVolunteerBadges(): Promise<{ data: VolunteerBadge[] }>
```

### Certificate Methods

```typescript
// Get volunteer certificates
async getVolunteerCertificates(): Promise<{ data: VolunteerCertificate[] }>

// Download certificate
async downloadCertificate(certificateId: number): Promise<Blob>
```

The `downloadCertificate` method now directly calls the `/volunteer/certificates/{certificate_id}/download` endpoint, which returns the certificate PDF file as a binary blob. This is more efficient than the previous implementation that required fetching certificate metadata first.

### Admin Dashboard Methods

```typescript
// Get admin dashboard
async getAdminDashboard(): Promise<{ data: any }>
```

### Admin Profile Methods

```typescript
// Get admin profile
async getAdminProfile(): Promise<{ data: Admin }>

// Update admin profile
async updateAdminProfile(data: Partial<Admin>): Promise<{ data: Admin }>
```

### Admin Volunteer Management Methods

```typescript
// Get all volunteers
async getAllVolunteers(page?: number, perPage?: number, search?: string): Promise<{ data: Volunteer[], pagination: any }>

// Create volunteer
async createVolunteer(data: VolunteerCreationData): Promise<{ data: Volunteer }>

// Get volunteer details
async getVolunteerDetails(volunteerId: number): Promise<{ data: DetailedVolunteer }>

// Update volunteer
async updateVolunteer(volunteerId: number, data: Partial<Volunteer>): Promise<{ data: Volunteer }>

// Delete volunteer
async deleteVolunteer(volunteerId: number): Promise<{ data: any }>
```

### Admin Event Management Methods

```typescript
// Get all events
async getAllEvents(page?: number, perPage?: number): Promise<{ data: Event[], pagination: any }>

// Create event
async createEvent(data: EventCreationData): Promise<{ data: Event }>

// Update event
async updateEvent(eventId: number, data: Partial<Event>): Promise<{ data: Event }>

// Delete event
async deleteEvent(eventId: number): Promise<{ data: any }>

// Get event QR code
async getEventQRCode(eventId: number): Promise<{ data: { qr_code_path: string } }>
```

### Admin Badge Management Methods

```typescript
// Get all badges
async getAllBadges(): Promise<{ data: Badge[] }>

// Create badge
async createBadge(data: BadgeCreationData): Promise<{ data: Badge }>

// Award badge
async awardBadge(volunteerId: number, badgeId: number): Promise<{ data: any }>
```

### Admin Certificate Management Methods

```typescript
// Get all certificates
async getAllCertificates(page?: number, perPage?: number): Promise<{ data: Certificate[], pagination: any }>

// Generate event certificate
async generateEventCertificate(volunteerId: number, eventId: number): Promise<{ data: Certificate }>

// Generate milestone certificate
async generateMilestoneCertificate(volunteerId: number, milestoneHours: number): Promise<{ data: Certificate }>
```

### Admin Report Methods

```typescript
// Platform statistics
async getPlatformStats(): Promise<{ data: any }>

// Volunteer activity report
async getVolunteerActivityReport(): Promise<{ data: any }>

// Event performance report
async getEventPerformanceReport(): Promise<{ data: any }>

// Top volunteers report
async getTopVolunteersReport(): Promise<{ data: any }>
async getPublicTopVolunteersReport(): Promise<{ data: any }>

// Badge distribution report
async getBadgeDistributionReport(): Promise<{ data: any }>
```

### Admin Management Methods

```typescript
// Get all admins
async getAllAdmins(): Promise<{ data: Admin[] }>

// Create admin
async createAdmin(data: AdminCreationData): Promise<{ data: Admin }>

// Update admin
async updateAdmin(adminId: number, data: Partial<Admin>): Promise<{ data: Admin }>

// Delete admin
async deleteAdmin(adminId: number): Promise<{ data: any }>

// Reset admin password
async resetAdminPassword(adminId: number, newPassword: string): Promise<{ message: string }>
```

### Survey Methods

```typescript
// Submit survey
async submitSurvey(data: SurveyRequest): Promise<{ message: string }>

// Get all surveys (Admin)
async getAllSurveys(): Promise<{ data: any[] }>
```

## Usage Examples

### Login and Profile Retrieval

```typescript
import { apiClient } from './lib/api';

// Login
try {
  const loginResponse = await apiClient.volunteerLogin('user@example.com', 'password123');
  console.log('Login successful', loginResponse);
  
  // Get profile
  const profileResponse = await apiClient.getVolunteerProfile();
  console.log('Profile:', profileResponse.data);
} catch (error) {
  console.error('Login failed:', error.message);
}
```

### Event Enrollment

```typescript
// Get available events
const eventsResponse = await apiClient.getAvailableEvents(1, 10);
const events = eventsResponse.data;

// Enroll in first event
if (events.length > 0) {
  const eventId = events[0].event_id;
  const enrollmentResponse = await apiClient.enrollInEvent(eventId);
  console.log('Enrolled in event:', enrollmentResponse.data);
}
```

### Certificate Download

```typescript
// Get certificates
const certificatesResponse = await apiClient.getVolunteerCertificates();
const certificates = certificatesResponse.data;

// Download first certificate
if (certificates.length > 0) {
  const certificateId = certificates[0].certificate_id;
  try {
    const blob = await apiClient.downloadCertificate(certificateId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificate-${certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error.message);
  }
}
```

## Error Handling in Components

```typescript
import { apiClient } from './lib/api';
import { toast } from 'sonner';

try {
  const response = await apiClient.updateVolunteerProfile({
    first_name: 'New Name'
  });
  toast.success('Profile updated successfully');
} catch (error) {
  toast.error(`Failed to update profile: ${error.message}`);
}
```

## Type Definitions

The API client includes comprehensive TypeScript interfaces for all data structures:

- `Volunteer` - Basic volunteer information
- `DetailedVolunteer` - Extended volunteer information with related data
- `Event` - Event information
- `Badge` - Badge information
- `Certificate` - Certificate information
- And many more...

These types provide IntelliSense support and compile-time type checking when using the API client.