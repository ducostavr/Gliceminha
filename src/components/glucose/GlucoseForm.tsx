// ✅ GlucoseForm.tsx CORRIGIDO
import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGlucoseRecords } from '../../hooks/useGlucoseRecords'
import { Plus, Activity, Syringe, TestTube } from 'lucide-react'

// OPÇÕES DE REFEIÇÃO DEFINIDAS
const mealOptions = [
  'Café da Manhã',
  'Colação',
  'Almoço',
  'Lanche',
  'Jantar',
  'Ceia',
  'Outros'
];

export function GlucoseForm() {
  const [glucoseLevel, setGlucoseLevel] = useState('')
  const [insulinUnits, setInsulinUnits] = useState('')
  const [hba1c, setHba1c] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const { user } = useAuth()
  const { addRecord } = useGlucoseRecords(user?.id)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess(false)

    const glucose = parseFloat(glucoseLevel)
    const insulin = insulinUnits ? parseFloat(insulinUnits) : null
    const hba1cValue = hba1c ? parseFloat(hba1c) : null

    // Validation
    if (isNaN(glucose) || glucose < 40 || glucose > 600) {
      setError('O nível de glicose deve estar entre 40 e 600 mg/dL')
      setLoading(false)
      return
    }

    if (insulin !== null && (isNaN(insulin) || insulin < 0)) {
      setError('As unidades de insulina devem ser um número positivo')
      setLoading(false)
      return
    }

    if (hba1cValue !== null && (isNaN(hba1cValue) || hba1cValue < 0 || hba1cValue > 20)) {
      setError('A HbA1c deve estar entre 0 e 20%')
      setLoading(false)
      return
    }

    try {
      await addRecord({
        user_id: user.id,
        glucose_level: glucose,
        insulin_units: insulin,
        hba1c: hba1cValue,
        note: note.trim() || null,
      })

      // Reset form
      setGlucoseLevel('')
      setInsulinUnits('')
      setHba1c('')
      setNote('')
      setSuccess(true)
      
      setTimeout(() => setSuccess(false), 3000)
    // ✅ LINHA CORRIGIDA
    } catch (err: any) { setError(err.message || 'Erro ao salvar registro'); }
    finally {
      setLoading(false)
    }
  }

  const getGlucoseStatus = (level: number) => {
    if (level < 70) return { status: 'Baixo', color: 'text-red-600 bg-red-50 border-red-200' }
    if (level <= 140) return { status: 'Normal', color: 'text-green-600 bg-green-50 border-green-200' }
    if (level <= 200) return { status: 'Alto', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    return { status: 'Muito Alto', color: 'text-red-600 bg-red-50 border-red-200' }
  }

  const currentLevel = parseFloat(glucoseLevel)
  const statusInfo = !isNaN(currentLevel) ? getGlucoseStatus(currentLevel) : null

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <Plus className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Novo Registro</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            Registro salvo com sucesso!
          </div>
        )}

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Activity className="h-4 w-4 mr-1" />
            Nível de Glicose (mg/dL) *
          </label>
          <input
            type="number"
            min="40"
            max="600"
            step="1"
            value={glucoseLevel}
            onChange={(e) => setGlucoseLevel(e.target.value)}
            className="input-field"
            placeholder="Ex: 120"
            required
          />
          {statusInfo && (
            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block border ${statusInfo.color}`}>
              {statusInfo.status}
            </div>
          )}
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Syringe className="h-4 w-4 mr-1" />
            Unidades de Insulina (opcional)
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={insulinUnits}
            onChange={(e) => setInsulinUnits(e.target.value)}
            className="input-field"
            placeholder="Ex: 10"
          />
        </div>

        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <TestTube className="h-4 w-4 mr-1" />
            HbA1c (%) (opcional)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            step="0.1"
            value={hba1c}
            onChange={(e) => setHba1c(e.target.value)}
            className="input-field"
            placeholder="Ex: 7.2"
          />
        </div>

        {/* SEÇÃO DE OBSERVAÇÃO ATUALIZADA */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observação (opcional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="input-field"
            placeholder="Selecione ou digite (ex: após exercício)"
            maxLength={200}
            list="meal-options" // Conecta este input ao datalist
          />
          {/* Adiciona la lista de sugestões */}
          <datalist id="meal-options">
            {mealOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : 'Salvar Registro'}
        </button>
      </form>
    </div>
  )
}