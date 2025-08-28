import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Processar webhook da PixupBR
    console.log('Webhook recebido:', body);
    
    switch (body.status) {
      case 'paid':
        // Pagamento aprovado
        console.log(`Pagamento aprovado - ID: ${body.external_id}`);
        break;
      case 'cancelled':
        // Pagamento cancelado
        console.log(`Pagamento cancelado - ID: ${body.external_id}`);
        break;
      case 'expired':
        // Pagamento expirado
        console.log(`Pagamento expirado - ID: ${body.external_id}`);
        break;
      default:
        console.log(`Status desconhecido: ${body.status}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Erro no webhook:', error);
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    );
  }
}
