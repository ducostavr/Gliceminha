import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Share2, Copy, RefreshCw } from 'lucide-react';

export function InvitationCode() {
  const { profile, generateInvitationCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateCode = async () => {
    setLoading(true);
    await generateInvitationCode();
    setLoading(false);
  };

  const handleCopyCode = async () => {
    if (profile?.invitation_code) {
      await navigator.clipboard.writeText(profile.invitation_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <div className="flex items-center mb-4">
        <Share2 className="h-6 w-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Compartilhar Dados</h3>
      </div>
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Gere um código para permitir que um guardião (médico, familiar) acesse seus dados.
        </p>
        {!profile?.invitation_code ? (
          <button onClick={handleGenerateCode} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center">
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Gerar Código'}
          </button>
        ) : (
          <div className="space-y-3">
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-gray-700">Seu Código de Convite:</p>
              <p className="text-2xl font-mono font-bold text-blue-600 tracking-wider my-1">
                {profile.invitation_code}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
               <button onClick={handleCopyCode} className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center text-sm">
                <Copy className="h-4 w-4 mr-2" />
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
              <button onClick={handleGenerateCode} disabled={loading} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg flex items-center justify-center text-sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Gerar Novo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}