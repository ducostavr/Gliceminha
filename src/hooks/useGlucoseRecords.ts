import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { GlucoseRecord } from '../lib/database.types'

export function useGlucoseRecords(userId?: string) {
  const [records, setRecords] = useState<GlucoseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRecords = async (targetUserId?: string) => {
    if (!targetUserId && !userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', targetUserId || userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching glucose records:', error)
        throw error
      }
      
      setRecords(data || [])
    } catch (err: any) {
      console.error('Error in fetchRecords:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addRecord = async (record: Omit<GlucoseRecord, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('glucose_records')
        .insert(record)
        .select()
        .single()

      if (error) {
        console.error('Error adding glucose record:', error)
        throw error
      }
      
      setRecords(prev => [data, ...prev])
      return data
    } catch (err: any) {
      console.error('Error in addRecord:', err)
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    if (userId) {
      fetchRecords(userId)
    }
  }, [userId])

  return {
    records,
    loading,
    error,
    addRecord,
    refetch: () => fetchRecords(userId),
  }
}