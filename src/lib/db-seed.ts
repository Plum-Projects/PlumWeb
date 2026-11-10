import prisma from './prisma';
import { hashPassword } from './auth';

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Ensure SiteSettings exists
    const existingSettings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!existingSettings) {
      await prisma.siteSettings.create({
        data: {
          id: 'default',
          showRecentRegistrations: true,
          showRecentCredits: true,
          announcement: 'Plumya Sunucusuna Hoş Geldiniz! 🍇',
          serverIp: 'play.plumya.net',
          serverPort: '25565',
          maxPlayers: 200,
          onlinePlayers: 47,
        },
      });
      console.log('✔ SiteSettings default seeded.');
    }

    // 2. Ensure Admin User exists
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (!adminUser) {
      const hashedPassword = await hashPassword('Plumya123!');
      await prisma.user.create({
        data: {
          username: 'PlumyaAdmin',
          email: 'admin@plumya.net',
          password: hashedPassword,
          role: 'admin',
          credits: 99999,
        },
      });
      console.log('✔ Default Admin PlumyaAdmin created (Password: Plumya123!).');
    }

    // 3. Ensure CoinPackages exist
    const packagesCount = await prisma.coinPackage.count();
    if (packagesCount === 0) {
      await prisma.coinPackage.createMany({
        data: [
          { name: 'Çekirdek', coins: 100, price: 10, icon: 'Seedling' },
          { name: 'Fidan', coins: 250, price: 22, icon: 'Sprout' },
          { name: 'Erik Ağacı', coins: 500, price: 40, popular: true, icon: 'Trees' },
          { name: 'Erik Bahçesi', coins: 1200, price: 85, bonus: 200, icon: 'Sparkles' },
          { name: 'Plumya Kralı', coins: 3000, price: 180, bonus: 500, icon: 'Crown' },
        ],
      });
      console.log('✔ Default CoinPackages seeded.');
    }

    // Note: News are NOT auto-seeded — admins manage them manually via the panel.
  } catch (error) {
    // If DB is offline, log gracefully
    console.warn('Database seed skipped or pending DB connection:', error);
  }
}
