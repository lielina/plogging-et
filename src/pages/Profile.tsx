import { useState, useEffect } from 'react'
import QRCode from 'qrcode'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient, Volunteer, ChangePasswordRequest } from '@/lib/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import ImageUpload from "@/components/ui/image-upload"
import { useToast } from "@/hooks/use-toast"
import { User, Phone, Mail, Calendar, Award, Trophy, Clock, Eye, EyeOff, Save, RefreshCw } from 'lucide-react'
import { formatEthiopianPhoneNumber, removeEthiopianPrefix } from '@/utils/phoneFormatter';

export default function Profile() {
  const { user, updateUser, refreshUser } = useAuth() // Get updateUser and refreshUser methods from context
  const { toast } = useToast()
  const [profile, setProfile] = useState<Volunteer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  })
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  useEffect(() => {
    fetchProfile()
    // Note: We don't need to call refreshUser here as fetchProfile already gets the latest data
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getVolunteerProfile()
      setProfile(response.data)
      setProfileForm({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        phone_number: response.data.phone_number
      })
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      setError(error.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const generateQr = async () => {
      try {
        if (!profile?.volunteer_id) return
        const qrData = `volunteer:${profile.volunteer_id}`
        const url = await QRCode.toDataURL(qrData, {
          width: 200,
          margin: 1,
          color: { dark: '#000000', light: '#FFFFFF' },
        })
        setQrCodeDataUrl(url)
      } catch (e) {
        // ignore QR errors silently on profile
      }
    }
    generateQr()
  }, [profile?.volunteer_id])

  // Format phone number for display
  const displayPhoneNumber = profile?.phone_number 
    ? removeEthiopianPrefix(profile.phone_number) 
    : '';

  // Format phone number in the form
  const formDisplayPhoneNumber = profileForm?.phone_number 
    ? removeEthiopianPrefix(profileForm.phone_number) 
    : '';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Format the phone number as the user types
    const formattedPhone = formatEthiopianPhoneNumber(inputValue);
    setProfileForm({ ...profileForm, phone_number: formattedPhone });
  };

  const validateProfileForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Validate first name - only strings, no numbers
    if (!profileForm.first_name || profileForm.first_name.trim() === '') {
      errors.push('First name is required');
    } else if (!/^[a-zA-Z\s'-]+$/.test(profileForm.first_name.trim())) {
      errors.push('First name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    // Validate last name - only strings, no numbers
    if (!profileForm.last_name || profileForm.last_name.trim() === '') {
      errors.push('Last name is required');
    } else if (!/^[a-zA-Z\s'-]+$/.test(profileForm.last_name.trim())) {
      errors.push('Last name can only contain letters, spaces, hyphens, and apostrophes');
    }
    
    // Validate phone number - must start with +251 and contain only numbers after
    if (!profileForm.phone_number || profileForm.phone_number.trim() === '') {
      errors.push('Phone number is required');
    } else {
      const phoneRegex = /^\+251[0-9]{9}$/;
      if (!phoneRegex.test(profileForm.phone_number.trim())) {
        errors.push('Phone number must be in format +251XXXXXXXXX (9 digits after +251)');
      }
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleProfileUpdate = async () => {
    if (!profile) return;
    
    // Validate form
    const validation = validateProfileForm();
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.errors.join('. '),
        variant: "destructive"
      });
      return;
    }
    
    setSaving(true);
    try {
      // Send the phone number in +251 format to the API
      const updateData = {
        ...profileForm,
        first_name: profileForm.first_name.trim(),
        last_name: profileForm.last_name.trim(),
        phone_number: profileForm.phone_number.trim() // This is already in +251 format
      };
      
      const response = await apiClient.updateVolunteerProfile(updateData);
      setProfile(response.data);
      updateUser(response.data);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      let errorMessage = error.message || "Failed to update profile. Please try again.";
      
      // Extract specific validation errors
      if (error.message && error.message.includes('validation')) {
        errorMessage = error.message;
      } else if (error.message && error.message.includes('phone')) {
        errorMessage = 'Invalid phone number format. Please use +251XXXXXXXXX format.';
      }
      
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }

  const handlePasswordChange = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Password Mismatch",
        description: "New passwords do not match.",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.new_password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      })
      return
    }

    try {
      setSaving(true)
      await apiClient.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      } as ChangePasswordRequest)
      
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      
      toast({
        title: "Password Changed",
        description: "Your password has been successfully changed.",
      })
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: "Password Change Failed",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true)
      console.log('Starting profile image upload...');
      // Use the new endpoint for profile image upload
      const response = await apiClient.uploadProfileImage(file);
      console.log("Profile image upload response:", response);
      
      // Update the profile with the new image URL
      if (profile) {
        const updatedProfile = { ...profile, profile_image: response.data.profile_image }
        setProfile(updatedProfile)
        // Also update the form state to ensure consistency
        setProfileForm({
          ...profileForm,
          // We don't have profile_image in the form state, but we update the profile
        })
        // Update user in context to ensure consistency across the app
        updateUser(updatedProfile)
        
        console.log('Profile image updated in context');
        // Don't refresh immediately after upload to avoid race conditions
        // The refresh will happen when the page is reloaded or when explicitly requested
      }
      
      // Show success message
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated.",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageDelete = async () => {
    try {
      setIsUploadingImage(true)
      // Use the new endpoint for profile image deletion
      await apiClient.deleteProfileImage()
      
      // Update the profile to remove the image URL
      if (profile) {
        const updatedProfile = { ...profile, profile_image: undefined }
        setProfile(updatedProfile)
        // Update user in context to ensure consistency across the app
        updateUser(updatedProfile)
        
        console.log('Profile image removed from context');
        // Don't refresh immediately after delete to avoid race conditions
        // The refresh will happen when the page is reloaded or when explicitly requested
      }
      
      toast({
        title: "Profile Picture Removed",
        description: "Your profile picture has been removed.",
      })
    } catch (error: any) {
      console.error('Error deleting image:', error)
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete image. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsUploadingImage(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Failed to Load Profile</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button 
              onClick={fetchProfile} 
              variant="outline"
              className="border-green-500 text-green-700 hover:bg-green-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      {/* Header */ }
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-sm sm:text-base text-gray-600">Manage your personal information and account settings</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Profile Overview */ }
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <ImageUpload
                  currentImageUrl={profile.profile_image_url}
                  onImageUpload={handleImageUpload}
                  onImageDelete={profile.profile_image ? handleImageDelete : undefined}
                  isUploading={isUploadingImage}
                  className=""
                />
              </div>
              <CardTitle className="text-lg sm:text-xl">
                {profile.first_name} {profile.last_name}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">{profile.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Total Hours</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{profile.total_hours_contributed}h</span>
                  </div>
                </div>
                {qrCodeDataUrl && (
                  <div className="pt-2 border-t">
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 text-center">Your Check-in QR</p>
                    <div className="flex justify-center">
                      <img src={qrCodeDataUrl} alt="Volunteer QR Code" className="w-36 h-36" />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */ }
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */ }
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and contact information
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm sm:text-base">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={profileForm.first_name}
                      onChange={(e) => {
                        // Only allow letters, spaces, hyphens, and apostrophes
                        const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                        setProfileForm({ ...profileForm, first_name: value });
                      }}
                      className="text-sm sm:text-base"
                      placeholder="Enter first name (letters only)"
                    />
                  ) : (
                    <p className="py-2 px-3 bg-gray-50 rounded-md text-sm sm:text-base">{profile.first_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm sm:text-base">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={profileForm.last_name}
                      onChange={(e) => {
                        // Only allow letters, spaces, hyphens, and apostrophes
                        const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, '');
                        setProfileForm({ ...profileForm, last_name: value });
                      }}
                      className="text-sm sm:text-base"
                      placeholder="Enter last name (letters only)"
                    />
                  ) : (
                    <p className="py-2 px-3 bg-gray-50 rounded-md text-sm sm:text-base">{profile.last_name}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm sm:text-base">Email Address</Label>
                <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md flex-wrap">
                  <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                  <span className="text-sm sm:text-base flex-1 min-w-0 break-all">{profile.email}</span>
                  <Badge variant="secondary" className="text-xs sm:text-sm flex-shrink-0">Verified</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251 ..."
                      value={profileForm.phone_number ? removeEthiopianPrefix(profileForm.phone_number) : ''}
                      onChange={handlePhoneChange}
                      className="text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">Please enter your phone number in +251 format</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{displayPhoneNumber}</span>
                  </div>
                )}
              </div>
              
              {isEditing && (
                <div className="flex justify-end pt-2">
                  <Button onClick={handleProfileUpdate} disabled={isSaving} className="text-sm sm:text-base">
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */ }
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your account password for security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 6 characters long</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  placeholder="Confirm new password"
                />
              </div>
              
              <Button 
                onClick={handlePasswordChange} 
                disabled={isSaving || !passwordForm.current_password || !passwordForm.new_password || !passwordForm.confirm_password}
                className="w-full"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </>
                ) : (
                  'Change Password'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}