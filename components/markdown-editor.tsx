"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import ReactMarkdown from "react-markdown"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  return (
    <Tabs defaultValue="write" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>
      <TabsContent value="write" className="mt-4">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-96 font-mono text-sm"
        />
      </TabsContent>
      <TabsContent value="preview" className="mt-4">
        <div className="markdown min-h-96 p-4 bg-slate-50 rounded-lg border border-slate-200 prose prose-sm max-w-none">
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
            }}
          >
            {value}
          </ReactMarkdown>
        </div>
      </TabsContent>
    </Tabs>
  )
}
