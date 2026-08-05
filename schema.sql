-- Ativar extensão pgcrypto
create extension if not exists pgcrypto;

-- Criar tipo enumerado para estados da rifa se não existir
do $$
begin
    if not exists (select 1 from pg_type where typname = 'estado_rifa') then
        create type estado_rifa as enum ('disponivel', 'reservado', 'confirmado');
    end if;
end $$;

-- Tabela principal de números da rifa (adicionado IF NOT EXISTS)
create table if not exists public.rifas (
    numero integer primary key check (numero >= 1 and numero <= 100),
    estado estado_rifa not null default 'disponivel',
    nome text,
    telemovel text,
    grupo text,
    comprovativo_url text,
    data_reserva timestamptz,
    data_confirmacao timestamptz
);

-- Inserir os 100 números inicialmente disponíveis (adicionado ON CONFLICT)
insert into public.rifas (numero, estado)
select i, 'disponivel'::estado_rifa
from generate_series(1, 100) as i
on conflict (numero) do nothing;

-- Ativar Row Level Security (RLS)
alter table public.rifas enable row level security;

-- Remover políticas antigas se existirem para evitar erros ao reexecutar
drop policy if exists "Leitura pública da rifa" on public.rifas;
drop policy if exists "Reservar número disponível" on public.rifas;
drop policy if exists "Administração total para utilizadores autenticados" on public.rifas;

-- Políticas de RLS para a tabela
create policy "Leitura pública da rifa" 
on public.rifas for select 
using (true);

create policy "Reservar número disponível" 
on public.rifas for update 
using (estado = 'disponivel')
with check (estado = 'reservado');

create policy "Administração total para utilizadores autenticados" 
on public.rifas for all 
using (auth.role() = 'authenticated');

-- Função para libertar reservas expiradas (> 3 minutos sem confirmação)
create or replace function limpar_reservas_expiradas()
returns void as $$
begin
    update public.rifas
    set 
        estado = 'disponivel',
        nome = null,
        telemovel = null,
        grupo = null,
        comprovativo_url = null,
        data_reserva = null
    where 
        estado = 'reservado' 
        and comprovativo_url is null
        and data_reserva < (now() - interval '30 minutes');
end;
$$ language plpgsql security definer;

-- Configurar Storage para Comprovativos
insert into storage.buckets (id, name, public) 
values ('comprovativos', 'comprovativos', true)
on conflict (id) do nothing;

-- Remover políticas antigas de storage
drop policy if exists "Envio público de comprovativos" on storage.objects;
drop policy if exists "Leitura pública de comprovativos" on storage.objects;

-- Criar políticas de acesso ao Storage
create policy "Envio público de comprovativos" 
on storage.objects for insert 
with check (bucket_id = 'comprovativos');

create policy "Leitura pública de comprovativos" 
on storage.objects for select 
using (bucket_id = 'comprovativos');

-- Ativar pg_cron e agendar/reagendar a limpeza
create extension if not exists pg_cron;

-- Unschedule se a tarefa já existir para evitar erro ao agendar novamente
select cron.unschedule('limpar-reservas-expiradas-job') 
where exists (select 1 from cron.job where jobname = 'limpar-reservas-expiradas-job');

select cron.schedule(
    'limpar-reservas-expiradas-job',
    '*/2 * * * *',
    $$ select limpar_reservas_expiradas(); $$
);