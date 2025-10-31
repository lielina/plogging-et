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
  const [activeTab, setActiveTab] = useState('gallery')
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const handleFormSuccess = () => {
    setShowForm(false)
    setActiveTab('gallery')
    toast({
      title: "Post Submitted!",
      description: "Your ePlogging post has been submitted for review.",
    })
  }

  const handleFormCancel = () => {
    setShowForm(false)
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">ePlogging</h1>
          <p className="text-gray-600 mb-6">
            Share your remote plogging activities with the community. Please log in to participate.
          </p>
          <Button asChild>
            <a href="/login">Login to Continue</a>
          </Button>
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-posts" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              My Posts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-posts">
            <EPloggingGallery showMyPosts={true} />
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
                Get likes and recognition from the community for your environmental efforts. 
                Your posts help build a culture of environmental responsibility.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
