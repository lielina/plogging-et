import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react'

interface QRScannerProps {
  onScan: (result: string) => void
  onClose: () => void
  title: string
  description: string
  isOpen: boolean
}

export default function QRScanner({ onScan, onClose, title, description, isOpen }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startScanning()
    } else {
      stopScanning()
    }
  }, [isOpen])

  const startScanning = async () => {
    try {
      setError('')
      setSuccess('')
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err: any) {
      console.error('Camera access error:', err)
      if (err.name === 'NotAllowedError') {
        setError('Camera access denied. Please allow camera permissions and try again.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.')
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser.')
      } else {
        setError('Failed to access camera. Please check permissions and try again.')
      }
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const handleScan = (result: string) => {
    setSuccess('QR Code detected!')
    onScan(result)
    
    // Stop scanning after successful scan
    setTimeout(() => {
      stopScanning()
      onClose()
    }, 1500)
  }

  // Simulate QR code scanning for demo purposes
  // In a real implementation, you would use a library like jsQR or zxing
  const simulateScan = () => {
    // Generate demo QR data based on the title
    let demoQRData = 'volunteer:123'
    if (title.includes('Event QR')) {
      demoQRData = 'event:1' // Default event ID
    }
    handleScan(demoQRData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">{description}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera View */}
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {isScanning ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
            )}
            
            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-2 border-green-500 rounded-lg relative">
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-green-500"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-green-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-green-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-green-500"></div>
                </div>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {error && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </div>
              
              {/* Camera Permission Instructions */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">How to enable camera access:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Click the camera icon in your browser's address bar</li>
                  <li>• Select "Allow" for camera permissions</li>
                  <li>• Refresh the page and try again</li>
                  <li>• Or use the demo button below to test</li>
                </ul>
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <strong>Note:</strong> Camera access requires HTTPS in production. For local development, use localhost.
                </div>
              </div>
              
              {/* Retry Button */}
              <Button 
                onClick={startScanning}
                variant="outline"
                className="w-full"
              >
                <Camera className="h-4 w-4 mr-2" />
                Retry Camera Access
              </Button>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600">{success}</span>
            </div>
          )}

          {/* Demo Button for Testing */}
          <Button 
            onClick={simulateScan}
            className="w-full"
            variant="outline"
          >
            Simulate QR Scan (Demo)
          </Button>

          {/* Instructions */}
          <div className="text-xs text-gray-500 text-center">
            <p>Point your camera at a QR code to scan</p>
            <p>Make sure the QR code is clearly visible</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 