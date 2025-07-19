import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PatientDashboard } from './PatientDashboard';
// import { GuardianDashboard } from './GuardianDashboard'; 

export function DashboardPage() {
  const { profile } = useAuth();

  if (profile?.role === 'patient') {
    return <PatientDashboard />;
  }

  if (profile?.role === 'guardian') {
    return <div>Painel do Guardião (Ainda não implementado)</div>;
  }

  return null; 
}