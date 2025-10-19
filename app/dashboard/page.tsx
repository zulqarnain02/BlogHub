"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { Plus, Edit2, Trash2, Eye, EyeOff, Calendar, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Input } from "@/components/ui/input"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function DashboardPage() {
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all")
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [postSearch, setPostSearch] = useState("")
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = trpc.posts.getAll.useQuery()

  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.getAll.invalidate()
      toast({
        title: "Success",
        description: "Post deleted successfully.",
      })

    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete post: ${error.message}`,
      })
    },
  })



  const filteredByStatus = posts?.filter((post) => {
    if (filter === "all") return true
    return post.status === filter
  })
  console.log("filteredByStatus", filteredByStatus)
  console.log("posts", posts)

  const normalizedSearch = postSearch.trim().toLowerCase()

  const finalPosts =
    normalizedSearch.length === 0
      ? filteredByStatus
      : filteredByStatus?.filter(
          (post) =>
            post.title.toLowerCase().includes(normalizedSearch) ||
            (post.excerpt ?? "").toLowerCase().includes(normalizedSearch),
        )

  console.log("finalPosts", finalPosts);


  const handleDelete = (postId: number) => {
    deletePost.mutate(postId)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-80" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24" />
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Skeleton className="h-4 w-1/4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-4xl font-extrabold text-foreground">
                Dashboard
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Manage your blog posts
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/blog/new">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Link>
            </Button>
          </motion.div>

          <Input
            type="search"
            placeholder="Search posts by title or excerpt..."
            value={postSearch}
            onChange={(e) => setPostSearch(e.target.value)}
            className="mb-6"
            data-slot="input" 
            data-input="search"
          />

          <div className="flex flex-wrap gap-2 mb-8">
            {(["all", "draft", "published"] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                onClick={() => setFilter(status)}
                size="sm"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>

          {finalPosts && finalPosts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
              key={`${filter}-${normalizedSearch}`}
            >
              {finalPosts.map((post) => (
                <motion.div variants={itemVariants} key={post.id}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <CardTitle className="text-xl">{post.title}</CardTitle>
                        <Badge
                          variant={
                            post.status === "published" ? "default" : "secondary"
                          }
                          className="w-fit"
                        >
                          {post.status === "published" ? (
                            <Eye className="w-3 h-3 mr-1" />
                          ) : (
                            <EyeOff className="w-3 h-3 mr-1" />
                          )}
                          {post.status.charAt(0).toUpperCase() +
                            post.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        Created on {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between gap-4 border-t pt-4">
                      <div className="flex flex-wrap gap-2">
                        {post.postsToCategories.map((ptc) => (
                          <Badge key={ptc.categoryId} variant="outline">
                            {ptc.category.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="flex-1 sm:flex-grow-0"
                        >
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <ExternalLink className="w-4 h-4 sm:mr-2" />
                            <span className="hidden sm:inline">View</span>
                          </Link>
                        </Button>
                        <Button
                          asChild
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-grow-0 "
                        >
                          <Link href={`/blog/${post.slug}/edit`}>
                            <Edit2 className="w-4 h-4 sm:mr-2" />
                            <span className="">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteTargetId(post.id)}
                          className="flex-1 sm:flex-grow-0"
                          disabled={
                            deletePost.isPending && deletePost.variables === post.id
                          }
                        >
                          {deletePost.isPending &&
                          deletePost.variables === post.id ? (
                            <Spinner className="w-4 h-4 sm:mr-2" />
                          ) : (
                            <Trash2 className="w-4 h-4 sm:mr-2" />
                          )}
                          <span className="">Delete</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <Card className="p-12 text-center">
              <h3 className="text-xl font-semibold text-foreground">
                No posts found
              </h3>
              <p className="mt-2 text-muted-foreground">
                {postSearch
                  ? "No posts match your search criteria."
                  : filter === "all"
                  ? "Get started by creating your first post."
                  : `You have no ${filter} posts.`}
              </p>
              {filter === "all" && !postSearch && (
                <Button asChild className="mt-6">
                  <Link href="/blog/new">Create Post</Link>
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTargetId && handleDelete(deleteTargetId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
