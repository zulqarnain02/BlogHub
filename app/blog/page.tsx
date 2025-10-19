"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { trpc } from "@/lib/trpc"
import { ArrowRight, Calendar, Tag, Plus, X } from "lucide-react"
import { useBlogStore } from "@/lib/store"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"

export default function BlogPage() {
  const { selectedCategories, toggleCategory, setSelectedCategories } =
    useBlogStore()
  const [categorySearch, setCategorySearch] = useState("")
  const [postSearch, setPostSearch] = useState("")
  const {
    data: posts,
    isLoading: postsLoading,
    isError: postsError,
    error: postsErrorMessage,
  } = trpc.posts.getPublished.useQuery()
  const {
    data: categories,
    isLoading: categoriesLoading,
    isError: categoriesError,
    error: categoriesErrorMessage,
  } = trpc.categories.getAll.useQuery()

  const selectedCategoryObjects = categories?.filter((category) =>
    selectedCategories.includes(category.id),
  )

  const filteredPosts =
    selectedCategories.length > 0
      ? posts?.filter((post) =>
          post.postsToCategories.some((ptc) =>
            selectedCategories.includes(ptc.categoryId),
          ),
        )
      : posts

  const filteredCategories = categories?.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase()),
  )

  const searchedPosts = filteredPosts?.filter(
    (post) =>
      post.title.toLowerCase().includes(postSearch.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(postSearch.toLowerCase()),
  )

  const displayedCategories =
    categorySearch.length > 0
      ? filteredCategories
      : filteredCategories?.slice(0, 5)

  // Client-side pagination
  const [page, setPage] = useState(1)
  const pageSize = 6
  const totalPosts = searchedPosts?.length ?? 0
  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize))
  const startIdx = (page - 1) * pageSize
  const paginatedPosts = searchedPosts?.slice(startIdx, startIdx + pageSize)

  useEffect(() => {
    // Reset to first page when filters/search change or total pages shrink
    setPage(1)
  }, [postSearch, selectedCategories.join(","), totalPosts])

  const goTo = (p: number) => setPage(Math.min(Math.max(1, p), totalPages))

  const getPageList = () => {
    const pages: (number | "ellipsis")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
      return pages
    }
    if (page <= 3) return [1, 2, 3, "ellipsis", totalPages]
    if (page >= totalPages - 2)
      return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages]
    return [1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages]
  }


  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {postsLoading ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-10 w-64 mb-2" />
            <Skeleton className="h-6 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-extrabold text-foreground">Blog</h1>
            <p className="text-muted-foreground mt-2 text-lg">Discover stories and insights</p>
          </div>
          <Button asChild>
            <Link href="/blog/new">
              <Plus className="w-4 h-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
        )}
        {selectedCategoryObjects && selectedCategoryObjects.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <h3 className="text-sm md:text-base font-semibold text-muted-foreground">
              Filtered by:
            </h3>
            {selectedCategoryObjects.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="flex items-center gap-1.5 text-sm sm:text-base"
              >
                {category.name}
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    toggleCategory(category.id)
                  }}
                  className="rounded-full transition-colors hover:bg-muted-foreground/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg border p-4 sm:p-6 sticky top-28">
              <h3 className="font-semibold text-foreground mb-4">Categories</h3>
              <Input
                type="text"
                placeholder="Search categories..."
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="mb-4"
              />
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategories([])}
                  className={`w-full text-left px-3 py-2 rounded-lg transition text-sm sm:text-base ${
                    selectedCategories.length === 0
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  All Posts
                </button>
                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : categoriesError ? (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                      {categoriesErrorMessage?.message}
                    </AlertDescription>
                  </Alert>
                ) : (
                  displayedCategories?.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center space-x-3"
                    >
                      <Checkbox
                        id={String(category.id)}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label
                        htmlFor={String(category.id)}
                        className="font-normal text-sm sm:text-base text-muted-foreground hover:text-foreground transition cursor-pointer"
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
            </div>
          </div>

          {/* Posts Grid */}
          <div className="lg:col-span-3">
            <Input
              type="search"
              placeholder="Search posts by title or excerpt..."
              value={postSearch}
              onChange={(e) => setPostSearch(e.target.value)}
              className="mb-6"
              data-slot="input"
              data-input="search"
            />
            {postsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 sm:p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6" />
                  </Card>
                ))}
              </div>
            ) : postsError ? (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {postsErrorMessage?.message}
                </AlertDescription>
              </Alert>
            ) : searchedPosts && searchedPosts.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {paginatedPosts?.map((post) => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="p-4 sm:p-6 hover:shadow-lg transition cursor-pointer h-full group">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition line-clamp-2">
                            {post.title}
                          </h2>
                          <p className="text-muted-foreground mt-2 text-sm sm:text-base line-clamp-2">
                            {post.excerpt}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {post.postsToCategories.map(({ category }) => (
                            <Badge key={category.id} variant="secondary" className="text-xs sm:text-sm">
                              <Tag className="w-3 h-3 mr-1" />
                              {category.name}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center text-xs sm:text-sm text-muted-foreground gap-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(post.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary flex-shrink-0" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                  ))}
                </div>
                {totalPages > 1 && (
                  <Pagination className="pt-2">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious onClick={() => goTo(page - 1)} href="#" />
                      </PaginationItem>
                      {getPageList().map((p, idx) => (
                        <PaginationItem key={idx}>
                          {p === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={p === page}
                              onClick={() => goTo(p as number)}
                            >
                              {p}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext onClick={() => goTo(page + 1)} href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            ) : (
              <Card className="p-8 sm:p-12 text-center">
                <p className="text-muted-foreground text-base sm:text-lg">
                  No posts found.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
