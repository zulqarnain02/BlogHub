"use client"
import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X, BookOpen } from "lucide-react"


const navLinks = [
  { href: "/blog", label: "Blog" },
  { href: "/categories", label: "Categories" },
  { href: "/dashboard", label: "Dashboard" },
]

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        scrolled ? "shadow-md bg-card/90 backdrop-blur-sm" : "bg-card"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 border-b">
          <Link href="/" className="text-3xl font-serif font-bold text-foreground flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-foreground text-primary bg-primary/10 rounded-md p-1" />
            BlogHub
          </Link>

          <div className="hidden sm:flex items-center space-x-8">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    active
                      ? "text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          <div className="sm:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="sm:hidden bg-card shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-2">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "block px-3 py-2 rounded-md text-base font-medium transition-colors " +
                    (active ? "bg-secondary text-foreground" : "text-foreground hover:bg-secondary")
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </nav>
  )
}
