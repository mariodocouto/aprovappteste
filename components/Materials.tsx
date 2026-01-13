
import React, { useState, useEffect } from 'react';
import type { Edital, Product } from '../types.ts';
import { Card } from './common/Card.tsx';
import { BookOpen, FileText, Sparkles, Lock, ExternalLink, Download, Loader2, Search } from 'lucide-react';
import { mockProducts } from '../data/mockData.ts';
import { generateSummary } from '../services/geminiService.ts';

interface MaterialsProps {
    edital: Edital;
    isPremium: boolean;
    onOpenPricing: () => void;
}

export const Materials: React.FC<MaterialsProps> = ({ edital, isPremium, onOpenPricing }) => {
    const [activeTab, setActiveTab] = useState<'products' | 'summary'>('products');
    
    // Produtos Filtrados
    const [products, setProducts] = useState<Product[]>([]);

    // Estados do Gerador de Resumos
    const [selectedDisciplineId, setSelectedDisciplineId] = useState('');
    const [selectedTopicId, setSelectedTopicId] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedSummary, setGeneratedSummary] = useState('');

    useEffect(() => {
        // Filtra produtos relevantes para o edital atual
        const filtered = mockProducts.filter(p => p.editalId === edital.id || !p.editalId);
        setProducts(filtered);

        // Inicializa selects
        if (edital.disciplines.length > 0) {
            setSelectedDisciplineId(edital.disciplines[0].id);
            if (edital.disciplines[0].topics.length > 0) {
                setSelectedTopicId(edital.disciplines[0].topics[0].id);
            }
        }
    }, [edital]);

    const handleGenerateSummary = async () => {
        if (!isPremium) {
            onOpenPricing();
            return;
        }

        const disc = edital.disciplines.find(d => d.id === selectedDisciplineId);
        const topic = disc?.topics.find(t => t.id === selectedTopicId);

        if (!disc || !topic) return;

        setIsGenerating(true);
        setGeneratedSummary('');

        const summary = await generateSummary(topic.name, disc.name);
        setGeneratedSummary(summary);
        setIsGenerating(false);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-cyan-900 rounded-2xl p-6 shadow-xl relative overflow-hidden border border-blue-500/30">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <BookOpen className="text-cyan-400" /> Biblioteca de Conteúdo
                    </h2>
                    <p className="text-blue-100 text-sm mt-1">Materiais exclusivos e ferramentas de inteligência artificial para acelerar sua aprovação.</p>
                </div>
            </div>

            {/* Abas */}
            <div className="bg-neutral-800 rounded-xl p-1 flex gap-1 border border-neutral-700">
                <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'products' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                >
                    <FileText size={18} /> Apostilas & Conteúdos
                </button>
                <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        activeTab === 'summary' 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-700'
                    }`}
                >
                    <Sparkles size={18} /> IA Resumos
                </button>
            </div>

            {/* TAB PRODUTOS (APOSTILAS) */}
            {activeTab === 'products' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.length === 0 ? (
                        <div className="col-span-full text-center py-10">
                            <p className="text-neutral-500">Nenhum material disponível para este concurso no momento.</p>
                        </div>
                    ) : (
                        products.map(product => (
                            <div key={product.id} className="bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group flex flex-col h-full">
                                <div className="h-32 bg-neutral-700 flex items-center justify-center relative overflow-hidden">
                                    {/* Placeholder de Capa */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent opacity-60"></div>
                                    <FileText size={48} className="text-neutral-500 group-hover:scale-110 transition-transform duration-500" />
                                    {product.type === 'mentorship' && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                                            MENTORIA
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{product.title}</h3>
                                    <p className="text-sm text-neutral-400 mb-4 flex-1 line-clamp-3">{product.description}</p>
                                    
                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-700">
                                        <span className="text-xl font-bold text-green-400">
                                            R$ {product.price.toFixed(2).replace('.', ',')}
                                        </span>
                                        <a 
                                            href={product.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
                                        >
                                            Adquirir <ExternalLink size={14}/>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* TAB IA RESUMOS */}
            {activeTab === 'summary' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Configuração */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Sparkles className="text-purple-400" /> Gerar Resumo
                            </h3>
                            <p className="text-sm text-neutral-400 mb-6">
                                Escolha um tópico e a IA criará um material didático completo para você estudar agora.
                            </p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Disciplina</label>
                                    <select 
                                        value={selectedDisciplineId}
                                        onChange={(e) => {
                                            setSelectedDisciplineId(e.target.value);
                                            const disc = edital.disciplines.find(d => d.id === e.target.value);
                                            if (disc && disc.topics.length > 0) setSelectedTopicId(disc.topics[0].id);
                                        }}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                    >
                                        {edital.disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-neutral-500 mb-1 uppercase">Tópico</label>
                                    <select 
                                        value={selectedTopicId}
                                        onChange={(e) => setSelectedTopicId(e.target.value)}
                                        className="w-full bg-neutral-900 border border-neutral-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                    >
                                        {edital.disciplines.find(d => d.id === selectedDisciplineId)?.topics.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button 
                                    onClick={handleGenerateSummary}
                                    disabled={isGenerating}
                                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {!isPremium && <Lock size={16} />}
                                    {isGenerating ? (
                                        <><Loader2 className="animate-spin" size={18}/> Gerando...</>
                                    ) : (
                                        'Criar Resumo'
                                    )}
                                </button>
                                
                                {!isPremium && (
                                    <p className="text-xs text-center text-yellow-500 mt-2">
                                        Funcionalidade exclusiva para assinantes Premium.
                                    </p>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Resultado */}
                    <div className="lg:col-span-2">
                        {generatedSummary ? (
                            <Card className="min-h-[500px]">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-700">
                                    <h3 className="text-xl font-bold text-white">Resumo Gerado</h3>
                                    <button 
                                        onClick={() => window.print()} // Simples print para PDF
                                        className="text-neutral-400 hover:text-white flex items-center gap-1 text-sm"
                                    >
                                        <Download size={16} /> Salvar PDF
                                    </button>
                                </div>
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap text-neutral-300 leading-relaxed">
                                        {generatedSummary}
                                    </div>
                                </div>
                            </Card>
                        ) : (
                            <div className="h-full bg-neutral-800/30 border-2 border-dashed border-neutral-700 rounded-xl flex flex-col items-center justify-center text-neutral-500 p-8">
                                <div className="bg-neutral-800 p-4 rounded-full mb-4">
                                    <Search size={32} className="text-neutral-600" />
                                </div>
                                <p className="font-medium">O resumo aparecerá aqui.</p>
                                <p className="text-sm mt-1">Selecione um tópico ao lado para começar.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
