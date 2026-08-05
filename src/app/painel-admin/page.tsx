'use client';

// import { useEffect, useMemo, useState } from 'react';
// import { numberPool, siteConfig } from '@/lib/config';
// import type { RaffleEntry } from '@/lib/googleSheets';

// const statusLabels = {
//   available: 'Disponível',
//   reserved: 'Reservado',
//   pending: 'Aguardando confirmação',
//   paid: 'Confirmado',
// };

// export default function AdminPage() {
//   const [loggedIn, setLoggedIn] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [entries, setEntries] = useState<RaffleEntry[]>([]);
//   const [selected, setSelected] = useState<RaffleEntry | null>(null);
//   const [search, setSearch] = useState('');
//   const [errorMessage, setErrorMessage] = useState('');

//   const loadEntries = async () => {
//     try {
//       const res = await fetch('/api/google-sheets', { cache: 'no-store' });
//       if (!res.ok) {
//         setEntries([]);
//         return;
//       }

//       const text = await res.text();
//       if (!text) {
//         setEntries([]);
//         return;
//       }

//       const data = JSON.parse(text);
//       setEntries(data.entries || []);
//     } catch {
//       setEntries([]);
//     }
//   };

//   useEffect(() => {
//     loadEntries();
//     const interval = setInterval(() => {
//       loadEntries();
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const filtered = useMemo(() => {
//     const term = search.toLowerCase();
//     return entries.filter((entry) => {
//       return [String(entry.number), entry.name, entry.phone].some((value) => value?.toLowerCase().includes(term));
//     });
//   }, [entries, search]);

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setErrorMessage('');
//     const res = await fetch('/api/admin', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ action: 'login', email, password }),
//     });

//     if (res.ok) {
//       setLoggedIn(true);
//       setPassword('');
//       await loadEntries();
//     } else {
//       setErrorMessage('Email ou palavra-passe inválidos.');
//     }
//   };

//   const changeStatus = async (id: string, status: 'paid' | 'available') => {
//     const selectedEntry = entries.find((entry) => entry.id === id || entry.number === Number(id));
//     const res = await fetch('/api/admin', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         action: 'update',
//         id,
//         number: selectedEntry?.number ?? Number(id),
//         status,
//         name: selectedEntry?.name ?? '',
//         phone: selectedEntry?.phone ?? '',
//         group: selectedEntry?.group ?? '',
//         proof_url: selectedEntry?.proof_url ?? '',
//         reserved_at: selectedEntry?.reserved_at ?? null,
//       }),
//     });

//     const data = await res.json().catch(() => ({}));

//     if (res.ok) {
//       await loadEntries();
//       setSelected(null);
//       setErrorMessage('');
//     } else {
//       setErrorMessage(data.error || 'Não foi possível atualizar o estado.');
//     }
//   };

//   if (!loggedIn) {
//     return (
//       <main className='min-h-screen bg-[#111111] p-6 text-white'>
//         <div className='mx-auto flex max-w-md flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-8 shadow-2xl'>
//           <p className='text-sm uppercase tracking-[0.3em] text-[#E5E5E5]'>Acesso seguro</p>
//           <h1 className='text-2xl font-semibold'>Painel administrativo</h1>
//           <form onSubmit={handleLogin} className='flex flex-col gap-3'>
//             <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder='Email' className='rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white' />
//             <input
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               type='password'
//               placeholder='Palavra-passe'
//               className='rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-white'
//             />
//             {errorMessage ? <p className='text-sm text-[#E5E5E5]'>{errorMessage}</p> : null}
//             <button type='submit' className='rounded-xl bg-[#C1121F] px-4 py-2 font-semibold text-white'>
//               Entrar
//             </button>
//           </form>
//         </div>
//       </main>
//     );
//   }

//   return (
//     <main className='min-h-screen bg-[#111111] p-4 text-white md:p-8'>
//       <div className='mx-auto flex max-w-7xl flex-col gap-6'>
//         <div className='flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/10 p-6 md:flex-row md:items-center md:justify-between'>
//           <div>
//             <p className='text-sm uppercase tracking-[0.3em] text-[#E5E5E5]'>Administração</p>
//             <h1 className='text-3xl font-semibold'>{siteConfig.title}</h1>
//           </div>
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder='Pesquisar por número, nome ou telemóvel'
//             className='rounded-xl border border-white/10 bg-black/30 px-3 py-2 md:w-96'
//           />
//         </div>

//         <div className='grid gap-6 lg:grid-cols-[1.6fr_0.8fr]'>
//           <div className='grid grid-cols-10 gap-2 rounded-3xl border border-white/10 bg-white/5 p-4'>
//             {numberPool.map((number) => {
//               const entry = filtered.find((item) => item.number === number) || entries.find((item) => item.number === number);
//               const stateClass =
//                 entry?.status === 'paid' ? 'bg-[#111111] text-white' : entry?.status === 'reserved' || entry?.status === 'pending' ? 'bg-[#C1121F] text-white' : 'bg-white text-[#111111]';

//               return (
//                 <button key={number} onClick={() => setSelected(entry || null)} className={`aspect-square rounded-xl border border-[#E5E5E5] p-1 text-sm font-semibold ${stateClass}`}>
//                   {number}
//                 </button>
//               );
//             })}
//           </div>

//           <aside className='rounded-3xl border border-white/10 bg-white/10 p-4'>
//             {selected ? (
//               <div className='flex flex-col gap-4'>
//                 <div>
//                   <p className='text-sm uppercase tracking-[0.3em] text-[#E5E5E5]'>Reserva selecionada</p>
//                   <h2 className='text-2xl font-semibold'>Número {selected.number}</h2>
//                 </div>
//                 <div className='rounded-2xl bg-black/20 p-3 text-sm'>
//                   <p>
//                     <strong>Nome:</strong> {selected.name || '—'}
//                   </p>
//                   <p>
//                     <strong>Telemóvel:</strong> {selected.phone || '—'}
//                   </p>
//                   <p>
//                     <strong>Grupo:</strong> {selected.group || '—'}
//                   </p>
//                   <p>
//                     <strong>Estado:</strong> {statusLabels[selected.status as keyof typeof statusLabels] || selected.status}
//                   </p>
//                   <p>
//                     <strong>Reserva:</strong> {selected.reserved_at ? new Date(selected.reserved_at).toLocaleString('pt-PT') : '—'}
//                   </p>
//                   <p>
//                     <strong>Comprovativo:</strong>{' '}
//                     {selected.proof_url ? (
//                       <a className='text-[#E5E5E5] underline' href={selected.proof_url} target='_blank'>
//                         Ver
//                       </a>
//                     ) : (
//                       'Não enviado'
//                     )}
//                   </p>
//                 </div>
//                 <div className='flex flex-col gap-2'>
//                   <button onClick={() => changeStatus(selected.id, 'paid')} className='rounded-xl bg-[#111111] px-4 py-2 font-semibold text-white'>
//                     Confirmar pagamento
//                   </button>
//                   <button onClick={() => changeStatus(selected.id, 'available')} className='rounded-xl bg-[#C1121F] px-4 py-2 font-semibold text-white'>
//                     Cancelar reserva
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className='text-sm text-[#E5E5E5]'>Clique num número para ver os detalhes da reserva.</div>
//             )}
//           </aside>
//         </div>
//       </div>
//     </main>
//   );
// }

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabaseClient';
import { RifaItem } from '../../types/rifa';

export default function PainelAdministrativo() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rifas, setRifas] = useState<RifaItem[]>([]);
  const [pesquisa, setPesquisa] = useState<string>('');
  const [itemSelecionado, setItemSelecionado] = useState<RifaItem | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) carregarRifas();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) carregarRifas();
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const channel = supabase
      .channel('admin-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rifas' }, () => {
        carregarRifas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  async function carregarRifas(): Promise<void> {
    const { data } = await supabase.from('rifas').select('*').order('numero', { ascending: true });

    if (data) setRifas(data as RifaItem[]);
  }

  async function handleLogin(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCarregando(false);
    if (error) alert('Credenciais inválidas.');
  }

  async function handleLogout(): Promise<void> {
    await supabase.auth.signOut();
  }

  async function confirmarPagamento(numero: number): Promise<void> {
    setCarregando(true);
    await supabase
      .from('rifas')
      .update({
        estado: 'confirmado',
        data_confirmacao: new Date().toISOString(),
      })
      .eq('numero', numero);

    setCarregando(false);
    setItemSelecionado(null);
    carregarRifas();
  }

  async function cancelarReserva(numero: number): Promise<void> {
    if (!confirm('Tem a certeza que deseja cancelar esta reserva e libertar o número?')) return;
    setCarregando(true);
    await supabase
      .from('rifas')
      .update({
        estado: 'disponivel',
        nome: null,
        telemovel: null,
        grupo: null,
        comprovativo_url: null,
        data_reserva: null,
        data_confirmacao: null,
      })
      .eq('numero', numero);

    setCarregando(false);
    setItemSelecionado(null);
    carregarRifas();
  }

  const rifasFiltradas = rifas.filter((item) => {
    const termo = pesquisa.toLowerCase();
    const numMatch = item.numero.toString().includes(termo);
    const nomeMatch = item.nome ? item.nome.toLowerCase().includes(termo) : false;
    const telMatch = item.telemovel ? item.telemovel.toLowerCase().includes(termo) : false;
    return numMatch || nomeMatch || telMatch;
  });

  if (!session) {
    return (
      <div className='min-h-screen bg-[#111111] flex items-center justify-center p-4'>
        <form onSubmit={handleLogin} className='bg-[#FFFFFF] text-[#111111] p-8 rounded-2xl max-w-sm w-full space-y-4 shadow-2xl'>
          <h1 className='text-2xl font-black text-center uppercase tracking-tight'>Painel Gestão</h1>
          <div>
            <label className='block text-xs font-bold uppercase mb-1'>Email</label>
            <input
              type='email'
              required
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              className='w-full border-2 border-[#E5E5E5] p-3 rounded-lg focus:outline-none focus:border-[#111111]'
            />
          </div>
          <div>
            <label className='block text-xs font-bold uppercase mb-1'>Palavra-passe</label>
            <input
              type='password'
              required
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              className='w-full border-2 border-[#E5E5E5] p-3 rounded-lg focus:outline-none focus:border-[#111111]'
            />
          </div>
          <button type='submit' disabled={carregando} className='w-full py-3 bg-[#111111] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90'>
            {carregando ? 'A entrar...' : 'Entrar'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#111111] text-[#FFFFFF] p-4 md:p-8'>
      <div className='max-w-5xl mx-auto space-y-6'>
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#FFFFFF] text-[#111111] p-6 rounded-2xl'>
          <div>
            <h1 className='text-2xl font-black uppercase'>Painel de Controlo da Rifa</h1>
            <p className='text-xs text-[#111111]/70'>Gestão simplificada de reservas e pagamentos</p>
          </div>
          <button onClick={handleLogout} className='bg-[#C1121F] text-[#FFFFFF] px-4 py-2 rounded-lg font-bold text-sm'>
            Sair
          </button>
        </div>

        <div className='bg-[#FFFFFF] p-4 rounded-xl'>
          <input
            type='text'
            placeholder='Pesquisar por número, nome ou telemóvel...'
            value={pesquisa}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPesquisa(e.target.value)}
            className='w-full border-2 border-[#E5E5E5] p-3 rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]'
          />
        </div>

        <div className='bg-[#FFFFFF] text-[#111111] p-6 rounded-2xl'>
          <div className='grid grid-cols-5 sm:grid-cols-10 gap-2'>
            {rifasFiltradas.map((item) => {
              let estiloBotao = 'bg-[#FFFFFF] text-[#111111] border-[#E5E5E5]';
              if (item.estado === 'reservado') estiloBotao = 'bg-[#C1121F] text-[#FFFFFF] border-[#C1121F]';
              if (item.estado === 'confirmado') estiloBotao = 'bg-[#111111] text-[#FFFFFF] border-[#111111]';

              return (
                <button
                  key={item.numero}
                  onClick={() => setItemSelecionado(item)}
                  className={`h-12 border-2 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${estiloBotao}`}
                >
                  {item.numero}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {itemSelecionado && (
        <div className='fixed inset-0 bg-[#111111]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-[#FFFFFF] text-[#111111] rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#E5E5E5] space-y-4'>
            <div className='flex justify-between items-center border-b border-[#E5E5E5] pb-3'>
              <h3 className='text-xl font-black'>Detalhes do Número #{itemSelecionado.numero}</h3>
              <button onClick={() => setItemSelecionado(null)} className='font-bold text-lg'>
                &times;
              </button>
            </div>

            <div className='space-y-2 text-sm'>
              <p>
                <strong>Estado:</strong> <span className='uppercase font-bold'>{itemSelecionado.estado}</span>
              </p>
              <p>
                <strong>Nome:</strong> {itemSelecionado.nome || 'N/A'}
              </p>
              <p>
                <strong>Telemóvel:</strong> {itemSelecionado.telemovel || 'N/A'}
              </p>
              <p>
                <strong>Grupo:</strong> {itemSelecionado.grupo || 'N/A'}
              </p>
              <p>
                <strong>Data da Reserva:</strong> {itemSelecionado.data_reserva ? new Date(itemSelecionado.data_reserva).toLocaleString('pt-PT') : 'N/A'}
              </p>

              {itemSelecionado.comprovativo_url && (
                <div className='pt-2'>
                  <strong>Comprovativo:</strong>
                  <div className='mt-1'>
                    <a
                      href={itemSelecionado.comprovativo_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-block bg-[#E5E5E5] text-[#111111] px-3 py-2 rounded-lg text-xs font-bold underline'
                    >
                      Ver Comprovativo Enviado
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className='pt-4 border-t border-[#E5E5E5] flex flex-col gap-2'>
              {itemSelecionado.estado !== 'disponivel' && (
                <>
                  {itemSelecionado.estado !== 'confirmado' && (
                    <button onClick={() => confirmarPagamento(itemSelecionado.numero)} disabled={carregando} className='w-full py-3 bg-[#111111] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90'>
                      Confirmar Pagamento
                    </button>
                  )}
                  <button onClick={() => cancelarReserva(itemSelecionado.numero)} disabled={carregando} className='w-full py-3 bg-[#C1121F] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90'>
                    Cancelar Reserva
                  </button>
                </>
              )}
              <button onClick={() => setItemSelecionado(null)} className='w-full py-2 bg-[#E5E5E5] text-[#111111] font-bold rounded-lg'>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
