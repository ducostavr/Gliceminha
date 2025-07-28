import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { Send } from 'lucide-react'

export function LinkPatient() {
  const { user, profile } = useAuth()
  const [invitationCode, setInvitationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  if (!user || !profile) {
    return (
      <div className="card text-center text-gray-500">
        Aguardando dados do usuário...
      </div>
    )
  }

  const handleLink = async () => {
    setLoading(true)
    setSuccess(false)
    setError('')

    try {
      // 🔎 Busca o paciente pelo código de convite
      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('invitation_code', invitationCode)
        .eq('role', 'patient')
        .single()

      if (patientError || !patientData) {
        throw new Error('Código de convite inválido ou paciente não encontrado')
      }

      // 🚫 Evita duplicidade de vínculo
      const { data: existingLink, error: linkCheckError } = await supabase
        .from('guardian_patient_links')
        .select('*')
        .eq('guardian_id', user.id)
        .eq('patient_id', patientData.user_id)
        .maybeSingle()

      if (existingLink) {
        throw new Error('Você já está vinculado a este paciente')
      }

      // ✅ Cria o vínculo
      const { error: linkError } = await supabase
        .from('guardian_patient_links')
        .insert({
          guardian_id: user.id,
          patient_id: patientData.user_id,
        })

      if (linkError) {
        throw new Error('Erro ao vincular paciente')
      }

      setSuccess(true)
      setInvitationCode('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center">
        <Send className="h-6 w-6 text-blue-600 mr-2" />
        Vincular Paciente
      </h2>
      <input
        type="text"
        placeholder="Código de convite do paciente"
        value={invitationCode}
        onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
        className="input"
        disabled={loading}
      />
      <button onClick={handleLink} className="btn-primary w-full" disabled={loading}>
        {loading ? 'Vinculando...' : 'Vincular'}
      </button>
      {success && <p className="text-green-600 text-sm">Paciente vinculado com sucesso!</p>}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  )
}
