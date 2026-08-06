'use client';

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
            <h1 className='text-2xl font-black uppercase'>Painel de Controle da Rifa</h1>
            <p className='text-xs text-[#111111]/70'>Gestão de reservas e pagamentos</p>
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
        <div className='fixed inset-0 bg-[#111111]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto'>
          <div className='bg-[#FFFFFF] text-[#111111] rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-[#E5E5E5] space-y-4 my-8 max-h-[90vh] flex flex-col'>
            {/* Cabeçalho do Modal */}
            <div className='flex justify-between items-center border-b border-[#E5E5E5] pb-3 shrink-0'>
              <h3 className='text-xl font-black'>Detalhes do Número #{itemSelecionado.numero}</h3>
              <button onClick={() => setItemSelecionado(null)} className='font-bold text-[#111111] text-2xl hover:opacity-75'>
                &times;
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className='space-y-4 overflow-y-auto pr-1 grow'>
              {/* Informações da Reserva */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-[#E5E5E5]/30 p-4 rounded-xl border border-[#E5E5E5]'>
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
                <p className='sm:col-span-2'>
                  <strong>Data da Reserva:</strong> {itemSelecionado.data_reserva ? new Date(itemSelecionado.data_reserva).toLocaleString('pt-PT') : 'N/A'}
                </p>
              </div>

              {/* Visualizador do Comprovativo (PDF ou Imagem) */}
              {itemSelecionado.comprovativo_url ? (
                <div className='pt-2'>
                  <div className='flex justify-between items-center mb-2'>
                    <strong className='text-sm'>Comprovativo Enviado:</strong>
                    <a href={itemSelecionado.comprovativo_url} target='_blank' rel='noopener noreferrer' className='text-xs text-[#C1121F] underline font-bold'>
                      Abrir num novo separador ↗
                    </a>
                  </div>

                  <div className='border-2 border-[#E5E5E5] rounded-xl overflow-hidden bg-[#111111]/5 min-h-[350px] flex items-center justify-center'>
                    {itemSelecionado.comprovativo_url.toLowerCase().includes('.pdf') ? (
                      /* Exibição em Incorporado para PDF */
                      <iframe src={`${itemSelecionado.comprovativo_url}#toolbar=0`} title={`Comprovativo do número ${itemSelecionado.numero}`} className='w-full h-[400px] border-0' />
                    ) : (
                      /* Exibição para Imagens (JPG / PNG) */
                      <img src={itemSelecionado.comprovativo_url} alt={`Comprovativo do número ${itemSelecionado.numero}`} className='max-h-[400px] w-auto object-contain mx-auto py-2' />
                    )}
                  </div>
                </div>
              ) : (
                <div className='p-4 bg-[#E5E5E5]/20 text-center rounded-xl text-xs text-[#111111]/60 font-semibold'>Nenhum comprovativo enviado até ao momento.</div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className='pt-4 border-t border-[#E5E5E5] flex flex-col gap-2 shrink-0'>
              {itemSelecionado.estado !== 'disponivel' && (
                <>
                  {itemSelecionado.estado !== 'confirmado' && (
                    <button
                      onClick={() => confirmarPagamento(itemSelecionado.numero)}
                      disabled={carregando}
                      className='w-full py-3 bg-[#111111] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90 transition-opacity'
                    >
                      {carregando ? 'A processar...' : 'Confirmar Pagamento'}
                    </button>
                  )}
                  <button
                    onClick={() => cancelarReserva(itemSelecionado.numero)}
                    disabled={carregando}
                    className='w-full py-3 bg-[#C1121F] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90 transition-opacity'
                  >
                    {carregando ? 'A processar...' : 'Cancelar Reserva'}
                  </button>
                </>
              )}
              <button onClick={() => setItemSelecionado(null)} className='w-full py-2 bg-[#E5E5E5] text-[#111111] font-bold rounded-lg hover:bg-gray-300'>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
