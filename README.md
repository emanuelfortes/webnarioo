# Webinar ACEV

Funil de webinar "just-in-time": o visitante se cadastra, recebe um horário de sessão calculado
por intervalo fixo e entra numa sala onde um vídeo gravado é sincronizado pelo relógio — com chat
ao vivo, mensagens programadas do apresentador e uma oferta que abre num minuto definido.

**Next.js 16 · React 19 · TypeScript · Tailwind 3 · Supabase (Postgres + Realtime)**

---

## Como rodar

```bash
npm install
cp .env.example .env.local     # preencha os valores
npm run gerar-senha -- "sua-senha-do-admin"
npm run dev
```

Antes do primeiro `npm run dev`, aplique o schema: abra o **SQL Editor** do seu projeto no
Supabase, cole o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e execute. Depois rode
uma vez, separadamente:

```sql
alter publication supabase_realtime add table public.messages;
```

### Variáveis de ambiente

| Variável | Onde vive | Para quê |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | servidor + navegador | endereço do projeto |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | navegador | apenas o realtime do chat |
| `SUPABASE_SERVICE_ROLE_KEY` | **só servidor** | todas as leituras e escritas |
| `ADMIN_EMAIL` | servidor | login do painel |
| `ADMIN_PASSWORD_HASH` | servidor | hash scrypt, gerado por `npm run gerar-senha` |
| `SESSION_SECRET` | servidor | assina o cookie de sessão do admin |

Gere o `SESSION_SECRET` com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Coloque também a foto do bloco de autoridade em `public/foto.jpg`.

---

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção |
| `npm run start` | sobe o build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sem emitir |
| `npm run gerar-senha -- "senha"` | gera o `ADMIN_PASSWORD_HASH` |

---

## Arquitetura

O código é dividido em **cinco módulos de produto** — um por etapa do funil, que também é uma rota —
e um **núcleo** compartilhado.

```
src/
├── app/                 rotas (App Router): só compõem módulos
├── core/                autenticação, banco, tipos, formatação
└── modules/
    ├── captacao/        /            cadastro do lead
    ├── sala/            /sala        vídeo, chat, presença, oferta
    ├── aplicacao/       /aplicacao   questionário de qualificação
    ├── metricas/        /dashboard   funil e retenção
    └── administracao/   /admin       configuração, leads, moderação
```

Cada módulo de produto tem sempre o mesmo formato interno:

| Arquivo | Roda onde | Papel |
| --- | --- | --- |
| `actions.ts` | servidor | mutações (`'use server'`) |
| `queries.ts` | servidor | leituras (`import 'server-only'`) |
| `components/` | navegador | interface |
| `hooks/` | navegador | estado de cliente |

### A fronteira de segurança

Esta é a decisão que organiza todo o resto: **o navegador não escreve no banco.**

- `core/db/server.ts` carrega a `service_role` key e começa com `import 'server-only'` — se algum
  componente de cliente importar esse módulo, o build falha. A garantia é mecânica, não disciplinar.
- `core/db/browser.ts` carrega a `anon` key, cujo único poder no RLS é `select` em `messages`,
  necessário para a assinatura de realtime do chat.
- Toda ação de `/admin` e `/dashboard` passa por `exigirAdmin()`, que valida um cookie httpOnly
  assinado. Não é condicional de renderização: chamar a API direto não contorna nada.

O RLS que sustenta isso está versionado em [`supabase/schema.sql`](supabase/schema.sql).

### Por que o Supabase continua aqui

Só por duas coisas: **Realtime** (chat) e **Presence** (contador de espectadores). Uma função
serverless não segura uma conexão aberta pelos 75 minutos de uma sessão, e Postgres puro não faz
broadcast. O banco em si poderia ser trocado sem tocar nos módulos — todo o acesso está concentrado
em `queries.ts` e `actions.ts`.

---

## O que ainda falta

- **Testes.** Não há nenhum. A lógica temporal (`useSessionClock`, marcos de retenção, disparo das
  mensagens programadas) é o candidato óbvio para os primeiros.
- **Política de privacidade.** `/privacidade` descreve corretamente o que o sistema coleta, mas
  faltam a razão social, o CNPJ e o e-mail do encarregado — e uma revisão jurídica.
- **`public/foto.jpg`** ainda não existe.
