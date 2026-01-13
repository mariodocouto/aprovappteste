
import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase com as credenciais do usuário
const SUPABASE_URL = "https://jwqdurvaekwbbajiphdv.supabase.co"; 
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3cWR1cnZhZWt3YmJhamlwaGR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0MTQ5NDksImV4cCI6MjA3ODk5MDk0OX0.puPLzTceM3A-Thm-uxZD-pq7A16eN-ejFEc1dFXiFEg";

// Verifica se as credenciais ainda são as de exemplo (não deve acontecer agora)
// Safe check using logical OR to prevent crash if SUPABASE_URL were somehow undefined
if ((SUPABASE_URL || "").includes("exemplo.supabase.co")) {
  console.warn("Aviso: Você está usando as credenciais de exemplo do Supabase.");
}

// Helper para verificar se o usuário configurou as chaves (será true agora)
export const isSupabaseConfigured = !(SUPABASE_URL || "").includes("exemplo.supabase.co");

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
