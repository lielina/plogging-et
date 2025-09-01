import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { 
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Award, 
  FileText, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Eye,
  QrCode,
  Printer,
  User
} from 'lucide-react';
import { apiClient, DetailedVolunteer } from '../lib/api';

const AdminVolunteerDetail: React.FC = () => {
  const { volunteerId } = useParams<{ volunteerId: string }>();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState<DetailedVolunteer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [enrollmentsPage, setEnrollmentsPage] = useState(1);
  const enrollmentsPerPage = 5;

  useEffect(() => {
    if (volunteerId) {
      loadVolunteerDetails();
    }
  }, [volunteerId]);

  const loadVolunteerDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getVolunteerDetails(parseInt(volunteerId!));
      setVolunteer(response.data);
    } catch (err) {
      console.error('Error loading volunteer details:', err);
      setError('Failed to load volunteer details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'attended':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'signed up':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'missed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'upcoming':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'attended':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'missed':
        return <XCircle className="h-4 w-4" />;
      case 'signed up':
      case 'upcoming':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const generateQRCode = (text: string) => {
    // Simple QR code generation using a QR code API
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const printBadge = () => {
    if (!volunteer) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrCodeUrl = generateQRCode(`VOLUNTEER_ID:${volunteer.volunteer_id}`);
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Volunteer Badge - ${volunteer.first_name} ${volunteer.last_name}</title>
          <style>
            @media print {
              body { margin: 0; }
              .badge { page-break-inside: avoid; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            .badge {
              width: 350px;
              height: 550px;
              background: white;
              border-radius: 20px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.1);
              overflow: hidden;
              position: relative;
            }
            .top-decoration {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 80px;
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              border-radius: 20px 20px 0 0;
            }
            .top-left-curve {
              position: absolute;
              top: 10px;
              left: 10px;
              width: 60px;
              height: 60px;
              background: #15803d;
              border-radius: 50% 0 50% 50%;
            }
            .top-left-gold {
              position: absolute;
              top: 15px;
              left: 15px;
              width: 50px;
              height: 50px;
              background: linear-gradient(45deg, #fbbf24, #f59e0b);
              border-radius: 50% 0 50% 50%;
            }
            .top-right-curves {
              position: absolute;
              top: 20px;
              right: 20px;
              width: 40px;
              height: 40px;
              background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.1) 2px,
                rgba(255,255,255,0.1) 4px
              );
              border-radius: 50%;
            }
            .logo-section {
              position: absolute;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              text-align: center;
              z-index: 2;
            }
            .logo {
              width: 50px;
              height: 50px;
              background: #15803d;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 8px;
              color: white;
              font-weight: bold;
              font-size: 20px;
            }
            .company-name {
              color: #374151;
              font-size: 14px;
              font-weight: 600;
            }
            .photo-section {
              margin-top: 90px;
              text-align: center;
              padding: 20px;
            }
            .photo-frame {
              width: 120px;
              height: 120px;
              background: #15803d;
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              transform: rotate(45deg);
            }
            .photo-frame::before {
              content: '';
              width: 110px;
              height: 110px;
              background: white;
              border-radius: 50%;
              position: absolute;
            }
            .photo-placeholder {
              width: 100px;
              height: 100px;
              background: #f3f4f6;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #15803d;
              font-size: 40px;
              font-weight: bold;
              position: relative;
              z-index: 1;
            }
            .volunteer-name {
              font-size: 24px;
              font-weight: bold;
              color: #15803d;
              margin-bottom: 8px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .volunteer-role {
              font-size: 16px;
              color: #15803d;
              font-style: italic;
              margin-bottom: 30px;
            }
            .bottom-section {
              padding: 20px;
              text-align: center;
            }
            .qr-code {
              width: 120px;
              height: 120px;
              background: white;
              border: 2px solid #e5e7eb;
              border-radius: 8px;
              margin: 0 auto 15px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 8px;
            }
            .qr-code img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
            .volunteer-id {
              font-size: 14px;
              color: #374151;
              font-weight: 500;
            }
            .bottom-decoration {
              position: absolute;
              bottom: 0;
              left: 0;
              right: 0;
              height: 60px;
              background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
              border-radius: 0 0 20px 20px;
            }
            .bottom-right-curve {
              position: absolute;
              bottom: 10px;
              right: 10px;
              width: 50px;
              height: 50px;
              background: #15803d;
              border-radius: 50% 50% 0 50%;
            }
            .bottom-right-gold {
              position: absolute;
              bottom: 15px;
              right: 15px;
              width: 40px;
              height: 40px;
              background: linear-gradient(45deg, #fbbf24, #f59e0b);
              border-radius: 50% 50% 0 50%;
            }
            .bottom-left-curves {
              position: absolute;
              bottom: 15px;
              left: 15px;
              width: 30px;
              height: 30px;
              background: repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255,255,255,0.1) 2px,
                rgba(255,255,255,0.1) 4px
              );
              border-radius: 50%;
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 12px 24px;
              background: #15803d;
              color: white;
              border: none;
              border-radius: 8px;
              cursor: pointer;
              font-size: 16px;
              font-weight: 600;
              box-shadow: 0 4px 12px rgba(21, 128, 61, 0.3);
            }
            .print-button:hover {
              background: #16a34a;
            }
            @media print {
              .print-button { display: none; }
              body { background: white; }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">Print Badge</button>
          <div class="badge">
            <div class="top-decoration">
              <div class="top-left-curve"></div>
              <div class="top-left-gold"></div>
              <div class="top-right-curves"></div>
            </div>
            <div class="logo-section">
              <div class="logo">PE</div>
              <div class="company-name">Plogging Ethiopia</div>
            </div>
            <div class="photo-section">
              <div class="photo-frame">
                <div class="photo-placeholder">${volunteer.first_name[0]}${volunteer.last_name[0]}</div>
              </div>
              <div class="volunteer-name">${volunteer.first_name} ${volunteer.last_name}</div>
              <div class="volunteer-role">Volunteer</div>
            </div>
            <div class="bottom-section">
              <div class="qr-code">
                <img src="${qrCodeUrl}" alt="QR Code" />
              </div>
              <div class="volunteer-id">ID ${volunteer.volunteer_id}</div>
            </div>
            <div class="bottom-decoration">
              <div class="bottom-right-curve"></div>
              <div class="bottom-right-gold"></div>
              <div class="bottom-left-curves"></div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const showQRCodeModal = () => {
    if (!volunteer) return;
    
    const modalWindow = window.open('', '_blank', 'width=400,height=500');
    if (modalWindow) {
      const qrCodeUrl = generateQRCode(`VOLUNTEER_ID:${volunteer.volunteer_id}`);
      
      modalWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code - ${volunteer.first_name} ${volunteer.last_name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
            }
            .container {
              background: white;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              text-align: center;
            }
            .title {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 20px;
              color: #333;
            }
            .qr-code {
              margin: 20px 0;
            }
            .qr-code img {
              border: 2px solid #ddd;
              border-radius: 8px;
            }
            .volunteer-info {
              margin-top: 20px;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .volunteer-name {
              font-size: 18px;
              font-weight: bold;
              color: #333;
              margin-bottom: 5px;
            }
            .volunteer-id {
              font-size: 14px;
              color: #666;
            }
            .close-button {
              margin-top: 20px;
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">Volunteer QR Code</div>
            <div class="qr-code">
              <img src="${qrCodeUrl}" alt="QR Code" />
            </div>
            <div class="volunteer-info">
              <div class="volunteer-name">${volunteer.first_name} ${volunteer.last_name}</div>
              <div class="volunteer-id">ID: ${volunteer.volunteer_id}</div>
            </div>
            <button class="close-button" onclick="window.close()">Close</button>
          </div>
        </body>
        </html>
      `);
      modalWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/volunteers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Volunteers
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading volunteer details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !volunteer) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/volunteers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Volunteers
          </Button>
        </div>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Volunteer not found'}</p>
            <Button onClick={() => navigate('/admin/volunteers')}>
              Return to Volunteers
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const attendedEvents = volunteer.enrollments.filter(e => e.status === 'Attended');
  const upcomingEvents = volunteer.enrollments.filter(e => e.status === 'Signed Up');
  const missedEvents = volunteer.enrollments.filter(e => e.status === 'Missed');

  return (
    <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin/volunteers')}
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Volunteers
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-slate-800 mb-1">Volunteer Details</h1>
            <p className="text-slate-600 font-medium">ID: {volunteer.volunteer_id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge 
            variant={volunteer.is_active ? "default" : "secondary"}
            className={volunteer.is_active ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-slate-100 text-slate-800 border-slate-200"}
          >
            {volunteer.is_active ? 'Active' : 'Inactive'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={showQRCodeModal}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={printBadge}
            className="border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Badge
          </Button>
        </div>
      </div>

      {/* Profile Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 border-b">
          <CardTitle className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-4 border-white shadow-md">
              <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {volunteer.first_name[0]}{volunteer.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-3xl font-bold text-slate-800">
                {volunteer.first_name} {volunteer.last_name}
              </div>
              <div className="text-base text-slate-600 mt-1">
                {volunteer.email}
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="p-2 rounded-full bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Email</p>
                <p className="text-sm text-slate-600">{volunteer.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="p-2 rounded-full bg-purple-100">
                <Phone className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Phone</p>
                <p className="text-sm text-slate-600">{volunteer.phone_number}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="p-2 rounded-full bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Registration Date</p>
                <p className="text-sm text-slate-600">
                  {formatDate(volunteer.registration_date)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="p-2 rounded-full bg-emerald-100">
                <Clock className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-700">Last Login</p>
                <p className="text-sm text-slate-600">
                  {formatDate(volunteer.last_login)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="text-3xl font-bold text-blue-700 mb-2">{volunteer.total_hours_contributed}</div>
              <div className="text-sm font-medium text-blue-600">Total Hours</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
              <div className="text-3xl font-bold text-emerald-700 mb-2">{attendedEvents.length}</div>
              <div className="text-sm font-medium text-emerald-600">Events Attended</div>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="text-3xl font-bold text-purple-700 mb-2">{volunteer.badges.length}</div>
              <div className="text-sm font-medium text-purple-600">Badges Earned</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Section */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 border-b">
          <CardTitle className="text-slate-800">QR Code</CardTitle>
          <CardDescription className="text-slate-600">Volunteer's unique QR code for event check-ins</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm">
                <img 
                  src={generateQRCode(`VOLUNTEER_ID:${volunteer.volunteer_id}`)}
                  alt={`QR Code for ${volunteer.first_name} ${volunteer.last_name}`}
                  className="w-36 h-36 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              </div>
              <div className="hidden text-center text-sm text-slate-500 mt-2">
                QR Code for {volunteer.first_name} {volunteer.last_name}
              </div>
            </div>
            <div className="flex-1">
              <div className="p-4 rounded-lg bg-slate-50 mb-6">
                <p className="text-sm text-slate-700 leading-relaxed">
                  This QR code is used for event check-ins and attendance tracking. 
                  Volunteers can scan this code to register their participation at events.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.document.write(`
                        <html>
                          <head>
                            <title>QR Code - ${volunteer.first_name} ${volunteer.last_name}</title>
                            <style>
                              body { 
                                margin: 0; 
                                padding: 20px; 
                                display: flex; 
                                justify-content: center; 
                                align-items: center; 
                                min-height: 100vh;
                                background: #f8fafc;
                              }
                              img { 
                                max-width: 400px; 
                                max-height: 400px; 
                                border: 2px solid #e2e8f0;
                                border-radius: 12px;
                                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                                background: white;
                                padding: 16px;
                              }
                              .title {
                                position: absolute;
                                top: 20px;
                                left: 50%;
                                transform: translateX(-50%);
                                font-family: Arial, sans-serif;
                                font-size: 18px;
                                color: #334155;
                                background: white;
                                padding: 12px 20px;
                                border-radius: 8px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                                font-weight: 600;
                              }
                            </style>
                          </head>
                          <body>
                            <div class="title">QR Code for ${volunteer.first_name} ${volunteer.last_name}</div>
                            <img src="${generateQRCode(`VOLUNTEER_ID:${volunteer.volunteer_id}`)}" alt="QR Code" />
                          </body>
                        </html>
                      `);
                    }
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Size
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={showQRCodeModal}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Generate QR
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="enrollments" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrollments">Events ({volunteer.enrollments.length})</TabsTrigger>
          <TabsTrigger value="badges">Badges ({volunteer.badges.length})</TabsTrigger>
          <TabsTrigger value="certificates">Certificates ({volunteer.certificates.length})</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        {/* Enrollments Tab */}
        <TabsContent value="enrollments" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{attendedEvents.length}</div>
                    <div className="text-sm text-muted-foreground">Attended</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</div>
                    <div className="text-sm text-muted-foreground">Upcoming</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{missedEvents.length}</div>
                    <div className="text-sm text-muted-foreground">Missed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Enrollments</CardTitle>
              <CardDescription>
                All events this volunteer has signed up for or attended 
                ({volunteer.enrollments.length} total)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Signup Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {volunteer.enrollments
                      .slice((enrollmentsPage - 1) * enrollmentsPerPage, enrollmentsPage * enrollmentsPerPage)
                      .map((enrollment) => (
                      <TableRow key={enrollment.enrollment_id}>
                        <TableCell className="font-medium">
                          {enrollment.event.event_name}
                        </TableCell>
                        <TableCell>
                          {formatDate(enrollment.event.event_date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{enrollment.event.location_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(enrollment.status)} border px-3 py-1`}>
                            <div className="flex items-center space-x-2">
                              {getStatusIcon(enrollment.status)}
                              <span className="font-medium">{enrollment.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatDate(enrollment.signup_date)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {volunteer.enrollments.length > enrollmentsPerPage && (
                <div className="mt-6">
                  <Pagination>
                    <PaginationContent>
                      {/* Previous button */}
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (enrollmentsPage > 1) {
                              setEnrollmentsPage(enrollmentsPage - 1);
                            }
                          }}
                          className={enrollmentsPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {/* Page numbers */}
                      {Array.from({ length: Math.ceil(volunteer.enrollments.length / enrollmentsPerPage) }, (_, i) => i + 1).map((page) => {
                        const totalPages = Math.ceil(volunteer.enrollments.length / enrollmentsPerPage);
                        
                        // Show first page, last page, current page, and pages around current page
                        if (
                          page === 1 ||
                          page === totalPages ||
                          (page >= enrollmentsPage - 1 && page <= enrollmentsPage + 1)
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setEnrollmentsPage(page);
                                }}
                                isActive={page === enrollmentsPage}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          page === enrollmentsPage - 2 ||
                          page === enrollmentsPage + 2
                        ) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                        return null;
                      })}

                      {/* Next button */}
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (enrollmentsPage < Math.ceil(volunteer.enrollments.length / enrollmentsPerPage)) {
                              setEnrollmentsPage(enrollmentsPage + 1);
                            }
                          }}
                          className={enrollmentsPage === Math.ceil(volunteer.enrollments.length / enrollmentsPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  
                  {/* Pagination info */}
                  <div className="text-center text-sm text-slate-600 mt-4">
                    Showing {((enrollmentsPage - 1) * enrollmentsPerPage) + 1} to {Math.min(enrollmentsPage * enrollmentsPerPage, volunteer.enrollments.length)} of {volunteer.enrollments.length} enrollments
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Earned Badges</CardTitle>
              <CardDescription>Badges earned through participation and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              {volunteer.badges.length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No badges earned yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {volunteer.badges.map((badge) => (
                    <Card key={badge.badge_id} className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{badge.badge_name}</h4>
                          <p className="text-sm text-muted-foreground">{badge.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Earned: {formatDate(badge.pivot.earned_date)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certificates</CardTitle>
              <CardDescription>Certificates earned for participation and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              {volunteer.certificates.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No certificates generated yet</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Generated Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {volunteer.certificates.map((certificate) => (
                        <TableRow key={certificate.certificate_id}>
                          <TableCell className="font-medium">
                            {certificate.certificate_type} Certificate
                          </TableCell>
                          <TableCell>{certificate.hours_on_certificate} hours</TableCell>
                          <TableCell>{formatDate(certificate.generation_date)}</TableCell>
                          <TableCell>
                            <Badge variant={certificate.status === 'Downloaded' ? 'default' : 'secondary'}>
                              {certificate.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{volunteer.total_hours_contributed}</div>
                <div className="text-sm text-muted-foreground">Total Hours</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{volunteer.enrollments.length}</div>
                <div className="text-sm text-muted-foreground">Total Events</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{attendedEvents.length}</div>
                <div className="text-sm text-muted-foreground">Events Attended</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{volunteer.badges.length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
              <CardDescription>Recent activity and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Registration</p>
                    <p className="text-xs text-muted-foreground">{formatDate(volunteer.registration_date)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Last Login</p>
                    <p className="text-xs text-muted-foreground">{formatDate(volunteer.last_login)}</p>
                  </div>
                </div>
                {volunteer.badges.map((badge) => (
                  <div key={badge.badge_id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Earned {badge.badge_name} Badge</p>
                      <p className="text-xs text-muted-foreground">{formatDate(badge.pivot.earned_date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminVolunteerDetail; 