import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SurveyProvider } from './contexts/SurveyContext'
import { Toaster } from './components/ui/toaster'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import Events from './pages/Events'
import Leaderboard from './pages/Leaderboard'
import PublicLeaderboard from './pages/PublicLeaderboard'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Welcome from './pages/Welcome'
import EventDetail from './pages/EventDetail'
import Layout from './pages/Layout'
import Membership from './pages/Membership'
import Contact from './pages/Contact'
import VolunteerCertificates from './pages/VolunteerCertificates'
import VolunteerBadges from './pages/VolunteerBadges'
import EPlogging from './pages/EPlogging'
import Gallery from './pages/Gallery'
import Blog from './pages/Blog'
import BlogPostPage from './pages/BlogPost'
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

function App() {
  return (
    <AuthProvider>
      <SurveyProvider>
        <div className="min-h-screen bg-background">
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:eventId" element={<EventDetail />} />
              <Route path="/about" element={<div>About Page</div>} />
              <Route path="/membership" element={<Membership />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:postId" element={<BlogPostPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/eplogging" element={<EPlogging />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/leaderboard-public" element={<PublicLeaderboard />} />
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
              <Route path="/badges" element={
                <ProtectedRoute>
                  <VolunteerBadges />
                </ProtectedRoute>
              } />
            </Route>
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/welcome" element={<Welcome />} />
          </Routes>
        </div>
        <Toaster />
      </SurveyProvider>
    </AuthProvider>
  )
}

export default App