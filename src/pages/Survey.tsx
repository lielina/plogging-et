import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, SurveyRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ArrowLeft, Save, SkipForward } from 'lucide-react';

const Survey: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Survey data state
  const [surveyData, setSurveyData] = useState<Partial<SurveyRequest>>({
    event_id: 0,
    plogging_location: '',
    age: 0,
    gender: 'male',
    education_level: '',
    residence_area: '',
    employment_status: '',
    main_reason: '',
    main_reason_other: '',
    future_participation_likelihood: 3,
    participation_factors: [],
    barriers_to_participation: [],
    barriers_to_participation_other: '',
    overall_satisfaction: ''
  });

  // Survey steps
  const steps = [
    { id: 'basic', title: 'Basic Information' },
    { id: 'reasons', title: 'Participation Reasons' },
    { id: 'future', title: 'Future Participation' },
    { id: 'barriers', title: 'Barriers to Participation' },
    { id: 'satisfaction', title: 'Overall Satisfaction' },
    { id: 'review', title: 'Review & Submit' }
  ];

  // Handle input changes
  const handleInputChange = (field: keyof SurveyRequest, value: any) => {
    setSurveyData(prev => ({ ...prev, [field]: value }));
  };

  // Handle checkbox changes
  const handleCheckboxChange = (field: keyof SurveyRequest, value: string, checked: boolean) => {
    setSurveyData(prev => {
      const currentArray = Array.isArray(prev[field]) ? [...prev[field] as string[]] : [];
      if (checked) {
        return { ...prev, [field]: [...currentArray, value] };
      } else {
        return { ...prev, [field]: currentArray.filter(item => item !== value) };
      }
    });
  };

  // Navigation functions
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit survey
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields
      if (!surveyData.plogging_location || !surveyData.age || !surveyData.gender) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      // Submit survey data
      await apiClient.submitSurvey(surveyData as SurveyRequest);
      
      toast({
        title: "Success",
        description: "Survey submitted successfully!",
      });
      
      // Navigate to dashboard after successful submission
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit survey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basic Information
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="plogging_location">Location of Plogging *</Label>
              <Input
                id="plogging_location"
                value={surveyData.plogging_location || ''}
                onChange={(e) => handleInputChange('plogging_location', e.target.value)}
                placeholder="Enter location"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={surveyData.age || ''}
                onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                placeholder="Enter your age"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Gender *</Label>
              <RadioGroup 
                value={surveyData.gender || 'male'} 
                onValueChange={(value) => handleInputChange('gender', value as 'male' | 'female' | 'other')}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="education_level">Education Level</Label>
              <Select 
                value={surveyData.education_level || ''} 
                onValueChange={(value) => handleInputChange('education_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high_school">High School</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="master">Master's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="residence_area">Neighborhood</Label>
              <Input
                id="residence_area"
                value={surveyData.residence_area || ''}
                onChange={(e) => handleInputChange('residence_area', e.target.value)}
                placeholder="Enter your neighborhood"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="employment_status">Work Status</Label>
              <Select 
                value={surveyData.employment_status || ''} 
                onValueChange={(value) => handleInputChange('employment_status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select work status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self_employed">Self-Employed</SelectItem>
                  <SelectItem value="job_seeker">Job Seeker</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="employed">Employed</SelectItem>
                  <SelectItem value="unemployed">Unemployed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 1: // Participation Reasons
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">
                What was your main reason for participating in the Plogging activity today? *
              </Label>
              <RadioGroup 
                value={surveyData.main_reason || ''} 
                onValueChange={(value) => handleInputChange('main_reason', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="protect_environment" id="protect_environment" />
                  <Label htmlFor="protect_environment">To protect the environment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="protect_health" id="protect_health" />
                  <Label htmlFor="protect_health">To protect my own health by being active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="social_interaction" id="social_interaction" />
                  <Label htmlFor="social_interaction">For social interaction (meeting people)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="enjoy_nature" id="enjoy_nature" />
                  <Label htmlFor="enjoy_nature">For fun, to enjoy nature</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="reason_other" />
                  <Label htmlFor="reason_other">Other:</Label>
                </div>
                {surveyData.main_reason === 'other' && (
                  <div className="ml-6 mt-2">
                    <Input
                      value={surveyData.main_reason_other || ''}
                      onChange={(e) => handleInputChange('main_reason_other', e.target.value)}
                      placeholder="Please specify"
                    />
                  </div>
                )}
              </RadioGroup>
            </div>
          </div>
        );
      
      case 2: // Future Participation
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">
                How likely are you to participate in future Plogging activities? *
              </Label>
              <div className="flex justify-between items-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div key={num} className="flex flex-col items-center">
                    <Button
                      variant={surveyData.future_participation_likelihood === num ? "default" : "outline"}
                      className="w-12 h-12 rounded-full"
                      onClick={() => handleInputChange('future_participation_likelihood', num)}
                    >
                      {num}
                    </Button>
                    <span className="text-xs mt-1">
                      {num === 1 ? 'Very low' : num === 5 ? 'Very high' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Which of the following would increase your chances of participating again? (Choose more than one)
              </Label>
              <div className="space-y-2">
                {[
                  { id: 'frequent', label: 'If the plogging is organized frequently' },
                  { id: 'different_places', label: 'If it is organized in different places' },
                  { id: 'social_activities', label: 'If there are other social activities after plogging' },
                  { id: 'recognition', label: 'If there is recognition or awards' },
                  { id: 'always_motivated', label: 'I am always motivated to participate' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={(surveyData.participation_factors || []).includes(item.id)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('participation_factors', item.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 3: // Barriers to Participation
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Which of the following might prevent you from participating in the future? (Choose more than one)
              </Label>
              <div className="space-y-2">
                {[
                  { id: 'time_inconvenience', label: 'Inconvenience of time' },
                  { id: 'location_inconvenience', label: 'The location is not convenient' },
                  { id: 'physical_health', label: 'My physical health makes it difficult for me to participate' },
                  { id: 'lack_of_interest', label: 'Lack of interest' },
                  { id: 'barrier_other', label: 'Other' }
                ].map((item) => (
                  <div key={item.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={item.id}
                      checked={(surveyData.barriers_to_participation || []).includes(item.id)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('barriers_to_participation', item.id, checked as boolean)
                      }
                    />
                    <Label htmlFor={item.id}>{item.label}</Label>
                  </div>
                ))}
                {(surveyData.barriers_to_participation || []).includes('barrier_other') && (
                  <div className="ml-6 mt-2">
                    <Input
                      placeholder="Please specify"
                      value={surveyData.barriers_to_participation_other || ''}
                      onChange={(e) => handleInputChange('barriers_to_participation_other', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      
      case 4: // Overall Satisfaction
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Overall, how was today's activity? *
              </Label>
              <RadioGroup 
                value={surveyData.overall_satisfaction || ''} 
                onValueChange={(value) => handleInputChange('overall_satisfaction', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="happy" id="happy" />
                  <Label htmlFor="happy">I am happy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not_happy" id="not_happy" />
                  <Label htmlFor="not_happy">I am not happy</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      
      case 5: // Review & Submit
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Review Your Answers</CardTitle>
                <CardDescription>Please review your answers before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-medium">Location:</Label>
                    <p>{surveyData.plogging_location || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Age:</Label>
                    <p>{surveyData.age || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Gender:</Label>
                    <p>{surveyData.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Education Level:</Label>
                    <p>{surveyData.education_level || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Neighborhood:</Label>
                    <p>{surveyData.residence_area || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Work Status:</Label>
                    <p>{surveyData.employment_status || 'Not provided'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="font-medium">Main Reason:</Label>
                  <p>{surveyData.main_reason === 'other' ? `Other: ${surveyData.main_reason_other}` : surveyData.main_reason || 'Not provided'}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Future Participation Likelihood:</Label>
                  <p>{surveyData.future_participation_likelihood || 'Not provided'}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Participation Factors:</Label>
                  <p>{(surveyData.participation_factors || []).join(', ') || 'None selected'}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Barriers to Participation:</Label>
                  <p>{(surveyData.barriers_to_participation || []).join(', ') || 'None selected'}</p>
                </div>
                
                <div>
                  <Label className="font-medium">Overall Satisfaction:</Label>
                  <p>{surveyData.overall_satisfaction || 'Not provided'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Mobile sidebar trigger */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50 lg:hidden">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar className="border-r">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Survey Steps</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {steps.map((step, index) => (
                      <SidebarMenuItem key={step.id}>
                        <SidebarMenuButton
                          onClick={() => {
                            setCurrentStep(index);
                            setSidebarOpen(false);
                          }}
                          isActive={currentStep === index}
                          className="flex items-center gap-3"
                        >
                          <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                            currentStep === index 
                              ? 'bg-green-500 text-white' 
                              : currentStep > index 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-500'
                          }`}>
                            {index + 1}
                          </span>
                          <span>{step.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 border-r">
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Survey Steps</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {steps.map((step, index) => (
                    <SidebarMenuItem key={step.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentStep(index)}
                        isActive={currentStep === index}
                        className="flex items-center gap-3"
                      >
                        <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                          currentStep === index 
                            ? 'bg-green-500 text-white' 
                            : currentStep > index 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                        <span>{step.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-white sticky top-0 z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/dashboard')}
                className="hidden lg:flex"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <div>
                <h1 className="text-xl font-bold">Volunteer Survey</h1>
                <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
              </span>
            </div>
          </div>
        </header>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-200">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>{steps[currentStep].title}</CardTitle>
                <CardDescription>
                  {currentStep === 0 && "Please provide your basic information"}
                  {currentStep === 1 && "Tell us about your reasons for participating"}
                  {currentStep === 2 && "Share your thoughts on future participation"}
                  {currentStep === 3 && "Help us understand potential barriers"}
                  {currentStep === 4 && "How satisfied were you with today's activity?"}
                  {currentStep === 5 && "Review your answers before submitting"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderStepContent()}
              </CardContent>
            </Card>
          </div>
        </main>

        {/* Navigation */}
        <footer className="border-t bg-white p-4">
          <div className="max-w-3xl mx-auto flex justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < steps.length - 1 ? (
                <Button onClick={nextStep}>
                  Next
                  <SkipForward className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Submit Survey
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Survey;