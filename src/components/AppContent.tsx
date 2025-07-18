import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { AuthForm } from './auth/AuthForm'
import { Layout } from './Layout'
import { PatientDashboard } from '../pages/PatientDashboard'
import { GuardianDashboard } from '../pages/GuardianDashboard'
import { LoadingSpinner } from './ui/LoadingSpinner'

export function AppContent() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return <AuthForm />
  }

  return (
    <Layout>
      {profile.role === 'patient' ? <PatientDashboard /> : <GuardianDashboard />}
    </Layout>
  )
}