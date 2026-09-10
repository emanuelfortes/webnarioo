# Acesso e credenciais

Onde cada peça deste projeto vive e como voltar a trabalhar nele em outra máquina.

> **Este arquivo não contém segredo nenhum, de propósito.** Ele vai para o GitHub.
> Os valores reais ficam na Vercel e no Supabase, e a seção "Máquina nova" abaixo
> mostra como puxá-los de lá sem precisar carregar nada com você.

---

## O mapa

| Peça | Serviço | Conta | Onde |
| --- | --- | --- | --- |
| Aplicação | Vercel | sua (dev) | `webnarioo.vercel.app` |
| Banco + Realtime | Supabase | org `Fortesdev` | projeto `webinar-acev`, região `sa-east-1` |
| Repositório principal | GitHub | `emanuelfortes` | `emanuelfortes/webnarioo` — a Vercel puxa daqui |
| Repositório espelho | GitHub | `gurgelleonardo784-jpg` | `gurgelleonardo784-jpg/webnario` |
| Vídeo | Cloudflare R2 | sua | (preencher quando subir) |
| Domínio | seu registrador | sua | (preencher quando apontar) |

Os dois remotes já estão configurados no repositório:

```bash
git push                  # publica no seu repo → dispara o deploy na Vercel
git push leonardo main    # sincroniza o espelho do Leonardo
```

---

## Máquina nova

Clone **o seu** repositório, não o do Leonardo: é o seu que a Vercel observa. Um
commit empurrado só para o espelho não dispara deploy nenhum, e o site fica parado
sem dar nenhum sinal do motivo.

```bash
git clone https://github.com/emanuelfortes/webnarioo.git
cd webnarioo
git remote add leonardo https://github.com/gurgelleonardo784-jpg/webnario.git
npm install
```

A terceira linha recria o segundo remote, para você continuar conseguindo atualizar
o espelho com `git push leonardo main`. Sem ela, a máquina nova só conhece o seu
repositório e o do Leonardo vai ficando para trás em silêncio.

Agora as variáveis. **Não copie na mão** — puxe da Vercel, que é a fonte da verdade:

```bash
npm install -g vercel     # global, não local: o npx dentro do projeto conflita com o lockfile
vercel login
vercel link               # escolha o projeto webnarioo
vercel env pull .env.local
```

Isso escreve um `.env.local` completo e atualizado. Confira e suba:

```bash
npm run verificar         # testa banco, RLS, métricas e realtime de verdade
npm run dev
```

Se `npm run verificar` terminar em verde, está tudo funcionando.

### Sem a CLI

Dá para montar o `.env.local` na mão a partir de dois painéis:

- **Supabase → Project Settings → API Keys**: a URL do projeto, a *Publishable key*
  (vai em `NEXT_PUBLIC_SUPABASE_ANON_KEY`) e a *Secret key* (vai em
  `SUPABASE_SERVICE_ROLE_KEY`).
- **Vercel → Settings → Environment Variables**: as outras três. Só as marcadas como
  *Config* podem ser lidas de volta; as marcadas como *Secret* não — para essas,
  gere valores novos (veja a tabela abaixo).

Use o [`.env.example`](.env.example) como molde.

---

## As seis variáveis

| Variável | Para que serve | Se você perder |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | endereço do projeto | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | só o realtime do chat; é pública por design | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **acesso total ao banco, ignora RLS** | Supabase → Settings → API (dá para rotacionar) |
| `ADMIN_EMAIL` | login do painel `/admin` | você escolhe; troque na Vercel e refaça o deploy |
| `ADMIN_PASSWORD_HASH` | hash scrypt da senha do painel | **não é recuperável** — veja abaixo |
| `SESSION_SECRET` | assina o cookie de sessão do admin | gere outro; o efeito é derrubar quem estiver logado |

### Perdeu a senha do `/admin`?

Ela não está guardada em lugar nenhum — o que existe é um hash scrypt, e scrypt é
via de mão única. Nem eu, nem a Vercel, nem o Supabase conseguem recuperá-la.
O caminho é gerar outra:

```bash
npm run gerar-senha -- "a-nova-senha"
```

Copie o valor impresso para `ADMIN_PASSWORD_HASH` na Vercel e refaça o deploy.

### Gerar um `SESSION_SECRET` novo

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Tipos na Vercel

A Vercel pede um tipo por variável, e errar aqui gera um aviso confuso:

| Variável | Type |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | **Config** |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Config** |
| as outras quatro | **Secret** |

As duas com prefixo `NEXT_PUBLIC_` são embutidas no bundle que vai para o navegador
— é o comportamento desejado, porque o chat precisa delas no cliente. Marcá-las como
*Secret* não esconde nada de ninguém; só impede **você** de lê-las depois no painel.

Que a `anon key` seja pública não é descuido: o RLS garante que com ela o navegador
só consegue `select` em `messages`. O `npm run verificar` testa isso a cada execução.

Marque sempre **Production, Preview e Development** nas seis.

---

## Depois de mudar qualquer variável

Refaça o deploy: **Vercel → Deployments → ⋯ → Redeploy**. As `NEXT_PUBLIC_*` entram
no bundle durante o build, então salvar a variável não basta — o deploy antigo
continua com o valor velho.

---

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run verificar` | testa se o Supabase está 100% configurado |
| `npm run gerar-senha -- "senha"` | gera o `ADMIN_PASSWORD_HASH` |
| `npm run build` | build de produção |
| `npm run typecheck` | TypeScript sem emitir |
| `npm run lint` | ESLint |

Ver também: [`DEPLOY.md`](DEPLOY.md) para a primeira subida e o roteiro de teste
ponta a ponta, e [`supabase/schema.sql`](supabase/schema.sql) para o banco.
