# Plogging Ethiopia API Documentation

## Overview

This document provides comprehensive documentation for the Plogging Ethiopia API endpoints. The API is organized into several resource categories including authentication, volunteer management, event management, badges, certificates, and administrative functions.

## Base URL

```
https://ploggingapi.pixeladdis.com/api/v1
```

## Authentication

All API requests requiring authentication must include a Bearer token in the Authorization header:

```
Authorization: Bearer <token>
```

Tokens are obtained through the login endpoints and are typically valid for a limited time.

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses follow this format:
```json
{
  "status": "error",
  "message": "Error description",
  "errors": {
    "field_name": ["Error message for field"]
  }
}
```

## Endpoints

### Volunteer Authentication

#### Register Volunteer
```
POST /auth/volunteer/register
```

Registers a new volunteer account.

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone_number": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "volunteer": {
      "volunteer_id": "integer",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "phone_number": "string",
      "qr_code_path": "string",
      "total_hours_contributed": "number"
    },
    "token": "string"
  }
}
```

#### Login Volunteer
```
POST /auth/volunteer/login
```

Authenticates a volunteer and returns an access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "volunteer": {
      "volunteer_id": "integer",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "phone_number": "string",
      "qr_code_path": "string",
      "total_hours_contributed": "number"
    },
    "token": "string"
  }
}
```

### Volunteer Profile Management

#### Get Volunteer Profile
```
GET /volunteer/profile
```

Retrieves the authenticated volunteer's profile information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "volunteer_id": "integer",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone_number": "string",
    "qr_code_path": "string",
    "total_hours_contributed": "number",
    "profile_image": "string (optional)"
  }
}
```

#### Update Volunteer Profile
```
PUT /volunteer/profile
```

Updates the authenticated volunteer's profile information.

**Request Body:**
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone_number": "string (optional)",
  "profile_image": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "volunteer_id": "integer",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone_number": "string",
    "qr_code_path": "string",
    "total_hours_contributed": "number",
    "profile_image": "string (optional)"
  }
}
```

#### Change Password
```
POST /volunteer/change-password
```

Changes the authenticated volunteer's password.

**Request Body:**
```json
{
  "current_password": "string",
  "new_password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password changed successfully"
}
```

### Volunteer Statistics

#### Get Volunteer Statistics
```
GET /volunteer/statistics
```

Retrieves statistics for the authenticated volunteer.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Statistics data structure
  }
}
```

### Volunteer Events

#### Get Available Events
```
GET /volunteer/events
```

Retrieves a list of available events for the volunteer to enroll in.

**Query Parameters:**
- `page` (integer, optional) - Page number for pagination
- `per_page` (integer, optional) - Number of items per page

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "event_id": "integer",
      "event_name": "string",
      "description": "string",
      "event_date": "string (date)",
      "start_time": "string (time)",
      "end_time": "string (time)",
      "location_name": "string",
      "latitude": "number",
      "longitude": "number",
      "estimated_duration_hours": "number",
      "max_volunteers": "integer",
      "status": "string",
      "qr_code_path": "string (optional)",
      "is_enrolled": "boolean (optional)",
      "enrollment_status": "string (optional)",
      "can_enroll": "boolean (optional)",
      "enrollment_id": "integer (optional)"
    }
  ],
  "pagination": {
    // Pagination data
  }
}
```

#### Get Event Details
```
GET /volunteer/events/{event_id}
```

Retrieves detailed information for a specific event.

**Path Parameters:**
- `event_id` (integer) - The ID of the event

**Response:**
```json
{
  "status": "success",
  "data": {
    "event_id": "integer",
    "event_name": "string",
    "description": "string",
    "event_date": "string (date)",
    "start_time": "string (time)",
    "end_time": "string (time)",
    "location_name": "string",
    "latitude": "number",
    "longitude": "number",
    "estimated_duration_hours": "number",
    "max_volunteers": "integer",
    "status": "string",
    "qr_code_path": "string (optional)",
    "is_enrolled": "boolean (optional)",
    "enrollment_status": "string (optional)",
    "can_enroll": "boolean (optional)",
    "enrollment_id": "integer (optional)"
  }
}
```

### Volunteer Enrollments

#### Enroll in Event
```
POST /volunteer/enrollments
```

Enrolls the authenticated volunteer in an event.

**Request Body:**
```json
{
  "event_id": "integer"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    // Enrollment data
  }
}
```

#### Cancel Enrollment
```
DELETE /volunteer/enrollments/{enrollment_id}
```

Cancels the authenticated volunteer's enrollment in an event.

**Path Parameters:**
- `enrollment_id` (integer) - The ID of the enrollment to cancel

**Response:**
```json
{
  "status": "success",
  "data": {
    // Cancellation confirmation data
  }
}
```

### Volunteer Attendance

#### Check In
```
POST /volunteer/attendance/check-in
```

Records the volunteer's check-in for an event using a QR code.

**Request Body:**
```json
{
  "event_id": "integer",
  "qr_code": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    // Check-in confirmation data
  }
}
```

#### Check Out
```
POST /volunteer/attendance/check-out
```

Records the volunteer's check-out for an event using a QR code.

**Request Body:**
```json
{
  "event_id": "integer",
  "qr_code": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    // Check-out confirmation data
  }
}
```

### Volunteer Badges

#### Get Volunteer Badges
```
GET /volunteer/badges
```

Retrieves all badges earned by the authenticated volunteer.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "badge_id": "integer",
      "badge_name": "string",
      "description": "string",
      "image_url": "string",
      "criteria_type": "string",
      "criteria_value": "number",
      "is_active": "boolean",
      "created_at": "string (datetime)",
      "updated_at": "string (datetime)",
      "pivot": {
        "volunteer_id": "string",
        "badge_id": "string",
        "earned_date": "string (date)",
        "created_at": "string (datetime)",
        "updated_at": "string (datetime)"
      }
    }
  ]
}
```

### Volunteer Certificates

#### Get Volunteer Certificates
```
GET /volunteer/certificates
```

Retrieves all certificates earned by the authenticated volunteer.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "certificate_id": "integer",
      "volunteer_id": "string",
      "event_id": "string (optional)",
      "certificate_type": "string",
      "hours_on_certificate": "string",
      "generation_date": "string (date)",
      "file_path": "string",
      "status": "string",
      "created_at": "string (datetime)",
      "updated_at": "string (datetime)"
    }
  ]
}
```

#### Download Certificate
```
GET /volunteer/certificates/{certificate_id}/download
```

Downloads a specific certificate file directly from the server.

**Path Parameters:**
- `certificate_id` (integer) - The ID of the certificate to download

**Authentication:**
This endpoint requires a valid JWT token in the Authorization header.

**Response:**
Binary file data (PDF)

**Error Responses:**
- `404 Not Found` - Certificate file not found
- `500 Internal Server Error` - Server error while retrieving certificate
- `401 Unauthorized` - Invalid or missing authentication token

### Password Reset

#### Request Password Reset
```
POST /auth/forgot-password
```

Sends a password reset email to the volunteer.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset email sent"
}
```

#### Reset Password
```
POST /auth/reset-password
```

Resets the volunteer's password using a reset token.

**Request Body:**
```json
{
  "token": "string",
  "new_password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset successful"
}
```

### Survey Management

#### Submit Survey
```
POST /volunteer/surveys
```

Submits a survey response from the volunteer.

**Request Body:**
```json
{
  "event_id": "integer (optional)",
  "plogging_location": "string",
  "age": "integer",
  "gender": "string (male|female|other)",
  "education_level": "string",
  "residence_area": "string",
  "employment_status": "string",
  "main_reason": "string",
  "main_reason_other": "string (optional)",
  "future_participation_likelihood": "integer",
  "participation_factors": ["string"],
  "barriers_to_participation": ["string"],
  "barriers_to_participation_other": "string (optional)",
  "overall_satisfaction": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Survey submitted successfully"
}
```

### Admin Authentication

#### Login Admin
```
POST /auth/admin/login
```

Authenticates an admin user and returns an access token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "admin": {
      "admin_id": "integer",
      "username": "string",
      "email": "string",
      "role": "string",
      "first_name": "string",
      "last_name": "string",
      "profile_image": "string (optional)"
    },
    "token": "string"
  }
}
```

### Admin Dashboard

#### Get Admin Dashboard
```
GET /admin/dashboard
```

Retrieves dashboard statistics for admin users.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Dashboard statistics
  }
}
```

### Admin Profile Management

#### Get Admin Profile
```
GET /admin/profile
```

Retrieves the authenticated admin's profile information.

**Response:**
```json
{
  "status": "success",
  "data": {
    "admin_id": "integer",
    "username": "string",
    "email": "string",
    "role": "string",
    "first_name": "string",
    "last_name": "string",
    "profile_image": "string (optional)"
  }
}
```

#### Update Admin Profile
```
PUT /admin/profile
```

Updates the authenticated admin's profile information.

**Request Body:**
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "email": "string (optional)",
  "profile_image": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "admin_id": "integer",
    "username": "string",
    "email": "string",
    "role": "string",
    "first_name": "string",
    "last_name": "string",
    "profile_image": "string (optional)"
  }
}
```

### Admin Volunteer Management

#### Get All Volunteers
```
GET /admin/volunteers
```

Retrieves a paginated list of all volunteers.

**Query Parameters:**
- `page` (integer, optional) - Page number for pagination
- `per_page` (integer, optional) - Number of items per page
- `search` (string, optional) - Search term to filter volunteers

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "volunteer_id": "integer",
      "first_name": "string",
      "last_name": "string",
      "email": "string",
      "phone_number": "string",
      "qr_code_path": "string",
      "total_hours_contributed": "number",
      "profile_image": "string (optional)"
    }
  ],
  "pagination": {
    // Pagination data
  }
}
```

#### Create Volunteer
```
POST /admin/volunteers
```

Creates a new volunteer account.

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone_number": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "volunteer_id": "integer",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone_number": "string",
    "qr_code_path": "string",
    "total_hours_contributed": "number"
  }
}
```

#### Get Volunteer Details
```
GET /admin/volunteers/{volunteer_id}
```

Retrieves detailed information for a specific volunteer.

**Path Parameters:**
- `volunteer_id` (integer) - The ID of the volunteer

**Response:**
```json
{
  "status": "success",
  "data": {
    "volunteer_id": "integer",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone_number": "string",
    "qr_code_path": "string",
    "total_hours_contributed": "number",
    "profile_image": "string (optional)",
    "registration_date": "string (datetime)",
    "last_login": "string (datetime)",
    "is_active": "boolean",
    "created_at": "string (datetime)",
    "updated_at": "string (datetime)",
    "enrollments": [
      // Enrollment data
    ],
    "badges": [
      // Badge data
    ],
    "certificates": [
      // Certificate data
    ]
  }
}
```

#### Update Volunteer
```
PUT /admin/volunteers/{volunteer_id}
```

Updates a volunteer's information.

**Path Parameters:**
- `volunteer_id` (integer) - The ID of the volunteer to update

**Request Body:**
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "email": "string (optional)",
  "phone_number": "string (optional)",
  "is_active": "boolean (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "volunteer_id": "integer",
    "first_name": "string",
    "last_name": "string",
    "email": "string",
    "phone_number": "string",
    "qr_code_path": "string",
    "total_hours_contributed": "number"
  }
}
```

#### Delete Volunteer
```
DELETE /admin/volunteers/{volunteer_id}
```

Deletes a volunteer account.

**Path Parameters:**
- `volunteer_id` (integer) - The ID of the volunteer to delete

**Response:**
```json
{
  "status": "success",
  "data": {
    // Deletion confirmation
  }
}
```

### Admin Event Management

#### Get All Events
```
GET /admin/events
```

Retrieves a paginated list of all events.

**Query Parameters:**
- `page` (integer, optional) - Page number for pagination
- `per_page` (integer, optional) - Number of items per page

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "event_id": "integer",
      "event_name": "string",
      "description": "string",
      "event_date": "string (date)",
      "start_time": "string (time)",
      "end_time": "string (time)",
      "location_name": "string",
      "latitude": "number",
      "longitude": "number",
      "estimated_duration_hours": "number",
      "max_volunteers": "integer",
      "status": "string",
      "qr_code_path": "string (optional)"
    }
  ],
  "pagination": {
    // Pagination data
  }
}
```

#### Create Event
```
POST /admin/events
```

Creates a new event.

**Request Body:**
```json
{
  "event_name": "string",
  "description": "string",
  "event_date": "string (date)",
  "start_time": "string (time)",
  "end_time": "string (time)",
  "location_name": "string",
  "latitude": "number",
  "longitude": "number",
  "estimated_duration_hours": "number",
  "max_volunteers": "integer",
  "status": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "event_id": "integer",
    "event_name": "string",
    "description": "string",
    "event_date": "string (date)",
    "start_time": "string (time)",
    "end_time": "string (time)",
    "location_name": "string",
    "latitude": "number",
    "longitude": "number",
    "estimated_duration_hours": "number",
    "max_volunteers": "integer",
    "status": "string"
  }
}
```

#### Update Event
```
PUT /admin/events/{event_id}
```

Updates an event's information.

**Path Parameters:**
- `event_id` (integer) - The ID of the event to update

**Request Body:**
```json
{
  "event_name": "string (optional)",
  "description": "string (optional)",
  "event_date": "string (date, optional)",
  "start_time": "string (time, optional)",
  "end_time": "string (time, optional)",
  "location_name": "string (optional)",
  "latitude": "number (optional)",
  "longitude": "number (optional)",
  "estimated_duration_hours": "number (optional)",
  "max_volunteers": "integer (optional)",
  "status": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "event_id": "integer",
    "event_name": "string",
    "description": "string",
    "event_date": "string (date)",
    "start_time": "string (time)",
    "end_time": "string (time)",
    "location_name": "string",
    "latitude": "number",
    "longitude": "number",
    "estimated_duration_hours": "number",
    "max_volunteers": "integer",
    "status": "string"
  }
}
```

#### Delete Event
```
DELETE /admin/events/{event_id}
```

Deletes an event.

**Path Parameters:**
- `event_id` (integer) - The ID of the event to delete

**Response:**
```json
{
  "status": "success",
  "data": {
    // Deletion confirmation
  }
}
```

#### Get Event QR Code
```
GET /admin/events/{event_id}/qr-code
```

Retrieves the QR code for a specific event.

**Path Parameters:**
- `event_id` (integer) - The ID of the event

**Response:**
```json
{
  "status": "success",
  "data": {
    "qr_code_path": "string"
  }
}
```

### Admin Badge Management

#### Get All Badges
```
GET /admin/badges
```

Retrieves all badges in the system.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "badge_id": "integer",
      "badge_name": "string",
      "description": "string",
      "image_url": "string",
      "criteria_type": "string",
      "criteria_value": "number"
    }
  ]
}
```

#### Create Badge
```
POST /admin/badges
```

Creates a new badge.

**Request Body:**
```json
{
  "badge_name": "string",
  "description": "string",
  "image_url": "string",
  "criteria_type": "string",
  "criteria_value": "number"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "badge_id": "integer",
    "badge_name": "string",
    "description": "string",
    "image_url": "string",
    "criteria_type": "string",
    "criteria_value": "number"
  }
}
```

#### Award Badge
```
POST /admin/badges/award
```

Awards a badge to a volunteer.

**Request Body:**
```json
{
  "volunteer_id": "integer",
  "badge_id": "integer"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    // Award confirmation data
  }
}
```

### Admin Certificate Management

#### Get All Certificates
```
GET /admin/certificates
```

Retrieves a paginated list of all certificates.

**Query Parameters:**
- `page` (integer, optional) - Page number for pagination
- `per_page` (integer, optional) - Number of items per page

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "certificate_id": "integer",
      "volunteer_id": "integer",
      "event_id": "integer (optional)",
      "certificate_type": "string",
      "issued_date": "string (date)",
      "download_url": "string"
    }
  ],
  "pagination": {
    // Pagination data
  }
}
```

#### Generate Event Certificate
```
POST /admin/certificates/generate-event
```

Generates a certificate for a volunteer's participation in an event.

**Request Body:**
```json
{
  "volunteer_id": "integer",
  "event_id": "integer"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "certificate_id": "integer",
    "volunteer_id": "integer",
    "event_id": "integer",
    "certificate_type": "string",
    "issued_date": "string (date)",
    "download_url": "string"
  }
}
```

#### Generate Milestone Certificate
```
POST /admin/certificates/generate-milestone
```

Generates a milestone certificate for a volunteer based on hours contributed.

**Request Body:**
```json
{
  "volunteer_id": "integer",
  "milestone_hours": "integer"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "certificate_id": "integer",
    "volunteer_id": "integer",
    "certificate_type": "string",
    "issued_date": "string (date)",
    "download_url": "string"
  }
}
```

#### Download Certificate
```
GET /admin/certificates/{certificate_id}/download
```

Downloads a specific certificate file directly from the server.

**Path Parameters:**
- `certificate_id` (integer) - The ID of the certificate to download

**Authentication:**
This endpoint requires a valid JWT token in the Authorization header.

**Response:**
Binary file data (PDF)

**Error Responses:**
- `404 Not Found` - Certificate file not found
- `500 Internal Server Error` - Server error while retrieving certificate
- `401 Unauthorized` - Invalid or missing authentication token

### Admin Reports & Analytics

#### Get Platform Statistics
```
GET /admin/reports/platform-stats
```

Retrieves overall platform statistics.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Platform statistics
  }
}
```

#### Get Volunteer Activity Report
```
GET /admin/reports/volunteer-activity
```

Retrieves a report on volunteer activity.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Volunteer activity data
  }
}
```

#### Get Event Performance Report
```
GET /admin/reports/event-performance
```

Retrieves a report on event performance.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Event performance data
  }
}
```

#### Get Top Volunteers Report
```
GET /admin/reports/top-volunteers
```

Retrieves a report of top volunteers.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Top volunteers data
  }
}
```

#### Get Badge Distribution Report
```
GET /admin/reports/badge-distribution
```

Retrieves a report on badge distribution.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Badge distribution data
  }
}
```

### Public Reports

#### Get Public Top Volunteers Report
```
GET /reports/top-volunteers
```

Retrieves a public report of top volunteers.

**Response:**
```json
{
  "status": "success",
  "data": {
    // Top volunteers data
  }
}
```

### Admin Management

#### Get All Admins
```
GET /admin/admins
```

Retrieves all admin users.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "admin_id": "integer",
      "username": "string",
      "email": "string",
      "role": "string",
      "first_name": "string",
      "last_name": "string",
      "profile_image": "string (optional)"
    }
  ]
}
```

#### Create Admin
```
POST /admin/admins
```

Creates a new admin user.

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "admin_id": "integer",
    "username": "string",
    "email": "string",
    "role": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

#### Update Admin
```
PUT /admin/admins/{admin_id}
```

Updates an admin user's information.

**Path Parameters:**
- `admin_id` (integer) - The ID of the admin to update

**Request Body:**
```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "email": "string (optional)",
  "username": "string (optional)"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "admin_id": "integer",
    "username": "string",
    "email": "string",
    "role": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

#### Delete Admin
```
DELETE /admin/admins/{admin_id}
```

Deletes an admin user.

**Path Parameters:**
- `admin_id` (integer) - The ID of the admin to delete

**Response:**
```json
{
  "status": "success",
  "data": {
    // Deletion confirmation
  }
}
```

#### Reset Admin Password
```
POST /admin/admins/{admin_id}/reset-password
```

Resets an admin user's password.

**Path Parameters:**
- `admin_id` (integer) - The ID of the admin whose password to reset

**Request Body:**
```json
{
  "new_password": "string"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password reset successful"
}
```

## Surveys (Admin)

#### Get All Surveys
```
GET /admin/surveys
```

Retrieves all survey responses.

**Response:**
```json
{
  "status": "success",
  "data": [
    // Survey data
  ]
}
```

## Health Check

#### Health Check
```
GET /health
```

Checks the health status of the API.

**Response:**
```json
{
  "status": "healthy"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Exceeding the rate limits will result in a 429 (Too Many Requests) response.

## CORS Policy

The API implements Cross-Origin Resource Sharing (CORS) to allow requests from authorized domains.

## Versioning

This documentation represents version 1 of the Plogging Ethiopia API.

## Support

For API support, contact the development team at [support email].