import React, { useState } from 'react';
import { apiClient, SurveyRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Save, SkipForward } from 'lucide-react';

interface SurveyModalProps {
  open: boolean;
  onClose: () => void;
  onSurveyComplete: () => void;
  onSkip?: () => void;
  eventId?: number; // Add optional event ID
}

const SurveyModal: React.FC<SurveyModalProps> = ({ open, onClose, onSurveyComplete, onSkip, eventId }) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Survey data state
  const [surveyData, setSurveyData] = useState<Partial<SurveyRequest>>({
    event_id: eventId,
    plogging_location: '',
    age: 0,
    gender: 'male',
    education_level: '',
    residence_area: '',
    employment_status: '',
    main_reason: '',
    main_reason_other: null,
    future_participation_likelihood: 3,
    participation_factors: [],
    barriers_to_participation: [],
    barriers_to_participation_other: null,
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

      // Validate age (assuming minimum age is 16)
      if (surveyData.age < 16) {
        toast({
          title: "Error",
          description: "Age must be at least 16 years old.",
          variant: "destructive"
        });
        return;
      }

      // Validate main_reason - it's required
      if (!surveyData.main_reason) {
        toast({
          title: "Error",
          description: "Please select your main reason for participating.",
          variant: "destructive"
        });
        return;
      }

      // Validate overall_satisfaction - it's required
      if (!surveyData.overall_satisfaction) {
        toast({
          title: "Error",
          description: "Please select your overall satisfaction.",
          variant: "destructive"
        });
        return;
      }

      // Validate text fields have meaningful content
      if (surveyData.plogging_location && surveyData.plogging_location.length < 2) {
        toast({
          title: "Error",
          description: "Please enter a valid location.",
          variant: "destructive"
        });
        return;
      }

      if (surveyData.residence_area && surveyData.residence_area.length < 2) {
        toast({
          title: "Error",
          description: "Please enter a valid residence area.",
          variant: "destructive"
        });
        return;
      }

      // Prepare survey data for submission
      const surveyPayload: any = { ...surveyData };
      
      // Handle event_id - only include if it's a valid number
      if (surveyPayload.event_id && surveyPayload.event_id > 0) {
        surveyPayload.event_id = surveyPayload.event_id;
      } else {
        delete surveyPayload.event_id;
      }

      // Ensure participation_factors is an array
      if (!Array.isArray(surveyPayload.participation_factors)) {
        surveyPayload.participation_factors = [];
      }

      // Ensure barriers_to_participation is an array
      if (!Array.isArray(surveyPayload.barriers_to_participation)) {
        surveyPayload.barriers_to_participation = [];
      }

      // Handle main_reason_other - set to null if not 'other'
      if (surveyPayload.main_reason !== 'other') {
        surveyPayload.main_reason_other = null;
      } else if (!surveyPayload.main_reason_other) {
        surveyPayload.main_reason_other = null;
      }

      // Handle barriers_to_participation_other - set to null if 'other' not selected
      if (!surveyPayload.barriers_to_participation.includes('other')) {
        surveyPayload.barriers_to_participation_other = null;
      } else if (!surveyPayload.barriers_to_participation_other) {
        surveyPayload.barriers_to_participation_other = null;
      }

      // Remove undefined values
      Object.keys(surveyPayload).forEach(key => {
        if (surveyPayload[key as keyof typeof surveyPayload] === undefined) {
          delete surveyPayload[key as keyof typeof surveyPayload];
        }
      });

      console.log('Survey payload being sent:', surveyPayload); // For debugging

      // Submit survey data
      await apiClient.submitSurvey(surveyPayload as SurveyRequest);
      
      toast({
        title: "Success",
        description: "Survey submitted successfully!",
      });
      
      // Notify parent component that survey is complete
      onSurveyComplete();
      onClose();
    } catch (error: any) {
      console.error('Survey submission error:', error);
      
      // Try to get more detailed error information
      let errorMessage = error.message || "Failed to submit survey. Please try again.";
      
      // If we have more detailed error information from the API
      if (error.message && error.message.includes('Validation failed')) {
        errorMessage = "There was a validation error with your submission. Please check all fields and try again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
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
          <div className="space-y-4">
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
                onValueChange={(value) => handleInputChange('gender', value as 'male' | 'female')}
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
                  <SelectItem value="tvet">TVET</SelectItem>
                  <SelectItem value="secondary_school">Secondary School</SelectItem>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                  <SelectItem value="phd">PhD</SelectItem>
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
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="job_seeker">Job Seeker</SelectItem>
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
                  <RadioGroupItem value="environmental_health" id="environmental_health" />
                  <Label htmlFor="environmental_health">Environmental and health benefits</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="personal_health" id="personal_health" />
                  <Label htmlFor="personal_health">Personal health improvement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="social_connection" id="social_connection" />
                  <Label htmlFor="social_connection">Social connection</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entertainment_nature" id="entertainment_nature" />
                  <Label htmlFor="entertainment_nature">Entertainment in nature</Label>
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
                      className="w-10 h-10 rounded-full"
                      onClick={() => handleInputChange('future_participation_likelihood', num)}
                    >
                      {num}
                    </Button>
                    <span className="text-xs mt-1">
                      {num === 1 ? 'Low' : num === 5 ? 'High' : ''}
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
                  { id: 'regular_plogging', label: 'Regular plogging events' },
                  { id: 'various_locations', label: 'Plogging in various locations' },
                  { id: 'social_activities', label: 'Social activities after plogging' },
                  { id: 'recognition_rewards', label: 'Recognition or rewards' },
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
                  { id: 'time_constraint', label: 'Time constraint' },
                  { id: 'location_inconvenient', label: 'Location inconvenient' },
                  { id: 'physical_health', label: 'Physical health issues' },
                  { id: 'lack_of_interest', label: 'Lack of interest' },
                  { id: 'other', label: 'Other' }
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
                {(surveyData.barriers_to_participation || []).includes('other') && (
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
                  <RadioGroupItem value="satisfied" id="satisfied" />
                  <Label htmlFor="satisfied">Satisfied</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-satisfied" id="not_satisfied" />
                  <Label htmlFor="not_satisfied">Not satisfied</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );
      
      case 5: // Review & Submit
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
            
            <div className="text-sm">
              <Label className="font-medium">Main Reason:</Label>
              <p>{surveyData.main_reason === 'other' ? `Other: ${surveyData.main_reason_other || ''}` : surveyData.main_reason || 'Not provided'}</p>
            </div>
            
            <div className="text-sm">
              <Label className="font-medium">Future Participation Likelihood:</Label>
              <p>{surveyData.future_participation_likelihood || 'Not provided'}</p>
            </div>
            
            <div className="text-sm">
              <Label className="font-medium">Participation Factors:</Label>
              <p>{(surveyData.participation_factors || []).join(', ') || 'None selected'}</p>
            </div>
            
            <div className="text-sm">
              <Label className="font-medium">Barriers to Participation:</Label>
              <p>{(surveyData.barriers_to_participation || []).join(', ') || 'None selected'}</p>
            </div>
            
            <div className="text-sm">
              <Label className="font-medium">Overall Satisfaction:</Label>
              <p>{surveyData.overall_satisfaction || 'Not provided'}</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        // If the dialog is being closed, check if we have an onSkip handler
        if (onSkip) {
          onSkip();
        }
        onClose();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Volunteer Survey</span>
            <span className="text-sm font-normal text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{steps[currentStep].title}</h3>
            <p className="text-sm text-gray-500">
              {currentStep === 0 && "Please provide your basic information"}
              {currentStep === 1 && "Tell us about your reasons for participating"}
              {currentStep === 2 && "Share your thoughts on future participation"}
              {currentStep === 3 && "Help us understand potential barriers"}
              {currentStep === 4 && "How satisfied were you with today's activity?"}
              {currentStep === 5 && "Review your answers before submitting"}
            </p>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={((currentStep + 1) / steps.length) * 100} 
              className="w-full"
            />
            <div className="text-right text-xs text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
            </div>
          </div>
          
          <div className="py-2">
            {renderStepContent()}
          </div>
          
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              {currentStep === 0 && onSkip && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (onSkip) {
                      onSkip();
                    }
                    onClose();
                  }}
                >
                  Skip for now
                </Button>
              )}
            </div>
            
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SurveyModal;