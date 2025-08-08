import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { apiClient } from '../lib/api';
import { Certificate, Volunteer, Event } from '../lib/api';

const AdminCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    volunteer_id: '',
    event_id: '',
    certificate_type: 'event',
    milestone_hours: ''
  });

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

  const handleGenerateCertificate = async () => {
    try {
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
        milestone_hours: ''
      });
      loadData();
    } catch (error) {
      console.error('Error generating certificate:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Certificate Management</h1>
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Generate Certificate</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate New Certificate</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                        {volunteer.first_name} {volunteer.last_name}
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
                          {event.event_name}
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

              <Button 
                onClick={handleGenerateCertificate} 
                className="w-full"
                disabled={!formData.volunteer_id || 
                  (formData.certificate_type === 'event' && !formData.event_id) ||
                  (formData.certificate_type === 'milestone' && !formData.milestone_hours)}
              >
                Generate Certificate
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {certificates.map((certificate) => (
          <Card key={certificate.certificate_id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Certificate #{certificate.certificate_id}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {getVolunteerName(certificate.volunteer_id)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Badge variant="secondary">
                    {certificate.certificate_type}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(certificate.download_url, '_blank')}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span> {certificate.certificate_type}
                </div>
                <div>
                  <span className="font-medium">Issued:</span> {new Date(certificate.issued_date).toLocaleDateString()}
                </div>
                {certificate.event_id && (
                  <div>
                    <span className="font-medium">Event:</span> {getEventName(certificate.event_id)}
                  </div>
                )}
                <div>
                  <span className="font-medium">Status:</span> Active
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No certificates found.</p>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates; 