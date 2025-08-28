import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Suas credenciais - coloque no .env
    const client_id = process.env.PIXUPBR_CLIENT_ID;
    const client_secret = process.env.PIXUPBR_CLIENT_SECRET;

    if (!client_id || !client_secret) {
      return NextResponse.json(
        { error: 'Credenciais não configuradas' },
        { status: 500 }
      );
    }

    // Concatenar client_id e client_secret com ':'
    const credentials = `${client_id}:${client_secret}`;
    
    // Codificar em base64
    const base64Credentials = Buffer.from(credentials).toString('base64');
    
    // Fazer requisição para obter token
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

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Erro ao obter token', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    });

  } catch (error) {
    console.error('Erro na API de token:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}