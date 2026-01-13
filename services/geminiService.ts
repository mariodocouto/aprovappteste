
import { GoogleGenAI } from "@google/genai";
import type { Edital } from '../types.ts';

// --- MOCK DATA PARA MODO OFFLINE (FALLBACK) ---
const MOCK_QUESTIONS = [
    {
        question: "Esta é uma questão de exemplo (Modo Offline). A Constituição Federal de 1988, em seu artigo 5º, estabelece que todos são iguais perante a lei, sem distinção de qualquer natureza. Sobre os direitos e garantias fundamentais, é correto afirmar que:",
        options: [
            "A prática do racismo constitui crime inafiançável e imprescritível.",
            "É livre a manifestação do pensamento, sendo permitido o anonimato.",
            "A casa é asilo inviolável, ninguém nela podendo penetrar sem consentimento, salvo por ordem policial a qualquer hora.",
            "É plena a liberdade de associação para fins lícitos, inclusive de caráter paramilitar.",
            "A propriedade não atenderá a sua função social."
        ],
        correctAnswer: 0,
        explanation: "Correto. Conforme o Art. 5º, XLII da CF/88, a prática do racismo constitui crime inafiançável e imprescritível, sujeito à pena de reclusão."
    },
    {
        question: "(Modo Offline) No que tange aos atos administrativos, o atributo que permite à Administração Pública impor obrigações aos administrados, independentemente de sua concordância, denomina-se:",
        options: [
            "Presunção de legitimidade",
            "Imperatividade",
            "Autoexecutoriedade",
            "Tipicidade",
            "Discricionariedade"
        ],
        correctAnswer: 1,
        explanation: "A Imperatividade (ou Poder Extroverso) é o atributo pelo qual os atos administrativos se impõem a terceiros, independentemente de sua concordância."
    },
    {
        question: "(Modo Offline) Assinale a alternativa que apresenta um princípio implícito da Administração Pública:",
        options: [
            "Legalidade",
            "Impessoalidade",
            "Moralidade",
            "Eficiência",
            "Supremacia do Interesse Público"
        ],
        correctAnswer: 4,
        explanation: "Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência (LIMPE) são expressos no art. 37. A Supremacia do Interesse Público é um princípio implícito (ou basilar)."
    }
];

function cleanAndRepairJson(text: string): string {
    let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
        JSON.parse(cleaned);
        return cleaned;
    } catch (e) {
        if ((cleaned.match(/"/g) || []).length % 2 !== 0) cleaned += '"';
        const openBraces = (cleaned.match(/\{/g) || []).length;
        const closeBraces = (cleaned.match(/\}/g) || []).length;
        const openBrackets = (cleaned.match(/\[/g) || []).length;
        const closeBrackets = (cleaned.match(/\]/g) || []).length;
        for (let i = 0; i < (openBraces - closeBraces); i++) cleaned += "}";
        for (let i = 0; i < (openBrackets - closeBrackets); i++) cleaned += "]";
        return cleaned;
    }
}

const getSafeKey = (): string => {
    let key = "";
    try {
        if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
            key = process.env.API_KEY;
        }
    } catch (e) {
        console.warn("Erro ao ler ambiente:", e);
    }
    return key;
};

export const parseEditalWithGemini = async (base64Data: string): Promise<Edital | null> => {
    const apiKey = getSafeKey();
    if (!apiKey) return null;

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Extraia o conteúdo programático deste edital em formato JSON disciplinado. Exploda os tópicos em itens granulares.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: {
                parts: [
                    { inlineData: { mimeType: "application/pdf", data: base64Data } },
                    { text: prompt }
                ]
            },
            config: { responseMimeType: "application/json" },
        });
        
        const jsonText = response.text;
        if (!jsonText) throw new Error("Vazio");
        const parsedJson = JSON.parse(cleanAndRepairJson(jsonText));
        
        return {
            id: `edital-${Date.now()}`,
            name: parsedJson.name || "Edital Importado",
            disciplines: parsedJson.disciplines.map((d: any, i: number) => ({
                id: `disc-${i}-${Date.now()}`,
                name: d.name || "Disciplina",
                topics: Array.isArray(d.topics) ? d.topics.map((t: any, j: number) => ({
                    id: `top-${i}-${j}-${Date.now()}`,
                    name: typeof t === 'string' ? t : (t.name || "Tópico")
                })) : []
            }))
        };
    } catch (error) {
        console.error("Erro IA Edital:", error);
        return null;
    }
};

export const updateEditalWithAI = async (currentEdital: Edital, instruction: string): Promise<Edital | null> => {
    const apiKey = getSafeKey();
    if (!apiKey) return null;

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Instrução: ${instruction}. Contexto Atual: ${JSON.stringify(currentEdital)}. Retorne apenas o JSON atualizado.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json" }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Vazio");
        return JSON.parse(cleanAndRepairJson(jsonText));
    } catch (error) {
        console.error("Erro IA Update Edital:", error);
        return null;
    }
};

export const generatePracticeQuestions = async (topicName: string | null, disciplineName: string, count: number = 5): Promise<any[]> => {
    const apiKey = getSafeKey();
    if (!apiKey) return MOCK_QUESTIONS.slice(0, count);

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Gere ${count} questões difíceis sobre ${topicName || disciplineName} para concursos. Formato JSON com "questions" contendo question, options (array), correctAnswer (índice) e explanation.`;

        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ text: prompt }] },
            config: { responseMimeType: "application/json" }
        });

        const jsonText = response.text;
        if (!jsonText) throw new Error("Vazio");
        const parsed = JSON.parse(cleanAndRepairJson(jsonText));
        return (parsed.questions || []).slice(0, count);
    } catch (error) {
        console.error("Erro IA Questões:", error);
        return MOCK_QUESTIONS.slice(0, count);
    }
};

export const generateSummary = async (topicName: string, disciplineName: string): Promise<string> => {
    const apiKey = getSafeKey();
    if (!apiKey) return "Erro de chave.";

    try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Crie um resumo didático para concurso sobre ${topicName} de ${disciplineName}. Use Markdown.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ text: prompt }] }
        });
        return response.text || "Sem conteúdo.";
    } catch (error) {
        return "Erro ao gerar resumo.";
    }
};
