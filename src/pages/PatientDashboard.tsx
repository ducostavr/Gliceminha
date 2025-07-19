import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Supondo que seus componentes estão em 'src/components/'
// Se estiverem em outro lugar, ajuste os caminhos abaixo.
import { GlucoseForm } from '../components/glucose/GlucoseForm';
import { GlucoseHistory } from '../components/glucose/GlucoseHistory';
import { GlucoseChart } from '../components/glucose/GlucoseChart';
import { InvitationCode } from '../components/guardian/InvitationCode';

export function PatientDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleNavigateToReport = () => {
    navigate('/relatorio');
  };

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
          <InvitationCode />

          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex items-center mb-4">
               <FileText className="h-6 w-6 text-blue-600 mr-2" />
               <h3 className="text-xl font-semibold text-gray-900">Seus Relatórios</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gere um relatório completo com seus registros de glicemia para imprimir ou compartilhar.
            </p>
            <button
              onClick={handleNavigateToReport}
              className="w-full flex items-center justify-center px-4 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
            >
              <Printer className="mr-2 h-5 w-5" />
              Gerar Relatório
            </button>
          </div>
        </div>
        
        <div className="space-y-8">
          <GlucoseChart userId={user?.id} />
          <GlucoseHistory userId={user?.id} />
        </div>
      </div>
    </div>
  );
}