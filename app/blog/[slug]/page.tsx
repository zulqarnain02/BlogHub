"use client"

import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { ArrowLeft, Calendar, Tag, Edit2, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useState } from "react"
import { useBlogStore } from "@/lib/store"
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
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"

export default function PostPage() {
  const params = useParams()
  const router = useRouter()
  const utils = trpc.useUtils()
  const { setSelectedCategories } = useBlogStore()
  const slug = params.slug as string
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { toast } = useToast()

  const {
    data: post,
    isLoading,
    isError,
    error,
  } = trpc.posts.getBySlug.useQuery(slug)
  const deletePost = trpc.posts.delete.useMutation({
    onSuccess: async () => {
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      })
      await utils.posts.getPublished.invalidate()
      await utils.posts.getAll.invalidate()
      router.push("/blog")
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting post",
        description: error.message,
      })
    },
  })

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategories([categoryId])
    router.push("/blog")
  }

  const handleDelete = async () => {
    if (!post) return
    deletePost.mutate(post.id)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12">
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-2 mb-8">
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error.message || "Failed to load the post."}
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button asChild variant="outline">
              <Link href="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Post not found
          </h1>
          <Button asChild variant="outline">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32 pb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground mb-4 text-balance">
              {post.title}
            </h1>
            <div className="flex flex-col items-start sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-10">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/blog/${post.slug}/edit`}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deletePost.isPending}
                >
                  {deletePost.isPending ? (
                    <Spinner className="w-4 h-4 mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {deletePost.isPending ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {post.postsToCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-10">
                {post.postsToCategories.map((ptc) => (
                  <button
                    key={ptc.categoryId}
                    onClick={() => handleCategoryClick(ptc.categoryId)}
                  >
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80 text-sm"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {ptc.category.name}
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            <article className="max-3xl mx-auto markdown prose prose-lg prose-stone dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                  h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-3 mb-2" {...props} />,
                  h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-2 mb-1" {...props} />,
                  p: ({ node, ...props }) => <p className="mb-2" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside mb-2" {...props} />,
                  ol: ({ node, ...props }) => <ol className="list-decimal list-inside mb-2" {...props} />,
                  code: ({ node, className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "")
                    return !match ? (
                      <code className="bg-slate-200 px-1 rounded text-sm" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code
                        className="block bg-slate-900 text-slate-100 p-2 rounded text-xs overflow-x-auto mb-2"
                        {...props}
                      >
                        {children}
                      </code>
                    )
                  },
                }}>{post.content}</ReactMarkdown>
            </article>
          </motion.div>
        </div>
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this
                post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  )
}
