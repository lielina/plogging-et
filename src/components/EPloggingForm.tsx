import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { 
  Upload, 
  Camera, 
  MapPin, 
  Trash2, 
  Clock, 
  Scale,
  Send,
  X
} from 'lucide-react'
import { apiClient, EPloggingSubmission } from '@/lib/api'

interface EPloggingFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EPloggingForm({ onSuccess, onCancel }: EPloggingFormProps) {
  const [formData, setFormData] = useState({
    quote: '',
    location: ''
  })
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Limit quote to 500 characters
    if (name === 'quote' && value.length > 500) {
      return // Don't update if exceeds limit
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please select an image file.",
          variant: "destructive"
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive"
        })
        return
      }

      setImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!image) {
      toast({
        title: "Image Required",
        description: "Please select an image for your ePlogging post.",
        variant: "destructive"
      })
      return
    }

    if (!formData.quote.trim() || !formData.location.trim()) {
      toast({
        title: "Required Fields",
        description: "Please fill in quote and location fields.",
        variant: "destructive"
      })
      return
    }

    // Validate quote length (max 500 characters)
    if (formData.quote.length > 500) {
      toast({
        title: "Quote Too Long",
        description: "Quote must be 500 characters or less. Please shorten your quote.",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const submissionData: EPloggingSubmission = {
        location: formData.location,
        quote: formData.quote,
        image
      }

      await apiClient.createEPloggingPost(submissionData)
      
      toast({
        title: "Post Submitted Successfully!",
        description: "Your ePlogging post has been submitted for review.",
        variant: "success"
      })

      // Reset form
      setFormData({
        quote: '',
        location: ''
      })
      setImage(null)
      setImagePreview('')

      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error('Error submitting ePlogging post:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit your ePlogging post. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-green-700">
          <Camera className="w-5 h-5 text-green-600" />
          Share Your ePlogging Experience
        </CardTitle>
        <CardDescription>
          Share your remote plogging activity with the community. Upload a photo, add an inspirational quote, and specify your location. Your post will be reviewed before being published.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Photo *</Label>
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Click to upload your plogging photo</p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>


          {/* Quote */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="quote">Inspirational Quote *</Label>
              <span className={`text-xs ${formData.quote.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.quote.length}/500
              </span>
            </div>
            <Textarea
              id="quote"
              name="quote"
              value={formData.quote}
              onChange={handleInputChange}
              placeholder="Share an inspiring quote or thought about environmental action"
              rows={2}
              maxLength={500}
              required
              className={formData.quote.length > 500 ? 'border-red-500' : ''}
            />
            {formData.quote.length > 500 && (
              <p className="text-xs text-red-500">Quote exceeds 500 characters. Please shorten it.</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location *
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Where did you plog? (e.g., 'My neighborhood', 'Local park')"
              required
            />
          </div>

        {/* Action Buttons */}
<div className="flex justify-end gap-2 pt-6 border-t mt-6">
  <Button
    type="button"
    variant="outline"
    size="sm"
    onClick={onCancel}
    disabled={isSubmitting}
    className="min-w-[90px]"
  >
    Cancel
  </Button>

  <Button
    type="submit"
    size="sm"
    disabled={isSubmitting}
    className="min-w-[120px]"
  >
    {isSubmitting ? (
      <>
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
        Submitting...
      </>
    ) : (
      <>
        <Send className="w-4 h-4 mr-2" />
        Submit
      </>
    )}
  </Button>
</div>

        </form>
      </CardContent>
    </Card>
  )
}
