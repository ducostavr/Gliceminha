import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile, GlucoseRecord } from '../lib/database.types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  glucoseRecords: GlucoseRecord[];
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  generateInvitationCode: () => Promise<string | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [glucoseRecords, setGlucoseRecords] = useState<GlucoseRecord[]>([]);

  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (e) {
        console.error("Erro ao buscar sessão inicial:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && profile) {
      fetchGlucoseRecords();
    }
  }, [user, profile]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
    if (error && error.code !== 'PGRST116') console.error('Erro ao buscar perfil:', error);
    setProfile(data || null);
  };

  const fetchGlucoseRecords = async () => {
    if (!user) return;
    const { data, error } = await supabase.from('glucose_records').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    if (error) console.error('Erro ao buscar registros:', error);
    setGlucoseRecords(data || []);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setGlucoseRecords([]);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    setProfile(data);
  };

  const generateInvitationCode = async (): Promise<string | undefined> => {
    if (!user || !profile || profile.role !== 'patient') return;
    try {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      await updateProfile({ invitation_code: code });
      return code;
    } catch (error) {
      console.error('Error generating code:', error);
    }
  };

  const value = { user, profile, loading, glucoseRecords, signOut, updateProfile, generateInvitationCode };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}