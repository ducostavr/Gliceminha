import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Heart, LogOut, User } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, profile, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getRoleLabel = (role: string) => {
    return role === 'patient' ? 'Paciente' : 'Guardião'
  }

  const getDiabetesTypeLabel = (type: string) => {
    switch (type) {
      case 'type1': return 'Tipo 1'
      case 'type2': return 'Tipo 2'
      case 'prediabetes': return 'Pré-diabetes'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Gliceminha</h1>
              {profile && (
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {getRoleLabel(profile.role)}
                  </span>
                  {profile.role === 'patient' && profile.diabetes_type && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {getDiabetesTypeLabel(profile.diabetes_type)}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {user && profile && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <User className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">{profile.full_name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}