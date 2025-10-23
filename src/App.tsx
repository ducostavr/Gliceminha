import React, { useState, useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import type { User } from '@supabase/supabase-js'
import { GlucoseForm } from './components/glucose/GlucoseForm.tsx';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportPDF } from './components/ReportPDF'; // Ajuste o caminho se o seu for diferente
import { 
  Heart, 
  LogOut, 
  User as UserIcon, 
  Plus, 
  Activity, 
  Syringe, 
  TestTube, 
  Clock, 
  FileText, 
  TrendingUp, 
  Users, 
  Eye, 
  UserPlus, 
  Link as LinkIcon, // Renomeado para evitar conflitos
  Share2, 
  Copy, 
  RefreshCw, 
  ArrowLeft,
  Download,
  Calendar,
  Edit3,
  Save,
  Trash2,  
  X
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}


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

// ========================================================================
// TODOS OS SEUS COMPONENTES ORIGINAIS ESTÃO AQUI, COMPLETOS
// ========================================================================

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<UserRole>('patient')
  const [diabetesType, setDiabetesType] = useState<DiabetesType>('type2')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
      } else {
        if (password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres')
        }
        
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
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
if (loading) {
  return <div className="p-8 text-center text-gray-500">Carregando...</div>
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gliceminha</h1>
          <p className="text-gray-600">
            {isLogin ? 'Entre na sua conta' : 'Crie sua conta'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome Completo
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 pr-10"
                placeholder="Sua senha"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <Eye className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tipo de Conta
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('patient')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 ${
                      role === 'patient'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <UserIcon className="h-6 w-6" />
                    <span className="text-sm font-medium">Paciente</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('guardian')}
                    className={`p-4 border-2 rounded-lg flex flex-col items-center space-y-2 transition-all duration-200 ${
                      role === 'guardian'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Users className="h-6 w-6" />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
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
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Layout({ children, user, profile }: { children: React.ReactNode, user: User, profile: Profile }) {
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getRoleLabel = (role: string) => {
    return role === 'patient' ? 'Paciente' : 'Guardião'
  }

  const getDiabetesTypeLabel = (type: string | null) => {
    if (!type) return '';
    switch (type) {
      case 'type1': return 'Tipo 1'
      case 'type2': return 'Tipo 2'
      case 'prediabetes': return 'Pré-diabetes'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Heart className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">Gliceminha</h1>
              {profile && (
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
              )}
            </div>
            
            {user && profile && (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-gray-600">
                  <UserIcon className="h-5 w-5 mr-2" />
                  <span className="text-sm font-medium">{profile.full_name}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

function PatientDashboard({ user, profile, onShowReport }: { user: User, profile: Profile, onShowReport: () => void }) {
  return (
    <div className="space-y-8 animate-fade-in">
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
         <GlucoseForm />
         <InvitationCode profile={profile} />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Download className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Relatório de Insulina</h2>
            </div>
            <p className="text-gray-600 mb-4">
              Gere um relatório detalhado dos seus registros de insulina
            </p>
            <button
              onClick={onShowReport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full flex items-center justify-center"
            >
              <Download className="h-5 w-5 mr-2" />
              📊 Relatório de Insulina
            </button>
          </div>
        </div>
        
        <div className="space-y-8">
          <GlucoseChart userId={user.id} />
          <GlucoseHistory userId={user.id} />
        </div>
      </div>
    </div>
  )
}

function GuardianDashboard({ user, profile, selectedPatient, onSelectPatient, onShowReport }: { 
  user: User, 
  profile: Profile, 
  selectedPatient: any, 
  onSelectPatient: (patient: any) => void,
  onShowReport: (patient: any) => void
}) {
  const [patientListVersion, setPatientListVersion] = useState(0);

  // Função para forçar a atualização da lista de pacientes
  const refreshPatientList = () => {
    setPatientListVersion(v => v + 1);
  };

  if (selectedPatient) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => onSelectPatient(null)}
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
          
          <button
            onClick={() => onShowReport(selectedPatient)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Relatório de Insulina
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <GlucoseChart 
              userId={selectedPatient.user_id} 
              title="Tendência da Glicose do Paciente"
            />
          </div>
          <div>
            <GlucoseHistory 
              userId={selectedPatient.user_id}
              title="Histórico do Paciente"
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Painel do Guardião
        </h1>
        <p className="text-gray-600">
          Monitore os dados de glicemia dos seus pacientes
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <LinkPatient guardianId={user.id} onPatientLinked={refreshPatientList} />
        </div>
        
        <div>
          <PatientsList 
            version={patientListVersion} 
            guardianId={user.id} 
            onSelectPatient={onSelectPatient}
            onListChange={refreshPatientList} 
          />
        </div>
      </div>
    </div>
  )
}

function GlucoseChart({ userId, title = 'Tendência da Glicose' }: { userId: string, title?: string }) {
  const [records, setRecords] = useState<GlucoseRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      fetchRecords()
    }
  }, [userId])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = records
    .slice(0, 30)
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

function GlucoseHistory({ userId, title = 'Histórico de Registros' }: { userId: string, title?: string }) {
  const [records, setRecords] = useState<GlucoseRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRecord, setEditingRecord] = useState<GlucoseRecord | null>(null)
  
  // Estados para os campos de edição
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editInsulin, setEditInsulin] = useState('') // <-- NOVO ESTADO

  useEffect(() => {
    if (userId) {
      fetchRecords()
    }
  }, [userId])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Error fetching records:', error)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (record: GlucoseRecord) => {
    setEditingRecord(record)
    const date = new Date(record.created_at)
    setEditDate(date.toISOString().split('T')[0]) // Formato YYYY-MM-DD
    setEditTime(date.toTimeString().slice(0, 5))   // Formato HH:MM
    
    setEditInsulin(record.insulin_units ? String(record.insulin_units) : '')
  }

  const cancelEdit = () => {
    setEditingRecord(null)
    setEditDate('')
    setEditTime('')
    setEditInsulin('') 
  }
  
  const saveEdit = async () => {
    if (!editingRecord) return

    try {
      const newDateTime = new Date(`${editDate}T${editTime}`);
      
      const newInsulin = editInsulin ? parseFloat(editInsulin) : null;
      
      // Validação corrigida para TypeScript
      if (newInsulin !== null && (isNaN(newInsulin) || newInsulin < 0)) {
        alert('O valor da insulina deve ser um número positivo.');
        return;
      }

      const { error } = await supabase
        .from('glucose_records')
        .update({ 
          created_at: newDateTime.toISOString(),
          insulin_units: newInsulin 
        })
        .eq('id', editingRecord.id)

      if (error) throw error

      setEditingRecord(null)
      fetchRecords() // Atualiza a lista
    } catch (error) {
      console.error('Error updating record:', error)
      alert('Não foi possível atualizar o registro.');
    }
  }

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.')) {
      try {
        const { error } = await supabase
          .from('glucose_records')
          .delete()
          .eq('id', recordId);

        if (error) throw error;
        
        fetchRecords(); 

      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Não foi possível excluir o registro.');
      }
    }
  };


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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            const isEditing = editingRecord?.id === record.id
            
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
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex space-x-2">
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            <input
                              type="time"
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>
                          
                          {/* <-- NOVO CAMPO DE INSULINA --> */}
                          <div className="mt-2">
                            <label className="text-xs font-medium text-gray-600 flex items-center">
                              <Syringe className="h-3 w-3 mr-1" />
                              Insulina (unid)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={editInsulin}
                              onChange={(e) => setEditInsulin(e.target.value)}
                              className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                              placeholder="Ex: 10"
                            />
                          </div>
                          {/* <-- FIM DO NOVO CAMPO --> */}
                          
                          <div className="flex space-x-2 mt-2">
                            <button
                              onClick={saveEdit}
                              className="flex items-center px-2 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Salvar
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center px-2 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(record.created_at)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(record.created_at)}
                          </span>
                          <button
                            onClick={() => startEdit(record)}
                            className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Edit3 className="h-3 w-3 mr-1" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="flex items-center text-red-600 hover:text-red-700 text-sm"
                            title="Excluir registro"
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Excluir
                          </button>
                        </div>
                      )}
                      
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

// Invitation Code Component
function InvitationCode({ profile }: { profile: Profile }) {
  const [code, setCode] = useState<string | null>(profile.invitation_code)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerateCode = async () => {
    setLoading(true)
    try {
      const newCode = Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          invitation_code: newCode,
          updated_at: new Date().toISOString() 
        })
        .eq('user_id', profile.user_id)

      if (error) throw error
      setCode(newCode)
    } catch (error) {
      console.error('Error generating code:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (code) {
      try {
        await navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Error copying to clipboard:', error)
        alert(`Código: ${code}`)
      }
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <Share2 className="h-6 w-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Compartilhar Dados</h2>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600">
          Gere um código de convite para permitir que um guardião (médico, familiar, etc.) 
          acesse seus dados de glicose.
        </p>

        {!code ? (
          <button
            onClick={handleGenerateCode}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg w-full flex items-center justify-center"
          >
            {loading ? (
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
                    {code}
                  </p>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Importante:</strong> Compartilhe este código apenas com pessoas de confiança. 
                Elas terão acesso de leitura aos seus dados de glicose.
              </p>
            </div>

            <button
              onClick={handleGenerateCode}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-2 px-4 rounded-lg w-full flex items-center justify-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Novo Código
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Link Patient Component
function LinkPatient({ guardianId, onPatientLinked }: { guardianId: string, onPatientLinked: () => void }) {
  const [invitationCode, setInvitationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guardianId) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const cleanCode = invitationCode.trim().toUpperCase()
      
      if (cleanCode.length !== 8) {
        throw new Error('O código deve ter exatamente 8 caracteres')
      }

      const { data: patientData, error: patientError } = await supabase
        .from('profiles')
        .select('*')
        .eq('invitation_code', cleanCode)
        .eq('role', 'patient')
        .single()

      if (patientError || !patientData) {
        throw new Error('Código de convite inválido ou expirado. Verifique se o código está correto.')
      }

      const { data: existingLink } = await supabase
        .from('guardian_patient_links')
        .select('*')
        .eq('guardian_id', guardianId)
        .eq('patient_id', patientData.user_id)
        .maybeSingle()
        

      if (existingLink) {
        throw new Error('Você já está vinculado a este paciente')
      }

      const { error: linkError } = await supabase
        .from('guardian_patient_links')
        .insert({
          guardian_id: guardianId,
          patient_id: patientData.user_id,
        })

      if (linkError) {
        console.error('Link error:', linkError)
        throw new Error('Erro ao criar vínculo. Tente novamente.')
      }
      

      setSuccess(`Paciente ${patientData.full_name} vinculado com sucesso!`)
      setInvitationCode('')
      onPatientLinked()
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err: any) {
      console.error('Error linking patient:', err)
      setError(err.message)
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-lg tracking-wider"
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
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg w-full flex items-center justify-center disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              <span>Vinculando...</span>
            </>
          ) : (
            <>
              <LinkIcon className="h-5 w-5 mr-2" />
              <span>Vincular Paciente</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}

// Patients List Component
function PatientsList({ guardianId, onSelectPatient, version, onListChange }: { 
  guardianId: string, 
  onSelectPatient: (patient: Profile) => void, 
  version: number,
  onListChange: () => void 
}) {
  const [patients, setPatients] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (guardianId) {
      fetchPatients()
    }
  }, [guardianId, version])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      
      const { data: links, error: linksError } = await supabase
        .from('guardian_patient_links')
        .select('patient_id')
        .eq('guardian_id', guardianId)

      if (linksError) throw linksError

      if (!links || links.length === 0) {
        setPatients([])
        setLoading(false) // Adicionado para parar o loading se não houver pacientes
        return
      }

      const patientIds = links.map(link => link.patient_id)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('user_id', patientIds)

      if (profilesError) throw profilesError

      setPatients(profiles || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
      setPatients([])
    } finally {
      setLoading(false)
    }
  }

  // Função para lidar com a exclusão do paciente
  const handleDeleteLink = async (patient: Profile) => {
    // Usamos um modal de confirmação simples do navegador
    if (!window.confirm(`Tem certeza de que deseja desvincular o paciente ${patient.full_name}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('guardian_patient_links')
        .delete()
        .eq('guardian_id', guardianId)
        .eq('patient_id', patient.user_id);

      if (error) {
        throw error;
      }
      
      alert(`Paciente ${patient.full_name} foi desvinculado com sucesso.`);
      onListChange(); // Chama a função do componente pai para atualizar a lista

    } catch (error: any) {
      console.error('Erro ao desvincular paciente:', error);
      alert(`Não foi possível desvincular o paciente: ${error.message}`);
    }
  }

  const getDiabetesTypeLabel = (type: string | null) => {
    if (!type) return '';
    switch (type) {
      case 'type1': return 'Tipo 1'
      case 'type2': return 'Tipo 2'
      case 'prediabetes': return 'Pré-diabetes'
      default: return ''
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
                        Vinculado em {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectPatient(patient)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg flex items-center text-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Dados
                  </button>

                  <button
                    onClick={() => handleDeleteLink(patient)}
                    title="Desvincular paciente"
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// Report Page Component
function ReportPage({ userId, patientName, onBack }: { userId: string, patientName: string, onBack: () => void }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState<GlucoseRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<GlucoseRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [quickFilter, setQuickFilter] = useState('');

  useEffect(() => {
    if (userId) {
      fetchAllRecords();
    }
  }, [userId]);

  const fetchAllRecords = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('glucose_records')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const setTodayFilter = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    setStartDate(todayString);
    setEndDate(todayString);
    setQuickFilter('hoje');
    generateReport(todayString, todayString);
  };

  const setQuickFilterDays = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    const startDateString = start.toISOString().split('T')[0];
    const endDateString = end.toISOString().split('T')[0];

    setStartDate(startDateString);
    setEndDate(endDateString);
    setQuickFilter(`${days} dias`);
    generateReport(startDateString, endDateString);
  };

  const generateReport = (startDt?: string, endDt?: string) => {
    const finalStartDate = startDt || startDate;
    const finalEndDate = endDt || endDate;

    if (!finalStartDate || !finalEndDate) {
      alert('Por favor, selecione as datas de início e fim');
      return;
    }

    const filtered = records.filter(record => {
      const recordDateString = record.created_at.substring(0, 10);
      return recordDateString >= finalStartDate &&
             recordDateString <= finalEndDate;
    });
    setFilteredRecords(filtered);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center">
        <button
          onClick={onBack}
          className="flex items-center text-blue-600 hover:text-blue-700 mr-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Voltar
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Relatório de Insulina
          </h1>
          <p className="text-gray-600">
            {patientName}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <Calendar className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Filtros de Data</h2>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Filtros Rápidos:</p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={setTodayFilter}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                quickFilter === 'hoje'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setQuickFilterDays(7)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                quickFilter === '7 dias'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 7 dias
            </button>
            <button
              onClick={() => setQuickFilterDays(15)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                quickFilter === '15 dias'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 15 dias
            </button>
            <button
              onClick={() => setQuickFilterDays(30)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                quickFilter === '30 dias'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Últimos 30 dias
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Início
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setQuickFilter('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Fim
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setQuickFilter('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <button
          onClick={() => generateReport()}
          disabled={!startDate || !endDate || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg w-full disabled:opacity-50 flex items-center justify-center"
        >
          <Calendar className="h-5 w-5 mr-2" />
          Gerar Relatório
        </button>
      </div>

      {filteredRecords.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">
                Registros de Insulina ({filteredRecords.length})
              </h2>
            </div>
            
            <PDFDownloadLink
              document={
                <ReportPDF 
                  patientName={patientName}
                  startDate={startDate}
                  endDate={endDate}
                  records={filteredRecords}
                />
              }
              fileName={`relatorio-insulina-${patientName.replace(/\s+/g, '-')}.pdf`}
            >
              {({ loading }) => 
                loading ? (
                  <button className="bg-gray-500 text-white font-medium py-2 px-4 rounded-lg flex items-center" disabled>
                    Gerando PDF...
                  </button>
                ) : (
                  <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center">
                    <Download className="h-5 w-5 mr-2" />
                    Baixar Relatório em PDF
                  </button>
                )
              }
            </PDFDownloadLink>

          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{record.glucose_level}</div>
                      <div className="text-xs text-gray-500">mg/dL</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">{record.insulin_units}</div>
                      <div className="text-xs text-gray-500">unidades</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{new Date(record.created_at).toLocaleDateString('pt-BR')}</div>
                    <div className="text-sm text-gray-500">{new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                {record.note && <div className="mt-2 text-sm text-gray-600 italic">"{record.note}"</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================================================
// COMPONENTE PRINCIPAL App
// ========================================================================

function App() {
  const { user, profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'dashboard' | 'report'>('dashboard');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  console.log('App.tsx → loading:', loading, '| user:', user, '| profile:', profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // ✅ Verificação correta para exibir login após o loading
  if (!user || !profile) {
    return <AuthForm />;
  }

  return (
    <Layout user={user} profile={profile}>
      {currentView === 'report' ? (
        <ReportPage
          userId={selectedPatient?.user_id || user.id}
          patientName={selectedPatient?.full_name || profile.full_name}
          onBack={() => setCurrentView('dashboard')}
        />
      ) : (
        <>
          {profile.role === 'patient' ? (
            <PatientDashboard
              user={user}
              profile={profile}
              onShowReport={() => setCurrentView('report')}
            />
          ) : (
            <GuardianDashboard
              user={user}
              profile={profile}
              selectedPatient={selectedPatient}
              onSelectPatient={setSelectedPatient}
              onShowReport={(patient: any) => {
                setSelectedPatient(patient);
                setCurrentView('report');
              }}
            />
          )}
        </>
      )}
    </Layout>
  );
}

export default App;