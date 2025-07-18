import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/database.types'

export function useGuardianPatients(guardianId: string) {
  const [patients, setPatients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('guardian_patient_links')
        .select(`
          patient_id,
          profiles!guardian_patient_links_patient_id_fkey (*)
        `)
        .eq('guardian_id', guardianId)

      if (error) throw error

      const patientProfiles = data?.map(link => (link as any).profiles).filter(Boolean) || []
      setPatients(patientProfiles)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const linkPatient = async (invitationCode: string) => {
    try {
      // Find patient by invitation code
      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('invitation_code', invitationCode)
        .eq('role', 'patient')
        .single()

      if (patientError || !patientData) {
        throw new Error('Código de convite inválido ou expirado')
      }

      // Check if link already exists
      const { data: existingLink } = await supabase
        .from('guardian_patient_links')
        .select('*')
        .eq('guardian_id', guardianId)
        .eq('patient_id', patientData.user_id)
        .single()

      if (existingLink) {
        throw new Error('Você já está vinculado a este paciente')
      }

      // Create the link
      const { error: linkError } = await supabase
        .from('guardian_patient_links')
        .insert({
          guardian_id: guardianId,
          patient_id: patientData.user_id,
        })

      if (linkError) throw linkError

      // Refresh patients list
      await fetchPatients()
      return patientData
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    if (guardianId) {
      fetchPatients()
    }
  }, [guardianId])

  return {
    patients,
    loading,
    error,
    linkPatient,
    refetch: fetchPatients,
  }
}