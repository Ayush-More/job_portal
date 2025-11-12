'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

export default function CategoriesClient() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/categories", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load categories")
      setCategories(data.categories || [])
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      setSubmitting(true)
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to create category")
      setName("")
      setDescription("")
      await load()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const onToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !active }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to update category")
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const onStartEdit = (category: any) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description || "")
    setError(null)
  }

  const onCancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditDescription("")
    setError(null)
  }

  const onSaveEdit = async (id: string) => {
    if (!editName.trim()) {
      setError("Name is required")
      return
    }
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to update category")
      await load()
      onCancelEdit()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm("Delete this category? This cannot be undone.")) return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to delete category")
      await load()
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Add Category</CardTitle>
          <CardDescription>Create a new job category</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sales" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <Button type="submit" disabled={submitting || !name.trim()} className="w-full">
              {submitting ? "Adding..." : "Add Category"}
            </Button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Manage visibility and names</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-600">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-600">No categories yet.</p>
          ) : (
            <div className="space-y-4">
              {categories.map((c) => (
                <div key={c.id} className="p-4 border rounded-lg">
                  {editingId === c.id ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-name-${c.id}`}>Name</Label>
                        <Input
                          id={`edit-name-${c.id}`}
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Category name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`edit-desc-${c.id}`}>Description (optional)</Label>
                        <Input
                          id={`edit-desc-${c.id}`}
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Short description"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onSaveEdit(c.id)}>
                          Save
                        </Button>
                        <Button variant="outline" size="sm" onClick={onCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{c.name}</span>
                          {c.active ? (
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                          )}
                        </div>
                        {c.description && (
                          <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => onToggleActive(c.id, c.active)}>
                          {c.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onStartEdit(c)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(c.id)}>Delete</Button>
                      </div>
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


