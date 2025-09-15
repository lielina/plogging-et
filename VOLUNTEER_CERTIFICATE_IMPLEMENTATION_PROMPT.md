# Volunteer Certificate System Implementation Prompt

## Project Overview
Implement a comprehensive volunteer certificate management system for a community service platform. The system should allow volunteers to view and download their earned certificates while providing administrators with tools to generate certificates for individual volunteers or in batch.

## Core Requirements

### 1. Volunteer Certificate Viewing System
- **Page**: `/certificates` - Protected route for authenticated volunteers
- **Features**:
  - Display all earned certificates in a responsive card layout
  - Show certificate statistics (total, by type, by status)
  - Certificate details: ID, type, generation date, hours contributed, status
  - Download functionality for PDF certificates
  - Loading states and error handling
  - Empty state when no certificates exist

### 2. Certificate Types
Implement support for multiple certificate types:
- **Event Certificates**: For participating in specific events
- **Milestone Certificates**: For reaching volunteer hour milestones
- **Achievement Certificates**: For reaching significant achievements
- **Leadership Certificates**: For volunteers with leadership roles

### 3. Badge System
Automatic badge assignment based on volunteer hours:
- **Environmental Champion**: 100+ hours
- **Green Warrior**: 50-99 hours
- **Eco Hero**: 25-49 hours
- **Community Helper**: <25 hours

### 4. Admin Certificate Generation
- **Individual Generation**: Generate certificates for specific volunteers
- **Batch Generation**: Generate certificates for multiple volunteers at once
- **Template Selection**: Multiple certificate templates with visual previews
- **Progress Tracking**: Real-time progress for batch operations
- **Download Management**: Individual and batch download options

## Technical Implementation

### 1. Data Models

```typescript
interface VolunteerCertificate {
  certificate_id: number;
  volunteer_id: string;
  event_id: string | null;
  certificate_type: string;
  hours_on_certificate: string;
  generation_date: string;
  file_path: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface CertificateData {
  volunteerName: string;
  eventName: string;
  eventDate: string;
  hoursContributed: number;
  location: string;
  organizerName: string;
  certificateId: string;
  issueDate: string;
  badgeType: string;
  totalHours: number;
  rank: number;
}

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  config: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    logoPosition: string;
    layout: string;
  };
}
```

### 2. API Endpoints

```typescript
// Volunteer endpoints
GET /volunteer/certificates - Get volunteer's certificates
GET /volunteer/certificates/{id}/download - Download certificate

// Admin endpoints
GET /admin/certificates - Get all certificates with pagination
POST /admin/certificates/generate-event - Generate event certificate
POST /admin/certificates/generate-milestone - Generate milestone certificate
POST /admin/certificates/batch-generate - Batch generate certificates
```

### 3. Core Components

#### VolunteerCertificates.tsx
```typescript
// Main volunteer certificate viewing page
- Certificate statistics cards
- Certificate list with filtering
- Download functionality
- Loading and error states
- Responsive design for mobile/desktop
```

#### AdminCertificates.tsx
```typescript
// Admin certificate management
- Certificate list with pagination
- Individual certificate generation dialog
- Template selection
- Volunteer and event selection
- Certificate preview
```

#### BatchVolunteerCertificates.tsx
```typescript
// Batch certificate generation
- Volunteer selection with checkboxes
- Batch configuration (type, template, location)
- Progress tracking with real-time updates
- Status indicators (pending, processing, completed, error)
- Batch download functionality
```

#### CertificateGenerator.tsx
```typescript
// PDF certificate generation utility
- Canvas-based PDF generation
- Multiple template support
- Dynamic content insertion
- High-quality graphics rendering
- Batch processing capabilities
```

### 4. Certificate Generation System

#### PDF Generation
- Use HTML5 Canvas for certificate rendering
- Support for multiple certificate templates
- Dynamic content insertion (names, dates, hours, etc.)
- High-quality graphics and logos
- Professional certificate design

#### Template System
```typescript
const defaultTemplates = [
  {
    id: 'classic',
    name: 'Classic Certificate',
    description: 'Traditional certificate design',
    preview: '/templates/classic-preview.png',
    config: {
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      accentColor: '#10b981',
      logoPosition: 'top-center',
      layout: 'centered'
    }
  },
  // Additional templates...
];
```

### 5. UI/UX Features

#### Navigation Integration
- Add "Certificates" link to main navigation
- Use FileText icon from Lucide React
- Active state highlighting
- Mobile-responsive navigation

#### Certificate Cards
- Hover effects and transitions
- Status badges with color coding
- Certificate type indicators
- Download buttons with loading states
- Responsive grid layout

#### Batch Generation Interface
- Volunteer selection with search/filter
- Progress bars and status indicators
- Real-time updates during generation
- Error handling and retry mechanisms
- Download management for completed certificates

### 6. State Management

```typescript
// Certificate state management
const [certificates, setCertificates] = useState<VolunteerCertificate[]>([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [selectedVolunteers, setSelectedVolunteers] = useState<Set<number>>(new Set());
const [certificateJobs, setCertificateJobs] = useState<BatchJob[]>([]);
const [progress, setProgress] = useState(0);
```

### 7. Error Handling & Loading States

- Loading spinners for API calls
- Error messages with retry options
- Empty states with helpful messaging
- Progress indicators for batch operations
- Toast notifications for user feedback

### 8. Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface elements
- Optimized for various screen sizes
- Accessible design patterns

## Implementation Steps

### Phase 1: Core Infrastructure
1. Set up certificate data models and API endpoints
2. Create basic certificate viewing page for volunteers
3. Implement certificate download functionality
4. Add navigation link for certificates

### Phase 2: Admin Features
1. Build admin certificate management interface
2. Implement individual certificate generation
3. Create certificate template system
4. Add certificate preview functionality

### Phase 3: Batch Operations
1. Develop batch certificate generation system
2. Implement progress tracking and status updates
3. Add volunteer selection interface
4. Create batch download functionality

### Phase 4: Polish & Optimization
1. Add comprehensive error handling
2. Implement loading states and animations
3. Optimize for mobile devices
4. Add accessibility features
5. Performance optimization for large datasets

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-router-dom": "^6.0.0",
    "lucide-react": "^0.263.0",
    "jspdf": "^2.5.1",
    "html2canvas": "^1.4.1",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-progress": "^1.0.0",
    "@radix-ui/react-checkbox": "^1.0.0",
    "@radix-ui/react-toast": "^1.0.0"
  }
}
```

## File Structure

```
src/
├── pages/
│   ├── VolunteerCertificates.tsx
│   ├── AdminCertificates.tsx
│   ├── BatchVolunteerCertificates.tsx
│   └── CertificateGenerator.tsx
├── components/
│   ├── navigation.tsx (updated with certificates link)
│   └── ui/ (existing UI components)
├── lib/
│   ├── api.ts (certificate endpoints)
│   └── certificate-generator.ts
└── types/
    └── certificate.ts
```

## Key Features to Implement

### For Volunteers:
- ✅ View all earned certificates
- ✅ Download PDF certificates
- ✅ Certificate statistics dashboard
- ✅ Responsive mobile interface
- ✅ Loading and error states

### For Admins:
- ✅ Individual certificate generation
- ✅ Batch certificate generation
- ✅ Multiple certificate templates
- ✅ Progress tracking
- ✅ Certificate preview
- ✅ Volunteer selection interface
- ✅ Batch download management

### Technical Features:
- ✅ PDF generation with Canvas
- ✅ Multiple certificate templates
- ✅ Badge system based on hours
- ✅ Real-time progress updates
- ✅ Error handling and retry
- ✅ Mobile-responsive design
- ✅ Accessibility compliance

## Success Criteria

1. Volunteers can easily view and download their certificates
2. Admins can generate certificates individually or in batch
3. System supports multiple certificate types and templates
4. Batch operations show real-time progress
5. Mobile-responsive design works on all devices
6. Error handling provides clear user feedback
7. Performance is optimized for large volunteer datasets
8. Code is maintainable and well-documented

This implementation provides a complete volunteer certificate management system that can be adapted for any community service or volunteer management platform.