// localStorage-based store utility for Plumya

import type {
  User,
  News,
  Ticket,
  TicketReply,
  CoinPackage,
  CreditLoad,
  SiteSettings,
} from './types';
import {
  defaultUsers,
  defaultNews,
  defaultTickets,
  defaultCoinPackages,
  defaultCreditLoads,
  defaultSettings,
} from './data';

const KEYS = {
  users: 'plumya_users',
  currentUser: 'plumya_current_user',
  news: 'plumya_news',
  tickets: 'plumya_tickets',
  coinPackages: 'plumya_coin_packages',
  creditLoads: 'plumya_credit_loads',
  settings: 'plumya_settings',
  initialized: 'plumya_initialized',
} as const;

// Generic get/set helpers
function getData<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function setData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Initialize store with defaults if empty
export function initializeStore(): void {
  if (typeof window === 'undefined') return;
  const already = localStorage.getItem(KEYS.initialized);
  if (already) return;

  setData(KEYS.users, defaultUsers);
  setData(KEYS.news, defaultNews);
  setData(KEYS.tickets, defaultTickets);
  setData(KEYS.coinPackages, defaultCoinPackages);
  setData(KEYS.creditLoads, defaultCreditLoads);
  setData(KEYS.settings, defaultSettings);

  localStorage.setItem(KEYS.initialized, 'true');
}

// ─── Users ──────────────────────────────────────────────────────────

export function getUsers(): User[] {
  return getData<User[]>(KEYS.users) ?? defaultUsers;
}

export function getCurrentUser(): User | null {
  return getData<User>(KEYS.currentUser);
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    setData(KEYS.currentUser, user);
  } else {
    if (typeof window !== 'undefined') localStorage.removeItem(KEYS.currentUser);
  }
}

export function addUser(user: User): void {
  const users = getUsers();
  users.push(user);
  setData(KEYS.users, users);
}

export function updateUser(userOrId: User | string, data?: Partial<User>): void {
  const users = getUsers();
  let updatedList: User[];

  if (typeof userOrId === 'string') {
    updatedList = users.map((u) => {
      if (u.id === userOrId) {
        return { ...u, ...(data || {}) };
      }
      return u;
    });
  } else {
    updatedList = users.map((u) => (u.id === userOrId.id ? { ...u, ...userOrId } : u));
  }

  setData(KEYS.users, updatedList);

  const current = getCurrentUser();
  if (current) {
    const updatedCurrent = updatedList.find((u) => u.id === current.id);
    if (updatedCurrent) {
      setCurrentUser(updatedCurrent);
    }
  }
}

export function deleteUser(id: string): void {
  const users = getUsers().filter((u) => u.id !== id);
  setData(KEYS.users, users);
  const current = getCurrentUser();
  if (current && current.id === id) {
    setCurrentUser(null);
  }
}

// ─── News ───────────────────────────────────────────────────────────

export function getNews(): News[] {
  return getData<News[]>(KEYS.news) ?? defaultNews;
}

export function addNews(newsItem: News | Omit<News, 'id'>): void {
  const news = getNews();
  const now = new Date().toISOString();
  const fullItem: News = {
    id: 'id' in newsItem ? newsItem.id : `news-${Date.now()}`,
    title: newsItem.title,
    content: newsItem.content,
    date: newsItem.date || newsItem.createdAt || now,
    createdAt: newsItem.createdAt || newsItem.date || now,
    author: newsItem.author,
    image: newsItem.image,
  };
  news.unshift(fullItem);
  setData(KEYS.news, news);
}

export function updateNews(updatedItem: News): void {
  const news = getNews().map((n) => (n.id === updatedItem.id ? updatedItem : n));
  setData(KEYS.news, news);
}

export function deleteNews(id: string): void {
  const news = getNews().filter((n) => n.id !== id);
  setData(KEYS.news, news);
}

// ─── Tickets ────────────────────────────────────────────────────────

export function getTickets(): Ticket[] {
  return getData<Ticket[]>(KEYS.tickets) ?? defaultTickets;
}

export function addTicket(ticket: Ticket): void {
  const tickets = getTickets();
  tickets.unshift(ticket);
  setData(KEYS.tickets, tickets);
}

export function addTicketReply(ticketId: string, reply: TicketReply): void {
  const tickets = getTickets().map((t) => {
    if (t.id === ticketId) {
      return {
        ...t,
        replies: [...t.replies, reply],
        status: reply.isAdmin ? ('answered' as const) : t.status,
      };
    }
    return t;
  });
  setData(KEYS.tickets, tickets);
}

export function updateTicketStatus(ticketId: string, status: Ticket['status']): void {
  const tickets = getTickets().map((t) => {
    if (t.id === ticketId) {
      return { ...t, status };
    }
    return t;
  });
  setData(KEYS.tickets, tickets);
}

// ─── Coin Packages ──────────────────────────────────────────────────

export function getCoinPackages(): CoinPackage[] {
  return getData<CoinPackage[]>(KEYS.coinPackages) ?? defaultCoinPackages;
}

// ─── Credit Loads ───────────────────────────────────────────────────

export function getCreditLoads(): CreditLoad[] {
  return getData<CreditLoad[]>(KEYS.creditLoads) ?? defaultCreditLoads;
}

export function addCreditLoad(load: CreditLoad): void {
  const loads = getCreditLoads();
  loads.unshift(load);
  setData(KEYS.creditLoads, loads);
}

// ─── Settings ───────────────────────────────────────────────────────

export function getSettings(): SiteSettings {
  const settings = getData<SiteSettings>(KEYS.settings) ?? defaultSettings;
  const ip = settings.serverIP || settings.serverIp || 'play.plumya.net';
  return {
    ...settings,
    serverIp: ip,
    serverIP: ip,
  };
}

export function updateSettings(settings: Partial<SiteSettings>): void {
  const current = getSettings();
  const ip = settings.serverIP || settings.serverIp || current.serverIp;
  const updated: SiteSettings = {
    ...current,
    ...settings,
    serverIp: ip,
    serverIP: ip,
  };
  setData(KEYS.settings, updated);
}
