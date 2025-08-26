// app/api/bspay/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Configurações do BSPay
const BSPAY_CONFIG = {
  CLIENT_ID: process.env.BSPAY_CLIENT_ID || 'usuarioteste_63c4ff6423765as',
  CLIENT_SECRET: process.env.BSPAY_CLIENT_SECRET || '1759dd06464041b182f2a18abae597a',
  API_BASE_URL: 'https://api.bspay.co/v2',
};

// Interface para os dados de pagamento
interface PaymentData {
  amount: number;
  description: string;
  external_id?: string;
  creditParty?: {
    name?: string;
    document?: string;
    // adicione outros campos conforme necessário
  };
}

// Interface para a resposta do token OAuth2
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

// Função para obter token OAuth2 via Client Credentials
async function getAccessToken(): Promise<string> {
  try {
    // Criar a string de credenciais para Basic Auth no endpoint de token
    const credentials = `${BSPAY_CONFIG.CLIENT_ID}:${BSPAY_CONFIG.CLIENT_SECRET}`;
    
    // Codificar em Base64
    const base64Credentials = Buffer.from(credentials).toString('base64');
    
    // Fazer a requisição para obter o token OAuth2
    // Testando diferentes endpoints possíveis para BSPay
    const possibleEndpoints = [
      `${BSPAY_CONFIG.API_BASE_URL}/oauth/token`,
      `${BSPAY_CONFIG.API_BASE_URL}/auth/oauth/token`,
      `${BSPAY_CONFIG.API_BASE_URL}/token`,
      `${BSPAY_CONFIG.API_BASE_URL}/oauth2/token`
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Tentando endpoint: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${base64Credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials',
        });

        if (response.ok) {
          const tokenData: TokenResponse = await response.json();
          console.log(`Token obtido com sucesso do endpoint: ${endpoint}`);
          return tokenData.access_token;
        }

        if (response.status !== 404) {
          // Se não é 404, pode ser outro erro interessante
          const errorText = await response.text();
          console.log(`Endpoint ${endpoint} retornou ${response.status}: ${errorText}`);
        }
      } catch (error) {
        console.log(`Erro no endpoint ${endpoint}:`, error);
        continue;
      }
    }

    // Se nenhum endpoint funcionou, tenta usar o Basic Auth direto (fallback)
    throw new Error('Nenhum endpoint de token funcionou. Verifique suas credenciais BSPay.');
    
  } catch (error) {
    console.error('Erro ao obter token de acesso:', error);
    throw error;
  }
}

// Função para fazer o pagamento PIX
async function makePixPayment(token: string, paymentData: PaymentData) {
  try {
    const response = await fetch(`${BSPAY_CONFIG.API_BASE_URL}/pix/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro no pagamento: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao fazer pagamento:', error);
    throw error;
  }
}

// GET - Endpoint para testar a API
export async function GET() {
  return NextResponse.json({
    message: 'API BSPay funcionando',
    endpoints: {
      POST: '/api/bspay - Fazer pagamento PIX',
      GET: '/api/bspay - Status da API',
    }
  });
}

// POST - Endpoint principal para fazer pagamentos
export async function POST(request: NextRequest) {
  try {
    // Validar se os dados foram enviados
    const body = await request.json();
    
    // Validações básicas
    if (!body.amount || typeof body.amount !== 'number') {
      return NextResponse.json(
        { error: 'Campo "amount" é obrigatório e deve ser um número' },
        { status: 400 }
      );
    }

    if (!body.description) {
      return NextResponse.json(
        { error: 'Campo "description" é obrigatório' },
        { status: 400 }
      );
    }

    // Preparar dados do pagamento
    const paymentData: PaymentData = {
      amount: body.amount,
      description: body.description,
      external_id: body.external_id || `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creditParty: body.creditParty || {},
    };

    // Passo 1: Gerar header de autenticação Basic
    console.log('Gerando header de autenticação...');
    const authHeader = getBasicAuthHeader();
    console.log('Header de autenticação gerado com sucesso');

    // Passo 2: Fazer o pagamento
    console.log('Iniciando pagamento PIX...');
    const paymentResult = await makePixPayment(authHeader, paymentData);
    console.log('Pagamento processado com sucesso');

    // Retornar resultado
    return NextResponse.json({
      success: true,
      data: paymentResult,
      external_id: paymentData.external_id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro na API BSPay:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno do servidor',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// PUT - Endpoint para consultar status do pagamento (opcional)
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const external_id = searchParams.get('external_id');

    if (!external_id) {
      return NextResponse.json(
        { error: 'Parâmetro external_id é obrigatório' },
        { status: 400 }
      );
    }

    // Gerar header de autenticação
    const authHeader = getBasicAuthHeader();

    // Consultar status do pagamento
    const response = await fetch(
      `${BSPAY_CONFIG.API_BASE_URL}/pix/payment/${external_id}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao consultar pagamento: ${response.status}`);
    }

    const paymentStatus = await response.json();

    return NextResponse.json({
      success: true,
      data: paymentStatus,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Erro ao consultar status:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao consultar status',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}