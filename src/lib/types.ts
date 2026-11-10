// All TypeScript types for the Plumya project

export interface User {
  id: string;
  username: string;
  email: string;
  credits: number;
  role: 'user' | 'admin' | 'moderator';
  createdAt: string;
  registeredAt?: string;
  avatar?: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt?: string;
  author: string;
  image?: string;
}

export interface TicketReply {
  id: string;
  username: string;
  message: string;
  date: string;
  createdAt?: string;
  isAdmin: boolean;
}

export interface Ticket {
  id: string;
  userId: string;
  username: string;
  subject: string;
  message: string;
  status: 'open' | 'answered' | 'closed';
  createdAt: string;
  replies: TicketReply[];
}

export interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus?: number;
  popular?: boolean;
  icon: string;
}

export interface CreditLoad {
  id: string;
  userId?: string;
  username: string;
  amount: number;
  date: string;
  createdAt?: string;
}

export interface SiteSettings {
  siteName?: string;
  backgroundImage?: string;
  panelOpacity?: number;
  showNews?: boolean;
  showRecentRegistrations: boolean;
  showRecentCredits: boolean;
  announcement: string;
  serverIp: string;
  serverIP?: string;
  serverPort: string;
  maxPlayers: number;
  onlinePlayers: number;
  discordServerId?: string;
  discordInviteUrl?: string;
}
