import React, { useState } from 'react'
import { LinkPatient } from '../components/guardian/LinkPatient'
import { PatientsList } from '../components/guardian/PatientsList'
import { GlucoseHistory } from '../components/glucose/GlucoseHistory'
import { GlucoseChart } from '../components/glucose/GlucoseChart'
import { ArrowLeft } from 'lucide-react'

export function GuardianDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<any>(null)

  if (selectedPatient && selectedPatient.user_id) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center">
          <button
            onClick={() => setSelectedPatient(null)}
            className="flex items-center text-blue-600 hover:text-blue-700 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Voltar
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dados de {selectedPatient.full_name}
            </h1>
            <p className="text-gray-600">
              Monitoramento de glicemia do paciente
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <GlucoseChart 
              userId={selectedPatient.user_id} 
              title="Tendência da Glicose do Paciente"
            />
          </div>
          <div>
            <GlucoseHistory 
              userId={selectedPatient.user_id}
              title="Histórico do Paciente"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel do Guardião
        </h1>
        <p className="text-gray-600">
          Monitore os dados de glicemia dos seus pacientes
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <LinkPatient />
        </div>

        <div>
          <PatientsList onSelectPatient={setSelectedPatient} />
        </div>
      </div>
    </div>
  )
}
