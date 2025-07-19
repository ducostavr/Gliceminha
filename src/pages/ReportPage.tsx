import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Printer, ArrowLeft } from 'lucide-react';
import type { GlucoseRecord } from '../lib/database.types';

export function ReportPage() {
  const navigate = useNavigate();
  const { profile, glucoseRecords } = useAuth();
  const [filter, setFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    if (!glucoseRecords) return [];
    const now = new Date();
    let startDate = new Date();

    switch (filter) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case 'this_month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      default:
        return glucoseRecords;
    }
    return glucoseRecords.filter((record: GlucoseRecord) => new Date(record.created_at) >= startDate);
  }, [glucoseRecords, filter]);

  const stats = useMemo(() => {
    if (filteredRecords.length === 0) {
      return { avg: 0, min: 0, max: 0 };
    }
    const levels = filteredRecords.map((r: GlucoseRecord) => r.glucose_level);
    const sum = levels.reduce((a: number, b: number) => a + b, 0);
    return {
      avg: Math.round(sum / levels.length),
      min: Math.min(...levels),
      max: Math.max(...levels),
    };
  }, [filteredRecords]);

  const printStyles = `
    @media print {
      body * { visibility: hidden; }
      #printable-report, #printable-report * { visibility: visible; }
      #printable-report { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
      .no-print { display: none; }
    }
  `;

  if (!profile) return <p>Carregando...</p>;

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{printStyles}</style>
      <header className="bg-white shadow-sm border-b no-print">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Glicemia</h1>
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-5 w-5 mr-1" /> Voltar
              </button>
              <button onClick={handlePrint} className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg">
                <Printer className="h-5 w-5 mr-2" /> Imprimir / Salvar PDF
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main id="printable-report" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-md border">
          <h2 className="text-3xl font-bold text-center mb-2">Relatório de Glicemia</h2>
          <p className="text-center text-gray-600 mb-8">Gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
          
          <div className="mb-8 border-b pb-4">
            <h3 className="text-xl font-semibold mb-2">Dados do Paciente</h3>
            <p><strong>Nome:</strong> {profile.full_name}</p>
            {profile.diabetes_type && <p><strong>Condição:</strong> {profile.diabetes_type}</p>}
          </div>

          <div className="mb-8 no-print">
            <label htmlFor="period-filter" className="block text-sm font-medium text-gray-700 mb-2">Filtrar por período:</label>
            <select id="period-filter" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-full md:w-1/3 p-2 border border-gray-300 rounded-lg">
              <option value="all">Todos os registros</option>
              <option value="7d">Últimos 7 dias</option>
              <option value="30d">Últimos 30 dias</option>
              <option value="this_month">Este Mês</option>
            </select>
          </div>

          {filteredRecords.length > 0 && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center"><p className="text-sm text-blue-800">Média</p><p className="text-2xl font-bold text-blue-900">{stats.avg} <span className="text-base font-normal">mg/dL</span></p></div>
              <div className="bg-red-50 p-4 rounded-lg text-center"><p className="text-sm text-red-800">Mínima</p><p className="text-2xl font-bold text-red-900">{stats.min} <span className="text-base font-normal">mg/dL</span></p></div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center"><p className="text-sm text-yellow-800">Máxima</p><p className="text-2xl font-bold text-yellow-900">{stats.max} <span className="text-base font-normal">mg/dL</span></p></div>
            </div>
          )}

          <div>
            <h3 className="text-xl font-semibold mb-4">Registros do Período</h3>
            {filteredRecords.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Glicose</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insulina</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">HbA1c</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Observação</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record: GlucoseRecord) => (
                    <tr key={record.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(record.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">{new Date(record.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{record.glucose_level}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record.insulin_units || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record.hba1c || '-'}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{record.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500 py-8">Nenhum registro encontrado para este período.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}