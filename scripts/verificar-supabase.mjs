#!/usr/bin/env node
// Verifica se o Supabase está 100% configurado para este projeto.
// Uso: npm run verificar
//
// Testa de verdade, não só a presença das variáveis: conecta, confere as
// tabelas, valida o RLS e faz um teste real de Realtime ponta a ponta —
// insere uma mensagem e espera ela voltar pelo canal.

import { createClient } from '@supabase/supabase-js';

// --- ambiente ---------------------------------------------------------------

try {
  process.loadEnvFile('.env.local');
} catch {
  console.error('\n✗ Não encontrei o arquivo .env.local na raiz do projeto.');
  console.error('  Copie o .env.example e preencha com as chaves do seu Supabase.\n');
  process.exit(1);
}

const VARIAVEIS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'ADMIN_EMAIL',
  'ADMIN_PASSWORD_HASH',
  'SESSION_SECRET',
];

const TABELAS = ['webinar_config', 'leads', 'messages', 'applications', 'events'];

// Sessão fictícia usada só pelo teste. Não colide com sessão real, que é um
// timestamp em milissegundos.
const SESSAO_TESTE = 1;

// --- relatório --------------------------------------------------------------

let falhas = 0;
let avisos = 0;

const ok = (texto, detalhe) => console.log(`  ✓ ${texto}${detalhe ? ` — ${detalhe}` : ''}`);
const falhou = (texto, comoResolver) => {
  falhas++;
  console.log(`  ✗ ${texto}`);
  if (comoResolver) console.log(`      → ${comoResolver}`);
};
const aviso = (texto, detalhe) => {
  avisos++;
  console.log(`  ! ${texto}${detalhe ? ` — ${detalhe}` : ''}`);
};
const secao = (titulo) => console.log(`\n${titulo}`);

// --- 1. variáveis -----------------------------------------------------------

secao('Variáveis de ambiente');

const ausentes = VARIAVEIS.filter((v) => !process.env[v]);

for (const v of VARIAVEIS) {
  if (process.env[v]) ok(v);
  else falhou(`${v} está vazia`, 'preencha no .env.local');
}

if (ausentes.some((v) => v.includes('SUPABASE'))) {
  console.log('\nSem as chaves do Supabase não dá para continuar os testes.\n');
  process.exit(1);
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  falhou(
    'A service_role key e a anon key estão iguais',
    'são chaves diferentes, em Settings > API. Confira qual copiou.',
  );
}

if (process.env.ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD_HASH.includes(':')) {
  falhou(
    'ADMIN_PASSWORD_HASH não está no formato salt:hash',
    'gere com: npm run gerar-senha -- "sua-senha"',
  );
}

const servidor = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const navegador = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

// --- 2. tabelas -------------------------------------------------------------

secao('Tabelas (schema.sql aplicado?)');

let schemaOk = true;

for (const tabela of TABELAS) {
  const { error, count } = await servidor
    .from(tabela)
    .select('*', { count: 'exact', head: true });

  if (error) {
    schemaOk = false;
    falhou(
      `tabela "${tabela}" não encontrada`,
      'cole supabase/schema.sql no SQL Editor do Supabase e rode',
    );
  } else {
    ok(`tabela "${tabela}"`, `${count ?? 0} linha(s)`);
  }
}

if (!schemaOk) {
  console.log('\nO schema não está aplicado. Rode supabase/schema.sql antes de continuar.\n');
  process.exit(1);
}

// --- 3. configuração do webinar ---------------------------------------------

secao('Configuração do webinar');

const { data: cfg, error: erroCfg } = await servidor
  .from('webinar_config')
  .select('*')
  .eq('id', 1)
  .single();

if (erroCfg || !cfg) {
  falhou(
    'a linha id=1 de webinar_config não existe',
    "rode: insert into public.webinar_config (id) values (1) on conflict do nothing;",
  );
} else {
  ok('linha de configuração existe');

  if (!cfg.video_url) {
    aviso('video_url ainda está vazia', 'configure em /admin antes de abrir uma sessão');
  } else {
    ok('video_url preenchida', cfg.video_url.slice(0, 60));
  }

  if (cfg.offer_show_at_sec >= cfg.duration_sec) {
    falhou(
      `a oferta aparece no segundo ${cfg.offer_show_at_sec}, mas o vídeo dura ${cfg.duration_sec}s`,
      'a oferta nunca seria revelada durante a sessão. Ajuste em /admin.',
    );
  } else {
    ok(
      'oferta dentro da duração',
      `minuto ${Math.round(cfg.offer_show_at_sec / 60)} de ${Math.round(cfg.duration_sec / 60)}`,
    );
  }

  if (!cfg.booking_url) {
    aviso('booking_url vazia', 'o fim da aplicação mostra texto no lugar do botão de agendar');
  }
}

// --- 4. RLS -----------------------------------------------------------------

secao('RLS (o navegador não pode escrever)');

const { error: erroLeituraAnon } = await navegador.from('messages').select('id').limit(1);

if (erroLeituraAnon) {
  falhou(
    'a anon key não consegue ler "messages"',
    'falta a policy "anon le mensagens". Rode o schema.sql por inteiro.',
  );
} else {
  ok('anon lê "messages"', 'necessário para o realtime do chat');
}

const { error: erroEscritaAnon } = await navegador
  .from('leads')
  .insert({ name: 'teste-rls', email: 'rls@teste.local', session_at: SESSAO_TESTE });

if (erroEscritaAnon) {
  ok('anon NÃO consegue escrever em "leads"', 'RLS protegendo como esperado');
} else {
  falhou(
    'a anon key CONSEGUIU inserir em "leads" — o RLS está aberto',
    'rode o schema.sql inteiro: falta o "enable row level security".',
  );
  await servidor.from('leads').delete().eq('email', 'rls@teste.local');
}

const { error: erroRpcAnon } = await navegador.rpc('dashboard_stats');

if (erroRpcAnon) {
  ok('anon NÃO executa dashboard_stats', 'métricas só pelo servidor');
} else {
  falhou(
    'a anon key executou dashboard_stats — as métricas estão expostas',
    'rode: revoke execute on function public.dashboard_stats() from anon, authenticated;',
  );
}

// --- 5. métricas ------------------------------------------------------------

secao('Funções de métricas');

const { data: stats, error: erroStats } = await servidor.rpc('dashboard_stats');

if (erroStats) {
  falhou(`dashboard_stats falhou: ${erroStats.message}`, 'confira se o schema.sql rodou inteiro');
} else {
  ok('dashboard_stats responde', `${stats.leads_total} lead(s) na base`);
}

// --- 6. realtime ponta a ponta ----------------------------------------------

secao('Realtime (o teste que mais falha)');

const canal = navegador.channel('verificacao_' + Date.now());

const recebida = new Promise((resolve) => {
  canal.on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: 'session_at=eq.' + SESSAO_TESTE,
    },
    () => resolve(true),
  );
});

const inscrito = await new Promise((resolve) => {
  const limite = setTimeout(() => resolve(false), 15000);
  canal.subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      clearTimeout(limite);
      resolve(true);
    }
    if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      clearTimeout(limite);
      resolve(false);
    }
  });
});

let idTeste = null;

if (!inscrito) {
  falhou(
    'não consegui abrir o canal de realtime',
    'confira a URL e a anon key, e se o projeto do Supabase não está pausado',
  );
} else {
  ok('canal aberto');

  const { data: inserida, error: erroInsert } = await servidor
    .from('messages')
    .insert({
      session_at: SESSAO_TESTE,
      name: 'verificacao',
      text: 'teste automático de realtime',
      is_host: false,
    })
    .select('id')
    .single();

  if (erroInsert) {
    falhou(`não consegui inserir a mensagem de teste: ${erroInsert.message}`);
  } else {
    idTeste = inserida.id;

    // 30s, não 12: na primeiríssima assinatura de um projeto novo o Realtime
    // precisa inicializar a replicação, e o primeiro evento demora. Timeout
    // curto aqui vira falso negativo justo no cenário mais comum — alguém
    // acabando de criar o projeto.
    const chegou = await Promise.race([
      recebida,
      new Promise((r) => setTimeout(() => r(false), 30000)),
    ]);

    if (chegou) {
      ok('a mensagem voltou pelo canal', 'o chat ao vivo vai funcionar');
    } else {
      falhou(
        'a mensagem NÃO voltou pelo canal — o chat só atualizaria com F5',
        'rode no SQL Editor: alter publication supabase_realtime add table public.messages;',
      );
    }
  }
}

// --- limpeza ----------------------------------------------------------------

if (idTeste !== null) await servidor.from('messages').delete().eq('id', idTeste);
await servidor.from('messages').delete().eq('session_at', SESSAO_TESTE);
await navegador.removeChannel(canal);

// --- veredito ---------------------------------------------------------------

console.log('\n' + '─'.repeat(60));

if (falhas === 0 && avisos === 0) {
  console.log('✓ Supabase 100% configurado. Pode rodar: npm run dev');
} else if (falhas === 0) {
  console.log(`✓ Supabase configurado, com ${avisos} aviso(s) de conteúdo a preencher em /admin.`);
} else {
  console.log(`✗ ${falhas} problema(s) a resolver${avisos ? `, e ${avisos} aviso(s)` : ''}.`);
}

console.log('─'.repeat(60) + '\n');

process.exit(falhas > 0 ? 1 : 0);
