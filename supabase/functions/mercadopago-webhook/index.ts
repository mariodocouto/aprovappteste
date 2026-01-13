
// @ts-nocheck
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response("ok", { status: 200 });
    
    const body = await req.json();
    console.log("Notificação MP recebida:", body.type || body.action);

    // O Mercado Pago avisa quando um pagamento muda de status
    if (body.type === "payment" || body.action?.includes("payment")) {
      const paymentId = body.data?.id || body.resource?.split('/').pop();
      const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN");

      // Buscamos os detalhes do pagamento direto no Mercado Pago para ter certeza que é real
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${mpAccessToken}` }
      });

      if (mpRes.ok) {
        const paymentData = await mpRes.json();
        
        // STATUS APROVADO!
        if (paymentData.status === "approved") {
          const userId = paymentData.external_reference;
          console.log(`PAGAMENTO APROVADO! Liberando Premium para: ${userId}`);

          const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' 
          );

          const { error } = await supabase
            .from('profiles')
            .update({ is_premium: true, updated_at: new Date().toISOString() })
            .eq('id', userId);

          if (error) {
            console.error("Erro ao atualizar o banco de dados:", error.message);
            return new Response("Erro no Banco", { status: 500 });
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error("Erro crítico no Webhook:", err.message);
    return new Response("Erro Interno", { status: 500 });
  }
})
