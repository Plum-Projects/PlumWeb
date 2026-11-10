// Mock/default data for the Plumya project (Turkish)

import type { User, News, Ticket, CoinPackage, CreditLoad, SiteSettings } from './types';

export const defaultUsers: User[] = [
  {
    id: 'user-1',
    username: 'PlumyaAdmin',
    email: 'admin@plumya.net',
    credits: 99999,
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
    registeredAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'user-2',
    username: 'ErikKral42',
    email: 'erikkral@mail.com',
    credits: 1250,
    role: 'user',
    createdAt: '2024-06-20T14:30:00Z',
    registeredAt: '2024-06-20T14:30:00Z',
  },
  {
    id: 'user-3',
    username: 'MorSovalye',
    email: 'morsovalye@mail.com',
    credits: 340,
    role: 'user',
    createdAt: '2024-08-05T09:15:00Z',
    registeredAt: '2024-08-05T09:15:00Z',
  },
  {
    id: 'user-4',
    username: 'ElmasKazici',
    email: 'elmaskazici@mail.com',
    credits: 780,
    role: 'user',
    createdAt: '2024-09-12T18:45:00Z',
    registeredAt: '2024-09-12T18:45:00Z',
  },
  {
    id: 'user-5',
    username: 'GolgeAvcisi',
    email: 'golgeavcisi@mail.com',
    credits: 150,
    role: 'user',
    createdAt: '2024-10-01T22:00:00Z',
    registeredAt: '2024-10-01T22:00:00Z',
  },
];

export const defaultNews: News[] = [
  {
    id: 'news-1',
    title: 'Yeni Sezon Başladı! 🎉',
    content:
      'Plumya sunucusunda yepyeni bir sezon başlıyor! Tüm haritalar sıfırlandı, yeni biyomlar eklendi ve özel etkinlikler sizi bekliyor. İlk hafta içinde giriş yapan herkese 100 kredi hediye!',
    date: '2024-10-28T12:00:00Z',
    createdAt: '2024-10-28T12:00:00Z',
    author: 'PlumyaAdmin',
  },
  {
    id: 'news-2',
    title: 'SkyBlock Güncellemesi v2.0',
    content:
      'SkyBlock modumuza dev güncelleme geldi! Yeni ada temaları, özel minion sistemi, ada seviyesi yarışmaları ve otomatik çiftlik geliştirmeleri eklendi. /is komutu ile hemen keşfedin!',
    date: '2024-10-25T15:30:00Z',
    createdAt: '2024-10-25T15:30:00Z',
    author: 'PlumyaAdmin',
  },
  {
    id: 'news-3',
    title: 'Cadılar Bayramı Etkinliği 🎃',
    content:
      'Korkunç eğlence Plumya\'da! Spawn alanı balkabakları ve hayaletlerle süslendi. Özel etkinlik zindanını tamamlayarak benzersiz Cadılar Bayramı kozmetiklerini kazanın.',
    date: '2024-10-22T09:00:00Z',
    createdAt: '2024-10-22T09:00:00Z',
    author: 'PlumyaAdmin',
  },
  {
    id: 'news-4',
    title: 'Kredi Mağazası İndirimleri! 🍇',
    content:
      'Tüm coin paketlerinde bu haftaya özel %20 bonus! Erik Bahçesi ve Plumya Kralı paketlerinde ekstra avantajlar sizleri bekliyor. Kaçırmayın!',
    date: '2024-10-18T14:00:00Z',
    createdAt: '2024-10-18T14:00:00Z',
    author: 'PlumyaAdmin',
  },
];

export const defaultCoinPackages: CoinPackage[] = [
  {
    id: 'pkg-1',
    name: 'Çekirdek',
    coins: 100,
    price: 10,
    icon: 'Seedling',
  },
  {
    id: 'pkg-2',
    name: 'Fidan',
    coins: 250,
    price: 22,
    icon: 'Sprout',
  },
  {
    id: 'pkg-3',
    name: 'Erik Ağacı',
    coins: 500,
    price: 40,
    popular: true,
    icon: 'Trees',
  },
  {
    id: 'pkg-4',
    name: 'Erik Bahçesi',
    coins: 1200,
    price: 85,
    bonus: 200,
    icon: 'Sparkles',
  },
  {
    id: 'pkg-5',
    name: 'Plumya Kralı',
    coins: 3000,
    price: 180,
    bonus: 500,
    icon: 'Crown',
  },
];

export const defaultCreditLoads: CreditLoad[] = [
  {
    id: 'load-1',
    userId: 'user-2',
    username: 'ErikKral42',
    amount: 1200,
    date: '2024-10-29T16:20:00Z',
    createdAt: '2024-10-29T16:20:00Z',
  },
  {
    id: 'load-2',
    userId: 'user-4',
    username: 'ElmasKazici',
    amount: 500,
    date: '2024-10-29T14:10:00Z',
    createdAt: '2024-10-29T14:10:00Z',
  },
  {
    id: 'load-3',
    userId: 'user-3',
    username: 'MorSovalye',
    amount: 250,
    date: '2024-10-28T20:45:00Z',
    createdAt: '2024-10-28T20:45:00Z',
  },
  {
    id: 'load-4',
    userId: 'user-5',
    username: 'GolgeAvcisi',
    amount: 100,
    date: '2024-10-27T11:30:00Z',
    createdAt: '2024-10-27T11:30:00Z',
  },
  {
    id: 'load-5',
    userId: 'user-2',
    username: 'ErikKral42',
    amount: 500,
    date: '2024-10-26T19:00:00Z',
    createdAt: '2024-10-26T19:00:00Z',
  },
  {
    id: 'load-6',
    userId: 'user-4',
    username: 'ElmasKazici',
    amount: 250,
    date: '2024-10-25T08:15:00Z',
    createdAt: '2024-10-25T08:15:00Z',
  },
];

export const defaultTickets: Ticket[] = [
  {
    id: 'ticket-1',
    userId: 'user-2',
    username: 'ErikKral42',
    subject: 'Kredi yükleme gecikmesi',
    message: 'Erik Bahçesi paketi aldım fakat kredim henüz hesabıma yansımadı. Kontrol edebilir misiniz?',
    status: 'answered',
    createdAt: '2024-10-29T16:25:00Z',
    replies: [
      {
        id: 'reply-1',
        username: 'PlumyaAdmin',
        message: 'Merhaba ErikKral42, ödemeniz onaylandı ve 1400 kredi hesabınıza yüklendi. İyi oyunlar!',
        date: '2024-10-29T16:35:00Z',
        createdAt: '2024-10-29T16:35:00Z',
        isAdmin: true,
      },
    ],
  },
  {
    id: 'ticket-2',
    userId: 'user-3',
    username: 'MorSovalye',
    subject: 'Oyuncu şikayeti',
    message: 'xHacker99 isimli oyuncu hile kullanıyor. SkyBlock adasında uçarak hareket ediyor.',
    status: 'open',
    createdAt: '2024-10-27T18:00:00Z',
    replies: [],
  },
  {
    id: 'ticket-3',
    userId: 'user-4',
    username: 'ElmasKazici',
    subject: 'VIP rank hakkında',
    message: 'VIP rank ile hangi özelliklere sahip oluyoruz? Detaylı bilgi alabilir miyim?',
    status: 'closed',
    createdAt: '2024-10-20T10:00:00Z',
    replies: [
      {
        id: 'reply-2',
        username: 'PlumyaAdmin',
        message:
          'VIP rank ile özel kitlere, uçma iznine, renkli chat ve /hat komutuna erişim sağlarsınız. Detaylar için mağazamızı ziyaret edebilirsiniz.',
        date: '2024-10-20T11:00:00Z',
        createdAt: '2024-10-20T11:00:00Z',
        isAdmin: true,
      },
      {
        id: 'reply-3',
        username: 'ElmasKazici',
        message: 'Teşekkürler, çok yardımcı oldunuz!',
        date: '2024-10-20T11:30:00Z',
        createdAt: '2024-10-20T11:30:00Z',
        isAdmin: false,
      },
    ],
  },
];

export const defaultSettings: SiteSettings = {
  showRecentRegistrations: true,
  showRecentCredits: true,
  announcement: 'Plumya Sunucusuna Hoş Geldiniz! 🍇',
  serverIp: 'play.plumya.net',
  serverIP: 'play.plumya.net',
  serverPort: '25565',
  maxPlayers: 200,
  onlinePlayers: 47,
  discordServerId: '1097230283084111882',
  discordInviteUrl: 'https://discord.gg',
};
