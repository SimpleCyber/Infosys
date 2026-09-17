import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// Upstash REST API Client (Works over HTTP/HTTPS)
export const upstashRedis = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Standard ioredis Client (Works over TLS socket connection)
export const redisClient = new Redis(process.env.REDIS_URL, {
  tls: {},
  lazyConnect: true,
  maxRetriesPerRequest: 3,
});

redisClient.on('connect', () => {
  console.log('[Redis] Connected successfully via ioredis TLS');
});

redisClient.on('error', (err) => {
  console.error('[Redis Error]', err.message);
});
