import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { apiClient } from '../lib/api';
import { Certificate, Volunteer, Event } from '../lib/api';
import CertificateGeneratorPage from './CertificateGenerator';
import BatchCertificateGenerator from '../components/BatchCertificateGenerator';
import { 
  FileText, 
  Users, 
  Calendar, 
  Award, 
  Settings,
  Download,
  Eye,
  Share2,
  Package,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const CertificateManagement: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('individual');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certificatesRes, volunteersRes, eventsRes] = await Promise.all([
        apiClient.getAllCertificates(),
        apiClient.getAllVolunteers(),
        apiClient.getAllEvents()
      ]);
      setCertificates(certificatesRes.data);
      setVolunteers(volunteersRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVolunteerName = (volunteerId: number) => {
    const volunteer = volunteers.find(v => v.volunteer_id === volunteerId);
    return volunteer ? `${volunteer.first_name} ${volunteer.last_name}` : 'Unknown';
  };

  const getEventName = (eventId?: number) => {
    if (!eventId) return 'N/A';
    const event = events.find(e => e.event_id === eventId);
    return event ? event.event_name : 'Unknown';
  };

  const getCertificateTypeLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Event Certificate';
      case 'milestone': return 'Milestone Certificate';
      case 'achievement': return 'Achievement Certificate';
      default: return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'generated':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'downloaded':
        return <Download className="w-4 h-4 text-blue-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-green-100 text-green-800';
      case 'downloaded':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading certificate management...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Certificate Management</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate, manage, and track certificates for volunteers. Choose between individual or batch generation.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Active Volunteers</p>
                <p className="text-2xl font-bold text-gray-900">{volunteers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">
                  {certificates.filter(c => {
                    const certDate = new Date(c.issued_date);
                    const now = new Date();
                    return certDate.getMonth() === now.getMonth() && certDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Individual Generation
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Batch Generation
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Manage Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-6">
          <CertificateGeneratorPage />
        </TabsContent>

        <TabsContent value="batch" className="space-y-6">
          <div className="text-center space-y-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Batch Certificate Generation</h2>
            <p className="text-gray-600">
              Generate certificates for multiple volunteers at once. Select volunteers, choose a template, and generate all certificates in one go.
            </p>
          </div>
          <BatchCertificateGenerator 
            volunteers={volunteers}
            events={events}
            onComplete={(certificates) => {
              console.log('Batch generation completed:', certificates.length, 'certificates');
              // Optionally refresh the certificates list
              loadData();
            }}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Certificate Management</h2>
              <p className="text-gray-600">View and manage all generated certificates</p>
            </div>
            <Button onClick={loadData} variant="outline">
              <Eye className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Certificate List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generated Certificates ({certificates.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length > 0 ? (
                <div className="space-y-4">
                  {certificates.map((certificate) => (
                    <div key={certificate.certificate_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          {getStatusIcon(certificate.certificate_type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {getVolunteerName(certificate.volunteer_id)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {getCertificateTypeLabel(certificate.certificate_type)}
                            {certificate.event_id && ` • ${getEventName(certificate.event_id)}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            Issued: {new Date(certificate.issued_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(certificate.certificate_type)}>
                          {certificate.certificate_type}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(certificate.download_url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Share functionality
                            if (navigator.share) {
                              navigator.share({
                                title: "Plogging Ethiopia Certificate",
                                text: `${getVolunteerName(certificate.volunteer_id)}'s certificate`,
                                url: certificate.download_url,
                              });
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No certificates found.</p>
                  <p className="text-sm text-gray-400">Generate your first certificate to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificate Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {certificates.filter(c => c.certificate_type === 'event').length}
                  </div>
                  <div className="text-sm text-gray-600">Event Certificates</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {certificates.filter(c => c.certificate_type === 'milestone').length}
                  </div>
                  <div className="text-sm text-gray-600">Milestone Certificates</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {certificates.filter(c => c.certificate_type === 'achievement').length}
                  </div>
                  <div className="text-sm text-gray-600">Achievement Certificates</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CertificateManagement; 