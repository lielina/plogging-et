import React, { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, User, ClipboardList } from 'lucide-react';

const AdminSurveys: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [filteredSurveys, setFilteredSurveys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch surveys from API
  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const response = await apiClient.getAllSurveys();
        setSurveys(response.data);
        setFilteredSurveys(response.data);
      } catch (error: any) {
        console.error('Error fetching surveys:', error);
        toast({
          title: "Error",
          description: "Failed to fetch surveys. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  // Filter surveys based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSurveys(surveys);
    } else {
      const filtered = surveys.filter(survey => 
        survey.volunteer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.plogging_location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSurveys(filtered);
    }
  }, [searchTerm, surveys]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Volunteer Surveys</h1>
        <p className="text-gray-600">View and manage volunteer survey responses</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Survey Responses</CardTitle>
          <CardDescription>
            Overview of volunteer survey submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search surveys by volunteer name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Filter by Date
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Submitted Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSurveys.length > 0 ? (
                      filteredSurveys.map((survey) => (
                        <TableRow key={survey.id || survey.survey_id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium">{survey.volunteer_name || 'Unknown Volunteer'}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{survey.email || 'No email provided'}</TableCell>
                          <TableCell>{survey.plogging_location || 'Location not specified'}</TableCell>
                          <TableCell>
                            {survey.created_at 
                              ? new Date(survey.created_at).toLocaleDateString() 
                              : 'Date not available'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No surveys found</h3>
                            <p className="text-gray-500">Try adjusting your search query</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              {filteredSurveys.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {filteredSurveys.length} of {surveys.length} surveys
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSurveys;