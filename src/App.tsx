import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register' // Added import for Register
import Welcome from './pages/Welcome'
import AdminLayout from './pages/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminEvents from './pages/AdminEvents'
import AdminVolunteers from './pages/AdminVolunteers'
import AdminCertificates from './pages/AdminCertificates'
import EventDetail from './pages/EventDetail'
import AdminVolunteerDetail from './pages/AdminVolunteerDetail'
import Layout from './pages/Layout'
import Membership from './pages/Membership'
import Contact from './pages/Contact'
import VolunteerCertificates from './pages/VolunteerCertificates'

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/events" element={<Events />} />
          <Route path="/about" element={<div>About Page</div>} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/gallery" element={<div>Gallery Page</div>} />
          <Route path="/blog" element={<div>Blog Page</div>} />
          <Route path="/contact" element={<Contact />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Added route for Register */}
        <Route path="/welcome" element={<Welcome />} />
        
        {/* Protected Volunteer Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/leaderboard" element={
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/certificates" element={
          <ProtectedRoute>
            <VolunteerCertificates />
          </ProtectedRoute>
        } />
        
        {/* Protected Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="events" element={<AdminEvents />} />
          <Route path="events/:eventId" element={<EventDetail />} />
          <Route path="volunteers" element={<AdminVolunteers />} />
          <Route path="volunteers/:volunteerId" element={<AdminVolunteerDetail />} />
          <Route path="certificates" element={<AdminCertificates />} />
        </Route>
      </Routes>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
      <Toaster />
    </AuthProvider>
  )
}

export default App 