import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Share2, Copy, RefreshCw } from 'lucide-react'

export function InvitationCode() {
  const [code, setCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const { generateInvitationCode } = useAuth()

  const handleGenerateCode = async () => {
    setLoading(true)
    try {
      const newCode = await generateInvitationCode()
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
      }
    }
  }

  return (
    <div className="card">
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
            className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                  className="btn-primary flex items-center"
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
              className="btn-secondary w-full py-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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