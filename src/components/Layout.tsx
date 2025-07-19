import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Heart } from 'lucide-react';
import type { UserRole, DiabetesType } from '../lib/database.types';

// A correção principal está aqui: a função não recebe mais 'children' como prop
export function Layout() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  const getRoleLabel = (role: UserRole) => (role === 'patient' ? 'Paciente' : 'Guardião');

  const getDiabetesTypeLabel = (type: DiabetesType) => {
    switch (type) {
      case 'type1': return 'Tipo 1';
      case 'type2': return 'Tipo 2';
      case 'prediabetes': return 'Pré-diabetes';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
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
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Olá, {profile?.full_name}
              </span>
              <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-gray-100" title="Sair">
                <LogOut className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}