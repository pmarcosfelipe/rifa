export type EstadoRifa = 'disponivel' | 'reservado' | 'confirmado';

export interface RifaItem {
  numero: number;
  estado: EstadoRifa;
  nome: string | null;
  telemovel: string | null;
  grupo: string | null;
  comprovativo_url: string | null;
  data_reserva: string | null;
  data_confirmacao: string | null;
}

export interface RifaConfig {
  titulo: string;
  descricao: string;
  preco: number;
  mbwayNumero: string;
  mbwayQrCode: string;
  imagemBanner: string;
}

export interface FormDataReserva {
  nome: string;
  telemovel: string;
  grupo: string;
}
