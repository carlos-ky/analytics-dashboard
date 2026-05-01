import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/articles', label: 'Articles', icon: '📝' },
    { path: '/projects', label: 'Projets', icon: '💼' },
    { path: '/messages', label: 'Messages', icon: '✉️' },
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 md:p-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">
            <span className="md:hidden">A</span>
            <span className="hidden md:inline">Analytics</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1 hidden md:block">Dashboard</p>
        </div>

        <nav className="flex-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md mb-1 transition ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t">
          <p className="text-sm text-gray-600 truncate mb-2 hidden md:block">{user?.email}</p>
          <button onClick={signOut}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition text-sm">
            <span className="md:hidden">↩</span>
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  )
}