import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  Camera, 
  Eye, 
  Plus, 
  Users, 
  Leaf, 
  TrendingUp,
  Award,
  Globe
} from 'lucide-react'
import EPloggingForm from '@/components/EPloggingForm'
import EPloggingGallery from '@/components/EPloggingGallery'

export default function EPlogging() {
  const { isAuthenticated, user } = useAuth()
  const [activeTab, setActiveTab] = useState('my-posts')
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const { toast } = useToast()

  const handleFormSuccess = () => {
    setShowForm(false)
    setActiveTab('my-posts')
    setRefreshKey(prev => prev + 1) // Force refresh of gallery
    toast({
      title: "Post Submitted Successfully!",
      description: "Your ePlogging post has been submitted for review.",
    })
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  // Show public gallery for unauthenticated users
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Camera className="w-8 h-8 text-green-600" />
                ePlogging
              </h1>
              <p className="text-gray-600">
                Explore community plogging activities from around the world. Log in to share your own experience.
              </p>
            </div>
          </div>
        </div>

        {/* Public Gallery */}
        <EPloggingGallery isPublic={true} />

        {/* Information Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                What is ePlogging?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                ePlogging allows you to participate in environmental cleanup activities from anywhere. 
                Simply share a photo, inspirational quote, and location to inspire others to take action.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 text-sm">
                Every ePlogging post contributes to our global environmental mission. 
                Track your impact and see how your actions inspire others worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Community Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 text-sm">
                Get recognition from the community for your environmental efforts. 
                Your posts help build a culture of environmental responsibility.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
              <Camera className="w-8 h-8 text-green-600" />
              ePlogging
            </h1>
            <p className="text-gray-600">
              Share your remote plogging activities with just a photo, quote, and location to inspire others
            </p>
          </div>
          
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Share Your ePlogging
            </Button>
          )}
        </div>
      </div>

      {/* ePlogging Form */}
      {showForm && (
        <div className="mb-8">
          <EPloggingForm 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      )}

      {/* Main Content */}
      {!showForm && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsContent value="my-posts">
            <EPloggingGallery key={refreshKey} showMyPosts={true} />
          </TabsContent>
        </Tabs>
      )}

      {/* Information Cards */}
      {!showForm && (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Leaf className="w-5 h-5" />
                What is ePlogging?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 text-sm">
                ePlogging allows you to participate in environmental cleanup activities from anywhere. 
                Simply share a photo, inspirational quote, and location to inspire others to take action.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Global Impact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-700 text-sm">
                Every ePlogging post contributes to our global environmental mission. 
                Track your impact and see how your actions inspire others worldwide.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-purple-800 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Community Recognition
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 text-sm">
                Get recognition from the community for your environmental efforts. 
                Your posts help build a culture of environmental responsibility.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
