'use client';

import { useState } from 'react';

// Classe PixupBRService local
class PixupBRService {
  static async createPixPayment(data: {
    amount: number;
    external_id: string;
    payerQuestion?: string;
    postbackUrl?: string;
    payer?: {
      name?: string;
      document?: string;
      email?: string;
    };
  }) {
    try {
      const response = await fetch('/api/pixupbr/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar pagamento PIX');
      }

      return result.data;
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }
}

export default function TestePage() {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [pixKey, setPixKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreatePayment = async () => {
    setLoading(true);
    setError(null);
    setQrCode(null);
    setPixKey(null);
    
    try {
      const payment = await PixupBRService.createPixPayment({
        amount: 1, 
        external_id: `pedido_${Date.now()}`,
        payerQuestion: 'Pagamento do pedido de teste',
        postbackUrl: `${window.location.origin}/api/pixupbr/webhook`,
        payer: {
          name: 'João Silva',
          document: '12345678901',
          email: 'joao@email.com'
        }
      });

      console.log('Resposta completa do pagamento:', payment);

      // A resposta da PixupBR tem esta estrutura:
      // qrcode: string do código PIX (para copiar/colar)
      // Para gerar QR Code visual, precisamos converter essa string
      const qrCodeString = payment.qrcode;
      const pixKeyValue = payment.qrcode; // A string do QR code também serve como chave PIX
      
      console.log('QR Code string:', qrCodeString);
      console.log('Transaction ID:', payment.transactionId);
      console.log('Status:', payment.status);
      
      // Gerar URL do QR Code usando um serviço online
      const qrCodeImageUrl = qrCodeString ? 
        `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}` 
        : null;
      
      setQrCode(qrCodeImageUrl);
      setPixKey(qrCodeString);

      if (!qrCodeImageUrl && !qrCodeString) {
        setError('QR Code não encontrado na resposta da API');
      }
      
    } catch (error: any) {
      console.error('Erro:', error);
      setError(error.message || 'Erro ao criar pagamento PIX');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste Pagamento PIX</h1>
      
      <button 
        onClick={handleCreatePayment}
        disabled={loading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Gerando QR Code...' : 'Gerar QR Code PIX (R$ 1,00)'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Erro:</strong> {error}
        </div>
      )}

      {qrCode && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">QR Code PIX:</h3>
          <div className="border rounded p-4">
            <img 
              src={qrCode} 
              alt="QR Code PIX" 
              className="w-full max-w-xs mx-auto"
              onError={(e) => {
                console.error('Erro ao carregar imagem:', e);
                setError('Erro ao carregar QR Code');
              }}
            />
            
            {pixKey && (
              <div className="mt-4">
                <p className="font-medium mb-1">Código PIX (Copia e Cola):</p>
                <div className="bg-gray-100 p-2 rounded">
                  <code className="text-xs break-all block mb-2">
                    {pixKey}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pixKey);
                      alert('Código PIX copiado!');
                    }}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                  >
                    Copiar Código PIX
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debug: Mostrar dados brutos se houver */}
      {loading === false && !qrCode && !error && (
        <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded text-sm">
          <strong>Debug:</strong> Verifique o console para ver a resposta da API
        </div>
      )}
    </div>
  );
}