// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile, UserRole, DiabetesType } from '../lib/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    diabetesType?: DiabetesType
  ) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  generateInvitationCode: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  
  const fetchProfile = async (userId: string) => {
  try {
    console.log('🔍 Buscando perfil do usuário com ID:', userId)
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()

    if (error) {
      console.error('❌ Erro ao buscar perfil:', error)
      throw error
    }

    if (!data) {
      console.warn('⚠️ Nenhum perfil encontrado para este usuário')
    }

    console.log('✅ Perfil carregado:', data)
    setProfile(data)
  } catch (err) {
    console.error('❌ Exceção ao buscar perfil:', err)
    setProfile(null)
  }
}


  useEffect(() => {
    const init = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) throw error
        const session = data.session

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          setUser(null)
          setProfile(null)
        }
      } catch (e) {
        console.warn('Forçando refresh de sessão...')
        try {
          const { data } = await supabase.auth.refreshSession()
          if (data.session?.user) {
            setUser(data.session.user)
            await fetchProfile(data.session.user.id)
          } else {
            setUser(null)
            setProfile(null)
          }
        } catch (err) {
          console.error('Erro ao forçar refresh:', err)
          setUser(null)
          setProfile(null)
        }
      } finally {
        // 🔧 Garantir que o loading seja finalizado sempre
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          await fetchProfile(currentUser.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Timeout de segurança extra
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn('⏱ Forçando fim do loading (timeout de segurança)')
        setLoading(false)
      }
    }, 8000)
    return () => clearTimeout(timeout)
  }, [loading])

  const signUp = async (email: string, password: string, fullName: string, role: UserRole, diabetesType?: DiabetesType) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      const { error: insertError } = await supabase.from('profiles').insert({
        user_id: data.user.id,
        full_name: fullName,
        role,
        diabetes_type: role === 'patient' ? diabetesType || null : null,
      })
      if (insertError) throw insertError
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const session = data.session
    if (session?.user) {
      setUser(session.user)
      await fetchProfile(session.user.id)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setLoading(false)
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('Usuário não logado')
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
  }

  const generateInvitationCode = async (): Promise<string> => {
    if (!user || !profile) throw new Error('Usuário não logado')
    if (profile.role !== 'patient') throw new Error('Apenas pacientes podem gerar código')
    const code = Math.random().toString(36).substring(2, 10).toUpperCase()
    await updateProfile({ invitation_code: code })
    return code
  }

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    generateInvitationCode,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
