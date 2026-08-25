# Finanças App

Gerenciador financeiro pessoal: lançamento de receitas, despesas e investimentos,
orçamento por categoria e metas financeiras compartilhadas.

Front-end em Next.js 16 (App Router) + Tailwind 4. A API é um serviço separado.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra http://localhost:3000.

### Variáveis de ambiente

Crie um `.env.local` apontando para a API:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Sem isso o app assume `http://localhost:3001`. A mesma URL é usada pelo
WebSocket que atualiza as metas em tempo real.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção (roda o TypeScript) |
| `npm start` | Sobe o build de produção |
| `npm run lint` | ESLint |

## Estrutura

```
src/
  app/
    (admin)/         login e cadastro
    (pages)/         área logada (dashboard, receitas, despesas, ...)
  components/        um diretório por componente, com Index.tsx
  contexts/          TransactionsProvider — modal global de lançamento
  hooks/             useCategories, useLocalStore, useGoalSocket
  lib/               regras puras: categorias, orçamento, datas, moeda, CSV
  models/            tipos da API
  services/          cliente HTTP
```

### Onde ficam as coisas

- **Lançar uma transação**: `TransactionsProvider` mantém um único
  `TransactionModal` montado para todo o app. Qualquer tela abre o modal com
  `openTransaction()`; o atalho `N` faz o mesmo.
- **Recarregar listas**: o provider expõe `refreshToken`, que muda a cada
  gravação. Passe-o para `TransactionsList` e ela refaz a busca.
- **Cores**: `src/app/globals.css` define os tokens; `src/lib/transactionTheme.ts`
  diz como cada tipo de transação aparece. Não use hex solto nos componentes.
- **Categorias e orçamento**: ficam no navegador (`src/lib/storage.ts`,
  isolados por usuário) porque a API ainda não tem endpoint para eles. Para
  migrar, basta trocar o corpo das funções em `lib/categories.ts` e
  `lib/budgets.ts` — o resto do app só conhece essa interface.

## PWA

`public/manifest.json` permite instalar o app na tela inicial do celular, com
atalhos diretos para "Nova despesa" e "Nova receita".
