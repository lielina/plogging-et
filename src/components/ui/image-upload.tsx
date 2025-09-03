import React, { useRef, useState } from 'react'
import { Button } from './button'
import { useToast } from '@/hooks/use-toast'
import { Camera, Upload, X, User } from 'lucide-react'

interface ImageUploadProps {
  currentImageUrl?: string
  onImageUpload: (file: File) => Promise<void>
  onImageDelete?: () => Promise<void>
  isUploading?: boolean
  className?: string
}

export default function ImageUpload({
  currentImageUrl,
  onImageUpload,
  onImageDelete,
  isUploading = false,
  className = ''
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file (JPG, PNG, GIF, etc.)",
        variant: "destructive"
      })
      return
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive"
      })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    onImageUpload(file)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
  }

  const handleDelete = () => {
    setPreviewUrl(null)
    onImageDelete?.()
  }

  const imageUrl = previewUrl || currentImageUrl

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 
          flex items-center justify-center cursor-pointer transition-all duration-200
          hover:border-green-500 hover:bg-green-50
          ${dragActive ? 'border-green-500 bg-green-50' : ''}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={!isUploading ? handleClick : undefined}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={!isUploading ? handleDrop : undefined}
      >
        {imageUrl ? (
          <div className="relative w-full h-full">
            <img
              src={imageUrl}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
            {!isUploading && onImageDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete()
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
            {!isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-2"></div>
                <span className="text-xs text-gray-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <User className="w-12 h-12 text-gray-400 mb-2" />
                <Upload className="w-4 h-4 text-gray-400 mb-1" />
                <span className="text-xs text-gray-600">Upload Photo</span>
              </div>
            )}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {!imageUrl && (
        <div className="mt-3 text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isUploading}
            className="text-xs"
          >
            <Camera className="w-3 h-3 mr-1" />
            Choose Photo
          </Button>
          <p className="text-xs text-gray-500 mt-1">
            JPG, PNG up to 5MB
          </p>
        </div>
      )}
    </div>
  )
}