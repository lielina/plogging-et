# Plogging Ethiopia - Comprehensive System Documentation

## Overview

This document provides a comprehensive overview of the Plogging Ethiopia system, including API documentation, certificate generation functionality, and technical implementation details.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [API Documentation](#api-documentation)
3. [Certificate Generation System](#certificate-generation-system)
4. [Frontend Implementation](#frontend-implementation)
5. [Technical Components](#technical-components)
6. [Usage Guidelines](#usage-guidelines)

## System Architecture

The Plogging Ethiopia system consists of:

- **Frontend**: React/Vite application with TypeScript
- **Backend**: RESTful API service
- **Database**: Data persistence layer (implementation details not provided)
- **Authentication**: JWT-based authentication system

### Key Components

1. **Volunteer Management**: Registration, profile management, statistics tracking
2. **Event Management**: Event creation, enrollment, attendance tracking
3. **Badge System**: Achievement recognition with automatic badge assignment
4. **Certificate Generation**: PDF certificate creation for volunteer achievements
5. **Admin Panel**: Administrative tools for managing volunteers, events, and certificates
6. **Reporting**: Analytics and statistics for platform performance

## API Documentation

### Base URL
```
https://ploggingapi.pixeladdis.com/api/v1
```

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Main API Categories

1. **Authentication**
   - Volunteer registration and login
   - Admin login
   - Password reset functionality

2. **Volunteer Management**
   - Profile viewing and updating
   - Statistics retrieval
   - Event enrollment and attendance
   - Badge and certificate management

3. **Event Management**
   - Event browsing and details
   - Enrollment management
   - QR code-based check-in/check-out

4. **Certificate Management**
   - Certificate viewing and direct downloading via dedicated endpoint
   - Admin certificate generation (individual and batch)

5. **Admin Functions**
   - Dashboard statistics
   - Volunteer, event, and badge management
   - Reporting and analytics
   - Admin user management

For detailed API documentation, see:
- [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete endpoint documentation
- [API_SUMMARY.md](API_SUMMARY.md) - High-level API overview
- [API_ENDPOINTS_REFERENCE.md](API_ENDPOINTS_REFERENCE.md) - Concise endpoint reference
- [API_CLIENT_DOCUMENTATION.md](API_CLIENT_DOCUMENTATION.md) - Frontend API client usage

## Certificate Generation System

The certificate generation system is a key feature of the Plogging Ethiopia platform, allowing for recognition of volunteer achievements through professional PDF certificates.

### Key Features

1. **Multiple Certificate Types**
   - Event Participation Certificates
   - Achievement Certificates (based on hours contributed)
   - Leadership Recognition Certificates
   - Milestone Celebration Certificates

2. **Certificate Templates**
   - Standard Participation (Green theme)
   - Achievement Badge (Golden theme)
   - Leadership Recognition (Purple theme)
   - Milestone Celebration (Emerald theme)

3. **Generation Methods**
   - Individual certificate generation
   - Batch certificate generation for multiple volunteers
   - Live preview functionality
   - Real-time progress tracking for batch operations

4. **Badge System**
   - Automatic badge assignment based on volunteer hours:
     - Environmental Champion: 100+ hours
     - Green Warrior: 50-99 hours
     - Eco Hero: 25-49 hours
     - Community Helper: <25 hours

### Technical Implementation

The certificate generation system uses jsPDF for PDF creation and includes:

- Canvas-based rendering for high-quality certificates
- Multiple customizable templates
- Dynamic content insertion
- Batch processing capabilities
- Progress tracking for large operations

For detailed certificate documentation, see:
- [CERTIFICATE_GENERATION_README.md](CERTIFICATE_GENERATION_README.md) - Certificate system overview
- [BATCH_CERTIFICATE_GENERATION_README.md](BATCH_CERTIFICATE_GENERATION_README.md) - Batch generation guide
- [CERTIFICATE_GENERATION_IMPLEMENTATION.md](CERTIFICATE_GENERATION_IMPLEMENTATION.md) - Implementation details
- [VOLUNTEER_CERTIFICATE_IMPLEMENTATION_PROMPT.md](VOLUNTEER_CERTIFICATE_IMPLEMENTATION_PROMPT.md) - Original implementation prompt

## Frontend Implementation

The frontend is built with React and Vite, featuring:

### Core Technologies
- React 18 with TypeScript
- Vite for fast development and building
- React Router for client-side routing
- Tailwind CSS for styling
- Radix UI components for accessible UI
- Lucide React for icons

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Radix UI components
│   ├── navigation.tsx  # Navigation component
│   └── theme-provider.tsx # Custom theme provider
├── pages/              # Page components
│   ├── LandingPage.tsx # Main landing page
│   ├── Dashboard.tsx   # User dashboard
│   ├── Events.tsx      # Events page
│   ├── Leaderboard.tsx # Leaderboard page
│   ├── Profile.tsx     # User profile
│   ├── Login.tsx       # Login page
│   └── VolunteerCertificates.tsx # Certificate management
├── lib/                # Utility functions
│   ├── api.ts          # API client
│   └── certificate-generator.ts # Certificate generation
├── hooks/              # Custom React hooks
├── App.tsx             # Main app component with routing
├── main.tsx            # App entry point
└── index.css           # Global styles
```

### Key Pages

1. **Public Pages**
   - Landing Page
   - Events
   - Leaderboard
   - Login

2. **User Pages**
   - Dashboard
   - Profile
   - Certificates

3. **Admin Pages**
   - Admin Dashboard
   - Volunteer Management
   - Event Management
   - Certificate Management
   - Admin User Management

## Technical Components

### API Client
Located at `src/lib/api.ts`, the API client provides:
- Singleton instance for API communication
- Automatic JWT token handling
- Comprehensive error handling
- Methods for all API endpoints

### Certificate Generator
Located at `src/lib/certificate-generator.ts`, the certificate generator provides:
- PDF certificate creation using jsPDF
- Multiple template support
- Batch processing capabilities
- Progress tracking

### UI Components
The system uses:
- Radix UI components for accessibility
- Tailwind CSS for responsive design
- Custom components for specific functionality

## Usage Guidelines

### For Volunteers
1. Register for an account
2. Browse and enroll in events
3. Participate in events and check in/out using QR codes
4. View earned badges and certificates
5. Download certificates as PDFs

### For Administrators
1. Login to the admin panel
2. Manage volunteers, events, and badges
3. Generate certificates individually or in batch
4. View reports and analytics
5. Manage other admin users

### For Developers
1. Use the provided API client for backend communication
2. Follow the established TypeScript interfaces
3. Implement error handling using the provided patterns
4. Extend functionality while maintaining consistency
5. Refer to existing components for implementation patterns

## Best Practices

### API Usage
- Always handle authentication tokens properly
- Implement comprehensive error handling
- Use pagination for large datasets
- Follow RESTful principles

### Certificate Generation
- Preview certificates before generating
- Use appropriate templates for different certificate types
- Monitor batch generation progress
- Test with different data sets

### UI/UX
- Maintain responsive design principles
- Provide clear feedback for user actions
- Implement proper loading states
- Ensure accessibility compliance

## Support and Maintenance

For ongoing support and maintenance:
1. Refer to the comprehensive documentation
2. Follow established coding patterns
3. Test changes thoroughly
4. Update documentation when making changes
5. Monitor error logs and user feedback

## Conclusion

The Plogging Ethiopia system provides a comprehensive platform for managing volunteer activities, events, and recognition. With its robust API, certificate generation system, and user-friendly interface, it enables effective community engagement and volunteer management.