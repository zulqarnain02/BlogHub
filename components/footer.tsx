"use client"
import Link from "next/link"
import { BookOpen, Twitter, Github, Linkedin } from "lucide-react"

const footerLinks = {
  Product: [
    { href: "/blog", label: "Blog" },
    { href: "/categories", label: "Categories" },
    { href: "/dashboard", label: "Dashboard" },
  ],
  Resources: [
    { href: "#", label: "Documentation" },
    { href: "#", label: "Support" },
  ],
  Legal: [
    { href: "#", label: "Privacy" },
    { href: "#", label: "Terms" },
  ],
}

const socialLinks = [
  { href: "#", icon: Twitter },
  { href: "#", icon: Github },
  { href: "#", icon: Linkedin },
]

export function Footer() {
  return (
    <footer className="bg-card border-t text-muted-foreground">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4 flex flex-col items-start text-left">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-foreground text-primary bg-primary/10 rounded-md p-1" />
              <span className="font-serif font-bold text-xl text-foreground">
                BlogHub
              </span>
            </Link>
            <p className="text-sm">
              A timeless platform for sharing your stories.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="text-left">
              <h4 className="font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t pt-8 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 text-sm">
          <p>&copy; 2025 BlogHub. All rights reserved.</p>
          <div className="flex gap-4">
            {socialLinks.map((link, i) => (
              <a
                key={i}
                href={link.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <link.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
