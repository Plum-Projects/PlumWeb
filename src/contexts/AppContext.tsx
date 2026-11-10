"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { getSiteData } from '@/lib/site-data';
import type {
  User,
  News,
  Ticket,
  TicketReply,
  CoinPackage,
  CreditLoad,
  SiteSettings,
} from '@/lib/types';

export interface AppContextType {
  // Auth
  currentUser: User | null;
  login: (username: string, password?: string) => Promise<boolean> | boolean;
  logout: () => Promise<void> | void;
  register: (username: string, email: string, password?: string) => Promise<boolean> | boolean;

  // Data
  users: Pick<User, 'id' | 'username' | 'createdAt' | 'registeredAt'>[];
  news: News[];
  tickets: Ticket[];
  coinPackages: CoinPackage[];
  creditLoads: CreditLoad[];
  topSupporters: { username: string; amount: number }[];
  settings: SiteSettings;

  // Actions
  refreshData: () => void;
  updateSettings: (settings: Partial<SiteSettings>) => Promise<void> | void;
  addNews: (newsItem: News | Omit<News, 'id'>) => Promise<void> | void;
  deleteNews: (id: string) => Promise<void> | void;
  addTicket: (ticket: Ticket | { subject: string; message: string }) => Promise<void> | void;
  addTicketReply: (ticketId: string, reply: TicketReply | string) => Promise<void> | void;
  updateTicketStatus: (ticketId: string, status: Ticket['status'] | string) => Promise<void> | void;
  updateUser: (userOrId: User | string, data?: Partial<User>) => Promise<void> | void;
  deleteUser: (id: string) => Promise<void> | void;

  // State
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, initialData }: { children: React.ReactNode; initialData?: Awaited<ReturnType<typeof getSiteData>> }) {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<AppContextType['users']>(initialData?.recentUsers ?? []);
  const [news, setNews] = useState<News[]>(initialData?.news ?? []);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>(initialData?.coinPackages ?? []);
  const [topSupporters, setTopSupporters] = useState<AppContextType['topSupporters']>(initialData?.topSupporters ?? []);
  const [creditLoads, setCreditLoads] = useState<CreditLoad[]>(initialData?.recentCredits ?? []);
  const [settings, setSettings] = useState<SiteSettings>(initialData?.settings ?? {
    showRecentRegistrations: true,
    showRecentCredits: true,
    announcement: '',
    serverIp: 'play.plumya.net',
    serverIP: 'play.plumya.net',
    serverPort: '25565',
    maxPlayers: 200,
    onlinePlayers: 47,
    discordServerId: '1097230283084111882',
    discordInviteUrl: 'https://discord.gg',
  });

  // Load session and public content from the server.
  const refreshData = useCallback(async () => {
    try {
      const [meRes, dataRes] = await Promise.all([
        fetch('/api/auth/me', { cache: 'no-store' }).catch(() => null),
        fetch('/api/data', { cache: 'no-store' }).catch(() => null),
      ]);

      if (meRes && meRes.ok) {
        const meData = await meRes.json();
        if (meData.authenticated && meData.user) {
          setCurrentUser(meData.user);
        } else {
          setCurrentUser(null);
        }
      }

      if (dataRes && dataRes.ok) {
        const data = await dataRes.json();
        if (data.success) {
          if (data.settings) {
            setSettings(data.settings);
          }
          if (Array.isArray(data.news)) {
            setNews(data.news);
          }
          if (Array.isArray(data.coinPackages)) {
            setCoinPackages(data.coinPackages);
          }
          if (Array.isArray(data.recentUsers)) {
            setUsers(data.recentUsers);
          }
          if (Array.isArray(data.topSupporters)) setTopSupporters(data.topSupporters);
          if (Array.isArray(data.recentCredits)) {
            setCreditLoads(data.recentCredits);
          }
        }
      }

      // Fetch tickets if logged in
      const ticketsRes = await fetch('/api/tickets').catch(() => null);
      if (ticketsRes && ticketsRes.ok) {
        const tData = await ticketsRes.json();
        if (tData.success && tData.tickets) {
          setTickets(tData.tickets);
        }
      }
    } catch {
      // Keep the last successfully loaded server data.
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    refreshData().finally(() => setLoading(false));
  }, [refreshData]);

  // Auth functions with Backend API
  const login = useCallback(
    async (username: string, password = ''): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            refreshData();
            return true;
          }
        }
      } catch {
        return false;
      }
      return false;
    },
    [refreshData]
  );

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setCurrentUser(null);
    window.location.href = '/';
  }, []);

  const register = useCallback(
    async (username: string, email: string, password = ''): Promise<boolean> => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setCurrentUser(data.user);
            refreshData();
            return true;
          }
        }
      } catch {
        return false;
      }
      return false;
    },
    [refreshData]
  );

  // Data action wrappers
  const handleUpdateSettings = useCallback(
    async (newSettings: Partial<SiteSettings>) => {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      const data = await response.json();
      if (!response.ok || !data.settings) throw new Error(data.error || 'Ayarlar kaydedilemedi.');
      setSettings(data.settings);
    },
    []
  );

  const mutate = useCallback(async (url: string, method: string, body?: object) => {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.error || "İşlem tamamlanamadı.");
    }
    await refreshData();
  }, [refreshData]);

  const handleAddNews = (newsItem: News | Omit<News, "id">) => mutate("/api/admin/news", "POST", newsItem);
  const handleDeleteNews = (id: string) => mutate(`/api/admin/news?id=${encodeURIComponent(id)}`, "DELETE");
  const handleAddTicket = (ticket: Ticket | { subject: string; message: string }) =>
    mutate("/api/tickets", "POST", { subject: ticket.subject, message: ticket.message });
  const handleAddTicketReply = (ticketId: string, reply: TicketReply | string) =>
    mutate(`/api/tickets/${encodeURIComponent(ticketId)}/reply`, "POST", { message: typeof reply === "string" ? reply : reply.message });
  const handleUpdateTicketStatus = (id: string, status: string) => mutate("/api/admin/tickets", "PUT", { id, status });
  const handleUpdateUser = (userOrId: User | string, data?: Partial<User>) => {
    const id = typeof userOrId === "string" ? userOrId : userOrId.id;
    const changes = typeof userOrId === "string" ? data : userOrId;
    return mutate("/api/admin/users", "PUT", { ...changes, id });
  };
  const handleDeleteUser = (id: string) => mutate(`/api/admin/users?id=${encodeURIComponent(id)}`, "DELETE");

  const value: AppContextType = {
    currentUser,
    login,
    logout,
    register,
    users,
    news,
    tickets,
    coinPackages,
    creditLoads,
    topSupporters,
    settings,
    refreshData,
    updateSettings: handleUpdateSettings,
    addNews: handleAddNews,
    deleteNews: handleDeleteNews,
    addTicket: handleAddTicket,
    addTicketReply: handleAddTicketReply,
    updateTicketStatus: handleUpdateTicketStatus,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser,
    loading,
  };

  return (
    <AppContext.Provider value={value}>
      <div
        className="plumya-site"
        data-animated-backdrop={!settings.backgroundImage || settings.backgroundImage === "/plumya-dusk.webp" ? "" : undefined}
        style={{
          "--site-background": `url(${JSON.stringify(settings.backgroundImage || "/plumya-dusk.webp")})`,
          "--panel-opacity": (settings.panelOpacity ?? 65) / 100,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
