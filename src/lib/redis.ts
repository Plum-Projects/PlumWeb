import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis?: Redis };

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

// Singleton Redis istemcisi
function createRedisClient() {
  const client = new Redis(redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    connectTimeout: 1500,
    commandTimeout: 2500,
    enableOfflineQueue: true,
    retryStrategy(times) {
      if (times > 3) return null; // Sunucuya ulaşılamıyorsa sonsuz denemeyi durdur
      return Math.min(times * 300, 2000);
    },
  });

  // Node.js unhandled error çökmesini önlemek için hata dinleyicisi
  client.on('error', (err) => {
    // Redis kapalı veya erişilemiyorsa sunucuyu çökertme, sadece log düş
    console.warn('[Redis] Bağlantı uyarısı (İşlemler etkilenmez):', err.message);
  });

  return client;
}

export const redis = globalForRedis.redis || createRedisClient();

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

/**
 * Minecraft PlumCredit eklentisine Redis Pub/Sub üzerinden anlık bildirim fırlatır.
 * Redis kapalı olsa dahi veritabanı veya ödeme işlemini ASLA bozmaz.
 */
export async function publishCreditUpdate(
  player: string,
  amount: number,
  type: 'ADD' | 'SET' | 'REMOVE' = 'ADD'
) {
  try {
    const channel = process.env.REDIS_CREDIT_CHANNEL || 'plumcredit:updates';
    const payload = JSON.stringify({
      player,
      amount,
      type,
    });

    await redis.publish(channel, payload);
  } catch (error) {
    console.warn('[Redis] Mesaj gönderilemedi (İşlem devam etti):', error);
  }
}
