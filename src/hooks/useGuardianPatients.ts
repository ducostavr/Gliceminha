import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/database.types'

export function useGuardianPatients(guardianId?: string) {
  const [patients, setPatients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPatients = async () => {
    if (!guardianId) {
      setPatients([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('guardian_patient_links')
        .select(`
          patient_profile:patient_id (
            user_id,
            full_name,
            role,
            diabetes_type,
            invitation_code,
            created_at,
            updated_at
          )
        `)
        .eq('guardian_id', guardianId)

      if (error) throw error

      // Garante que só pacientes válidos serão incluídos
      const patientProfiles = (data || [])
        .map((link: any) => link.patient_profile)
        .filter(Boolean)

      setPatients(patientProfiles)
    } catch (err: any) {
      console.error('Erro ao buscar pacientes:', err)
      setError(err.message || 'Erro ao buscar pacientes.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (guardianId) {
      fetchPatients()
    } else {
      setPatients([])
      setLoading(false)
    }
  }, [guardianId])

  return {
    patients,
    loading,
    error,
    refetch: fetchPatients,
  }
}
