"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, DollarSign, Briefcase, Search, Zap } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")

  useEffect(() => {
    fetchJobs()
  }, [search, location, category])

  async function fetchJobs() {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append("search", search)
    if (location) params.append("location", location)
    if (category) params.append("category", category)

    try {
      const response = await fetch(`/api/jobs?${params.toString()}`)
      const data = await response.json()
      // Ensure data is always an array
      setJobs(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching jobs:", error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--brand-50)] to-white">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[var(--brand-600)] to-[var(--secondary-500)] py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="h-6 w-6 text-white" />
            <span className="text-sm font-semibold text-white/90">Browse Opportunities</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">Browse Jobs</h1>
          <p className="text-lg text-white/90">Find your next great opportunity with placement guarantee protection</p>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search Filters */}
        <Card className="mb-8 border-2 border-[var(--brand-300)]">
          <CardHeader>
            <CardTitle className="text-[var(--heading)]">Search Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="search" className="font-semibold text-[var(--heading)]">Keyword</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" />
                  <Input
                    id="search"
                    placeholder="Job title or keyword"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 border-2 border-[var(--brand-200)] focus:border-[var(--brand-500)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="font-semibold text-[var(--heading)]">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-[var(--muted)]" />
                  <Input
                    id="location"
                    placeholder="City or state"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 border-2 border-[var(--brand-200)] focus:border-[var(--brand-500)]"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="font-semibold text-[var(--heading)]">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Technology"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border-2 border-[var(--brand-200)] focus:border-[var(--brand-500)]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs Grid */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse border-2 border-[var(--brand-200)]">
                <CardHeader>
                  <div className="h-6 bg-gradient-to-r from-[var(--brand-200)] to-[var(--accent-200)] rounded w-3/4" />
                  <div className="h-4 bg-[var(--brand-100)] rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-[var(--brand-100)] rounded" />
                    <div className="h-4 bg-[var(--brand-100)] rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-2 border-[var(--brand-200)]">
            <CardContent className="py-16 text-center">
              <p className="text-lg text-[var(--muted)] mb-2">No jobs found matching your criteria</p>
              <p className="text-sm text-[var(--muted)]">Try adjusting your filters or check back later</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm font-semibold text-[var(--muted)]">Found {jobs.length} job{jobs.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job, idx) => (
                <Card 
                  key={job.id} 
                  className="flex flex-col border-2 border-[var(--brand-200)] hover:border-[var(--brand-400)] transition-all duration-300 hover:shadow-xl hover:shadow-[rgba(168,85,247,0.2)] animate-slide-up"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <CardHeader>
                    <CardTitle className="line-clamp-2 text-[var(--heading)] text-lg">{job.title}</CardTitle>
                    <CardDescription className="line-clamp-1 text-[var(--muted)]">
                      {job.company.companyName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-[var(--muted)] line-clamp-3 mb-4">
                      {job.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-[var(--muted)]">
                        <MapPin className="mr-2 h-4 w-4 text-[var(--brand-600)]" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-sm text-[var(--muted)]">
                        <Briefcase className="mr-2 h-4 w-4 text-[var(--brand-600)]" />
                        {job.category}
                      </div>
                      {job.salaryMin && job.salaryMax && (
                        <div className="flex items-center text-sm text-[var(--muted)]">
                          <DollarSign className="mr-2 h-4 w-4 text-[var(--secondary-600)]" />
                          ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <Badge className="bg-gradient-to-r from-[var(--brand-100)] to-[var(--accent-100)] text-[var(--brand-700)] border border-[var(--brand-300)]">
                        Fee: {formatCurrency(job.applicationFee)}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-[var(--secondary-100)] to-[var(--brand-100)] text-[var(--secondary-700)] border border-[var(--secondary-300)]">
                        Guaranteed
                      </Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/jobs/${job.id}`} className="w-full">
                      <Button className="w-full bg-gradient-to-r from-[var(--brand-600)] to-[var(--secondary-500)] text-white rounded-[var(--radius-md)]">
                        View Details
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

