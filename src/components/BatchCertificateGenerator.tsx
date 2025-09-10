import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  CertificateGenerator, 
  CertificateData, 
  CertificateTemplate, 
  defaultTemplates,
  generateCertificateId,
  formatDate 
} from '../lib/certificate-generator';
import { Volunteer, Event } from '../lib/api';
import { 
  Download, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Package
} from 'lucide-react';

interface BatchCertificateGeneratorProps {
  volunteers: Volunteer[];
  events: Event[];
  onComplete?: (certificates: Array<{blob: Blob, data: CertificateData}>) => void;
}

interface BatchJob {
  volunteer: Volunteer;
  event?: Event;
  certificateType: string;
  milestoneHours?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  certificate?: {blob: Blob, data: CertificateData};
  error?: string;
}

const BatchCertificateGenerator: React.FC<BatchCertificateGeneratorProps> = ({
  volunteers,
  events,
  onComplete
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(defaultTemplates[0]);
  const [batchJobs, setBatchJobs] = useState<BatchJob[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Set<number>>(new Set());
  const [batchConfig, setBatchConfig] = useState({
    certificateType: 'event',
    eventId: '',
    milestoneHours: '',
    organizerName: 'Plogging Ethiopia Team',
    location: 'Addis Ababa, Ethiopia'
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

  const selectAllVolunteers = () => {
    setSelectedVolunteers(new Set(volunteers.map(v => v.volunteer_id)));
  };

  const deselectAllVolunteers = () => {
    setSelectedVolunteers(new Set());
  };

  const prepareBatchJobs = () => {
    const jobs: BatchJob[] = [];
    
    selectedVolunteers.forEach(volunteerId => {
      const volunteer = volunteers.find(v => v.volunteer_id === volunteerId);
      if (!volunteer) return;

      const event = batchConfig.certificateType === 'event' && batchConfig.eventId 
        ? events.find(e => e.event_id.toString() === batchConfig.eventId)
        : undefined;

      jobs.push({
        volunteer,
        event,
        certificateType: batchConfig.certificateType,
        milestoneHours: batchConfig.certificateType === 'milestone' ? parseInt(batchConfig.milestoneHours) : undefined,
        status: 'pending'
      });
    });

    setBatchJobs(jobs);
  };

  const generateBatchCertificates = async () => {
    if (selectedVolunteers.size === 0) return;

    setIsGenerating(true);
    setProgress(0);
    prepareBatchJobs();

    const generator = new CertificateGenerator(selectedTemplate);
    const completedCertificates: Array<{blob: Blob, data: CertificateData}> = [];

    for (let i = 0; i < batchJobs.length; i++) {
      const job = batchJobs[i];
      
      // Update status to processing
      setBatchJobs(prev => prev.map((j, index) => 
        index === i ? { ...j, status: 'processing' } : j
      ));

      try {
        const certificateData: CertificateData = {
          volunteerName: `${job.volunteer.first_name} ${job.volunteer.last_name}`,
          eventName: job.event?.event_name || 'Community Service',
          eventDate: job.event?.event_date || formatDate(new Date()),
          hoursContributed: job.event?.estimated_duration_hours || job.milestoneHours || 4,
          location: batchConfig.location,
          organizerName: batchConfig.organizerName,
          certificateId: generateCertificateId(),
          issueDate: formatDate(new Date()),
          badgeType: 'Environmental Champion',
          totalHours: job.volunteer.total_hours_contributed,
          rank: 1
        };

        const blob = generator.getCertificateBlob(certificateData);
        completedCertificates.push({ blob, data: certificateData });

        // Update status to completed
        setBatchJobs(prev => prev.map((j, index) => 
          index === i ? { ...j, status: 'completed', certificate: { blob, data: certificateData } } : j
        ));

      } catch (error) {
        // Update status to error
        setBatchJobs(prev => prev.map((j, index) => 
          index === i ? { ...j, status: 'error', error: 'Generation failed' } : j
        ));
      }

      // Update progress
      setProgress(((i + 1) / batchJobs.length) * 100);
    }

    setIsGenerating(false);
    
    if (onComplete) {
      onComplete(completedCertificates);
    }
  };

  const downloadAllCertificates = () => {
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
        }, index * 100); // Stagger downloads
      }
    });
  };

  const downloadZip = async () => {
    const completedJobs = batchJobs.filter(job => job.status === 'completed' && job.certificate);
    
    // Note: For a production app, you'd want to use a library like JSZip
    // For now, we'll download them individually with a slight delay
    alert(`Downloading ${completedJobs.length} certificates...`);
    downloadAllCertificates();
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

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Batch Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Certificate Type</Label>
              <Select
                value={batchConfig.certificateType}
                onValueChange={(value) => setBatchConfig({ ...batchConfig, certificateType: value })}
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

            {batchConfig.certificateType === 'event' && (
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
          </div>

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
        </CardContent>
      </Card>

      {/* Volunteer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Volunteers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
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
                  <div className="font-medium">{volunteer.first_name} {volunteer.last_name}</div>
                  <div className="text-sm text-gray-500">{volunteer.total_hours_contributed} hours</div>
                </Label>
              </div>
            ))}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                <Badge className="text-xs mt-1 px-2 py-0.5" style={{ backgroundColor: template.primaryColor, color: "white" }}>
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

      {/* Progress and Results */}
      {batchJobs.length > 0 && (
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

            {/* Job List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {batchJobs.map((job, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <div className="font-medium">{job.volunteer.first_name} {job.volunteer.last_name}</div>
                      <div className="text-sm text-gray-500">
                        {job.event?.event_name || job.certificateType} certificate
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(job.status) + " text-xs px-2 py-0.5"}>
                    {job.status}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Download Actions */}
            {!isGenerating && batchJobs.some(j => j.status === 'completed') && (
              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={downloadAllCertificates} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <Button onClick={downloadZip} className="bg-green-600 hover:bg-green-700">
                  <Package className="w-4 h-4 mr-2" />
                  Download as ZIP
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchCertificateGenerator; 