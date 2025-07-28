import React from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGuardianPatients } from '../../hooks/useGuardianPatients'
import { Users, User, Eye } from 'lucide-react'

interface PatientsListProps {
  onSelectPatient: (patient: any) => void
}

export function PatientsList({ onSelectPatient }: PatientsListProps) {
  const { user } = useAuth()
  const { patients, loading } = useGuardianPatients(user?.id)

  const getDiabetesTypeLabel = (type?: string | null) => {
    switch (type) {
      case 'type1': return 'Tipo 1'
      case 'type2': return 'Tipo 2'
      case 'prediabetes': return 'Pré-diabetes'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <Users className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Meus Pacientes</h2>
        <span className="ml-2 text-sm text-gray-500">({patients.length})</span>
      </div>

      {patients.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Nenhum paciente vinculado</p>
          <p className="text-sm">Use um código de convite para vincular um paciente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.user_id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <User className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {patient.full_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {patient.diabetes_type && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {getDiabetesTypeLabel(patient.diabetes_type)}
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        Vinculado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPatient(patient)}
                  className="btn-primary flex items-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Dados
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
