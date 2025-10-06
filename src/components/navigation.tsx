"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Leaf, Menu, Home, Calendar, Trophy, User, Settings, Bell, LogOut, FileText } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const { isAdmin } = useAuth()

  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/events", label: "Events", icon: Calendar },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy, adminOnly: true },
    { href: "/certificates", label: "Certificates", icon: FileText },
    { href: "/profile", label: "Profile", icon: User },
  ]

  const isActive = (href: string) => location.pathname === href

  return (
    <header className="border-b border-green-200 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-green-800">Plogging Ethiopia</h1>
              <p className="text-xs text-green-600 hidden sm:block">Environmental Care + Community Wellness</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navigationItems
              .filter(item => !item.adminOnly || isAdmin)
              .map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive(item.href) ? "bg-green-100 text-green-800 font-medium" : "text-green-600 hover:bg-green-50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-600 bg-transparent hover:bg-green-50"
            >
              <Bell className="w-4 h-4 mr-2" />
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 ml-1">3</Badge>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-green-600 text-green-600 bg-transparent hover:bg-green-50"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm" className="border-red-600 text-red-600 bg-transparent hover:bg-red-50">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="sm" className="border-green-600 text-green-600 bg-transparent">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 pb-6 border-b border-green-200">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-green-800">Plogging Ethiopia</h2>
                    <p className="text-sm text-green-600">Welcome, Sarah!</p>
                  </div>
                </div>

                <nav className="flex-1 py-6">
                  <div className="space-y-2">
                    {navigationItems
                      .filter(item => !item.adminOnly || isAdmin)
                      .map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setIsOpen(false)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(item.href)
                              ? "bg-green-100 text-green-800 font-medium"
                              : "text-green-600 hover:bg-green-50"
                          }`}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </Link>
                      ))}
                  </div>
                </nav>

                <div className="border-t border-green-200 pt-6 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-green-600 text-green-600 bg-transparent hover:bg-green-50"
                  >
                    <Bell className="w-4 h-4 mr-3" />
                    Notifications
                    <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 ml-auto">3</Badge>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-green-600 text-green-600 bg-transparent hover:bg-green-50"
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-red-600 text-red-600 bg-transparent hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>)
}

export default Navigation