-- Conciliación diaria automática de pagos E-pagos.
-- Programa un job que llama a la edge function `conciliar-pagos` una vez por día.
-- Usa pg_cron (scheduler) + pg_net (HTTP), ambas disponibles en Supabase.
--
-- El body vacío {} hace que la función use su rango por defecto (ayer -> hoy).
-- La anon key es pública (ya se usa en el frontend); si se prefiere, puede moverse a Vault.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Idempotente: si el job ya existe (re-aplicación de la migración), lo quita antes de recrearlo.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'conciliar-pagos-diario') then
    perform cron.unschedule('conciliar-pagos-diario');
  end if;
end $$;

-- Todos los días a las 06:00 UTC (~03:00 ART).
select cron.schedule(
  'conciliar-pagos-diario',
  '0 6 * * *',
  $$
  select net.http_post(
    url     := 'https://wmtvbbczyjdaciuzquqx.supabase.co/functions/v1/conciliar-pagos',
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtdHZiYmN6eWpkYWNpdXpxdXF4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyMDM1NzcsImV4cCI6MjA5Njc3OTU3N30.pj4_PkDuBQW81fCDa188xMch9YOPTAo9yuRUE979zTI'
    ),
    body    := '{}'::jsonb
  );
  $$
);
