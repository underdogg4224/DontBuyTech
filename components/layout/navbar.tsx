"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const categories = [
  { name: "Laptops", href: "/categories/laptops" },
  { name: "Smartphones", href: "/categories/smartphones" },
  { name: "Tablets", href: "/categories/tablets" },
  { name: "Accessories", href: "/categories/accessories" },
  { name: "Gaming", href: "/categories/gaming" },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between px-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-foreground">
              DontBuyTech
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              Home
            </Link>

            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground">
                Categories
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {categories.map((category) => (
                  <DropdownMenuItem key={category.href} asChild>
                    <Link href={category.href}>{category.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/archive"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              Archive
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="md:hidden"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
          aria-expanded={mobileMenuOpen}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="container border-t bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col space-y-3">
            <Link
              href="/"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>

            <div className="space-y-2">
              <div className="text-sm font-medium text-foreground/60">
                Categories
              </div>
              <div className="ml-4 flex flex-col space-y-2">
                {categories.map((category) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    className="text-sm text-foreground/60 transition-colors hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>

            <Link
              href="/archive"
              className="text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Archive
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
