# AprovApp - Instalação Local

## Passo 1: Instalação
1. Certifique-se de ter o [Node.js](https://nodejs.org/) instalado.
2. Abra o terminal nesta pasta.
3. Rode o comando:
   ```bash
   npm install
   ```

## Passo 2: Configuração da IA (Gemini)
1. Crie um arquivo chamado `.env` na raiz do projeto (copie o .env.example).
2. Adicione sua chave de API do Google Gemini:
   ```
   VITE_API_KEY=AIzaSy...
   ```
   (Você pega essa chave em: https://aistudio.google.com/app/apikey)

## Passo 3: Configuração do Pagamento (Plano B)
1. Abra o arquivo `components/Pricing.tsx`.
2. Procure por `const FALLBACK_LINKS`.
3. Cole os links de pagamento que você criou no painel do Mercado Pago.
   Isso garante que o pagamento funcione mesmo sem configurar o servidor complexo.

## Passo 4: Rodar
Rode o comando:
```bash
npm run dev
```
Acesse o link que aparecerá (geralmente http://localhost:5173).
