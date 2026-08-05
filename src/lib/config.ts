// import bcrypt from 'bcryptjs';

// export const siteConfig = {
//   title: 'Rifa Solidária',
//   description: 'A sua oportunidade de apoiar a causa com um número único e acompanhar a reserva em tempo real.',
//   price: 5,
//   currency: '€',
//   mbWayNumber: '910 907 034',
//   mbWayQrImage: '/mb-way-qr.svg',
//   bannerImage: '/raffle-banner.svg',
//   adminSecretPath: '/painel-admin',
//   adminEmail: process.env.ADMIN_EMAIL || 'admin@rifa.com',
//   adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(process.env.ADMIN_PASSWORD || '123456', 12),
// };

// export const numberPool = Array.from({ length: 100 }, (_, index) => index + 1);

import { RifaConfig } from '../types/rifa';

export const rifaConfig: RifaConfig = {
  titulo: 'Rifa Solidária',
  descricao: 'A sua oportunidade de apoiar a causa com um número único e acompanhar a reserva em tempo real.',
  preco: 5,
  mbwayNumero: '912 345 678',
  mbwayQrCode: '/mb-way-qr.svg',
  imagemBanner: '/raffle-banner.svg',
};
