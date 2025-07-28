import React from 'react'
import { GlucoseForm } from '../components/glucose/GlucoseForm'
import { GlucoseHistory } from '../components/glucose/GlucoseHistory'
import { GlucoseChart } from '../components/glucose/GlucoseChart'
import { InvitationCode } from '../components/guardian/InvitationCode'
import { useAuth } from '../contexts/AuthContext'

export function PatientDashboard() {
  const { user } = useAuth()
  if (!user?.id) {
    return null // ou <LoadingScreen />
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Controle de Glicemia
        </h1>
        <p className="text-gray-600">
          Monitore seus níveis de glicose e compartilhe com seus cuidadores
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <GlucoseForm />
          <InvitationCode />
        </div>
        
        <div className="space-y-8">
          <GlucoseChart userId={user?.id} />
          <GlucoseHistory userId={user?.id} />
        </div>
      </div>
    </div>
  )
}