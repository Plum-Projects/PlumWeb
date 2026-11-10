import prisma from '@/lib/prisma';

export async function getSiteData() {
  const [
    settingsResult,
    newsResult,
    packagesResult,
    recentUsersResult,
    recentCreditsResult,
    topSupportersResult,
  ] = await Promise.allSettled([
    prisma.siteSettings.findUnique({
      where: { id: 'default' },
    }),
    prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
    prisma.coinPackage.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
    prisma.creditLoad.findMany({
      select: {
        id: true,
        username: true,
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.creditLoad.groupBy({
      by: ["username"],
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
      take: 5,
    }),
  ]);

  const settings = settingsResult.status === 'fulfilled' ? settingsResult.value : null;
  const news = newsResult.status === 'fulfilled' && Array.isArray(newsResult.value) ? newsResult.value : [];
  const packages = packagesResult.status === 'fulfilled' && Array.isArray(packagesResult.value) ? packagesResult.value : [];
  const recentUsers = recentUsersResult.status === 'fulfilled' && Array.isArray(recentUsersResult.value) ? recentUsersResult.value : [];
  const recentCredits = recentCreditsResult.status === 'fulfilled' && Array.isArray(recentCreditsResult.value) ? recentCreditsResult.value : [];
  const topSupporters = topSupportersResult.status === 'fulfilled' && Array.isArray(topSupportersResult.value) ? topSupportersResult.value : [];

  const activeSettings = settings || {
    id: 'default',
    showRecentRegistrations: true,
    showRecentCredits: true,
    announcement: 'Plumya Sunucusuna Hoş Geldiniz! 🍇',
    serverIp: 'play.plumya.net',
    serverPort: '25565',
    maxPlayers: 200,
    onlinePlayers: 47,
  };

  return {
    success: true,
    settings: {
      ...activeSettings,
      serverIP: activeSettings.serverIp,
    },
    news: news.map((n) => ({
      ...n,
      image: n.image ?? undefined,
      createdAt: n.createdAt.toISOString(),
      date: n.createdAt.toISOString(),
    })),
    coinPackages: packages,
    topSupporters: topSupporters.map((item) => ({ username: item.username, amount: item._sum.amount ?? 0 })),
    recentUsers: recentUsers.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      registeredAt: u.createdAt.toISOString(),
    })),
    recentCredits: recentCredits.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      date: c.createdAt.toISOString(),
    })),
  };
}
