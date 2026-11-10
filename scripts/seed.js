// Standalone seed script for PostgreSQL
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding PostgreSQL database for Plumya...');

  // 1. Settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
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
  console.log('✔ Site settings seeded.');

  // 2. Default Admin
  const adminExists = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  if (!adminExists) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Plumya123!', salt);

    await prisma.user.create({
      data: {
        username: 'PlumyaAdmin',
        email: 'admin@plumya.net',
        password: hashedPassword,
        role: 'admin',
        credits: 99999,
      },
    });
    console.log('✔ Admin user created: PlumyaAdmin / Plumya123!');
  }

  // 3. Coin Packages
  const count = await prisma.coinPackage.count();
  if (count === 0) {
    await prisma.coinPackage.createMany({
      data: [
        { name: 'Çekirdek', coins: 100, price: 10, icon: 'Seedling' },
        { name: 'Fidan', coins: 250, price: 22, icon: 'Sprout' },
        { name: 'Erik Ağacı', coins: 500, price: 40, popular: true, icon: 'Trees' },
        { name: 'Erik Bahçesi', coins: 1200, price: 85, bonus: 200, icon: 'Sparkles' },
        { name: 'Plumya Kralı', coins: 3000, price: 180, bonus: 500, icon: 'Crown' },
      ],
    });
    console.log('✔ Coin packages seeded.');
  }

  // 4. Sample News
  const newsCount = await prisma.news.count();
  if (newsCount === 0) {
    await prisma.news.createMany({
      data: [
        {
          title: 'Yeni Sezon Başladı! 🎉',
          content:
            'Plumya sunucusunda yepyeni bir sezon başlıyor! Tüm haritalar sıfırlandı, yeni biyomlar eklendi ve özel etkinlikler sizi bekliyor. İlk hafta içinde giriş yapan herkese 100 kredi hediye!',
          author: 'PlumyaAdmin',
        },
        {
          title: 'SkyBlock Güncellemesi v2.0',
          content:
            'SkyBlock modumuza dev güncelleme geldi! Yeni ada temaları, özel minion sistemi, ada seviyesi yarışmaları ve otomatik çiftlik geliştirmeleri eklendi. /is komutu ile hemen keşfedin!',
          author: 'PlumyaAdmin',
        },
      ],
    });
    console.log('✔ News seeded.');
  }

  console.log('🎉 PostgreSQL Database is ready for Plumya!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
