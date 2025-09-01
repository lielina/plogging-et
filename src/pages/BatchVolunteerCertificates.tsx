import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  CertificateGenerator, 
  CertificateData, 
  CertificateTemplate, 
  defaultTemplates,
  generateCertificateId,
  formatDate 
} from '../lib/certificate-generator';
import { Volunteer, Event } from '../lib/api';
import { apiClient } from '../lib/api';
import { 
  Download, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Package,
  Award,
  Calendar,
  MapPin,
  UserCheck,
  Filter,
  Search
} from 'lucide-react';

interface CertificateJob {
  volunteer: Volunteer;
  certificateType: 'participation' | 'achievement' | 'leadership' | 'milestone';
  event?: Event;
  milestoneHours?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  certificate?: {blob: Blob, data: CertificateData};
  error?: string;
}

const BatchVolunteerCertificates: React.FC = () => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(defaultTemplates[0]);
  const [certificateJobs, setCertificateJobs] = useState<CertificateJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'new'>('all');
  const [batchConfig, setBatchConfig] = useState({
    certificateType: 'participation' as const,
    eventId: '',
    milestoneHours: '50',
    organizerName: 'Plogging Ethiopia Team',
    location: 'Addis Ababa, Ethiopia',
    customMessage: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [volunteersRes, eventsRes] = await Promise.all([
        apiClient.getAllVolunteers(1, 1000), // Get all volunteers
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

  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = `${volunteer.first_name} ${volunteer.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filterType === 'active') {
      matchesFilter = volunteer.total_hours_contributed > 0;
    } else if (filterType === 'new') {
      // Consider volunteers with less than 10 hours as new
      matchesFilter = volunteer.total_hours_contributed < 10;
    }

    return matchesSearch && matchesFilter;
  });

  const handleVolunteerSelection = (volunteerId: number, checked: boolean) => {
    const newSelected = new Set(selectedVolunteers);
    if (checked) {
      newSelected.add(volunteerId);
    } else {
      newSelected.delete(volunteerId);
    }
    setSelectedVolunteers(newSelected);
  };

  const selectAllFiltered = () => {
    setSelectedVolunteers(new Set(filteredVolunteers.map(v => v.volunteer_id)));
  };

  const deselectAll = () => {
    setSelectedVolunteers(new Set());
  };

  const prepareCertificateJobs = () => {
    const jobs: CertificateJob[] = [];
    
    selectedVolunteers.forEach(volunteerId => {
      const volunteer = volunteers.find(v => v.volunteer_id === volunteerId);
      if (!volunteer) return;

      const event = batchConfig.certificateType === 'participation' && batchConfig.eventId 
        ? events.find(e => e.event_id.toString() === batchConfig.eventId)
        : undefined;

      jobs.push({
        volunteer,
        certificateType: batchConfig.certificateType,
        event,
        milestoneHours: batchConfig.certificateType === 'milestone' ? parseInt(batchConfig.milestoneHours) : undefined,
        status: 'pending'
      });
    });

    setCertificateJobs(jobs);
  };

  const generateBatchCertificates = async () => {
    if (selectedVolunteers.size === 0) return;

    setIsGenerating(true);
    setProgress(0);
    prepareCertificateJobs();

    const generator = new CertificateGenerator(selectedTemplate);
    const completedCertificates: Array<{blob: Blob, data: CertificateData}> = [];

    for (let i = 0; i < certificateJobs.length; i++) {
      const job = certificateJobs[i];
      
      // Update status to processing
      setCertificateJobs(prev => prev.map((j, index) => 
        index === i ? { ...j, status: 'processing' } : j
      ));

      try {
        const certificateData: CertificateData = {
          volunteerName: `${job.volunteer.first_name} ${job.volunteer.last_name}`,
          eventName: job.event?.event_name || 'Community Service',
          eventDate: job.event?.event_date || formatDate(new Date()),
          hoursContributed: job.event?.estimated_duration_hours || job.milestoneHours || job.volunteer.total_hours_contributed,
          location: batchConfig.location,
          organizerName: batchConfig.organizerName,
          certificateId: generateCertificateId(),
          issueDate: formatDate(new Date()),
          badgeType: getBadgeType(job.certificateType, job.volunteer.total_hours_contributed),
          totalHours: job.volunteer.total_hours_contributed,
          rank: getVolunteerRank(job.volunteer.total_hours_contributed)
        };

        const blob = generator.getCertificateBlob(certificateData);
        completedCertificates.push({ blob, data: certificateData });

        // Update status to completed
        setCertificateJobs(prev => prev.map((j, index) => 
          index === i ? { ...j, status: 'completed', certificate: { blob, data: certificateData } } : j
        ));

      } catch (error) {
        // Update status to error
        setCertificateJobs(prev => prev.map((j, index) => 
          index === i ? { ...j, status: 'error', error: 'Generation failed' } : j
        ));
      }

      // Update progress
      setProgress(((i + 1) / certificateJobs.length) * 100);
    }

    setIsGenerating(false);
  };

  const getBadgeType = (certificateType: string, totalHours: number): string => {
    switch (certificateType) {
      case 'achievement':
        if (totalHours >= 100) return 'Environmental Champion';
        if (totalHours >= 50) return 'Green Warrior';
        if (totalHours >= 25) return 'Eco Hero';
        return 'Community Helper';
      case 'leadership':
        return 'Environmental Leader';
      case 'milestone':
        return 'Milestone Achiever';
      default:
        return 'Environmental Steward';
    }
  };

  const getVolunteerRank = (totalHours: number): number => {
    const sortedVolunteers = [...volunteers].sort((a, b) => b.total_hours_contributed - a.total_hours_contributed);
    const rank = sortedVolunteers.findIndex(v => v.total_hours_contributed === totalHours) + 1;
    return rank;
  };

  const downloadAllCertificates = () => {
    const completedJobs = certificateJobs.filter(job => job.status === 'completed' && job.certificate);
    
    completedJobs.forEach((job, index) => {
      if (job.certificate) {
        setTimeout(() => {
          const url = URL.createObjectURL(job.certificate!.blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `certificate-${job.volunteer.first_name}-${job.volunteer.last_name}-${job.certificateType}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, index * 100); // Stagger downloads
      }
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading volunteer certificates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Volunteer Certificates</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate certificates for all volunteers. Choose certificate types, select volunteers, and create beautiful certificates in batch.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Certificate Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certificate Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Certificate Type</Label>
                <Select
                  value={batchConfig.certificateType}
                  onValueChange={(value: any) => setBatchConfig({ ...batchConfig, certificateType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="participation">Participation Certificate</SelectItem>
                    <SelectItem value="achievement">Achievement Certificate</SelectItem>
                    <SelectItem value="leadership">Leadership Certificate</SelectItem>
                    <SelectItem value="milestone">Milestone Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {batchConfig.certificateType === 'participation' && (
                <div>
                  <Label>Event</Label>
                  <Select
                    value={batchConfig.eventId}
                    onValueChange={(value) => setBatchConfig({ ...batchConfig, eventId: value })}
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

              {batchConfig.certificateType === 'milestone' && (
                <div>
                  <Label>Milestone Hours</Label>
                  <input
                    type="number"
                    value={batchConfig.milestoneHours}
                    onChange={(e) => setBatchConfig({ ...batchConfig, milestoneHours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter milestone hours"
                  />
                </div>
              )}

              <div>
                <Label>Location</Label>
                <input
                  type="text"
                  value={batchConfig.location}
                  onChange={(e) => setBatchConfig({ ...batchConfig, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Event location"
                />
              </div>

              <div>
                <Label>Organizer Name</Label>
                <input
                  type="text"
                  value={batchConfig.organizerName}
                  onChange={(e) => setBatchConfig({ ...batchConfig, organizerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Organizer name"
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
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
              <Button 
                onClick={generateBatchCertificates} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isGenerating || selectedVolunteers.size === 0}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating {certificateJobs.filter(j => j.status === 'processing').length} of {certificateJobs.length}...
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
        </div>

        {/* Right Panel - Volunteer Selection and Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="volunteers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="volunteers">Volunteers ({filteredVolunteers.length})</TabsTrigger>
              <TabsTrigger value="progress">Progress ({certificateJobs.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="volunteers" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Search volunteers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Volunteers</SelectItem>
                          <SelectItem value="active">Active Volunteers</SelectItem>
                          <SelectItem value="new">New Volunteers</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={selectAllFiltered}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" onClick={deselectAll}>
                        Deselect All
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Volunteer List */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Select Volunteers ({selectedVolunteers.size} selected)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {filteredVolunteers.map((volunteer) => (
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
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              {certificateJobs.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Generation Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="w-full" />
                    </div>

                    {/* Status Summary */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {certificateJobs.filter(j => j.status === 'completed').length}
                        </div>
                        <div className="text-sm text-green-600">Completed</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {certificateJobs.filter(j => j.status === 'processing').length}
                        </div>
                        <div className="text-sm text-blue-600">Processing</div>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">
                          {certificateJobs.filter(j => j.status === 'error').length}
                        </div>
                        <div className="text-sm text-red-600">Failed</div>
                      </div>
                    </div>

                    {/* Job List */}
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {certificateJobs.map((job, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(job.status)}
                            <div>
                              <div className="font-medium">{job.volunteer.first_name} {job.volunteer.last_name}</div>
                              <div className="text-sm text-gray-500">
                                {job.certificateType} certificate
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(job.status)}>
                            {job.status}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Download Actions */}
                    {!isGenerating && certificateJobs.some(j => j.status === 'completed') && (
                      <div className="flex space-x-2 pt-4 border-t">
                        <Button onClick={downloadAllCertificates} variant="outline">
                          <Download className="w-4 h-4 mr-2" />
                          Download All
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No certificates generated yet.</p>
                    <p className="text-sm text-gray-400">Select volunteers and generate certificates to see progress here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selectedVolunteers.size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{certificateJobs.filter(j => j.status === 'completed').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BatchVolunteerCertificates; 