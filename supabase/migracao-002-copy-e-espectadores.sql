-- =============================================================================
-- Migração 002 — copy editável da landing e curva de espectadores
-- =============================================================================
-- Rode UMA VEZ no SQL Editor do Supabase, num projeto que já tenha o
-- schema.sql aplicado.
--
-- É seguro rodar de novo: todo comando usa `if not exists`.
--
-- Os defaults reproduzem exatamente os textos que hoje estão escritos no
-- código, então logo depois da migração o site continua idêntico. A partir daí
-- tudo passa a ser editável em /admin.
-- =============================================================================

alter table public.webinar_config
  add column if not exists landing_subtitle text not null default
    'Encha a agenda de consultas do seu escritório com clientes vindos do Google, sem depender de indicação e sem risco com a OAB.',

  add column if not exists author_name text not null default 'ACEV',

  add column if not exists author_bio text not null default
    'Especialistas em captação de clientes pelo Google para escritórios de advocacia: Ads, SEO e presença local',

  add column if not exists register_cta_label text not null default
    '🔴 Garantir minha vaga na próxima sessão',

  add column if not exists consent_text text not null default
    'Autorizo a ACEV a usar meus dados para me dar acesso a esta sessão e entrar em contato sobre os serviços apresentados. Posso pedir a exclusão a qualquer momento.',

  add column if not exists footer_text text not null default
    'ACEV · Todos os direitos reservados',

  -- Curva de espectadores: [{"at": segundos, "n": pessoas}], interpolada
  -- linearmente entre os pontos e somada à presença real da sala.
  -- Vazia = só a presença real.
  add column if not exists viewers_curve jsonb not null default '[]'::jsonb;

-- --- Conferência -------------------------------------------------------------
-- Deve listar as sete colunas novas.

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'webinar_config'
  and column_name in (
    'landing_subtitle', 'author_name', 'author_bio', 'register_cta_label',
    'consent_text', 'footer_text', 'viewers_curve'
  )
order by column_name;
