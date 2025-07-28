import React from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Profile, UserRole, DiabetesType } from '../lib/database.types';

// --- Interfaces e Contexto (sem alterações) ---
interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    diabetesType?: DiabetesType
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  generateInvitationCode: () => Promise<string>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

// --- Componente Provedor (com a lógica corrigida) ---
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingProfile, setLoadingProfile] = React.useState(false);

  // Efeito 1: Lida APENAS com a autenticação do Supabase
  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      setUser(session?.user ?? null);
      // Este listener agora SÓ define o usuário, nada mais.
    });

    // Ao carregar, verifica se a sessão já existe e define o usuário
    // Isso acelera o processo na primeira carga.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false); // Finaliza o loading de autenticação
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Efeito 2: Lida APENAS com a busca do perfil, REAGINDO a mudanças no 'user'
  React.useEffect(() => {
    // Se o usuário fez logout, limpa o perfil.
    if (!user) {
      setProfile(null);
      return;
    }

    // Se o usuário existe, busca o perfil.
    setLoadingProfile(true);
    supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') { // PGRST116 = 0 rows
          console.error('Erro ao buscar perfil:', error);
        } else {
          setProfile(data);
        }
        setLoadingProfile(false);
      });
  }, [user]); // Este efeito roda sempre que o 'user' muda.

  // --- Funções do Contexto (sem alterações) ---
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    diabetesType?: DiabetesType
  ) => {
    // ...código original
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    // ...código original
  };

  const generateInvitationCode = async (): Promise<string> => {
    // ...código original
    return ''; // Placeholder
  };
  
  const value = {
    user,
    profile,
    // O loading geral agora depende tanto do loading da autenticação quanto do perfil
    loading: loading || loadingProfile,
    signUp,
    signIn,
    signOut,
    updateProfile,
    generateInvitationCode,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}