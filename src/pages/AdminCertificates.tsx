import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../components/ui/pagination';
import { apiClient } from '../lib/api';
import { Certificate, Volunteer, Event } from '../lib/api';
import { 
  CertificateGenerator, 
  CertificateData, 
  CertificateTemplate, 
  defaultTemplates,
  generateCertificateId,
  formatDate 
} from '../lib/certificate-generator';
import { Download, Eye, Plus, FileText, Users, Calendar, Award } from 'lucide-react';

const AdminCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 1,
    to: 15
  });
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(defaultTemplates[0]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    volunteer_id: '',
    event_id: '',
    certificate_type: 'event',
    milestone_hours: '',
    custom_message: ''
  });

  useEffect(() => {
    loadData();
  }, [currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [certificatesRes, volunteersRes, eventsRes] = await Promise.all([
        apiClient.getAllCertificates(currentPage, 15),
        apiClient.getAllVolunteers(),
        apiClient.getAllEvents()
      ]);
      setCertificates(certificatesRes.data);
      setVolunteers(volunteersRes.data);
      setEvents(eventsRes.data);
      setPagination(certificatesRes.pagination);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePreview = () => {
    const selectedVolunteer = volunteers.find(v => v.volunteer_id.toString() === formData.volunteer_id);
    const selectedEvent = events.find(e => e.event_id.toString() === formData.event_id);
    
    if (!selectedVolunteer) return;

    const certificateData: CertificateData = {
      volunteerName: `${selectedVolunteer.first_name} ${selectedVolunteer.last_name}`,
      eventName: selectedEvent?.event_name || 'Community Service',
      eventDate: selectedEvent?.event_date || formatDate(new Date()),
      hoursContributed: Number(selectedEvent?.estimated_duration_hours ?? 4),
      location: selectedEvent?.location_name || 'Addis Ababa, Ethiopia',
      organizerName: 'Plogging Ethiopia Team',
      certificateId: generateCertificateId(),
      issueDate: formatDate(new Date()),
      badgeType: 'Environmental Champion',
      totalHours: selectedVolunteer.total_hours_contributed,
      rank: 1
    };

    const generator = new CertificateGenerator(selectedTemplate);
    const dataURL = generator.getCertificateDataURL(certificateData);
    setPreviewUrl(dataURL);
  };

  const handleGenerateCertificate = async () => {
    try {
      setIsGenerating(true);
      const selectedVolunteer = volunteers.find(v => v.volunteer_id.toString() === formData.volunteer_id);
      const selectedEvent = events.find(e => e.event_id.toString() === formData.event_id);
      
      if (!selectedVolunteer) return;

      const certificateData: CertificateData = {
        volunteerName: `${selectedVolunteer.first_name} ${selectedVolunteer.last_name}`,
        eventName: selectedEvent?.event_name || 'Community Service',
        eventDate: selectedEvent?.event_date || formatDate(new Date()),
        hoursContributed: Number(selectedEvent?.estimated_duration_hours ?? 4),
        location: selectedEvent?.location_name || 'Addis Ababa, Ethiopia',
        organizerName: 'Plogging Ethiopia Team',
        certificateId: generateCertificateId(),
        issueDate: formatDate(new Date()),
        badgeType: 'Environmental Champion',
        totalHours: selectedVolunteer.total_hours_contributed,
        rank: 1
      };

      // Generate PDF
      const generator = new CertificateGenerator(selectedTemplate);
      const blob = generator.getCertificateBlob(certificateData);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${selectedVolunteer.first_name}-${selectedVolunteer.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Call API to save certificate
      if (formData.certificate_type === 'event') {
        await apiClient.generateEventCertificate(
          parseInt(formData.volunteer_id),
          parseInt(formData.event_id)
        );
      } else {
        await apiClient.generateMilestoneCertificate(
          parseInt(formData.volunteer_id),
          parseInt(formData.milestone_hours)
        );
      }

      setIsGenerateDialogOpen(false);
      setFormData({
        volunteer_id: '',
        event_id: '',
        certificate_type: 'event',
        milestone_hours: '',
        custom_message: ''
      });
      setPreviewUrl('');
      loadData();
    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Certificate Management</h1>
          <p className="text-gray-600 mt-1">Generate and manage volunteer certificates</p>
        </div>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Generate Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Generate New Certificate
              </DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Certificate Details</TabsTrigger>
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="volunteer">Volunteer</Label>
                    <Select
                      value={formData.volunteer_id}
                      onValueChange={(value) => setFormData({ ...formData, volunteer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select volunteer" />
                      </SelectTrigger>
                      <SelectContent>
                        {volunteers.map((volunteer) => (
                          <SelectItem key={volunteer.volunteer_id} value={volunteer.volunteer_id.toString()}>
                            {volunteer.first_name} {volunteer.last_name} ({volunteer.total_hours_contributed} hours)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="certificate_type">Certificate Type</Label>
                    <Select
                      value={formData.certificate_type}
                      onValueChange={(value) => setFormData({ ...formData, certificate_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Event Certificate</SelectItem>
                        <SelectItem value="milestone">Milestone Certificate</SelectItem>
                        <SelectItem value="achievement">Achievement Certificate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.certificate_type === 'event' && (
                    <div>
                      <Label htmlFor="event">Event</Label>
                      <Select
                        value={formData.event_id}
                        onValueChange={(value) => setFormData({ ...formData, event_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {events.map((event) => (
                            <SelectItem key={event.event_id} value={event.event_id.toString()}>
                              {event.event_name} - {new Date(event.event_date).toLocaleDateString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {formData.certificate_type === 'milestone' && (
                    <div>
                      <Label htmlFor="milestone_hours">Milestone Hours</Label>
                      <Input
                        id="milestone_hours"
                        type="number"
                        placeholder="Enter milestone hours"
                        value={formData.milestone_hours}
                        onChange={(e) => setFormData({ ...formData, milestone_hours: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <Label htmlFor="custom_message">Custom Message (Optional)</Label>
                    <Input
                      id="custom_message"
                      placeholder="Add a custom message to the certificate"
                      value={formData.custom_message}
                      onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="template" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {defaultTemplates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate.id === template.id
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="w-full h-20 rounded mb-2" style={{ backgroundColor: template.backgroundColor }}>
                        <div className="flex items-center justify-center h-full">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: template.primaryColor }}
                          >
                            🌿
                          </div>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-gray-800">{template.name}</h3>
                      <Badge className="text-xs mt-1 px-2 py-0.5" style={{ backgroundColor: template.primaryColor, color: "white" }}>
                        {template.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Certificate Preview</h3>
                  <Button 
                    onClick={generatePreview} 
                    variant="outline"
                    disabled={!formData.volunteer_id}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Generate Preview
                  </Button>
                </div>
                
                {previewUrl ? (
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      src={previewUrl}
                      className="w-full h-96"
                      title="Certificate Preview"
                    />
                  </div>
                ) : (
                  <div className="w-full h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-dashed border-green-300 flex items-center justify-center">
                    <div className="text-center text-green-600">
                      <FileText className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-medium">Certificate Preview</p>
                      <p className="text-sm">Select a volunteer and click "Generate Preview"</p>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsGenerateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleGenerateCertificate} 
                className="bg-green-600 hover:bg-green-700"
                disabled={isGenerating || !formData.volunteer_id || 
                  (formData.certificate_type === 'event' && !formData.event_id) ||
                  (formData.certificate_type === 'milestone' && !formData.milestone_hours)}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate & Download
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
              <FileText className="w-8 h-8 text-orange-600" />
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

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <div key={certificate.certificate_id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-600" />
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
                  <Badge variant="secondary" className="text-xs px-2 py-0.5">
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
                </div>
              </div>
            ))}
          </div>

          {certificates.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No certificates found.</p>
              <p className="text-sm text-gray-400">Generate your first certificate to get started.</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(pagination.last_page, currentPage + 1))}
                      className={currentPage === pagination.last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCertificates;