# Colocar o Webinar ACEV no ar

Guia da primeira subida, com tudo nas suas contas de dev. A arquitetura é a mesma
que o projeto já pressupõe — só muda o dono de cada peça.

| Peça | Serviço | Plano | Custo |
| --- | --- | --- | --- |
| Aplicação Next.js | Vercel | Hobby | R$ 0 |
| Postgres + Realtime | Supabase | Free | R$ 0 |
| Vídeo MP4 (75 min) | Cloudflare R2 | Free tier (10 GB) | R$ 0 até ~10 GB/mês |
| Domínio | o que você já tem | — | já pago |

Tempo estimado: **40 a 60 minutos**, sendo que o upload do vídeo é a parte mais lenta.

---

## Passo 1 — Repositório na sua conta

Hoje o código está em `gurgelleonardo784-jpg/webnario`, que não é sua conta. Você
precisa de uma cópia própria, porque a Vercel vai puxar o deploy de lá e você
precisa de permissão de escrita.

Crie um repositório **vazio** (sem README, sem .gitignore) na sua conta de dev —
sugestão de nome: `webinar-acev`. Depois, aqui na pasta do projeto:

```bash
git remote rename origin antigo
git remote add origin https://github.com/SEU-USUARIO/webinar-acev.git
git push -u origin main
```

Isso mantém o histórico e deixa o repositório antigo intacto como backup. Se
preferir cortar o vínculo por completo, use *Fork* na interface do GitHub — mas
o push acima é mais limpo, porque o repositório novo nasce sem a marca de fork.

> Não crie o repositório como público sem antes conferir que `.env.local` está
> ignorado. Já está (`.gitignore` linha 7), mas confirme com `git status`.

---

## Passo 2 — Supabase

1. Em [supabase.com](https://supabase.com), entre com a sua conta de dev e crie
   um projeto novo.
   - **Região: South America (São Paulo)** — o público é brasileiro, e a latência
     do Realtime é o que dá a sensação de "ao vivo" no chat.
   - Guarde a senha do Postgres num gerenciador. Ela não é usada pela aplicação,
     mas você vai precisar dela se um dia acessar o banco direto.

2. Abra **SQL Editor → New query**, cole o conteúdo inteiro de
   [`supabase/schema.sql`](supabase/schema.sql) e rode. Isso cria as cinco
   tabelas, o RLS, os índices e as duas funções de métricas.

3. Rode **numa query separada**, uma única vez:

   ```sql
   alter publication supabase_realtime add table public.messages;
   ```

   Sem esta linha o chat não recebe nada em tempo real. É o erro mais comum
   nesta etapa, e o sintoma é traiçoeiro: o chat funciona ao recarregar a página,
   mas mensagens novas não aparecem sozinhas.

4. Em **Settings → API**, copie três valores:

   | Valor no painel | Variável |
   | --- | --- |
   | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
   | `anon` `public` | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
   | `service_role` `secret` | `SUPABASE_SERVICE_ROLE_KEY` |

   A `service_role` ignora RLS e dá acesso total ao banco. Ela nunca pode ser
   prefixada com `NEXT_PUBLIC_`, nunca vai para o navegador e nunca entra no
   repositório.

> **Atenção ao plano free:** projetos sem atividade por 7 dias são pausados. Se o
> webinar ficar semanas sem tráfego, entre no painel antes de reativar campanha —
> ou o primeiro visitante encontra o banco fora do ar.

---

## Passo 3 — Vídeo no Cloudflare R2

O vídeo é o único item com custo real de banda: 75 minutos em 1080p dá algo
entre 1 e 3 GB, multiplicado por cada espectador. R2 não cobra egress, e é por
isso que o projeto já sugere ele no campo do admin.

### Prepare o arquivo antes de subir

Este passo não é opcional. A sala posiciona o vídeo pelo relógio
(`video.currentTime = agora − início da sessão`), então **quem entra atrasado
salta direto para o meio do arquivo**. Para esse salto ser instantâneo, o índice
do MP4 precisa estar no começo do arquivo:

```bash
ffmpeg -i original.mp4 -c copy -movflags +faststart webinar.mp4
```

Sem `+faststart`, o navegador baixa o arquivo quase inteiro antes de conseguir
pular para o minuto 40 — e o espectador atrasado vê uma tela preta longa.

Confira também a **duração exata em segundos**, que você vai precisar no passo 6:

```bash
ffprobe -v error -show_entries format=duration -of csv=p=0 webinar.mp4
```

### Suba

1. Cloudflare → **R2** → *Create bucket* (ex: `acev-webinar`).
2. Faça upload do `webinar.mp4`.
3. **Settings → Public access → Allow Access** (ou conecte um domínio próprio,
   ex: `video.seudominio.com.br`, que é o recomendado para produção — o domínio
   `r2.dev` tem limite de banda e não serve para tráfego real).
4. Copie a URL pública final. Ela vai no campo *URL do vídeo* do admin.

> Alternativa mais simples se você não quiser mexer com R2: **Bunny Stream**
> (~US$ 1/mês + banda barata) entrega HLS e já resolve faststart e qualidade
> adaptativa sozinho. Mas aí o `<video>` do projeto precisaria de HLS.js — é
> código a mais. Para começar, R2 com MP4 basta.

---

## Passo 4 — Vercel

1. Entre em [vercel.com](https://vercel.com) **com o GitHub da sua conta de dev**.
2. *Add New → Project* → importe `webinar-acev`. O framework já vem detectado
   como Next.js por causa do [`vercel.json`](vercel.json).
3. Antes de clicar em Deploy, abra **Environment Variables** e cadastre as seis,
   marcando **Production, Preview e Development** em todas:

   | Variável | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | do passo 2 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | do passo 2 |
   | `SUPABASE_SERVICE_ROLE_KEY` | do passo 2 |
   | `ADMIN_EMAIL` | o e-mail com que você entra em `/admin` |
   | `ADMIN_PASSWORD_HASH` | gere: `npm run gerar-senha -- "sua-senha-forte"` |
   | `SESSION_SECRET` | gere: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

   Gere um `ADMIN_PASSWORD_HASH` e um `SESSION_SECRET` **diferentes** dos que
   estão no seu `.env.local`. O arquivo local é de teste.

4. Deploy. O build leva cerca de 1 minuto.

> Se esquecer uma variável, o app não sobe em branco: [`src/core/env.ts`](src/core/env.ts)
> derruba com uma mensagem dizendo exatamente qual falta.

---

## Passo 5 — Domínio

1. No projeto da Vercel: **Settings → Domains → Add**.
2. Digite o domínio ou subdomínio (ex: `webinar.seudominio.com.br`).
3. A Vercel mostra o registro DNS a criar no seu registrador:
   - subdomínio → um `CNAME` para `cname.vercel-dns.com`
   - domínio raiz → um registro `A` para o IP que ela indicar
4. A propagação leva de minutos a algumas horas. O SSL é emitido sozinho depois.

---

## Passo 6 — Configurar o webinar

Acesse `https://seu-dominio/admin` e entre com `ADMIN_EMAIL` e a senha que você
gerou. Na aba **Configuração**:

| Campo | O que colocar |
| --- | --- |
| Título | vira o `<title>` e o `<h1>` da landing |
| URL do vídeo | a URL pública do R2 |
| Duração do vídeo (segundos) | o valor do `ffprobe` — **precisa bater com o arquivo** |
| Sessões a cada (minutos) | 15 é o padrão. Menor = menos espera, salas mais vazias |
| Oferta aparece no segundo | o momento da virada de chave no seu roteiro |
| Selo / Headline / Texto | conteúdo da aba Oferta |
| Texto do botão | ex: `QUERO IMPLEMENTAR` |
| Link do botão | `/aplicacao` |
| Link da agenda | seu Cal.com ou Calendly |

Se a **duração** estiver errada, a sala encerra antes do vídeo acabar (ou deixa
tela preta rodando depois do fim). É o campo que mais dá problema.

### Mensagens programadas

JSON com o roteiro do apresentador no chat. Aparecem quando o vídeo atinge o
segundo indicado, e **quem entra depois não recebe** — porque já passou.

```json
[
  { "at": 60,   "name": "ACEV", "text": "Bem-vindos! Comentem de qual cidade vocês são." },
  { "at": 900,  "name": "ACEV", "text": "Quem está acompanhando até aqui, escreve NO PONTO no chat." },
  { "at": 2700, "name": "ACEV", "text": "Liberamos a condição especial — está na aba Oferta 🎁" }
]
```

Alinhe o `at` da última com o campo *Oferta aparece no segundo*.

---

## Passo 7 — Teste de ponta a ponta

Faça este roteiro **antes** de mandar tráfego. Use uma aba anônima para simular
um visitante limpo.

1. **Landing** — abra `/`. O título é o que você configurou? A foto/monograma
   aparece? O formulário recusa e-mail inválido e a caixa de consentimento é
   obrigatória?
2. **Cadastro** — envie. Você deve cair em `/sala?s=...` com contagem regressiva
   de no máximo `interval_min` minutos.
3. **Sala** — espere a sessão abrir. O vídeo começa sozinho (mudo, com o aviso
   "toque para ativar o som")? Ao tocar, o som liga?
4. **Sincronia** — abra a mesma sessão numa segunda aba anônima. As duas devem
   estar aproximadamente no mesmo segundo do vídeo.
5. **Chat** — escreva das duas abas. Cada uma vê a própria mensagem e a da outra,
   **sem recarregar**. Se não aparecer sozinho, você pulou o passo 2.3.
6. **Contador** — o número de espectadores no topo reflete as abas abertas.
7. **Moderação** — em `/admin → Chat/Moderação`, envie como apresentador (aparece
   nas duas abas, em laranja) e apague uma mensagem (some das duas na hora).
8. **Oferta** — para testar sem esperar 45 minutos, baixe temporariamente
   *Oferta aparece no segundo* para `60`. A aba Oferta deve pulsar e revelar.
9. **Aplicação** — clique no CTA, responda as 9 perguntas, confirme o botão de
   agendamento no fim.
10. **Dashboard** — em `/dashboard`, confira que os números refletem o que você
    acabou de fazer: leads, entraram na sala, chegaram na oferta, clicaram,
    aplicações.

Depois do teste, **devolva o `offer_show_at_sec` para o valor real** e apague os
dados de teste, se quiser começar limpo:

```sql
delete from events;
delete from messages;
delete from applications;
delete from leads;
```

---

## Problemas comuns

| Sintoma | Causa quase certa |
| --- | --- |
| Chat só atualiza com F5 | faltou `alter publication supabase_realtime add table public.messages` |
| Erro "Variável de ambiente ausente: X" | a variável X não foi cadastrada na Vercel |
| "Configuração do webinar não encontrada" | o `schema.sql` não foi aplicado nesse projeto do Supabase |
| Vídeo não carrega | URL do R2 não é pública, ou o bucket não permite acesso |
| Vídeo demora muito para pular para o meio | MP4 sem `-movflags +faststart` |
| Sala encerra cedo demais | `duration_sec` menor que a duração real do arquivo |
| Tudo fora do ar depois de semanas parado | projeto do Supabase pausado por inatividade |
| Dashboard com números zerados | os eventos só contam para quem tem cookie de cadastro |

---

## Depois de estar no ar

Duas coisas continuam pendentes e não dependem de infra:

- **`public/foto.jpg`** — enquanto não existir, a landing mostra o monograma
  "AC". Basta colocar o arquivo (quadrado, 52px ou maior) e dar push.
- **`/privacidade`** — faltam razão social, CNPJ e o e-mail do encarregado, além
  de revisão jurídica. O texto está em [`src/app/privacidade/page.tsx`](src/app/privacidade/page.tsx).
