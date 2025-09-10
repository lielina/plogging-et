import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  CertificateGenerator, 
  CertificateData, 
  CertificateTemplate, 
  defaultTemplates,
  generateCertificateId,
  formatDate 
} from '../lib/certificate-generator';
import { 
  FileText, 
  Download, 
  Eye, 
  Share2, 
  Palette,
  Award,
  Users,
  Calendar,
  Star
} from 'lucide-react';

// Sample data for demo
const sampleVolunteers = [
  { id: 1, name: 'Sarah Alemayehu', hours: 24, email: 'sarah@example.com' },
  { id: 2, name: 'Michael Tadesse', hours: 18, email: 'michael@example.com' },
  { id: 3, name: 'Fatima Hassan', hours: 32, email: 'fatima@example.com' },
  { id: 4, name: 'David Bekele', hours: 15, email: 'david@example.com' },
];

const sampleEvents = [
  { id: 1, name: 'Meskel Square Cleanup Drive', date: '2024-01-15', hours: 4, location: 'Meskel Square, Addis Ababa' },
  { id: 2, name: 'Entoto Mountain Trail Maintenance', date: '2024-02-20', hours: 6, location: 'Entoto Mountain, Addis Ababa' },
  { id: 3, name: 'Bole Community Garden Project', date: '2024-03-10', hours: 5, location: 'Bole, Addis Ababa' },
];

const CertificateDemo: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>(defaultTemplates[0]);
  const [selectedVolunteer, setSelectedVolunteer] = useState(sampleVolunteers[0]);
  const [selectedEvent, setSelectedEvent] = useState(sampleEvents[0]);
  const [certificateType, setCertificateType] = useState('event');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePreview = () => {
    const certificateData: CertificateData = {
      volunteerName: selectedVolunteer.name,
      eventName: selectedEvent.name,
      eventDate: selectedEvent.date,
      hoursContributed: selectedEvent.hours,
      location: selectedEvent.location,
      organizerName: 'Plogging Ethiopia Team',
      certificateId: generateCertificateId(),
      issueDate: formatDate(new Date()),
      badgeType: 'Environmental Champion',
      totalHours: selectedVolunteer.hours,
      rank: 1
    };

    const generator = new CertificateGenerator(selectedTemplate);
    const dataURL = generator.getCertificateDataURL(certificateData);
    setPreviewUrl(dataURL);
  };

  const handleGenerateCertificate = async () => {
    setIsGenerating(true);
    
    try {
      const certificateData: CertificateData = {
        volunteerName: selectedVolunteer.name,
        eventName: selectedEvent.name,
        eventDate: selectedEvent.date,
        hoursContributed: selectedEvent.hours,
        location: selectedEvent.location,
        organizerName: 'Plogging Ethiopia Team',
        certificateId: generateCertificateId(),
        issueDate: formatDate(new Date()),
        badgeType: 'Environmental Champion',
        totalHours: selectedVolunteer.hours,
        rank: 1
      };

      const generator = new CertificateGenerator(selectedTemplate);
      const blob = generator.getCertificateBlob(certificateData);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${selectedVolunteer.name.replace(/\s+/g, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error generating certificate:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Plogging Ethiopia Certificate",
          text: `${selectedVolunteer.name}'s certificate for ${selectedEvent.name}`,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing certificate:", error);
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-gray-900">Certificate Generator Demo</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Experience the certificate generation system with sample data. Try different templates and see how certificates look.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Volunteer Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Select Volunteer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleVolunteers.map((volunteer) => (
                <div
                  key={volunteer.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedVolunteer.id === volunteer.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => setSelectedVolunteer(volunteer)}
                >
                  <div className="font-medium text-gray-900">{volunteer.name}</div>
                  <div className="text-sm text-gray-600">{volunteer.hours} hours contributed</div>
                  <div className="text-xs text-gray-500">{volunteer.email}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Event Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Select Event
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sampleEvents.map((event) => (
                <div
                  key={event.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedEvent.id === event.id
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-green-300"
                  }`}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="font-medium text-gray-900">{event.name}</div>
                  <div className="text-sm text-gray-600">{event.hours} hours • {event.location}</div>
                  <div className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString()}</div>
                </div>
              ))}
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
                    <Badge className="text-xs mt-1 px-2 py-0.5" style={{ backgroundColor: template.primaryColor, color: "white" }}>
                      {template.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={generatePreview} 
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Certificate
                </Button>
                <Button 
                  onClick={handleGenerateCertificate} 
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={isGenerating}
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
                <Button 
                  onClick={shareCertificate} 
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Certificate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="lg:col-span-2">
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
                    <p className="text-sm">Click "Preview Certificate" to see your certificate</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certificate Details */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certificate Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedVolunteer.hours}</div>
                  <div className="text-sm text-green-600">Total Hours</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedEvent.hours}</div>
                  <div className="text-sm text-blue-600">Event Hours</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedTemplate.type}</div>
                  <div className="text-sm text-purple-600">Certificate Type</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">4</div>
                  <div className="text-sm text-orange-600">Templates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Showcase */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Certificate Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Palette className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Multiple Templates</h3>
              <p className="text-gray-600">Choose from 4 different certificate templates with unique designs and color schemes.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Download className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Instant Download</h3>
              <p className="text-gray-600">Generate and download high-quality PDF certificates instantly from your browser.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <Share2 className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Easy Sharing</h3>
              <p className="text-gray-600">Share certificates directly via email, social media, or download links.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CertificateDemo; 