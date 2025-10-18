# Plogging Ethiopia API Summary

## Overview

The Plogging Ethiopia API provides a comprehensive set of endpoints for managing volunteers, events, badges, certificates, and administrative functions for the plogging platform. The API is organized into logical resource categories with clear separation between volunteer-facing and admin-facing functionality.

## Key Features

1. **User Authentication & Management**
   - Volunteer registration and login
   - Admin authentication
   - Password reset functionality
   - Profile management for both volunteers and admins

2. **Event Management**
   - Browse available events
   - Event enrollment and cancellation
   - Event check-in/check-out using QR codes
   - Admin event creation and management

3. **Volunteer Tracking**
   - Statistics and activity tracking
   - Badge earning system
   - Certificate generation and management
   - Volunteer leaderboard

4. **Administrative Functions**
   - Volunteer management
   - Event administration
   - Badge and certificate management
   - Reporting and analytics
   - Admin user management

## API Structure

The API is organized into the following main categories:

### Authentication Endpoints
- `/auth/volunteer/register` - Register new volunteers
- `/auth/volunteer/login` - Volunteer login
- `/auth/admin/login` - Admin login
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset

### Volunteer Endpoints
- `/volunteer/profile` - Profile management
- `/volunteer/statistics` - Volunteer statistics
- `/volunteer/events` - Event browsing
- `/volunteer/enrollments` - Event enrollment
- `/volunteer/attendance` - Check-in/check-out
- `/volunteer/badges` - Badge management
- `/volunteer/certificates` - Certificate management
- `/volunteer/surveys` - Survey submission

### Admin Endpoints
- `/admin/dashboard` - Admin dashboard
- `/admin/profile` - Admin profile management
- `/admin/volunteers` - Volunteer management
- `/admin/events` - Event management
- `/admin/badges` - Badge management
- `/admin/certificates` - Certificate management
- `/admin/reports` - Reporting and analytics
- `/admin/admins` - Admin user management

### Public Endpoints
- `/reports/top-volunteers` - Public volunteer leaderboard
- `/health` - API health check

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. After successful login, a token is returned which must be included in the Authorization header for all subsequent requests:

```
Authorization: Bearer <token>
```

## Data Formats

All API requests and responses use JSON format. Date and time values follow ISO 8601 format.

## Error Handling

The API uses standard HTTP status codes:
- 200 - Success
- 400 - Bad Request
- 401 - Unauthorized
- 403 - Forbidden
- 404 - Not Found
- 500 - Internal Server Error

Error responses include a status field, message, and optional error details.

## Rate Limiting

The API implements rate limiting to prevent abuse. Exceeding rate limits results in a 429 (Too Many Requests) response.

## Version

This documentation represents version 1 of the Plogging Ethiopia API.

## Base URL

```
https://ploggingapi.pixeladdis.com/api/v1
```

For detailed endpoint documentation, see the full API documentation.