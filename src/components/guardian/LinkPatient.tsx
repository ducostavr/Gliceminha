import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useGuardianPatients } from '../../hooks/useGuardianPatients'
import { UserPlus, Link } from 'lucide-react'

export function LinkPatient() {
  const [invitationCode, setInvitationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { user } = useAuth()
  const { linkPatient } = useGuardianPatients(user?.id || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const patient = await linkPatient(invitationCode.toUpperCase())
      setSuccess(`Paciente ${patient.full_name} vinculado com sucesso!`)
      setInvitationCode('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Vincular Paciente</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
            {success}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Convite
          </label>
          <input
            type="text"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
            className="input-field font-mono text-lg tracking-wider"
            placeholder="Ex: ABC12345"
            maxLength={8}
            required
          />
          <p className="mt-2 text-sm text-gray-500">
            Digite o código de 8 caracteres fornecido pelo paciente
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || invitationCode.length !== 8}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            'Vinculando...'
          ) : (
            <>
              <Link className="h-5 w-5 mr-2" />
              Vincular Paciente
            </>
          )}
        </button>
      </form>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Como funciona:</strong> Peça ao paciente para gerar um código de convite 
          na seção "Compartilhar Dados\" e digite-o aqui para ter acesso aos dados dele.
        </p>
      </div>
    </div>
  )
}