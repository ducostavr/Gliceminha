import React, { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import { 
  Heart, 
  User as UserIcon, 
  Shield, 
  Eye, 
  EyeOff, 
  Plus, 
  Activity, 
  Syringe, 
  TestTube,
  Clock,
  TrendingUp,
  Share2,
  Copy,
  RefreshCw,
  UserPlus,
  Link,
  Users,
  ArrowLeft,
  LogOut,
  FileText
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// Types
type UserRole = 'patient' | 'guardian'
type DiabetesType = 'type1' | 'type2' | 'prediabetes'

interface Profile {
  id: string
  user_id: string
  role: UserRole
  diabetes_type: DiabetesType | null
  full_name: string
  invitation_code: string | null
  created_at: string
  updated_at: string
}

interface GlucoseRecord {
  id: string
  user_id: string
  glucose_level: number
  insulin_units: number | null
  hba1c: number | null
  note: string | null
  created_at: string
}

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  
  // Form states
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('patient')
  const [diabetesType, setDiabetesType] = useState<DiabetesType>('type2')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [error, setError] = useState('')

  // App states
  const [glucoseRecords, setGlucoseRecords] = useState<GlucoseRecord[]>([])
  const [patients, setPatients] = useState<Profile[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Profile | null>(null)

  // Form states for glucose
  const [glucoseLevel, setGlucoseLevel] = useState('')
  const [insulinUnits, setInsulinUnits] = useState('')
  const [hba1c, setHba1c] = useState('')
  const [note, setNote] = useState('')
  const [glucoseLoading, setGlucoseLoading] = useState(false)
  const [glucoseError, setGlucoseError] = useState('')
  const [glucoseSuccess, setGlucoseSuccess] = useState(false)

  // Invitation code states
  const [invitationCode, setInvitationCode] = useState<string | null>(null)
  const [codeLoading, setCodeLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [linkCode, setLinkCode] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && profile) {
      fetchGlucoseRecords()
      if (profile.role === 'guardian') {
        fetchPatients()
      }
    }
  }, [user, profile])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      
      setProfile(data || null)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchGlucoseRecords = async (targetUserId?: string) => {
    if (!user && !targetUserId) return

    try {
      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', targetUserId || user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGlucoseRecords(data || [])
    } catch (error) {
      console.error('Error fetching glucose records:', error)
    }
  }

  const fetchPatients = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('guardian_patient_links')
        .select(`
          patient_id,
          profiles!guardian_patient_links_patient_id_fkey (*)
        `)
        .eq('guardian_id', user.id)

      if (error) throw error

      const patientProfiles = data?.map(link => (link as any).profiles).filter(Boolean) || []
      setPatients(patientProfiles)
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            role,
            full_name: fullName,
            diabetes_type: role === 'patient' ? diabetesType : null,
          })
        if (profileError) throw profileError
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  const handleGlucoseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setGlucoseLoading(true)
    setGlucoseError('')
    setGlucoseSuccess(false)

    const glucose = parseFloat(glucoseLevel)
    const insulin = insulinUnits ? parseFloat(insulinUnits) : null
    const hba1cValue = hba1c ? parseFloat(hba1c) : null

    if (isNaN(glucose) || glucose < 40 || glucose > 600) {
      setGlucoseError('O nível de glicose deve estar entre 40 e 600 mg/dL')
      setGlucoseLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('glucose_records')
        .insert({
          user_id: user.id,
          glucose_level: glucose,
          insulin_units: insulin,
          hba1c: hba1cValue,
          note: note.trim() || null,
        })

      if (error) throw error

      setGlucoseLevel('')
      setInsulinUnits('')
      setHba1c('')
      setNote('')
      setGlucoseSuccess(true)
      fetchGlucoseRecords()
      
      setTimeout(() => setGlucoseSuccess(false), 3000)
    } catch (err: any) {
      setGlucoseError(err.message || 'Erro ao salvar registro')
    } finally {
      setGlucoseLoading(false)
    }
  }

  const generateInvitationCode = async () => {
    if (!user || !profile || profile.role !== 'patient') return

    setCodeLoading(true)
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const { error } = await supabase
        .from('profiles')
        .update({ invitation_code: code })
        .eq('user_id', user.id)

      if (error) throw error
      
      setInvitationCode(code)
      setProfile({ ...profile, invitation_code: code })
    } catch (error) {
      console.error('Error generating code:', error)
    } finally {
      setCodeLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (invitationCode) {
      try {
        await navigator.clipboard.writeText(invitationCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  const handleLinkPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLinkLoading(true)
    setLinkError('')
    setLinkSuccess('')

    try {
      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('invitation_code', linkCode.toUpperCase())
        .eq('role', 'patient')
        .single()

      if (patientError || !patientData) {
        throw new Error('Código de convite inválido ou expirado')
      }

      const { data: existingLink } = await supabase
        .from('guardian_patient_links')
        .select('*')
        .eq('guardian_id', user.id)
        .eq('patient_id', patientData.user_id)
        .single()

      if (existingLink) {
        throw new Error('Você já está vinculado a este paciente')
      }

      const { error: linkError } = await supabase
        .from('guardian_patient_links')
        .insert({
          guardian_id: user.id,
          patient_id: patientData.user_id,
        })

      if (linkError) throw linkError

      setLinkSuccess(`Paciente ${patientData.full_name} vinculado com sucesso!`)
      setLinkCode('')
      fetchPatients()
    } catch (err: any) {
      setLinkError(err.message)
    } finally {
      setLinkLoading(false)
    }
  }

  const getGlucoseStatus = (level: number) => {
    if (level < 70) return { status: 'Baixo', color: 'text-red-600 bg-red-50 border-red-200' }
    if (level <= 140) return { status: 'Normal', color: 'text-green-600 bg-green-50 border-green-200' }
    if (level <= 200) return { status: 'Alto', color: 'text-yellow-600 bg-yellow-50 border-yellow-200' }
    return { status: 'Muito Alto', color: 'text-red-600 bg-red-50 border-red-200' }
  }

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

  const getDiabetesTypeLabel = (type: string) => {
    switch (type) {
      case 'type1': return 'Tipo 1'
      case 'type2': return 'Tipo 2'
      case 'prediabetes': return 'Pré-diabetes'
      default: return ''
    }
  }

  const getRoleLabel = (role: string) => {
    return role === 'patient' ? 'Paciente' : 'Guardião'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gliceminha</h1>
            <p className="text-gray-600">
              {authMode === 'signin' ? 'Entre na sua conta' : 'Crie sua conta'}
            </p>
          </div>

          <form onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {authMode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Conta
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('patient')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                        role === 'patient'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <UserIcon className="h-6 w-6" />
                      <span className="text-sm font-medium">Paciente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('guardian')}
                      className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all ${
                        role === 'guardian'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Shield className="h-6 w-6" />
                      <span className="text-sm font-medium">Guardião</span>
                    </button>
                  </div>
                </div>

                {role === 'patient' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Diabetes
                    </label>
                    <select
                      value={diabetesType}
                      onChange={(e) => setDiabetesType(e.target.value as DiabetesType)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="type1">Diabetes Tipo 1</option>
                      <option value="type2">Diabetes Tipo 2</option>
                      <option value="prediabetes">Pré-diabetes</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {authLoading ? 'Carregando...' : authMode === 'signin' ? 'Entrar' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {authMode === 'signin' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Guardian Dashboard with Patient Selection
  if (profile.role === 'guardian' && selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-4">
                <Heart className="h-8 w-8 text-red-500" />
                <h1 className="text-2xl font-bold text-gray-900">Gliceminha</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {getRoleLabel(profile.role)}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{profile.full_name}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedPatient(null)}
                className="flex items-center text-blue-600 hover:text-blue-700 mr-4 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                Voltar
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Dados de {selectedPatient.full_name}
                </h1>
                <p className="text-gray-600">
                  Monitoramento de glicemia do paciente
                </p>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Tendência da Glicose</h2>
                </div>

                {glucoseRecords.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Sem dados para exibir</p>
                    <p className="text-sm">Paciente ainda não adicionou registros</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={glucoseRecords.slice(0, 30).reverse().map((record, index) => ({
                        index: index + 1,
                        glucose: record.glucose_level,
                        date: formatDate(record.created_at),
                        time: formatTime(record.created_at),
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                          }}
                          formatter={(value: any) => [`${value} mg/dL`, 'Glicose']}
                        />
                        <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
                        <ReferenceLine y={140} stroke="#22c55e" strokeDasharray="5 5" />
                        <Line
                          type="monotone"
                          dataKey="glucose"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <Clock className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Histórico do Paciente</h2>
                </div>

                {glucoseRecords.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium mb-2">Nenhum registro encontrado</p>
                    <p className="text-sm">Os registros aparecerão aqui</p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {glucoseRecords.slice(0, 10).map((record) => {
                      const statusInfo = getGlucoseStatus(record.glucose_level)
                      return (
                        <div key={record.id} className="border border-gray-200 rounded-lg p-4">
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
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Gliceminha</h1>
              <div className="flex items-center space-x-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {getRoleLabel(profile.role)}
                </span>
                {profile.role === 'patient' && profile.diabetes_type && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {getDiabetesTypeLabel(profile.diabetes_type)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{profile.full_name}</span>
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {profile.role === 'patient' ? (
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Controle de Glicemia
              </h1>
              <p className="text-gray-600">
                Monitore seus níveis de glicose e compartilhe com seus cuidadores
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                {/* Glucose Form */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center mb-6">
                    <Plus className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Novo Registro</h2>
                  </div>

                  <form onSubmit={handleGlucoseSubmit} className="space-y-6">
                    {glucoseError && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {glucoseError}
                      </div>
                    )}

                    {glucoseSuccess && (
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 120"
                        required
                      />
                      {glucoseLevel && !isNaN(parseFloat(glucoseLevel)) && (
                        <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block border ${getGlucoseStatus(parseFloat(glucoseLevel)).color}`}>
                          {getGlucoseStatus(parseFloat(glucoseLevel)).status}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 7.2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Observação (opcional)
                      </label>
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: antes do café da manhã"
                        maxLength={200}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={glucoseLoading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {glucoseLoading ? 'Salvando...' : 'Salvar Registro'}
                    </button>
                  </form>
                </div>

                {/* Invitation Code */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center mb-6">
                    <Share2 className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Compartilhar Dados</h2>
                  </div>

                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Gere um código de convite para permitir que um guardião acesse seus dados.
                    </p>

                    {!invitationCode && !profile.invitation_code ? (
                      <button
                        onClick={generateInvitationCode}
                        disabled={codeLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                      >
                        {codeLoading ? (
                          <>
                            <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Share2 className="h-5 w-5 mr-2" />
                            Gerar Código de Convite
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Código de Convite:
                              </p>
                              <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider">
                                {invitationCode || profile.invitation_code}
                              </p>
                            </div>
                            <button
                              onClick={handleCopyCode}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={generateInvitationCode}
                          disabled={codeLoading}
                          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Gerar Novo Código
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center mb-6">
                    <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Tendência da Glicose</h2>
                  </div>

                  {glucoseRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Sem dados para exibir</p>
                      <p className="text-sm">Adicione alguns registros para ver o gráfico</p>
                    </div>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={glucoseRecords.slice(0, 30).reverse().map((record, index) => ({
                          index: index + 1,
                          glucose: record.glucose_level,
                          date: formatDate(record.created_at),
                          time: formatTime(record.created_at),
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                          <YAxis stroke="#6b7280" fontSize={12} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                            }}
                            formatter={(value: any) => [`${value} mg/dL`, 'Glicose']}
                          />
                          <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="5 5" />
                          <ReferenceLine y={140} stroke="#22c55e" strokeDasharray="5 5" />
                          <Line
                            type="monotone"
                            dataKey="glucose"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={{ fill: '#3b82f6', r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* History */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center mb-6">
                    <Clock className="h-6 w-6 text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-900">Histórico de Registros</h2>
                  </div>

                  {glucoseRecords.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">Nenhum registro encontrado</p>
                      <p className="text-sm">Os registros aparecerão aqui</p>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {glucoseRecords.slice(0, 10).map((record) => {
                        const statusInfo = getGlucoseStatus(record.glucose_level)
                        return (
                          <div key={record.id} className="border border-gray-200 rounded-lg p-4">
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
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Guardian Dashboard
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Painel do Guardião
              </h1>
              <p className="text-gray-600">
                Monitore os dados de glicemia dos seus pacientes
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center mb-6">
                  <UserPlus className="h-6 w-6 text-blue-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-900">Vincular Paciente</h2>
                </div>

                <form onSubmit={handleLinkPatient} className="space-y-4">
                  {linkError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {linkError}
                    </div>
                  )}

                  {linkSuccess && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                      {linkSuccess}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código de Convite
                    </label>
                    <input
                      type="text"
                      value={linkCode}
                      onChange={(e) => setLinkCode(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg tracking-wider"
                      placeholder="Ex: ABC12345"
                      maxLength={8}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={linkLoading || linkCode.length !== 8}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {linkLoading ? (
                      'Vinculando...'
                    ) : (
                      <>
                        <Link className="h-5 w-5 mr-2" />
                        Vincular Paciente
                      </>
                    )}
                  </button>
                </form>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border p-6">
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
                        key={patient.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <UserIcon className="h-10 w-10 text-gray-400 bg-gray-100 rounded-full p-2" />
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
                                  Vinculado em {formatDate(patient.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => {
                              setSelectedPatient(patient)
                              fetchGlucoseRecords(patient.user_id)
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
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
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App