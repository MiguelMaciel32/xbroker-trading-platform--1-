import { NextRequest, NextResponse } from 'next/server';

interface QRCodeRequest {
  amount: number;
  external_id: string;
  payerQuestion?: string;
  postbackUrl?: string;
  payer?: {
    name?: string;
    document?: string;
    email?: string;
  };
}

// Função para obter token diretamente
async function getPixupBRToken() {
  const client_id = process.env.PIXUPBR_CLIENT_ID;
  const client_secret = process.env.PIXUPBR_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error('Credenciais não configuradas');
  }

  const credentials = `${client_id}:${client_secret}`;
  const base64Credentials = Buffer.from(credentials).toString('base64');
  
  const response = await fetch('https://api.pixupbr.com/v2/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${base64Credentials}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro response:', errorText);
    throw new Error(`Erro ao obter token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

export async function POST(request: NextRequest) {
  try {
    const body: QRCodeRequest = await request.json();
    
    // Validação básica
    if (!body.amount || !body.external_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: amount, external_id' },
        { status: 400 }
      );
    }

    console.log('Dados recebidos:', body);

    // Obter token diretamente
    let token;
    try {
      token = await getPixupBRToken();
    } catch (tokenError: any) {
      console.error('Erro ao obter token:', tokenError);
      return NextResponse.json(
        { error: 'Erro ao obter token de acesso', details: tokenError.message },
        { status: 401 }
      );
    }

    console.log('Token obtido com sucesso');

    // Criar QR Code PIX
    const qrResponse = await fetch('https://api.pixupbr.com/v2/pix/qrcode', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        amount: body.amount,
        external_id: body.external_id,
        payerQuestion: body.payerQuestion || '',
        postbackUrl: body.postbackUrl || '',
        payer: body.payer || {}
      })
    });

    if (!qrResponse.ok) {
      const errorText = await qrResponse.text();
      console.error('Erro na criação do QR Code:', errorText);
      return NextResponse.json(
        { error: 'Erro ao gerar QR Code', details: errorText },
        { status: qrResponse.status }
      );
    }

    const qrData = await qrResponse.json();
    console.log('QR Code criado com sucesso');

    return NextResponse.json({
      success: true,
      data: qrData
    });

  } catch (error: any) {
    console.error('Erro na API de QR Code:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', details: error.message },
      { status: 500 }
    );
  }
}