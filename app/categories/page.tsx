"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { trpc } from "@/lib/trpc"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Edit2, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
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
import { Spinner } from "@/components/ui/spinner"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

type CategoryFormValues = z.infer<typeof categorySchema>

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

export default function CategoriesPage() {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const {
    data: categories,
    isLoading,
    isError,
    error,
  } = trpc.categories.getAll.useQuery()
  console.log("categories", categories);
  const createCategory = trpc.categories.create.useMutation({
    onSuccess: async () => {
      console.log("Category created successfully")
      await utils.categories.getAll.invalidate()

      setOpen(false)
      reset()
      toast({ 
        title: "Success",
        description: "Category created successfully.",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to create category: ${error.message}`,
      })
    },
  })
  const updateCategory = trpc.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate()
      setOpen(false)
      reset()
      toast({
        title: "Success",
        description: "Category updated successfully.",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to update category: ${error.message}`,
      })
    },
  })
  const deleteCategory = trpc.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.getAll.invalidate()
      toast({
        title: "Success",
        description: "Category deleted successfully.",
      })
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to delete category: ${error.message}`,
      })
    },
  })

  const [open, setOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{
    id: number
    name: string
    description?: string | null
  } | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null)
  const [categorySearch, setCategorySearch] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  })

  const onSubmit: SubmitHandler<CategoryFormValues> = (data) => {
    if (editingCategory) {
      updateCategory.mutate({
        id: editingCategory.id,
        name: data.name,
        description: data.description,
      })
    } else {
      createCategory.mutate(data)
    }
  }

  const handleEdit = (category: {
    id: number
    name: string
    description?: string | null
  }) => {
    setEditingCategory(category)
    reset({ name: category.name, description: category.description || "" })
    setOpen(true)
  }

  const handleAddNew = () => {
    setEditingCategory(null)
    reset({ name: "", description: "" })
    setOpen(true)
  }

  const handleDelete = (id: number) => {
    deleteCategory.mutate(id)
  }

  const normalizedSearch = categorySearch.trim().toLowerCase()
  const filteredCategories =
    normalizedSearch.length === 0
      ? categories
      : categories?.filter(
          (category) =>
            category.name.toLowerCase().includes(normalizedSearch) ||
            (category.description ?? "").toLowerCase().includes(normalizedSearch),
        )
    
  console.log("filteredCategories", filteredCategories);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-80" />
            </div>
            <Skeleton className="h-10 w-44" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-2/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5 mt-2" />
                </CardContent>
                <CardFooter className="flex justify-end gap-2 border-t pt-4">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (isError)
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load categories: {error.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )

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
                Category Management
              </h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Organize your posts with categories.
              </p>
            </div>
            <Dialog
              open={open}
              onOpenChange={(isOpen) => {
                setOpen(isOpen)
                if (!isOpen) {
                  setEditingCategory(null)
                  reset()
                }
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Create New Category"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-foreground"
                    >
                      Name
                    </label>
                    <Input id="name" {...register("name")} className="mt-1" />
                    {errors.name && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-foreground"
                    >
                      Description
                    </label>
                    <Input
                      id="description"
                      {...register("description")}
                      className="mt-1"
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={
                        createCategory.isPending || updateCategory.isPending
                      }
                    >
                      {(createCategory.isPending || updateCategory.isPending) && (
                        <Spinner className="mr-2 h-4 w-4" />
                      )}
                      {editingCategory ? "Update Category" : "Create Category"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </motion.div>

          <Input
            type="search"
            placeholder="Search categories by name or description..."
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            className="mb-6"
            data-slot="input"
            data-input="search"
          />

          {filteredCategories && filteredCategories.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              key={filteredCategories.length + "-" + categorySearch}

            >
              {filteredCategories.map((category) => (
                <motion.div variants={itemVariants} key={category.id}>
                  <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-muted-foreground text-sm">
                        {category.description || "No description provided."}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 border-t pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit2 className="w-4 h-4 mr-2" /> Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTargetId(category.id)}
                        disabled={
                          deleteCategory.isPending &&
                          deleteCategory.variables === category.id
                        }
                      >
                        {deleteCategory.isPending &&
                        deleteCategory.variables === category.id ? (
                          <Spinner className="mr-2 h-4 w-4" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16 px-6 bg-card rounded-lg"
            >
              <h3 className="text-xl font-semibold text-foreground">
                No Categories Found
              </h3>
              <p className="mt-2 text-muted-foreground">
                {normalizedSearch
                  ? "No categories match your search."
                  : "Get started by creating your first category."}
              </p>
            </motion.div>
          )}
        </div>
      </div>
      <AlertDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTargetId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTargetId && handleDelete(deleteTargetId)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
