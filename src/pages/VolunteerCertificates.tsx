import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from 'lucide-react'

export default function VolunteerCertificates() {
  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-green-700" />
            Your Certificates
          </CardTitle>
          <CardDescription>
            View and download your earned certificates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No certificates available yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              Participate in events and achieve milestones to earn certificates!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
