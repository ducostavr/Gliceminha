import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useGlucoseRecords } from '../../hooks/useGlucoseRecords'
import { TrendingUp } from 'lucide-react'

interface GlucoseChartProps {
  userId?: string
  title?: string
}

export function GlucoseChart({ userId, title = 'Tendência da Glicose' }: GlucoseChartProps) {
  const { records, loading } = useGlucoseRecords(userId)

  const chartData = records
    .slice(0, 30) // Last 30 records
    .reverse()
    .map((record, index) => ({
      index: index + 1,
      glucose: record.glucose_level,
      date: new Date(record.created_at).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      }),
      time: new Date(record.created_at).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }))

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">Sem dados para exibir</p>
          <p className="text-sm">Adicione alguns registros para ver o gráfico</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        <span className="ml-2 text-sm text-gray-500">
          (últimos {Math.min(records.length, 30)} registros)
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              domain={['dataMin - 20', 'dataMax + 20']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: any) => [`${value} mg/dL`, 'Glicose']}
              labelFormatter={(label: string, payload: any) => {
                if (payload && payload[0]) {
                  return `${payload[0].payload.date} às ${payload[0].payload.time}`
                }
                return label
              }}
            />
            <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" strokeWidth={1} />
            <ReferenceLine y={140} stroke="#22c55e" strokeDasharray="5 5" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="glucose"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-red-500 mr-2"></div>
          <span className="text-gray-600">Baixo (&lt;70)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-green-500 mr-2"></div>
          <span className="text-gray-600">Normal (70-140)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-0.5 bg-blue-500 mr-2"></div>
          <span className="text-gray-600">Seus dados</span>
        </div>
      </div>
    </div>
  )
}