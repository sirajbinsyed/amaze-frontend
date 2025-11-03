"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import type { ReactNode } from "react"
import Image from "next/image"

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  role: string
}

export function DashboardLayout({ children, title, role }: DashboardLayoutProps) {
  const { user, logout } = useAuth()

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <header className="bg-white shadow-sm border-b flex-shrink-0">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 gap-4">
            
            <div className="flex items-center">
              <Image
                src="/amaze logo.png" // Path from the 'public' directory
                alt="Amaze Framing Shop Logo"
                width={150} // Adjust width as needed for your logo's aspect ratio
                height={40}  // Adjust height as needed
                className="object-contain" // Ensures the image scales nicely
              />
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="hidden md:inline text-sm font-medium text-gray-700">{user?.name}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full capitalize">{role}</span>
              </div>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* --- MODIFICATIONS HERE: Changed mb-8 to mb-4 and added text-center --- */}
          {/* <div className="sm-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-600 mt-2">Welcome back, {user?.name}</p>
          </div> */}
          {/* --------------------------------------------------------------------- */}

          {children}
        </main>
      </div>
    </div>
  )
}