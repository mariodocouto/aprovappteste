
import type { Edital, Product } from '../types.ts';

export const mockPcrs: Edital = {
    id: 'pc-rs-2024',
    name: 'PC RS Escrivão e Inspetor',
    disciplines: [
        {
            id: 'pcrs-d1', name: 'Língua Portuguesa',
            topics: [
                { id: 'pcrs-t1-1', name: 'Leitura, interpretação e relação entre ideias' },
                { id: 'pcrs-t1-2', name: 'Linguagem e comunicação' },
                { id: 'pcrs-t1-3', name: 'Gêneros e tipos textuais, intertextualidade' },
                { id: 'pcrs-t1-4', name: 'Coesão e coerência textuais' },
                { id: 'pcrs-t1-5', name: 'Léxico: significação e substituição de palavras' },
                { id: 'pcrs-t1-6', name: 'Ortografia' },
                { id: 'pcrs-t1-7', name: 'Figuras de linguagem' },
                { id: 'pcrs-t1-8', name: 'Fonologia' },
                { id: 'pcrs-t1-9', name: 'Morfologia' },
                { id: 'pcrs-t1-10', name: 'Sintaxe (funções sintáticas, colocação, regência, concordância)' },
                { id: 'pcrs-t1-11', name: 'Coordenação e subordinação. Pontuação' }
            ]
        },
        {
            id: 'pcrs-d2', name: 'Informática',
            topics: [
                { id: 'pcrs-t2-1', name: 'Fundamentos da internet e da conectividade (Deep Web, Dark Web, etc)' },
                { id: 'pcrs-t2-2', name: 'Identificação de usuários (IP, CGNAT, P2P, DNS, etc)' },
                { id: 'pcrs-t2-3', name: 'Redes de computadores e comunicação' },
                { id: 'pcrs-t2-4', name: 'Modelos OSI/ISO e TCP/IP' },
                { id: 'pcrs-t2-5', name: 'Computação em nuvem (cloud computing)' },
                { id: 'pcrs-t2-6', name: 'Sistemas operacionais (Windows e Linux)' },
                { id: 'pcrs-t2-7', name: 'Manipulação de arquivos e pastas' },
                { id: 'pcrs-t2-8', name: 'Acesso remoto, colaboração online (Teams)' },
                { id: 'pcrs-t2-9', name: 'Edição de textos, planilhas e apresentações (Office 365 e LibreOffice)' },
                { id: 'pcrs-t2-10', name: 'Ferramentas de navegação e correio eletrônico' },
                { id: 'pcrs-t2-11', name: 'Hash (MD5, SHA-1, SHA-256)' },
                { id: 'pcrs-t2-12', name: 'Segurança da informação' },
                { id: 'pcrs-t2-13', name: 'Ferramentas e técnicas de segurança (antivírus, firewall, MFA)' },
                { id: 'pcrs-t2-14', name: 'Investigação de evidências digitais' },
                { id: 'pcrs-t2-15', name: 'Análise de metadados' },
                { id: 'pcrs-t2-16', name: 'Criptografia na investigação' }
            ]
        },
        {
            id: 'pcrs-d3', name: 'Raciocínio Lógico',
            topics: [
                { id: 'pcrs-t3-1', name: 'Estrutura lógica de relações arbitrárias' },
                { id: 'pcrs-t3-2', name: 'Diagramas lógicos' },
                { id: 'pcrs-t3-3', name: 'Proposições e conectivos' },
                { id: 'pcrs-t3-4', name: 'Operações lógicas sobre proposições' },
                { id: 'pcrs-t3-5', name: 'Construção de tabelas-verdade' },
                { id: 'pcrs-t3-6', name: 'Implicação lógica, equivalência lógica, Leis De Morgan' },
                { id: 'pcrs-t3-7', name: 'Argumentação e dedução lógica' },
                { id: 'pcrs-t3-8', name: 'Sentenças abertas' },
                { id: 'pcrs-t3-9', name: 'Quantificadores universal e existencial' },
                { id: 'pcrs-t3-10', name: 'Argumentos Lógicos Dedutivos; Argumentos Categóricos' }
            ]
        },
        {
            id: 'pcrs-d4', name: 'Contabilidade Geral',
            topics: [
                { id: 'pcrs-t4-1', name: 'Contabilidade Geral: Conceito, objeto e finalidade' },
                { id: 'pcrs-t4-2', name: 'Patrimônio: Ativo, Passivo e PL' },
                { id: 'pcrs-t4-3', name: 'Atos e Fatos Administrativos' },
                { id: 'pcrs-t4-4', name: 'Contas: Conceito, classificação e plano de contas' },
                { id: 'pcrs-t4-5', name: 'Escrituração e Lançamentos Contábeis' },
                { id: 'pcrs-t4-6', name: 'Balancete de Verificação' },
                { id: 'pcrs-t4-7', name: 'Demonstrações Financeiras e Apuração do Resultado' },
                { id: 'pcrs-t4-8', name: 'Provisões, Depreciação, Amortização e Exaustão' },
                // NBCs Explodidas
                { id: 'pcrs-t4-nbc-1', name: 'NBC TG Estrutura Conceitual' },
                { id: 'pcrs-t4-nbc-2', name: 'NBC TG 01 (R4) – Redução ao Valor Recuperável de Ativos' },
                { id: 'pcrs-t4-nbc-3', name: 'NBC TG 03 (R3) – Demonstração dos Fluxos de Caixa' },
                { id: 'pcrs-t4-nbc-4', name: 'NBC TG 04 (R4) – Ativo Intangível' },
                { id: 'pcrs-t4-nbc-5', name: 'NBC TG 12 (R1) – Ajuste a Valor Presente' },
                { id: 'pcrs-t4-nbc-6', name: 'NBC TG 16 (R2) – Estoques' },
                { id: 'pcrs-t4-nbc-7', name: 'NBC TG 27 (R4) – Ativo Imobilizado' }
            ]
        },
        {
            id: 'pcrs-d5', name: 'Estatística',
            topics: [
                { id: 'pcrs-t5-1', name: 'Conceitos: tipos de dados, escalas de mensuração' },
                { id: 'pcrs-t5-2', name: 'Estatística descritiva' },
                { id: 'pcrs-t5-3', name: 'Probabilidade' },
                { id: 'pcrs-t5-4', name: 'Variáveis aleatórias' },
                { id: 'pcrs-t5-5', name: 'Distribuições discretas de probabilidade' },
                { id: 'pcrs-t5-6', name: 'Distribuições contínuas de probabilidade' },
                { id: 'pcrs-t5-7', name: 'Amostragens e Distribuições amostrais' },
                { id: 'pcrs-t5-8', name: 'Testes de hipóteses' },
                { id: 'pcrs-t5-9', name: 'Correlação, regressão linear simples e múltipla' },
                { id: 'pcrs-t5-10', name: 'Números índices' },
                { id: 'pcrs-t5-11', name: 'Índices complexos de quantidade e de preços' },
                { id: 'pcrs-t5-12', name: 'Análise de séries temporais' }
            ]
        },
        {
            id: 'pcrs-d6', name: 'Direito Penal',
            topics: [
                { id: 'pcrs-t6-1', name: 'Parte Geral' },
                { id: 'pcrs-t6-2', name: 'Princípios do Direito Penal' },
                { id: 'pcrs-t6-3', name: 'Lei penal no tempo e no espaço' },
                { id: 'pcrs-t6-4', name: 'Conceito de crime e seus elementos' },
                { id: 'pcrs-t6-5', name: 'Teoria da imputação objetiva' },
                { id: 'pcrs-t6-6', name: 'Concurso de pessoas e crimes' },
                { id: 'pcrs-t6-7', name: 'Pena e Medida de segurança' },
                
                // Parte Especial Verticalizada
                { id: 'pcrs-t6-pe-1', name: 'Crimes contra a pessoa' },
                { id: 'pcrs-t6-pe-2', name: 'Crimes contra o patrimônio' },
                { id: 'pcrs-t6-pe-3', name: 'Crimes contra a propriedade imaterial' },
                { id: 'pcrs-t6-pe-4', name: 'Crimes contra a organização do trabalho' },
                { id: 'pcrs-t6-pe-5', name: 'Crimes contra o sentimento religioso e contra o respeito aos mortos' },
                { id: 'pcrs-t6-pe-6', name: 'Crimes contra a dignidade sexual' },
                { id: 'pcrs-t6-pe-7', name: 'Crimes contra a família' },
                { id: 'pcrs-t6-pe-8', name: 'Crimes contra a incolumidade pública' },
                { id: 'pcrs-t6-pe-9', name: 'Crimes contra a paz pública' },
                { id: 'pcrs-t6-pe-10', name: 'Crimes contra a fé pública' },
                { id: 'pcrs-t6-pe-11', name: 'Crimes contra a administração pública' },
                { id: 'pcrs-t6-pe-12', name: 'Crimes contra o Estado Democrático de Direito' },

                // Leis Especiais Verticalizadas
                { id: 'pcrs-t6-le-1', name: 'Lei nº 13.869/2019 – Abuso de autoridade' },
                { id: 'pcrs-t6-le-2', name: 'Lei nº 12.850/2013 – Organização criminosa' },
                { id: 'pcrs-t6-le-3', name: 'Lei nº 8.072/1990 – Crimes hediondos' },
                { id: 'pcrs-t6-le-4', name: 'Lei nº 11.343/2006 – Lei de Drogas' },
                { id: 'pcrs-t6-le-5', name: 'Lei nº 7.716/1989 – Crimes de racismo e preconceito' },
                { id: 'pcrs-t6-le-6', name: 'Lei nº 12.737/2012 – Crimes cibernéticos' },
                { id: 'pcrs-t6-le-7', name: 'Lei nº 9.605/1998 – Crimes ambientais' },
                { id: 'pcrs-t6-le-8', name: 'Lei nº 9.613/1998 – Lavagem de capitais' },
                { id: 'pcrs-t6-le-9', name: 'Lei nº 10.826/2003 – Estatuto do Desarmamento' },
                { id: 'pcrs-t6-le-10', name: 'Lei nº 8.069/1990 – Estatuto da Criança e do Adolescente (ECA)' },
                { id: 'pcrs-t6-le-11', name: 'Lei nº 10.741/2003 – Estatuto do Idoso' },
                { id: 'pcrs-t6-le-12', name: 'Lei nº 13.146/2015 – Estatuto da Pessoa com Deficiência' },
                { id: 'pcrs-t6-le-13', name: 'Lei nº 12.288/2010 – Estatuto da Igualdade Racial' },
                { id: 'pcrs-t6-le-14', name: 'Lei nº 9.455/1997 – Tortura' },
                { id: 'pcrs-t6-le-15', name: 'Lei nº 13.260/2016 – Terrorismo' },
                { id: 'pcrs-t6-le-16', name: 'Lei nº 14.344/2022 – Lei Henry Borel' },
                { id: 'pcrs-t6-le-17', name: 'Lei nº 11.340/2006 – Lei Maria da Penha' },
                { id: 'pcrs-t6-le-18', name: 'Lei nº 13.344/2016 – Tráfico de pessoas' },
                { id: 'pcrs-t6-le-19', name: 'Lei nº 9.434/1997 – Transplante de órgãos' },
                { id: 'pcrs-t6-le-20', name: 'Lei nº 9.807/1999 – Programa de Proteção à Testemunha' },
                { id: 'pcrs-t6-le-21', name: 'Lei nº 14.597/2023 – Lei Geral do Esporte' },
                { id: 'pcrs-t6-le-22', name: 'Lei nº 8.078/1990 – Código de Defesa do Consumidor' },
                { id: 'pcrs-t6-le-23', name: 'Decreto-Lei nº 3.688/1941 – Contravenções penais' },
                { id: 'pcrs-t6-le-24', name: 'Lei nº 14.133/2021 – Nova Lei de Licitações' },
                { id: 'pcrs-t6-le-25', name: 'Lei nº 1.521/1951 – Crimes contra a economia popular' },
                { id: 'pcrs-t6-le-26', name: 'Lei nº 8.137/1990 – Crimes contra a ordem tributária e relações de consumo' },
                { id: 'pcrs-t6-le-27', name: 'Lei nº 9.099/1995 – Juizados Especiais Criminais' },
                { id: 'pcrs-t6-le-28', name: 'Lei nº 9.503/1997 – Código de Trânsito Brasileiro' },
                { id: 'pcrs-t6-le-29', name: 'Lei nº 4.737/1965 – Código Eleitoral' },
                { id: 'pcrs-t6-le-30', name: 'Lei nº 9.296/1996 (Interceptação telefônica)' }
            ]
        },
        {
            id: 'pcrs-d7', name: 'Direito Processual Penal',
            topics: [
                { id: 'pcrs-t7-1', name: 'Princípios e garantias processuais penais' },
                { id: 'pcrs-t7-2', name: 'Inquérito Policial e Investigação criminal' },
                { id: 'pcrs-t7-3', name: 'Ação penal e Competência' },
                
                // Provas Detalhadas
                { id: 'pcrs-t7-prov-1', name: 'Prova: Teoria Geral' },
                { id: 'pcrs-t7-prov-2', name: 'Exame de corpo de delito e perícias' },
                { id: 'pcrs-t7-prov-3', name: 'Cadeia de custódia da prova' },
                { id: 'pcrs-t7-prov-4', name: 'Interceptação telefônica (Lei nº 9.296/1996) e Captação ambiental' },
                { id: 'pcrs-t7-prov-5', name: 'Busca e apreensão' },
                { id: 'pcrs-t7-prov-6', name: 'Infiltração de agentes' },
                
                { id: 'pcrs-t7-4', name: 'Prisão e medidas cautelares' },
                { id: 'pcrs-t7-5', name: 'Processo, procedimentos e Nulidades' },
                
                // Leis Processuais Específicas
                { id: 'pcrs-t7-lei-1', name: 'Lei nº 12.830/2013 – Investigação pelo Delegado de Polícia' },
                { id: 'pcrs-t7-lei-2', name: 'Lei nº 12.037/2009 – Identificação criminal' },
                { id: 'pcrs-t7-lei-3', name: 'Lei nº 12.654/2012 – Identificação do perfil genético' }
            ]
        },
        {
            id: 'pcrs-d8', name: 'Direito Constitucional',
            topics: [
                { id: 'pcrs-t8-1', name: 'Teoria Geral do Direito Constitucional' },
                { id: 'pcrs-t8-2', name: 'Constituição: conceito, objeto, conteúdo e classificação' },
                { id: 'pcrs-t8-3', name: 'Poder Constituinte' },
                { id: 'pcrs-t8-4', name: 'Aplicabilidade das normas constitucionais' },
                { id: 'pcrs-t8-5', name: 'Constituição da República de 1988' },
                { id: 'pcrs-t8-6', name: 'Direitos e Garantias Fundamentais' },
                { id: 'pcrs-t8-7', name: 'Direitos sociais, políticos e de nacionalidade' },
                { id: 'pcrs-t8-8', name: 'Remédios Constitucionais' },
                { id: 'pcrs-t8-9', name: 'Organização do Estado e Administração Pública' },
                { id: 'pcrs-t8-10', name: 'Poderes do Estado (Executivo, Legislativo, Judiciário)' },
                { id: 'pcrs-t8-11', name: 'Funções Essenciais à Justiça' },
                { id: 'pcrs-t8-12', name: 'Defesa do Estado e das Instituições Democráticas' },
                { id: 'pcrs-t8-13', name: 'Ordem Social' },
                { id: 'pcrs-t8-14', name: 'Constituição do Estado do Rio Grande do Sul' }
            ]
        },
        {
            id: 'pcrs-d9', name: 'Direito Administrativo',
            topics: [
                { id: 'pcrs-t9-1', name: 'Fundamentos e fontes do direito administrativo' },
                { id: 'pcrs-t9-2', name: 'Princípios da Administração Pública' },
                { id: 'pcrs-t9-3', name: 'Organização da administração pública' },
                { id: 'pcrs-t9-4', name: 'Agentes públicos' },
                { id: 'pcrs-t9-5', name: 'Atos administrativos' },
                { id: 'pcrs-t9-6', name: 'Poderes da administração pública' },
                { id: 'pcrs-t9-7', name: 'Controle da administração pública' },
                { id: 'pcrs-t9-8', name: 'Licitações e contratos administrativos (Lei 14.133/2021)' },
                { id: 'pcrs-t9-9', name: 'Serviços públicos' },
                { id: 'pcrs-t9-10', name: 'Processo administrativo' },
                { id: 'pcrs-t9-11', name: 'Lei de Acesso à Informação' },
                { id: 'pcrs-t9-12', name: 'Lei Geral de Proteção de Dados (LGPD)' },
                { id: 'pcrs-t9-13', name: 'Responsabilidade do estado' },
                { id: 'pcrs-t9-14', name: 'Lei de Improbidade Administrativa' },
                { id: 'pcrs-t9-15', name: 'Lei Anticorrupção' }
            ]
        },
        {
            id: 'pcrs-d10', name: 'Direitos Humanos',
            topics: [
                { id: 'pcrs-t10-1', name: 'Teoria geral dos direitos humanos' },
                { id: 'pcrs-t10-2', name: 'Direitos humanos fundamentais na CF/88' },
                // Tratados e Convenções Explodidos
                { id: 'pcrs-t10-int-1', name: 'Declaração Universal dos Direitos Humanos' },
                { id: 'pcrs-t10-int-2', name: 'Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial' },
                { id: 'pcrs-t10-int-3', name: 'Convenção sobre a Eliminação de Todas as Formas de Discriminação contra a Mulher' },
                { id: 'pcrs-t10-int-4', name: 'Convenção contra a Tortura e Outros Tratamentos ou Penas Cruéis, Desumanos ou Degradantes' },
                { id: 'pcrs-t10-int-5', name: 'Declaração e Plataforma de Ação de Pequim (IV Conferência Mundial sobre as Mulheres)' },
                { id: 'pcrs-t10-int-6', name: 'Convenção Interamericana contra o Racismo' },
                { id: 'pcrs-t10-int-7', name: 'Agenda 2030 e os Objetivos de Desenvolvimento Sustentável' },
                { id: 'pcrs-t10-nac-1', name: 'Programa Nacional de Direitos Humanos – PNDH-3' },
                { id: 'pcrs-t10-nac-2', name: 'Grupos em situação de vulnerabilidade e minorias' },
                { id: 'pcrs-t10-pol-1', name: 'Segurança pública e direitos humanos' },
                { id: 'pcrs-t10-pol-2', name: 'Uso da força: Portaria 4.226/2010 e Lei nº 13.060/2014' },
                { id: 'pcrs-t10-pol-3', name: 'Regras de Mandela (Tratamento de Pessoas Presas)' },
                { id: 'pcrs-t10-pol-4', name: 'Regras de Bangkok (Mulheres Presas)' }
            ]
        },
        {
            id: 'pcrs-d11', name: 'Legislação Estatutária',
            topics: [
                { id: 'pcrs-t11-1', name: 'Lei Complementar nº 10.098/1994 (Estatuto e Regime Jurídico Único dos Servidores Públicos Civis do RS)' },
                { id: 'pcrs-t11-2', name: 'Lei nº 7.366/1980 (Estatuto dos Servidores da Polícia Civil)' },
                { id: 'pcrs-t11-3', name: 'Lei Orgânica Nacional das Polícias Civis (Lei nº 14.735/2023)' }
            ]
        }
    ]
};

export const mockOab: Edital = {
    id: 'oab-45-unificado',
    name: 'OAB 45º Exame',
    disciplines: [
        {
            id: 'oab-d1', name: 'Direito Administrativo',
            topics: [
                { id: 'oab-d1-t1', name: 'Princípios, fontes e interpretação. Lei 13.655/2018 (LINDB) e LGPD' },
                { id: 'oab-d1-t2', name: 'Atividade e estrutura administrativa. Organização (Terceiro setor)' },
                { id: 'oab-d1-t3', name: 'Poderes administrativos: hierárquico, disciplinar, regulamentar e de polícia' },
                { id: 'oab-d1-t4', name: 'Atos administrativos: conceito, atributos, classificação e extinção' },
                { id: 'oab-d1-t5', name: 'Licitações e contratos (Lei 8.666/93 e Lei 14.133/2021)' },
                { id: 'oab-d1-t6', name: 'Serviços públicos (concessões, PPPs, Agências Reguladoras)' },
                { id: 'oab-d1-t7', name: 'Agentes públicos: regime jurídico, direitos e responsabilidades' },
                { id: 'oab-d1-t8', name: 'Domínio público e bens públicos' },
                { id: 'oab-d1-t9', name: 'Intervenção estatal na propriedade e no domínio econômico' },
                { id: 'oab-d1-t10', name: 'Controle da Administração Pública (Tribunal de Contas, Judiciário)' },
                { id: 'oab-d1-t11', name: 'Lei Anticorrupção e Lei de Responsabilidade das Estatais' },
                { id: 'oab-d1-t12', name: 'Improbidade administrativa (Lei 8.429/92 com alterações)' },
                { id: 'oab-d1-t13', name: 'Lei de Abuso de Autoridade' },
                { id: 'oab-d1-t14', name: 'Responsabilidade civil do Estado' },
                { id: 'oab-d1-t15', name: 'Processo administrativo e prescrição' },
                { id: 'oab-d1-t16', name: 'Ações constitucionais (MS, Habeas Data, Ação Popular)' },
                { id: 'oab-d1-t17', name: 'Estatuto da Cidade' }
            ]
        },
        // ... (outras disciplinas OAB) ...
    ]
};

export const mockCfoPmmg: Edital = {
    id: 'cfo-pmmg-2024',
    name: 'CFO PM-MG (Oficial)',
    disciplines: [
        {
            id: 'pmmg-d1', name: 'Língua Portuguesa',
            topics: [
                { id: 'pmmg-t1-1', name: 'Interpretação de textos' },
                { id: 'pmmg-t1-2', name: 'Gramática' }
            ]
        },
        {
            id: 'pmmg-d2', name: 'Direito Constitucional',
            topics: [
                { id: 'pmmg-t2-1', name: 'Direitos e Garantias Fundamentais' },
                { id: 'pmmg-t2-2', name: 'Organização do Estado' }
            ]
        }
    ]
};

export const mockPpMg: Edital = {
    id: 'pp-mg-2024',
    name: 'Polícia Penal MG',
    disciplines: [
        {
            id: 'ppmg-d1', name: 'Língua Portuguesa',
            topics: [
                { id: 'ppmg-t1-1', name: 'Compreensão de texto' },
                { id: 'ppmg-t1-2', name: 'Morfologia' }
            ]
        },
        {
            id: 'ppmg-d2', name: 'Direitos Humanos',
            topics: [
                { id: 'ppmg-t2-1', name: 'Declaração Universal dos Direitos Humanos' }
            ]
        }
    ]
};

export const mockPpSp: Edital = {
    id: 'pp-sp-2024',
    name: 'Polícia Penal SP',
    disciplines: [
        {
            id: 'ppsp-d1', name: 'Língua Portuguesa',
            topics: [
                { id: 'ppsp-t1-1', name: 'Interpretação de texto' },
                { id: 'ppsp-t1-2', name: 'Ortografia oficial' }
            ]
        },
        {
            id: 'ppsp-d2', name: 'Matemática',
            topics: [
                { id: 'ppsp-t2-1', name: 'Números inteiros e racionais' },
                { id: 'ppsp-t2-2', name: 'Regra de três simples' }
            ]
        }
    ]
};

// --- LISTA DE PRODUTOS PARA A LOJA ---
export const mockProducts: Product[] = [
    // PC-RS
    {
        id: 'prod-pcrs-apostila-portugues',
        title: 'Apostila Completa de Língua Portuguesa - PC RS',
        description: 'Material focado na banca Fundatec, com teoria e 500 questões comentadas. Cobre todos os tópicos do edital.',
        price: 29.90,
        type: 'pdf',
        editalId: 'pc-rs-2024',
        link: 'https://mpago.la/...' // Link Exemplo
    },
    {
        id: 'prod-pcrs-resumo-penal',
        title: 'Resumão Turbo: Direito Penal PC RS',
        description: 'Os pontos mais cobrados de Penal (Parte Geral e Especial) em mapas mentais e tabelas.',
        price: 19.90,
        type: 'pdf',
        editalId: 'pc-rs-2024',
        link: 'https://mpago.la/...'
    },
    {
        id: 'prod-pcrs-mentoria-redacao',
        title: 'Mentoria de Redação: Correção Individual',
        description: 'Pacote com 5 correções detalhadas de redação nos moldes da PC-RS.',
        price: 149.90,
        type: 'mentorship',
        editalId: 'pc-rs-2024',
        link: 'https://mpago.la/...'
    },

    // OAB
    {
        id: 'prod-oab-cronograma',
        title: 'Cronograma 30 Dias OAB',
        description: 'O que estudar dia a dia para ser aprovado na 1ª fase em tempo recorde.',
        price: 37.00,
        type: 'pdf',
        editalId: 'oab-45-unificado',
        link: 'https://mpago.la/...'
    },
    {
        id: 'prod-oab-etica',
        title: 'Gabaritando Ética na OAB',
        description: 'Tudo sobre o Estatuto e o Código de Ética para garantir as 8 questões da prova.',
        price: 14.90,
        type: 'pdf',
        editalId: 'oab-45-unificado',
        link: 'https://mpago.la/...'
    },

    // Genéricos (Para quando não tiver edital específico)
    {
        id: 'prod-generic-redacao',
        title: 'Guia Definitivo da Redação Nota 1000',
        description: 'Técnicas de escrita que servem para qualquer banca.',
        price: 25.90,
        type: 'pdf',
        link: 'https://mpago.la/...'
    }
];
