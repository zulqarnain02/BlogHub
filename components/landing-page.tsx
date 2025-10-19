"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, Users, Zap, BarChart3 } from "lucide-react"

export const HeroSection = () => (
  <section className="py-32 sm:py-40 text-center border-b">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-foreground text-balance">
        Share Your Stories with the World
      </h1>
      <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
        A timeless platform where creators can publish, organize, and grow their
        audience with elegance and ease.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <Button asChild size="lg">
          <Link href="/blog/new">
            Start Writing <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/blog">Explore Posts</Link>
        </Button>
      </div>
    </div>
  </section>
)

const features = [
  {
    icon: BookOpen,
    title: "Timeless Typography",
    description:
      "Beautifully rendered content with a focus on readability.",
  },
  {
    icon: Users,
    title: "Community Focused",
    description: "Connect with readers and fellow authors on your blog.",
  },
  {
    icon: Zap,
    title: "Fast & Focused",
    description:
      "A clean, fast-loading experience that puts your content first.",
  },
  {
    icon: BarChart3,
    title: "Meaningful Analytics",
    description: "Track your posts and understand what resonates with your audience.",
  },
]

export const FeaturesSection = () => (
  <section className="py-20 sm:py-24 border-b">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground">
          Powerful Features
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Everything you need to create, manage, and share your content.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <div key={feature.title} className="text-center">
            <feature.icon className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-foreground mb-2">
              {feature.title}
            </h3>
            <p className="text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export const CtaSection = () => (
  <section className="py-20 sm:py-24">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-card rounded-lg p-10 sm:p-16 text-center border">
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-foreground">
          Ready to Start Writing?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Join our community of writers and share your thoughts with the world
          today.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/blog/new">Create Your First Post</Link>
        </Button>
      </div>
    </div>
  </section>
)
