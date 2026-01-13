
import React, { useState } from 'react';
import { Check, X, Loader2, ChevronLeft, ExternalLink, Crown, ArrowRight, Lock } from 'lucide-react';
import { Logo } from './common/Logo.tsx';
import { User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase.ts';

interface PricingProps {
    onClose: () => void;
    user: User;
}

const FALLBACK_LINKS = {
    monthly: "https://mpago.la/s/aprovapp-mensal", 
    annual: "https://mpago.la/s/aprovapp-anual"
};

const MPCheckoutPreview: React.FC<{ 
    plan: 'monthly' | 'annual'; 
    price: string; 
    onBack: () => void;
}> = ({ plan, price, onBack }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isWaitingPayment, setIsWaitingPayment] = useState(false);

    const handleGenerateLinkAndPay = async () => {
        setIsProcessing(true);
        try {
            const { data, error } = await supabase.functions.invoke('create-mp-preference', {
                body: { planType: plan }
            });

            if (error || !data?.init_point) throw new Error("Erro na função");
            window.open(data.init_point, '_blank');
            setIsWaitingPayment(true);
        } catch (err: any) {
            window.open(FALLBACK_LINKS[plan], '_blank');
            setIsWaitingPayment(true);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fadeIn">
            <div className="flex items-center gap-2 mb-6">
                <button onClick={onBack} className="p-2 hover:bg-neutral-800 rounded-full text-neutral-400 hover:text-white transition-colors">
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-xl font-bold text-white">Finalizar Assinatura</h3>
            </div>

            <div className="bg-neutral-800/80 p-6 rounded-2xl border border-white/10 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Crown size={40} className="text-primary" /></div>
                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">PLANO SELECIONADO</p>
                <h4 className="text-xl font-bold text-white mb-1">{plan === 'annual' ? 'Plano Anual (Recomendado)' : 'Plano Mensal (Recorrente)'}</h4>
                <p className="text-2xl font-black text-green-400">{price}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center space-y-6">
                {!isWaitingPayment ? (
                    <>
                        <div className="bg-primary/10 p-5 rounded-full ring-8 ring-primary/5">
                            <Lock size={48} className="text-primary" />
                        </div>
                        
                        <div>
                            <h4 className="text-white font-bold mb-2">Checkout Pro Seguro</h4>
                            <p className="text-sm text-neutral-400 px-4">
                                Você pagará no ambiente do Mercado Pago com **Cartão de Crédito**, Pix ou Boleto.
                            </p>
                        </div>

                        <button 
                            onClick={handleGenerateLinkAndPay}
                            disabled={isProcessing}
                            className="w-full bg-gradient-to-r from-primary to-secondary hover:brightness-110 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <>Pagar com Cartão / Pix <ExternalLink size={18} /></>}
                        </button>
                        
                        <div className="flex items-center gap-4 justify-center grayscale opacity-50 mt-4">
                             <img src="https://logodownload.org/wp-content/uploads/2019/06/mercado-pago-logo.png" className="h-4" alt="Mercado Pago" />
                             <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png" className="h-4" alt="Pix" />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                        <h4 className="text-xl font-bold text-white mb-2">Aguardando Pagamento</h4>
                        <p className="text-neutral-400 text-sm mb-8 text-center px-4">Conclua o pagamento na aba que abrimos. O sistema detectará automaticamente assim que aprovado.</p>
                        
                        <button onClick={() => setIsWaitingPayment(false)} className="mt-8 text-neutral-500 hover:text-white text-sm underline underline-offset-4">
                            Mudar forma de pagamento
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const Pricing: React.FC<PricingProps> = ({ onClose, user }) => {
    const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('annual');
    const [viewMode, setViewMode] = useState<'features' | 'checkout'>('features');

    const features = [
        "IA para Gerar Questões Ilimitadas",
        "Leitura de Editais em PDF por IA",
        "Resumos e Mapas Mentais por IA",
        "Ranking e Grupos de Estudo",
        "Revisões Automáticas (24h, 7d, 30d)",
        "Análise de Performance Detalhada"
    ];

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-[#0f172a] border border-white/10 w-full max-w-4xl rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative animate-fadeIn">
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors z-10 text-white/50 hover:text-white">
                    <X size={20} />
                </button>

                <div className="md:w-5/12 bg-gradient-to-br from-primary-900 to-[#1e1b4b] p-8 md:p-12 flex flex-col justify-between">
                    <div>
                        <Logo className="h-14 w-14 mb-8" />
                        <h2 className="text-3xl font-black text-white leading-tight mb-4 uppercase tracking-tighter">Estude com Inteligência Artificial.</h2>
                        <div className="space-y-4">
                            {features.map((f, i) => (
                                <div key={i} className="flex items-start gap-3 text-sm text-white/90">
                                    <div className="bg-green-500/20 p-0.5 rounded-full mt-0.5">
                                        <Check size={14} className="text-green-400" />
                                    </div>
                                    {f}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="md:w-7/12 p-8 md:p-12 bg-[#0f172a] flex flex-col">
                    {viewMode === 'features' ? (
                        <div className="animate-fadeIn flex flex-col h-full">
                            <h3 className="text-xl font-bold text-white mb-8">Escolha seu plano:</h3>
                            <div className="space-y-4 mb-10 flex-1">
                                <button 
                                    onClick={() => setSelectedPlan('monthly')}
                                    className={`w-full p-6 rounded-2xl border-2 text-left transition-all ${selectedPlan === 'monthly' ? 'border-primary bg-primary/10' : 'border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="flex justify-between font-bold text-lg">
                                        <span className="text-white">Plano Mensal</span>
                                        <span className="text-primary">R$ 19,90</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-2">Renovação automática mensal. Cancele quando quiser.</p>
                                </button>
                                <button 
                                    onClick={() => setSelectedPlan('annual')}
                                    className={`w-full p-6 rounded-2xl border-2 text-left relative transition-all ${selectedPlan === 'annual' ? 'border-green-500 bg-green-500/10' : 'border-white/5 hover:border-white/20'}`}
                                >
                                    <div className="absolute -top-3 right-6 bg-green-500 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg">35% OFF</div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span className="text-white">Plano Anual</span>
                                        <span className="text-green-400">R$ 159,90</span>
                                    </div>
                                    <p className="text-xs text-neutral-500 mt-2">Acesso por 1 ano. Parcelamento em até 12x no cartão.</p>
                                </button>
                            </div>

                            <button 
                                onClick={() => setViewMode('checkout')}
                                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black text-lg py-5 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                            >
                                Continuar <ArrowRight size={22} />
                            </button>
                        </div>
                    ) : (
                        <MPCheckoutPreview 
                            plan={selectedPlan} 
                            price={selectedPlan === 'annual' ? 'R$ 159,90' : 'R$ 19,90'}
                            onBack={() => setViewMode('features')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
