
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const mpAccessToken = Deno.env.get("MP_ACCESS_TOKEN")
    if (!mpAccessToken) throw new Error("ERRO: MP_ACCESS_TOKEN não configurada.")

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error("Usuário não autenticado.")

    const { planType } = await req.json()
    const isAnnual = planType === 'annual';
    const amount = isAnnual ? 159.90 : 19.90;
    
    const webhookUrl = "https://jwqdurvaekwbbajiphdv.supabase.co/functions/v1/mercadopago-webhook";

    const preferenceData = {
      items: [{
          id: planType,
          title: `AprovApp Premium - ${isAnnual ? 'Plano Anual' : 'Plano Mensal'}`,
          description: "Acesso total às ferramentas de IA e Simulados do AprovApp.",
          quantity: 1,
          currency_id: "BRL",
          unit_price: amount
      }],
      payer: { 
        email: user.email,
        identification: {
            type: "CPF",
            number: user.user_metadata.cpf || ""
        }
      },
      payment_methods: {
        excluded_payment_types: [
            { id: "ticket" } // Opcional: Remove boleto se quiser apenas Pix e Cartão (mais rápido)
        ],
        installments: 12 // Permite parcelar o plano anual em até 12x
      },
      external_reference: user.id,
      notification_url: webhookUrl,
      back_urls: {
        success: "https://aprovapp.vercel.app/?payment=success",
        failure: "https://aprovapp.vercel.app/pricing?payment=failed",
        pending: "https://aprovapp.vercel.app/pricing?payment=pending"
      },
      auto_return: "approved"
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${mpAccessToken}`
      },
      body: JSON.stringify(preferenceData)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Erro no Mercado Pago");

    return new Response(JSON.stringify({ init_point: result.init_point }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    })
  }
})
