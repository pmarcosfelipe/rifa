-- Ativar extensão pgcrypto
create extension if not exists pgcrypto;

-- Criar tipo enumerado para estados da rifa
create type estado_rifa as enum ('disponivel', 'reservado', 'confirmado');

-- Tabela principal de números da rifa
create table public.rifas (
    numero integer primary key check (numero >= 1 and numero <= 100),
    estado estado_rifa not null default 'disponivel',
    nome text,
    telemovel text,
    grupo text,
    comprovativo_url text,
    data_reserva timestamptz,
    data_confirmacao timestamptz
);

-- Inserir os 100 números incialmente disponíveis
insert into public.rifas (numero, estado)
select i, 'disponivel'::estado_rifa
from generate_series(1, 100) as i;

-- Ativar Row Level Security (RLS)
alter table public.rifas enable row level security;

-- Políticas de RLS
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

-- Função para libertar reservas expiradas (> 30 minutos sem confirmação)
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

-- Configurar Storage para Comprovativos (Garante que não falha se o bucket já existir)
insert into storage.buckets (id, name, public) 
values ('comprovativos', 'comprovativos', true)
on conflict (id) do nothing;

-- Remover políticas antigas se existirem para evitar duplicados
drop policy if exists "Envio público de comprovativos" on storage.objects;
drop policy if exists "Leitura pública de comprovativos" on storage.objects;

-- Criar políticas de acesso ao Storage
create policy "Envio público de comprovativos" 
on storage.objects for insert 
with check (bucket_id = 'comprovativos');

create policy "Leitura pública de comprovativos" 
on storage.objects for select 
using (bucket_id = 'comprovativos');