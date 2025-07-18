import React from 'react'
import { useGlucoseRecords } from '../../hooks/useGlucoseRecords'
import { Clock, Activity, Syringe, TestTube, FileText } from 'lucide-react'

interface GlucoseHistoryProps {
  userId?: string
  title?: string
}

export function GlucoseHistory({ userId, title = 'Histórico de Registros' }: GlucoseHistoryProps) {
  const { records, loading } = useGlucoseRecords(userId)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getGlucoseStatus = (level: number) => {
    if (level < 70) return { status: 'Baixo', color: 'text-red-600 bg-red-50 border-red-200' }
    if (level <= 140) return { status: 'Normal', color: 'text-green-600 bg-green-50 border-green-200' }
    if (level <= 200) return { status: 'Alto', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    return { status: 'Muito Alto', color: 'text-red-600 bg-red-50 border-red-200' }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <Clock className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className="ml-2 text-sm text-gray-500">({records.length} registros)</span>
      </div>

      {records.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Nenhum registro encontrado</p>
          <p className="text-sm">Os registros de glicose aparecerão aqui</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {records.map((record) => {
            const statusInfo = getGlucoseStatus(record.glucose_level)
            return (
              <div
                key={record.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {record.glucose_level}
                      </div>
                      <div className="text-xs text-gray-500">mg/dL</div>
                      <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                        {statusInfo.status}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(record.created_at)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatTime(record.created_at)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {record.insulin_units && (
                          <div className="flex items-center">
                            <Syringe className="h-4 w-4 mr-1" />
                            <span>{record.insulin_units} unidades</span>
                          </div>
                        )}
                        {record.hba1c && (
                          <div className="flex items-center">
                            <TestTube className="h-4 w-4 mr-1" />
                            <span>HbA1c: {record.hba1c}%</span>
                          </div>
                        )}
                      </div>
                      
                      {record.note && (
                        <div className="mt-2 text-sm text-gray-600 italic">
                          "{record.note}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}