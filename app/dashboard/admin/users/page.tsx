import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDateTime } from "@/lib/utils"
import { Mail, UserCheck, Building, User } from "lucide-react"

async function getUsers() {
  const { prisma } = await import("@/lib/prisma")
  
  return await prisma.user.findMany({
    include: {
      company: true,
      jobSeeker: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function UsersPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const users = await getUsers()

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "COMPANY":
        return <Building className="h-4 w-4" />
      case "JOB_SEEKER":
        return <User className="h-4 w-4" />
      case "ADMIN":
        return <UserCheck className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "COMPANY":
        return "bg-blue-100 text-blue-800"
      case "JOB_SEEKER":
        return "bg-green-100 text-green-800"
      case "ADMIN":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-[var(--brand-600)] font-bold">User Management</h1>
        <p className="text-gray-600">Manage all platform users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Total {users.length} users registered on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRoleIcon(user.role)}
                    <div>
                      <h3 className="font-medium">{user.name || "No Name"}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Mail className="h-3 w-3" />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getRoleColor(user.role)}>
                    {user.role}
                  </Badge>
                  {user.emailVerified && (
                    <Badge variant="outline" className="text-green-600">
                      Verified
                    </Badge>
                  )}
                  {!user.emailVerified && (
                    <Badge variant="outline" className="text-yellow-600">
                      Unverified
                    </Badge>
                  )}
                </div>
                <div className="text-right text-sm text-gray-500">
                  <div>Joined: {formatDateTime(user.createdAt)}</div>
                  {user.role === "COMPANY" && user.company && (
                    <div>Company: {user.company.companyName}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
