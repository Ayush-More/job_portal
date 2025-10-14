import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Redirect to role-specific dashboard
  const roleRoute = session.user.role.toLowerCase().replace("_", "-")
  redirect(`/dashboard/${roleRoute}`)
}

