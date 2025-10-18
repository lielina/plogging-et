# Plogging Ethiopia API Endpoints Reference

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/volunteer/register` | Register a new volunteer |
| POST | `/auth/volunteer/login` | Login as a volunteer |
| POST | `/auth/admin/login` | Login as an admin |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |

## Volunteer Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/volunteer/profile` | Get volunteer profile |
| PUT | `/volunteer/profile` | Update volunteer profile |
| POST | `/volunteer/change-password` | Change password |

## Volunteer Statistics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/volunteer/statistics` | Get volunteer statistics |

## Volunteer Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/volunteer/events` | Get available events |
| GET | `/volunteer/events/{event_id}` | Get event details |

## Volunteer Enrollments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/volunteer/enrollments` | Enroll in an event |
| DELETE | `/volunteer/enrollments/{enrollment_id}` | Cancel enrollment |

## Volunteer Attendance

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/volunteer/attendance/check-in` | Check in to an event |
| POST | `/volunteer/attendance/check-out` | Check out from an event |

## Volunteer Badges

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/volunteer/badges` | Get earned badges |

## Volunteer Certificates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/volunteer/certificates` | Get earned certificates |
| GET | `/volunteer/certificates/{certificate_id}/download` | Download certificate (Requires Authentication) |

## Surveys

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/volunteer/surveys` | Submit survey |
| GET | `/admin/surveys` | Get all surveys (Admin) |

## Admin Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Get admin dashboard |

## Admin Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/profile` | Get admin profile |
| PUT | `/admin/profile` | Update admin profile |

## Admin Volunteers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/volunteers` | Get all volunteers |
| POST | `/admin/volunteers` | Create volunteer |
| GET | `/admin/volunteers/{volunteer_id}` | Get volunteer details |
| PUT | `/admin/volunteers/{volunteer_id}` | Update volunteer |
| DELETE | `/admin/volunteers/{volunteer_id}` | Delete volunteer |

## Admin Events

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/events` | Get all events |
| POST | `/admin/events` | Create event |
| GET | `/admin/events/{event_id}` | Get event details |
| PUT | `/admin/events/{event_id}` | Update event |
| DELETE | `/admin/events/{event_id}` | Delete event |
| GET | `/admin/events/{event_id}/qr-code` | Get event QR code |

## Admin Badges

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/badges` | Get all badges |
| POST | `/admin/badges` | Create badge |
| POST | `/admin/badges/award` | Award badge to volunteer |

## Admin Certificates

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/certificates` | Get all certificates |
| POST | `/admin/certificates/generate-event` | Generate event certificate |
| POST | `/admin/certificates/generate-milestone` | Generate milestone certificate |
| GET | `/admin/certificates/{certificate_id}/download` | Download certificate (Requires Authentication) |

## Admin Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/reports/platform-stats` | Get platform statistics |
| GET | `/admin/reports/volunteer-activity` | Get volunteer activity report |
| GET | `/admin/reports/event-performance` | Get event performance report |
| GET | `/admin/reports/top-volunteers` | Get top volunteers report |
| GET | `/admin/reports/badge-distribution` | Get badge distribution report |
| GET | `/reports/top-volunteers` | Get public top volunteers report |

## Admin Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/admins` | Get all admins |
| POST | `/admin/admins` | Create admin |
| GET | `/admin/admins/{admin_id}` | Get admin details |
| PUT | `/admin/admins/{admin_id}` | Update admin |
| DELETE | `/admin/admins/{admin_id}` | Delete admin |
| POST | `/admin/admins/{admin_id}/reset-password` | Reset admin password |

## System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |