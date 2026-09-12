-- =============================================================================
-- Webinar ACEV — schema completo
-- =============================================================================
-- Este arquivo é a fonte da verdade do banco. Rode no SQL Editor do Supabase.
--
-- MODELO DE SEGURANÇA
-- O navegador nunca escreve no banco. Toda mutação passa por Server Action do
-- Next.js usando a service_role key, que roda apenas no servidor.
--
-- A anon key continua indo para o navegador, mas com um único poder: SELECT em
-- `messages`, necessário para a assinatura de realtime do chat. Qualquer outra
-- operação com a anon key é negada pelo RLS.
-- =============================================================================

-- --- Tabelas -----------------------------------------------------------------

create table if not exists public.webinar_config (
  id                 int primary key default 1,
  title              text    not null default 'Webinar',
  video_url          text    not null default '',
  duration_sec       int     not null default 4500,
  interval_min       int     not null default 15,
  offer_show_at_sec  int     not null default 2700,
  offer_title        text    not null default 'OFERTA ESPECIAL',
  offer_headline     text    not null default '',
  offer_text         text    not null default '',
  cta_label          text    not null default 'QUERO IMPLEMENTAR',
  cta_url            text    not null default '/aplicacao',
  booking_url        text    not null default '',
  -- [{"at": segundos, "name": "quem", "text": "...", "host": false}]
  scheduled_messages jsonb   not null default '[]'::jsonb,

  -- Copy da landing de captação. Editável em /admin.
  landing_subtitle   text    not null default 'Encha a agenda de consultas do seu escritório com clientes vindos do Google, sem depender de indicação e sem risco com a OAB.',
  author_name        text    not null default 'ACEV',
  author_bio         text    not null default 'Especialistas em captação de clientes pelo Google para escritórios de advocacia: Ads, SEO e presença local',
  register_cta_label text    not null default '🔴 Garantir minha vaga na próxima sessão',
  consent_text       text    not null default 'Autorizo a ACEV a usar meus dados para me dar acesso a esta sessão e entrar em contato sobre os serviços apresentados. Posso pedir a exclusão a qualquer momento.',
  footer_text        text    not null default 'ACEV · Todos os direitos reservados',

  -- Curva de espectadores: [{"at": segundos, "n": pessoas}]. Interpolada entre
  -- os pontos e somada à presença real. Vazia = só a presença real.
  viewers_curve      jsonb   not null default '[]'::jsonb,

  constraint webinar_config_singleton check (id = 1)
);

insert into public.webinar_config (id) values (1) on conflict (id) do nothing;

create table if not exists public.leads (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name       text        not null,
  email      text        not null,
  whatsapp   text,
  session_at bigint      not null,
  -- A4 da auditoria: registro do consentimento de LGPD.
  consent_at timestamptz
);

create table if not exists public.messages (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  session_at bigint      not null,
  lead_id    uuid        references public.leads (id) on delete set null,
  name       text        not null,
  text       text        not null,
  is_host    boolean     not null default false
);

create table if not exists public.applications (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  -- B7 da auditoria: sem estas duas colunas não há como atribuir a aplicação
  -- a um lead ou a uma sessão, e o funil vira cruzamento sem chave.
  lead_id      uuid references public.leads (id) on delete set null,
  session_at   bigint,
  name         text,
  area         text,
  cidade       text,
  tempo        text,
  faturamento  text,
  investimento text,
  dificuldade  text,
  pronto       text,
  whatsapp     text
);

create table if not exists public.events (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  lead_id    uuid        not null references public.leads (id) on delete cascade,
  session_at bigint      not null,
  type       text        not null check (type in ('room_enter', 'watch', 'offer_view', 'offer_click')),
  value      int
);

-- Um lead conta uma vez por marco. Torna a contagem idempotente no banco, e não
-- só no localStorage do navegador (A3 da auditoria).
create unique index if not exists events_dedup
  on public.events (lead_id, session_at, type, coalesce(value, -1));

create index if not exists messages_session_idx on public.messages (session_at, id);
create index if not exists leads_session_idx    on public.leads (session_at);
create index if not exists events_session_idx   on public.events (session_at, type);

-- --- RLS ---------------------------------------------------------------------
-- Padrão: nega tudo. A service_role ignora RLS por definição, então o servidor
-- continua com acesso completo sem precisar de policy.

alter table public.webinar_config enable row level security;
alter table public.leads          enable row level security;
alter table public.messages       enable row level security;
alter table public.applications   enable row level security;
alter table public.events         enable row level security;

drop policy if exists "anon le mensagens" on public.messages;

-- Única permissão concedida ao navegador: ler o chat, para o realtime.
create policy "anon le mensagens"
  on public.messages for select
  to anon, authenticated
  using (true);

-- --- Privilégios de tabela ---------------------------------------------------
-- A policy do RLS sozinha não basta: o Postgres exige TAMBÉM o grant de tabela.
-- Explicitar os dois aqui deixa o schema independente da opção "Automatically
-- expose new tables" do painel do Supabase — com ela ligada ou desligada, o
-- resultado é o mesmo, e é este.
--
-- A service_role não é afetada por nada abaixo: ela continua com acesso total.

revoke all on public.webinar_config from anon, authenticated;
revoke all on public.leads          from anon, authenticated;
revoke all on public.messages       from anon, authenticated;
revoke all on public.applications   from anon, authenticated;
revoke all on public.events         from anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.messages to anon, authenticated;

-- --- Métricas do dashboard ---------------------------------------------------

-- Distribuição de respostas da aplicação, por coluna.
create or replace function public.dist(col text)
returns jsonb
language plpgsql
stable
set search_path = public
as $fn$
declare
  result jsonb;
begin
  if col not in ('area', 'faturamento', 'investimento', 'pronto') then
    raise exception 'coluna nao permitida: %', col;
  end if;

  execute format(
    'select coalesce(jsonb_agg(jsonb_build_object(''k'', k, ''n'', n) order by n desc), ''[]''::jsonb)
     from (select %I as k, count(*) as n from applications where %I is not null group by 1) t',
    col, col
  ) into result;

  return result;
end
$fn$;

create or replace function public.dashboard_stats()
returns jsonb
language sql
stable
set search_path = public
as $fn$
  select jsonb_build_object(
    'leads_total', (select count(*) from leads),

    'leads_by_day', (
      select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n) order by d), '[]'::jsonb)
      from (
        select to_char(created_at at time zone 'America/Sao_Paulo', 'YYYY-MM-DD') as d,
               count(*) as n
        from leads
        where created_at >= now() - interval '14 days'
        group by 1
      ) t
    ),

    'room_viewers', (select count(distinct lead_id) from events where type = 'room_enter'),

    'watch', (
      select coalesce(jsonb_agg(jsonb_build_object('sec', value, 'n', n) order by value), '[]'::jsonb)
      from (
        select value, count(distinct lead_id) as n
        from events
        where type = 'watch' and value is not null
        group by value
      ) t
    ),

    'offer_views',  (select count(distinct lead_id) from events where type = 'offer_view'),
    'offer_clicks', (select count(distinct lead_id) from events where type = 'offer_click'),
    'apps_total',   (select count(*) from applications),

    'apps_area',         public.dist('area'),
    'apps_faturamento',  public.dist('faturamento'),
    'apps_investimento', public.dist('investimento'),
    'apps_pronto',       public.dist('pronto'),

    'sessions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        's', s, 'entered', entered, 'reached_offer', reached_offer, 'clicked', clicked
      ) order by s desc), '[]'::jsonb)
      from (
        select session_at as s,
               count(distinct lead_id) filter (where type = 'room_enter')  as entered,
               count(distinct lead_id) filter (where type = 'offer_view')  as reached_offer,
               count(distinct lead_id) filter (where type = 'offer_click') as clicked
        from events
        group by session_at
        order by session_at desc
        limit 20
      ) t
    )
  );
$fn$;

-- Só o servidor lê métricas.
revoke execute on function public.dashboard_stats() from anon, authenticated;
revoke execute on function public.dist(text)        from anon, authenticated;

-- --- Realtime ----------------------------------------------------------------
-- Rode uma vez. Se a tabela já estiver na publicação, o Postgres avisa e segue.
-- alter publication supabase_realtime add table public.messages;
