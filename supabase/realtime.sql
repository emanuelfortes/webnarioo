-- Rode UMA VEZ, depois do schema.sql, numa query separada.
-- Sem esta linha o chat não recebe mensagens em tempo real: elas só aparecem
-- quando o visitante recarrega a página.
--
-- Se a tabela já estiver na publicação, o Postgres avisa e você pode ignorar.

alter publication supabase_realtime add table public.messages;
