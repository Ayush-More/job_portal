import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDateTime } from "@/lib/utils"

async function getRefunds() {
  // This would normally fetch from API, but for SSR we'll use Prisma directly
  const { prisma } = await import("@/lib/prisma")
  
  return await prisma.refund.findMany({
    include: {
      payment: {
        include: {
          application: {
            include: {
              job: {
                include: {
                  company: true,
                },
              },
              jobSeeker: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { requestedAt: "desc" },
  })
}

export default async function RefundsPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const refunds = await getRefunds()

  const statusColors = {
    NOT_REQUESTED: "secondary",
    REQUESTED: "default",
    UNDER_REVIEW: "default",
    APPROVED: "success",
    REJECTED: "destructive",
    PROCESSED: "success",
  } as const

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Refund Management</h1>
        <p className="text-gray-600">Review and process refund requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>
            Manage guarantee-based refund claims from job seekers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {refunds.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No refund requests</p>
          ) : (
            <div className="space-y-4">
              {refunds.map((refund) => (
                <div
                  key={refund.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold">
                        {refund.payment.application.jobSeeker.user.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {refund.payment.application.job.title} at{" "}
                        {refund.payment.application.job.company.companyName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Requested {formatDateTime(refund.requestedAt)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={statusColors[refund.status]}>
                        {refund.status.replace("_", " ")}
                      </Badge>
                      <span className="text-lg font-semibold">
                        {formatCurrency(refund.amount)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700">Reason:</p>
                    <p className="text-sm text-gray-600 mt-1">{refund.reason}</p>
                  </div>

                  {refund.adminNotes && (
                    <div className="mb-3 bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-900">Admin Notes:</p>
                      <p className="text-sm text-blue-700 mt-1">{refund.adminNotes}</p>
                    </div>
                  )}

                  {refund.status === "REQUESTED" && (
                    <div className="flex gap-2 mt-3">
                      <form action={`/api/admin/refunds/${refund.id}`} method="POST">
                        <input type="hidden" name="status" value="APPROVED" />
                        <Button type="submit" size="sm" variant="default">
                          Approve
                        </Button>
                      </form>
                      <form action={`/api/admin/refunds/${refund.id}`} method="POST">
                        <input type="hidden" name="status" value="REJECTED" />
                        <Button type="submit" size="sm" variant="destructive">
                          Reject
                        </Button>
                      </form>
                    </div>
                  )}

                  {refund.status === "APPROVED" && (
                    <div className="mt-3">
                      <form action={`/api/admin/refunds/${refund.id}`} method="POST">
                        <input type="hidden" name="status" value="PROCESSED" />
                        <Button type="submit" size="sm" variant="default">
                          Mark as Processed
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

