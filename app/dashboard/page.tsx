import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Redirect to role-specific dashboard
  const roleRoute = session.user.role.toLowerCase().replace("_", "-")
  redirect(`/dashboard/${roleRoute}`)
}

