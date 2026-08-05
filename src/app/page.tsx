'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import { rifaConfig } from '../lib/config';
import { RifaItem, FormDataReserva } from '../types/rifa';

type Etapa = 'selecao' | 'formulario' | 'pagamento';

export default function Home() {
  const [rifas, setRifas] = useState<RifaItem[]>([]);
  const [numeroSelecionado, setNumeroSelecionado] = useState<number | null>(null);
  const [etapa, setEtapa] = useState<Etapa>('selecao');
  const [formData, setFormData] = useState<FormDataReserva>({ nome: '', telemovel: '', grupo: '' });
  const [tempoRestante, setTempoRestante] = useState<number>(180);
  const [ficheiro, setFicheiro] = useState<File | null>(null);
  const [carregando, setCarregando] = useState<boolean>(false);
  const [mensagemStatus, setMensagemStatus] = useState<string>('');

  useEffect(() => {
    carregarRifas();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rifas' }, () => {
        carregarRifas();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 1. Chamar a função de limpeza no Supabase via RPC quando o tempo expira no cliente
  async function libertarReservaExpirada(numero: number) {
    // Executa a função SQL remota (que tem permissões de admin)
    await supabase.rpc('limpar_reservas_expiradas');
    resetarEstado();
  }

  // 2. Temporizador ajustado
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (etapa === 'pagamento' && tempoRestante > 0) {
      timer = setInterval(() => {
        setTempoRestante((prev) => prev - 1);
      }, 1000);
    } else if (etapa === 'pagamento' && tempoRestante <= 0) {
      alert('A sua reserva de 3 minutos expirou.');

      if (numeroSelecionado) {
        libertarReservaExpirada(numeroSelecionado);
      } else {
        resetarEstado();
      }
    }

    return () => clearInterval(timer);
  }, [etapa, tempoRestante, numeroSelecionado]);

  async function carregarRifas(): Promise<void> {
    // Tenta limpar reservas expiradas antes de ir buscar os dados atualizados
    await supabase.rpc('limpar_reservas_expiradas');

    const { data, error } = await supabase.from('rifas').select('*').order('numero', { ascending: true });

    if (!error && data) {
      setRifas(data as RifaItem[]);
    }
  }

  function resetarEstado(): void {
    setNumeroSelecionado(null);
    setEtapa('selecao');
    setFormData({ nome: '', telemovel: '', grupo: '' });
    setTempoRestante(180);
    setFicheiro(null);
    setCarregando(false);
  }

  function handleCliqueNumero(item: RifaItem): void {
    if (item.estado !== 'disponivel') {
      alert('Este número já foi reservado ou vendido.');
      return;
    }
    setNumeroSelecionado(item.numero);
    setEtapa('formulario');
  }

  async function submeterFormulario(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (numeroSelecionado === null) return;

    setCarregando(true);

    const { error } = await supabase
      .from('rifas')
      .update({
        estado: 'reservado',
        nome: formData.nome,
        telemovel: formData.telemovel,
        grupo: formData.grupo,
        data_reserva: new Date().toISOString(),
      })
      .eq('numero', numeroSelecionado)
      .eq('estado', 'disponivel');

    setCarregando(false);

    if (error) {
      alert('Erro ao reservar o número. Pode já ter sido selecionado por outra pessoa.');
      resetarEstado();
    } else {
      setTempoRestante(180);
      setEtapa('pagamento');
    }
  }

  async function submeterComprovativo(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!ficheiro || numeroSelecionado === null) return;

    setCarregando(true);
    const ext = ficheiro.name.split('.').pop();
    const caminhoFicheiro = `comp_${numeroSelecionado}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage.from('comprovativos').upload(caminhoFicheiro, ficheiro);

    if (uploadError) {
      alert('Erro ao enviar o comprovativo. Tente novamente.');
      setCarregando(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('comprovativos').getPublicUrl(caminhoFicheiro);

    await supabase.from('rifas').update({ comprovativo_url: publicUrlData.publicUrl }).eq('numero', numeroSelecionado);

    setCarregando(false);
    setMensagemStatus('Comprovativo enviado com sucesso! A sua reserva está a aguardar validação.');
  }

  function formatarTempo(segundos: number): string {
    const mins = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  return (
    <div className='content-wrapper min-h-screen bg-[#111111] text-[#FFFFFF] font-sans'>
      <header className='max-w-4xl mx-auto pt-8 px-4 text-center relative z-1'>
        <div className='relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6 border border-[#E5E5E5]/20'>
          <Image src={rifaConfig.imagemBanner} alt='Banner Rifa' layout='fill' objectFit='cover' priority />
        </div>
        <h1 className='text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-2'>{rifaConfig.titulo}</h1>
        <p className='text-[#E5E5E5] text-base md:text-lg mb-4 max-w-2xl mx-auto'>{rifaConfig.descricao}</p>
        <div className='inline-block bg-[#C1121F] text-[#FFFFFF] px-6 py-2 rounded-full font-bold text-xl shadow-lg mb-8'>Preço por número: {rifaConfig.preco}€</div>
      </header>

      <div className='side-stripes stripe-left'></div>
      <div className='side-stripes stripe-left-2'></div>
      <div className='side-stripes stripe-right'></div>
      <div className='side-stripes stripe-right-2'></div>

      <main className='max-w-4xl mx-auto px-4 pb-16 relative z-1'>
        <div className='bg-[#FFFFFF] text-[#111111] p-6 rounded-2xl shadow-2xl'>
          <h2 className='text-xl font-bold mb-4 text-center uppercase tracking-wide'>Escolha o seu número (1 a 100)</h2>

          <div className='grid grid-cols-5 sm:grid-cols-10 gap-2 mb-8'>
            {rifas.map((item) => {
              let estiloBotao = 'bg-[#FFFFFF] text-[#111111] border-[#E5E5E5] hover:border-[#111111]';
              if (item.estado === 'reservado') estiloBotao = 'bg-[#C1121F] text-[#FFFFFF] border-[#C1121F]';
              if (item.estado === 'confirmado') estiloBotao = 'bg-[#111111] text-[#FFFFFF] border-[#111111] cursor-not-allowed';

              return (
                <button
                  key={item.numero}
                  onClick={() => handleCliqueNumero(item)}
                  className={`h-12 border-2 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${estiloBotao}`}
                >
                  {item.numero}
                </button>
              );
            })}
          </div>

          <div className='flex flex-wrap justify-center gap-6 pt-4 border-t border-[#E5E5E5] text-sm font-semibold'>
            <div className='flex items-center gap-2'>
              <span className='w-4 h-4 bg-[#FFFFFF] border-2 border-[#E5E5E5] rounded'></span> Disponível
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-4 h-4 bg-[#C1121F] rounded'></span> Reservado
            </div>
            <div className='flex items-center gap-2'>
              <span className='w-4 h-4 bg-[#111111] rounded'></span> Confirmado (Pago)
            </div>
          </div>
        </div>
      </main>

      {etapa !== 'selecao' && (
        <div className='fixed inset-0 bg-[#111111]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <div className='bg-[#FFFFFF] text-[#111111] rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-[#E5E5E5]'>
            {etapa === 'formulario' && (
              <div>
                <h3 className='text-2xl font-black mb-1 text-center'>Reservar Número #{numeroSelecionado}</h3>
                <p className='text-sm text-[#111111]/70 mb-6 text-center'>Preencha os dados abaixo para reservar o número.</p>
                <form onSubmit={submeterFormulario} className='space-y-4'>
                  <div>
                    <label className='block text-xs font-bold uppercase mb-1'>Nome Completo</label>
                    <input
                      type='text'
                      required
                      value={formData.nome}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, nome: e.target.value })}
                      className='w-full border-2 border-[#E5E5E5] p-3 rounded-lg focus:outline-none focus:border-[#111111]'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-bold uppercase mb-1'>Telemóvel</label>
                    <input
                      type='tel'
                      required
                      value={formData.telemovel}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, telemovel: e.target.value })}
                      className='w-full border-2 border-[#E5E5E5] p-3 rounded-lg focus:outline-none focus:border-[#111111]'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-bold uppercase mb-1'>Grupo onde recebeu a rifa</label>
                    <input
                      type='text'
                      required
                      placeholder='Ex: Família, Trabalho, Amigos'
                      value={formData.grupo}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, grupo: e.target.value })}
                      className='w-full border-2 border-[#E5E5E5] p-3 rounded-lg focus:outline-none focus:border-[#111111]'
                    />
                  </div>
                  <div className='flex gap-2 pt-2'>
                    <button type='button' onClick={resetarEstado} className='w-1/2 py-3 bg-[#E5E5E5] text-[#111111] font-bold rounded-lg hover:bg-gray-300'>
                      Cancelar
                    </button>
                    <button type='submit' disabled={carregando} className='w-1/2 py-3 bg-[#111111] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90'>
                      {carregando ? 'A processar...' : 'Continuar'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {etapa === 'pagamento' && (
              <div className='text-center'>
                <div className='bg-[#C1121F] text-[#FFFFFF] p-3 rounded-xl mb-4'>
                  <p className='text-xs font-semibold uppercase'>O seu número está reservado por 30 minutos.</p>
                  <p className='text-2xl font-mono font-black'>{formatarTempo(tempoRestante)}</p>
                </div>

                {mensagemStatus ? (
                  <div className='py-6 space-y-4'>
                    <p className='text-lg font-bold text-[#C1121F]'>{mensagemStatus}</p>
                    <button onClick={resetarEstado} className='w-full py-3 bg-[#111111] text-[#FFFFFF] font-bold rounded-lg'>
                      Voltar à Página Principal
                    </button>
                  </div>
                ) : (
                  <>
                    <h4 className='font-bold text-lg mb-2'>Pagamento por MB Way</h4>
                    <p className='text-[#111111]/70 text-sm mb-4'>
                      Valor: <strong>{rifaConfig.preco}€</strong>
                    </p>

                    <div className='relative w-40 h-40 mx-auto mb-4 border-2 border-[#E5E5E5] rounded-xl overflow-hidden p-2'>
                      <Image src={rifaConfig.mbwayQrCode} alt='QR Code MB Way' layout='fill' objectFit='contain' />
                    </div>

                    <div className='flex items-center justify-center gap-2 mb-6'>
                      <span className='font-mono font-bold text-lg bg-[#E5E5E5] px-3 py-1 rounded-lg'>{rifaConfig.mbwayNumero}</span>
                      <button onClick={() => navigator.clipboard.writeText(rifaConfig.mbwayNumero)} className='bg-[#111111] text-[#FFFFFF] text-xs font-bold px-3 py-2 rounded-lg'>
                        Copiar
                      </button>
                    </div>

                    <form onSubmit={submeterComprovativo} className='border-t border-[#E5E5E5] pt-4 text-left space-y-3'>
                      <label className='block text-xs font-bold uppercase'>Enviar Comprovativo (JPG, PNG, PDF)</label>
                      <input
                        type='file'
                        accept='image/jpeg,image/png,application/pdf'
                        required
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          if (e.target.files && e.target.files[0]) {
                            setFicheiro(e.target.files[0]);
                          }
                        }}
                        className='w-full text-sm text-[#111111] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#111111] file:text-[#FFFFFF] hover:file:opacity-80'
                      />
                      <button type='submit' disabled={carregando} className='w-full py-3 bg-[#C1121F] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90 mt-2'>
                        {carregando ? 'A enviar...' : 'Enviar Comprovativo'}
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
