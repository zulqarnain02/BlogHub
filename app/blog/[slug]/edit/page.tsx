"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { MarkdownEditor } from "@/components/markdown-editor"
import { trpc } from "@/lib/trpc"
import { ArrowLeft, Loader2, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

export default function EditPostPage() {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const utils = trpc.useUtils()
  const slug = params.slug as string

  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [categorySearch, setCategorySearch] = useState("")

  const {
    data: post,
    isLoading: postLoading,
    isError: postError,
    error: postErrorMessage,
  } = trpc.posts.getBySlug.useQuery(slug)
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorMessage,
  } = trpc.categories.getAll.useQuery()
  const updatePost = trpc.posts.update.useMutation({
    onSuccess: async (updatedPost) => {
      toast({
        title: "Success",
        description: "Post updated successfully.",
      })
      await utils.posts.getPublished.invalidate()
      await utils.posts.getAll.invalidate()
      await utils.posts.getBySlug.invalidate(slug)
      router.push(`/blog/${updatedPost.slug}`)
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update post",
        description: error.message,
      })
    },
  })

  useEffect(() => {
    if (post) {
      setTitle(post.title)
      setExcerpt(post.excerpt || "")
      setContent(post.content || "")
      setStatus(post.status as "draft" | "published")
      setSelectedCategories(post.postsToCategories.map((ptc) => ptc.categoryId))
    }
  }, [post])

  const selectedCategoryObjects = categories?.filter((category) =>
    selectedCategories.includes(category.id),
  )

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()),
  )

  const displayedCategories =
    categorySearch.length > 0
      ? filteredCategories
      : filteredCategories?.slice(0, 5)

  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || !excerpt.trim() || !post) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill in all required fields.",
      })
      return
    }

    updatePost.mutate({
      id: post.id,
      title,
      content,
      excerpt,
      status,
      categories: selectedCategories,
    })
  }

  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-12 w-96 mb-12" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-96 w-full" />
            </div>
            <div className="lg:col-span-1 space-y-8">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (postError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <Alert variant="destructive">
            <AlertTitle>Error loading post</AlertTitle>
            <AlertDescription>
              {postErrorMessage?.message || "Something went wrong."}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <h1 className="text-4xl font-extrabold text-foreground">Edit Post</h1>
        </motion.div>

        <form onSubmit={handleSubmit} className="mt-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="lg:col-span-2 space-y-8"
            >
              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <Label
                    htmlFor="title"
                    className="text-lg font-semibold mb-2 block"
                  >
                    Post Title
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter your post title"
                    className="text-lg"
                    required
                  />
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <Label
                    htmlFor="excerpt"
                    className="text-lg font-semibold mb-2 block"
                  >
                    Excerpt
                  </Label>
                  <Input
                    id="excerpt"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief summary of your post"
                    required
                  />
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card className="p-6">
                  <Label className="text-lg font-semibold mb-4 block">
                    Content (Markdown)
                  </Label>
                  <MarkdownEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Write your post content here..."
                  />
                </Card>
              </motion.div>
            </motion.div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="sticky top-24 space-y-8"
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Categories</h3>
                  {selectedCategoryObjects &&
                    selectedCategoryObjects.length > 0 && (
                      <div className="mb-4 flex flex-wrap gap-2">
                        {selectedCategoryObjects.map((category) => (
                          <Badge
                            key={category.id}
                            variant="secondary"
                            className="flex items-center gap-1.5"
                          >
                            {category.name}
                            <button
                              type="button"
                              onClick={() => handleCategoryToggle(category.id)}
                              className="rounded-full transition-colors hover:bg-muted-foreground/20"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  <Input
                    type="search"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="mb-4"
                  />
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {categoriesLoading ? (
                      [...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <Skeleton className="w-4 h-4" />
                          <Skeleton className="w-3/4 h-4" />
                        </div>
                      ))
                    ) : categoriesError ? (
                      <Alert variant="destructive" className="text-xs">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          {categoriesErrorMessage?.message}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      displayedCategories?.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-center gap-3"
                        >
                          <Checkbox
                            id={category.id.toString()}
                            checked={selectedCategories.includes(category.id)}
                            onCheckedChange={() =>
                              handleCategoryToggle(category.id)
                            }
                          />
                          <Label
                            htmlFor={category.id.toString()}
                            className="font-normal cursor-pointer"
                          >
                            {category.name}
                          </Label>
                        </div>
                      ))
                    )}
                    {filteredCategories &&
                      filteredCategories.length > 5 &&
                      !categorySearch && (
                        <p className="text-xs text-muted-foreground pt-2">
                          Search to see more categories.
                        </p>
                      )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Status</h3>
                  <div className="space-y-3">
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        status === "draft"
                          ? "bg-primary/10 border-primary border"
                          : "bg-card"
                      }`}
                      onClick={() => setStatus("draft")}
                    >
                      <Label
                        htmlFor="draft"
                        className="font-semibold cursor-pointer"
                      >
                        Draft
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Not visible to readers.
                      </p>
                    </div>
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition ${
                        status === "published"
                          ? "bg-primary/10 border-primary border"
                          : "bg-card"
                      }`}
                      onClick={() => setStatus("published")}
                    >
                      <Label
                        htmlFor="published"
                        className="font-semibold cursor-pointer"
                      >
                        Published
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Visible to all.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 text-center">
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={updatePost.isPending}
                    size="lg"
                  >
                    {updatePost.isPending && (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    )}
                    {updatePost.isPending ? "Updating..." : "Update Post"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full mt-2"
                    asChild
                  >
                    <Link href={`/blog/${slug}`}>Cancel</Link>
                  </Button>
                </Card>
              </motion.div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
