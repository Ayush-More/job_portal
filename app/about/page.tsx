import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, TrendingUp, Heart } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">About JobPortal Pro</h1>
          <p className="text-xl text-gray-600">
            Revolutionizing recruitment with placement guarantees
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          <p className="text-gray-700 leading-relaxed">
            JobPortal Pro is a revolutionary job portal platform that transforms the recruitment
            landscape by implementing a pay-to-apply model with job placement guarantee. We enable
            companies to access highly motivated, pre-qualified candidates while providing job
            seekers with risk-mitigated applications backed by placement guarantees.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 mb-12">
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                To create a fair and transparent job market where quality candidates connect with
                quality employers, backed by genuine placement guarantees that protect both parties.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>For Job Seekers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Apply with confidence knowing your investment is protected. Our placement guarantee
                ensures you either get hired or get your application fee refunded.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>For Companies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Receive applications only from serious, motivated candidates who have demonstrated
                their commitment through financial investment in their job search.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Transparency, fairness, and quality are at the heart of everything we do. We believe
                in creating value for both job seekers and employers.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">For Job Seekers:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Create your profile and upload your resume</li>
                <li>Browse verified job listings with clear guarantee terms</li>
                <li>Pay the application fee to submit your application</li>
                <li>Track your application status through our platform</li>
                <li>Get hired or receive a refund based on guarantee terms</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">For Companies:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-600">
                <li>Create your company profile</li>
                <li>Post jobs with application fees and guarantee terms</li>
                <li>Receive quality applications from committed candidates</li>
                <li>Review, interview, and hire top talent</li>
                <li>Manage all applications through our dashboard</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

