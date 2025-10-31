import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import CategoriesClient from "@/components/admin/CategoriesClient"

export default async function CategoriesPage() {
  const session = await auth()
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl text-[var(--brand-600)] font-bold">Job Categories</h1>
        <p className="text-gray-600">Create and manage categories used by jobs</p>
      </div>
      <CategoriesClient />
    </div>
  )
}


