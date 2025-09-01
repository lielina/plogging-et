import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Textarea } from '../components/ui/textarea';
import { apiClient } from '../lib/api';
import { Volunteer, Event } from '../lib/api';
import { 
  CertificateGenerator, 
  CertificateData, 
  CertificateTemplate, 
  defaultTemplates,
  generateCertificateId,
  formatDate 
} from '../lib/certificate-generator';
import { 
  Download, 
  Eye, 
  FileText, 
  Palette, 
  Users, 
  Calendar, 
  Award, 
  Settings,
  Share2,
  CheckCircle,
  Clock,
  Package,
  Checkbox
} from 'lucide-react';

const CertificateGeneratorPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(defaultTemplates[0]);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCertificates, setGeneratedCertificates] = useState<Array<{blob: Blob, data: CertificateData}>>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<number>>(new Set());
  const [batchJobs, setBatchJobs] = useState<Array<{volunteer: Volunteer, status: 'pending' | 'processing' | 'completed' | 'error', certificate?: {blob: Blob, data: CertificateData}}>>([]);
  const [batchProgress, setBatchProgress] = useState(0);
  const [isBatchGenerating, setIsBatchGenerating] = useState(false);
  const [formData, setFormData] = useState({
    volunteer_id: '',
    event_id: '',
    certificate_type: 'event',
    milestone_hours: '',
    custom_message: '',
    organizer_name: 'Plogging Ethiopia Team',
    location: 'Addis Ababa, Ethiopia'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [volunteersRes, eventsRes] = await Promise.all([
        apiClient.getAllVolunteers(),
        apiClient.getAllEvents()
      ]);
      setVolunteers(volunteersRes.data);
      setEvents(eventsRes.data);
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
      hoursContributed: selectedEvent?.estimated_duration_hours || 4,
      location: formData.location,
      organizerName: formData.organizer_name,
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
        hoursContributed: selectedEvent?.estimated_duration_hours || 4,
        location: formData.location,
        organizerName: formData.organizer_name,
        certificateId: generateCertificateId(),
        issueDate: formatDate(new Date()),
        badgeType: 'Environmental Champion',
        totalHours: selectedVolunteer.total_hours_contributed,
        rank: 1
      };

      // Generate PDF
      const generator = new CertificateGenerator(selectedTemplate);
      const blob = generator.getCertificateBlob(certificateData);

      // Add to generated certificates list
      setGeneratedCertificates(prev => [...prev, { blob, data: certificateData }]);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${selectedVolunteer.first_name}-${selectedVolunteer.last_name}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Reset form
      setFormData({
        volunteer_id: '',
        event_id: '',
        certificate_type: 'event',
        milestone_hours: '',
        custom_message: '',
        organizer_name: 'Plogging Ethiopia Team',
        location: 'Addis Ababa, Ethiopia'
      });
      setPreviewUrl('');

    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCertificate = (blob: Blob, data: CertificateData) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${data.volunteerName.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const shareCertificate = async (blob: Blob, data: CertificateData) => {
    if (navigator.share) {
      const file = new File([blob], `certificate-${data.volunteerName}.pdf`, { type: "application/pdf" });
      try {
        await navigator.share({
          title: "Plogging Ethiopia Certificate",
          text: `${data.volunteerName}'s certificate for ${data.eventName}`,
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing certificate:", error);
      }
    }
  };

  const handleVolunteerSelection = (volunteerId: number, checked: boolean) => {
    const newSelected = new Set(selectedVolunteers);
    if (checked) {
      newSelected.add(volunteerId);
    } else {
      newSelected.delete(volunteerId);
    }
    setSelectedVolunteers(newSelected);
  };

  const selectAllVolunteers = () => {
    setSelectedVolunteers(new Set(volunteers.map(v => v.volunteer_id)));
  };

  const deselectAllVolunteers = () => {
    setSelectedVolunteers(new Set());
  };

  const generateBatchCertificates = async () => {
    if (selectedVolunteers.size === 0) return;

    setIsBatchGenerating(true);
    setBatchProgress(0);
    
    const jobs = Array.from(selectedVolunteers).map(volunteerId => {
      const volunteer = volunteers.find(v => v.volunteer_id === volunteerId);
      return { volunteer: volunteer!, status: 'pending' as const };
    });
    
    setBatchJobs(jobs);
    const generator = new CertificateGenerator(selectedTemplate);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      
      setBatchJobs(prev => prev.map((j, index) => 
        index === i ? { ...j, status: 'processing' } : j
      ));

      try {
        const certificateData: CertificateData = {
          volunteerName: `${job.volunteer.first_name} ${job.volunteer.last_name}`,
          eventName: formData.event_id ? events.find(e => e.event_id.toString() === formData.event_id)?.event_name || 'Community Service' : 'Community Service',
          eventDate: formData.event_id ? events.find(e => e.event_id.toString() === formData.event_id)?.event_date || formatDate(new Date()) : formatDate(new Date()),
          hoursContributed: formData.event_id ? events.find(e => e.event_id.toString() === formData.event_id)?.estimated_duration_hours || job.volunteer.total_hours_contributed : job.volunteer.total_hours_contributed,
          location: formData.location,
          organizerName: formData.organizer_name,
          certificateId: generateCertificateId(),
          issueDate: formatDate(new Date()),
          badgeType: 'Environmental Champion',
          totalHours: job.volunteer.total_hours_contributed,
          rank: 1
        };

        const blob = generator.getCertificateBlob(certificateData);
        
        setBatchJobs(prev => prev.map((j, index) => 
          index === i ? { ...j, status: 'completed', certificate: { blob, data: certificateData } } : j
        ));

        setGeneratedCertificates(prev => [...prev, { blob, data: certificateData }]);

      } catch (error) {
        setBatchJobs(prev => prev.map((j, index) => 
          index === i ? { ...j, status: 'error' } : j
        ));
      }

      setBatchProgress(((i + 1) / jobs.length) * 100);
    }

    setIsBatchGenerating(false);
  };

  const downloadAllBatchCertificates = () => {
    const completedJobs = batchJobs.filter(job => job.status === 'completed' && job.certificate);
    
    completedJobs.forEach((job, index) => {
      if (job.certificate) {
        setTimeout(() => {
          const url = URL.createObjectURL(job.certificate!.blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-${job.volunteer.first_name}-${job.volunteer.last_name}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, index * 100);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading certificate generator...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Certificate Generator</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Create beautiful, professional certificates for volunteers. Choose from multiple templates, 
          customize content, and generate PDFs instantly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Form */}
        <div className="lg:col-span-1 space-y-6">
          {/* Certificate Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Event location"
                />
              </div>

              <div>
                <Label htmlFor="organizer_name">Organizer Name</Label>
                <Input
                  id="organizer_name"
                  value={formData.organizer_name}
                  onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                  placeholder="Organizer name"
                />
              </div>

              <div>
                <Label htmlFor="custom_message">Custom Message (Optional)</Label>
                <Textarea
                  id="custom_message"
                  placeholder="Add a custom message to the certificate"
                  value={formData.custom_message}
                  onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Choose Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {defaultTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedTemplate.id === template.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="w-full h-16 rounded mb-2" style={{ backgroundColor: template.backgroundColor }}>
                      <div className="flex items-center justify-center h-full">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                          style={{ backgroundColor: template.primaryColor }}
                        >
                          🌿
                        </div>
                      </div>
                    </div>
                    <h3 className="font-medium text-sm text-gray-800">{template.name}</h3>
                    <Badge className="text-xs mt-1" style={{ backgroundColor: template.primaryColor, color: "white" }}>
                      {template.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={generatePreview} 
                  variant="outline"
                  className="w-full"
                  disabled={!formData.volunteer_id}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Certificate
                </Button>
                <Button 
                  onClick={handleGenerateCertificate} 
                  className="w-full bg-green-600 hover:bg-green-700"
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
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview and Generated Certificates */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="batch">Batch Generate</TabsTrigger>
              <TabsTrigger value="generated">Generated ({generatedCertificates.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Certificate Preview
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                        <p className="text-sm">Select a volunteer and click "Preview Certificate"</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Batch Certificate Generation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        {selectedVolunteers.size} of {volunteers.length} volunteers selected
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={selectAllVolunteers}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAllVolunteers}>
                        Deselect All
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {volunteers.map((volunteer) => (
                      <div
                        key={volunteer.volunteer_id}
                        className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <Checkbox
                          id={`volunteer-${volunteer.volunteer_id}`}
                          checked={selectedVolunteers.has(volunteer.volunteer_id)}
                          onCheckedChange={(checked) => 
                            handleVolunteerSelection(volunteer.volunteer_id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`volunteer-${volunteer.volunteer_id}`} className="flex-1 cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{volunteer.first_name} {volunteer.last_name}</div>
                              <div className="text-sm text-gray-500">{volunteer.email}</div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Clock className="w-3 h-3" />
                                {volunteer.total_hours_contributed} hours
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {volunteer.total_hours_contributed >= 100 ? 'Champion' :
                                 volunteer.total_hours_contributed >= 50 ? 'Warrior' :
                                 volunteer.total_hours_contributed >= 25 ? 'Hero' : 'Helper'}
                              </Badge>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={generateBatchCertificates} 
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isBatchGenerating || selectedVolunteers.size === 0}
                  >
                    {isBatchGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating {batchJobs.filter(j => j.status === 'processing').length} of {batchJobs.length}...
                      </>
                    ) : (
                      <>
                        <Package className="w-4 h-4 mr-2" />
                        Generate {selectedVolunteers.size} Certificates
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {batchJobs.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Batch Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(batchProgress)}%</span>
                      </div>
                      <Progress value={batchProgress} className="w-full" />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {batchJobs.filter(j => j.status === 'completed').length}
                        </div>
                        <div className="text-sm text-green-600">Completed</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {batchJobs.filter(j => j.status === 'processing').length}
                        </div>
                        <div className="text-sm text-blue-600">Processing</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {batchJobs.filter(j => j.status === 'error').length}
                        </div>
                        <div className="text-sm text-red-600">Failed</div>
                      </div>
                    </div>

                    {!isBatchGenerating && batchJobs.some(j => j.status === 'completed') && (
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button onClick={downloadAllBatchCertificates} variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="generated" className="space-y-4">
              {generatedCertificates.length > 0 ? (
                <div className="grid gap-4">
                  {generatedCertificates.map((cert, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {cert.data.volunteerName}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {cert.data.eventName} • {cert.data.certificateId}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Generated {cert.data.issueDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadCertificate(cert.blob, cert.data)}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => shareCertificate(cert.blob, cert.data)}
                            >
                              <Share2 className="w-4 h-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No certificates generated yet.</p>
                    <p className="text-sm text-gray-400">Generate your first certificate to see it here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Volunteers</p>
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
              <Award className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Generated Today</p>
                <p className="text-2xl font-bold text-gray-900">{generatedCertificates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Package className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selectedVolunteers.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Templates</p>
                <p className="text-2xl font-bold text-gray-900">{defaultTemplates.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CertificateGeneratorPage; 