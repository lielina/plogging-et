import { useState, useEffect } from 'react'
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

  const handleProfileUpdate = async () => {
    try {
      setSaving(true)
      const response = await apiClient.updateVolunteerProfile(profileForm)
      setProfile(response.data)
      // Update user in context to ensure consistency across the app
      updateUser(response.data)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
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
      const response = await apiClient.uploadProfileImage(file)
      console.log('Profile image upload response:', response);
      
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
        
        console.log('Fetching updated profile after image upload...');
        // Refresh the user data from the API to ensure it's properly saved
        try {
          await refreshUser()
          console.log('Profile refreshed after image upload');
        } catch (refreshError) {
          console.error('Error refreshing user data:', refreshError)
          // Even if refresh fails, we still want to show the uploaded image
          // The user data in context has already been updated with the new image
        }
      }
      
      // Show success message
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully updated.",
      })
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
      await apiClient.deleteProfileImage()
      
      // Update the profile to remove the image URL
      if (profile) {
        const updatedProfile = { ...profile, profile_image: undefined }
        setProfile(updatedProfile)
        // Update user in context to ensure consistency across the app
        updateUser(updatedProfile)
        
        // Refresh the user data from the API to ensure it's properly saved
        try {
          await refreshUser()
        } catch (refreshError) {
          console.error('Error refreshing user data after delete:', refreshError)
          // Even if refresh fails, we still want to show the deleted state
          // The user data in context has already been updated without the image
        }
        
        // Also update the local profile state to ensure UI consistency
        setProfile(updatedProfile)
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
                  currentImageUrl={profile.profile_image}
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
                  <span className="text-xs sm:text-sm text-gray-600">Volunteer ID</span>
                  <Badge variant="outline" className="text-xs sm:text-sm">{profile.volunteer_id}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">Total Hours</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-green-600" />
                    <span className="font-semibold">{profile.total_hours_contributed}h</span>
                  </div>
                </div>
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
                      onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                      className="text-sm sm:text-base"
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
                      onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                      className="text-sm sm:text-base"
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
                  <Input
                    id="phone"
                    value={profileForm.phone_number}
                    onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                    className="text-sm sm:text-base"
                  />
                ) : (
                  <div className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-md">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm sm:text-base">{profile.phone_number}</span>
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