'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { numberPool, siteConfig } from '@/lib/config';
// import type { RaffleEntry } from '@/lib/googleSheets';

// const reserveDuration = 30 * 60;
// const raffleTitle = 'Rifa Solidária';
// const raffleDescription = 'A sua oportunidade de apoiar a causa com um número único e acompanhar a reserva em tempo real.';
// const rafflePrice = 5;
// const mbWayNumber = '910 907 034';
// const mbWayQrImage = '/mb-way-qr.svg';
// const bannerImage = '/raffle-banner.svg';

// export default function Home() {
//   const [entries, setEntries] = useState<RaffleEntry[]>([]);
//   const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
//   const [form, setForm] = useState({ name: '', phone: '', group: '' });
//   const [message, setMessage] = useState('');
//   const [timer, setTimer] = useState(reserveDuration);
//   const [proofFile, setProofFile] = useState<File | null>(null);
//   const [reservedEntry, setReservedEntry] = useState<RaffleEntry | null>(null);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const refreshEntries = async () => {
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
//     void refreshEntries();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setTimer((value) => (value > 0 ? value - 1 : 0));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       refreshEntries();
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const isAvailable = (number: number) => !entries.some((entry) => entry.number === number && (entry.status === 'reserved' || entry.status === 'paid' || entry.status === 'pending'));

//   const handleReserve = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     const res = await fetch('/api/google-sheets', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ number: selectedNumber, ...form }),
//     });

//     let data: { error?: string; entry?: RaffleEntry } = {};
//     try {
//       data = await res.json();
//     } catch {
//       data = {};
//     }

//     setIsSubmitting(false);
//     if (res.ok) {
//       setReservedEntry(data.entry || null);
//       setMessage('O seu número está reservado por 30 minutos. Efetue o pagamento para garantir a reserva.');
//       setTimer(reserveDuration);
//       await refreshEntries();
//     } else {
//       setMessage(data.error || 'Não foi possível reservar.');
//     }
//   };

//   const handleUpload = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!proofFile || !reservedEntry) return;
//     const formData = new FormData();
//     formData.append('file', proofFile);
//     formData.append('number', String(reservedEntry.number));
//     const res = await fetch('/api/upload', { method: 'POST', body: formData });
//     let data: { error?: string } = {};
//     try {
//       data = await res.json();
//     } catch {
//       data = {};
//     }

//     if (res.ok) {
//       setMessage('Comprovativo enviado. A reserva continua válida e aguarda confirmação.');
//       await refreshEntries();
//     } else {
//       setMessage(data.error || 'Não foi possível enviar o comprovativo.');
//     }
//   };

//   const formatTime = (seconds: number) => {
//     const mins = Math.floor(seconds / 60)
//       .toString()
//       .padStart(2, '0');
//     const secs = (seconds % 60).toString().padStart(2, '0');
//     return `${mins}:${secs}`;
//   };

//   return (
//     <main className='min-h-screen bg-[#FFFFFF] text-[#111111]'>
//       <section className='mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-10'>
//         <div className='overflow-hidden rounded-[2rem] border border-[#E5E5E5] bg-[#111111] text-white shadow-sm'>
//           <div className='grid gap-6 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-10'>
//             <div className='flex flex-col justify-center gap-4'>
//               <p className='text-sm uppercase tracking-[0.35em] text-[#E5E5E5]'>Rifa online</p>
//               <h1 className='text-3xl font-semibold md:text-5xl'>{raffleTitle}</h1>
//               <p className='max-w-xl text-base text-[#E5E5E5]'>{raffleDescription}</p>
//               <Link
//                 href={siteConfig.adminSecretPath}
//                 className='inline-flex w-fit items-center rounded-full border border-[#E5E5E5] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10'
//               >
//                 Painel administrativo
//               </Link>
//               <div className='flex flex-wrap gap-3'>
//                 <span className='rounded-full border border-[#E5E5E5] px-4 py-2 text-sm'>Valor: {rafflePrice}€ por número</span>
//                 <span className='rounded-full bg-[#C1121F] px-4 py-2 text-sm'>100 números disponíveis</span>
//               </div>
//             </div>
//             <div className='relative h-64 overflow-hidden rounded-[1.5rem] bg-white/10 md:h-full'>
//               <Image src={bannerImage} alt='Imagem da rifa' fill className='object-cover' />
//             </div>
//           </div>
//         </div>

//         <div className='rounded-[2rem] border border-[#E5E5E5] bg-white p-4 shadow-sm md:p-8'>
//           <div className='mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between'>
//             <div>
//               <h2 className='text-2xl font-semibold'>Escolha o seu número</h2>
//               <p className='text-sm text-zinc-600'>Clique num número para reservar. Os números reservados ficam em vermelho e os pagos em preto.</p>
//             </div>
//             <div className='flex gap-2 text-sm'>
//               <span className='rounded-full border border-[#E5E5E5] px-3 py-1'>Disponível</span>
//               <span className='rounded-full bg-[#C1121F] px-3 py-1 text-white'>Reservado</span>
//               <span className='rounded-full bg-[#111111] px-3 py-1 text-white'>Pago</span>
//             </div>
//           </div>

//           <div className='grid grid-cols-5 gap-2 md:grid-cols-10'>
//             {numberPool.map((number) => {
//               const entry = entries.find((item) => item.number === number);
//               const state = entry?.status === 'paid' ? 'paid' : entry?.status === 'reserved' || entry?.status === 'pending' ? 'reserved' : 'available';
//               return (
//                 <button
//                   key={number}
//                   onClick={() => {
//                     if (state !== 'available') {
//                       setMessage('Este número já foi reservado ou vendido.');
//                       return;
//                     }
//                     setSelectedNumber(number);
//                     setMessage('');
//                   }}
//                   className={`aspect-square rounded-2xl border text-sm font-semibold transition ${state === 'paid' ? 'border-[#111111] bg-[#111111] text-white' : state === 'reserved' ? 'border-[#C1121F] bg-[#C1121F] text-white' : 'border-[#E5E5E5] bg-white text-[#111111]'}`}
//                 >
//                   {number}
//                 </button>
//               );
//             })}
//           </div>

//           {message ? <p className='mt-4 rounded-2xl border border-[#E5E5E5] bg-[#F7F7F7] p-3 text-sm'>{message}</p> : null}

//           {selectedNumber && isAvailable(selectedNumber) && !reservedEntry ? (
//             <form onSubmit={handleReserve} className='mt-6 grid gap-3 rounded-[1.5rem] border border-[#E5E5E5] bg-[#FAFAFA] p-4 md:grid-cols-2'>
//               <div className='md:col-span-2'>
//                 <h3 className='text-xl font-semibold'>Reservar o número {selectedNumber}</h3>
//                 <p className='text-sm text-zinc-600'>Preencha os dados abaixo para reservar este número por 30 minutos.</p>
//               </div>
//               <input
//                 required
//                 value={form.name}
//                 onChange={(e) => setForm({ ...form, name: e.target.value })}
//                 placeholder='Nome completo'
//                 className='rounded-2xl border border-[#E5E5E5] bg-white px-3 py-3'
//               />
//               <input
//                 required
//                 value={form.phone}
//                 onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                 placeholder='Telemóvel'
//                 className='rounded-2xl border border-[#E5E5E5] bg-white px-3 py-3'
//               />
//               <input
//                 required
//                 value={form.group}
//                 onChange={(e) => setForm({ ...form, group: e.target.value })}
//                 placeholder='Grupo'
//                 className='rounded-2xl border border-[#E5E5E5] bg-white px-3 py-3 md:col-span-2'
//               />
//               <button type='submit' disabled={isSubmitting} className='rounded-2xl bg-[#111111] px-4 py-3 font-semibold text-white md:col-span-2'>
//                 {isSubmitting ? 'A reservar...' : 'Reservar número'}
//               </button>
//             </form>
//           ) : null}

//           {reservedEntry ? (
//             <div className='mt-6 grid gap-4 rounded-[1.5rem] border border-[#E5E5E5] bg-[#FAFAFA] p-4 lg:grid-cols-[0.8fr_1.2fr]'>
//               <div className='rounded-[1.25rem] bg-[#111111] p-5 text-white'>
//                 <p className='text-sm uppercase tracking-[0.3em] text-[#E5E5E5]'>Pagamento MB Way</p>
//                 <h3 className='mt-2 text-2xl font-semibold'>{mbWayNumber}</h3>
//                 <p className='mt-3 text-sm text-[#E5E5E5]'>Valor: {rafflePrice}€</p>
//                 <div className='mt-4 flex items-center justify-center rounded-[1.25rem] bg-white p-4'>
//                   <Image src={mbWayQrImage} alt='QR Code MB Way' width={180} height={180} />
//                 </div>
//                 <button onClick={() => navigator.clipboard.writeText(mbWayNumber)} className='mt-4 w-full rounded-2xl bg-[#C1121F] px-4 py-3 font-semibold text-white'>
//                   Copiar número MB Way
//                 </button>
//               </div>
//               <div className='flex flex-col gap-3'>
//                 <div className='rounded-[1.25rem] border border-[#E5E5E5] bg-white p-4'>
//                   <p className='text-sm uppercase tracking-[0.3em] text-[#E5E5E5]'>Reserva ativa</p>
//                   <h3 className='text-xl font-semibold'>Número {reservedEntry.number}</h3>
//                   <p className='mt-2 text-sm'>
//                     Tempo restante: <span className='font-semibold'>{formatTime(timer)}</span>
//                   </p>
//                   <p className='mt-2 text-sm'>Envia o comprovativo após pagar para aguardar confirmação.</p>
//                 </div>
//                 <form onSubmit={handleUpload} className='rounded-[1.25rem] border border-[#E5E5E5] bg-white p-4'>
//                   <label className='mb-2 block text-sm font-semibold'>Enviar comprovativo</label>
//                   <input
//                     type='file'
//                     accept='image/jpeg,image/png,application/pdf'
//                     onChange={(e) => setProofFile(e.target.files?.[0] || null)}
//                     className='w-full rounded-2xl border border-[#E5E5E5] bg-[#FAFAFA] p-3'
//                   />
//                   <button type='submit' className='mt-3 w-full rounded-2xl bg-[#111111] px-4 py-3 font-semibold text-white'>
//                     Enviar comprovativo
//                   </button>
//                 </form>
//               </div>
//             </div>
//           ) : null}
//         </div>
//       </section>
//     </main>
//   );
// }

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
  const [tempoRestante, setTempoRestante] = useState<number>(1800);
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

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (etapa === 'pagamento' && tempoRestante > 0) {
      timer = setInterval(() => {
        setTempoRestante((prev) => prev - 1);
      }, 1000);
    } else if (tempoRestante === 0 && etapa === 'pagamento') {
      alert('A sua reserva de 30 minutos expirou.');
      resetarEstado();
    }
    return () => clearInterval(timer);
  }, [etapa, tempoRestante]);

  async function carregarRifas(): Promise<void> {
    const { data, error } = await supabase.from('rifas').select('*').order('numero', { ascending: true });

    if (!error && data) {
      setRifas(data as RifaItem[]);
    }
  }

  function resetarEstado(): void {
    setNumeroSelecionado(null);
    setEtapa('selecao');
    setFormData({ nome: '', telemovel: '', grupo: '' });
    setTempoRestante(1800);
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
      setTempoRestante(1800);
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
    <div className='min-h-screen bg-[#111111] text-[#FFFFFF] font-sans'>
      <header className='max-w-4xl mx-auto pt-8 px-4 text-center'>
        <div className='relative w-full h-64 md:h-80 rounded-xl overflow-hidden mb-6 border border-[#E5E5E5]/20'>
          <Image src={rifaConfig.imagemBanner} alt='Banner Rifa' layout='fill' objectFit='cover' priority />
        </div>
        <h1 className='text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-2'>{rifaConfig.titulo}</h1>
        <p className='text-[#E5E5E5] text-base md:text-lg mb-4 max-w-2xl mx-auto'>{rifaConfig.descricao}</p>
        <div className='inline-block bg-[#C1121F] text-[#FFFFFF] px-6 py-2 rounded-full font-bold text-xl shadow-lg mb-8'>Preço por número: {rifaConfig.preco}€</div>
      </header>

      <main className='max-w-4xl mx-auto px-4 pb-16'>
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
