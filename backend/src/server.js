import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  CAMPUS_FOOD_COURTS,
  getMenuFeed,
  saveOutletMenu,
  deleteOutletMenu,
  purgeExpiredMenus,
  getCurrentMealWindow,
  getTodayDateString,
  getCycleStatus,
} from './services/menuService.js';
import { upstashRedis } from './config/redis.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and increase body limit for base64 image uploads (10MB)
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check
app.get('/api/health', async (req, res) => {
  const cycle = await getCycleStatus();
  res.json({
    status: 'ok',
    service: 'Infosys Food Court Menu API',
    currentMealWindow: getCurrentMealWindow(),
    todayDate: getTodayDateString(),
    cycle,
    timestamp: new Date().toISOString(),
  });
});

// List Campus Food Courts
app.get('/api/food-courts', (req, res) => {
  res.json({ foodCourts: CAMPUS_FOOD_COURTS });
});

// Analytics: 24h Visitor Counter in Redis (0 Firebase writes)
app.post('/api/analytics/visit', async (req, res) => {
  try {
    const todayStr = getTodayDateString();
    const key = `analytics:visitors:${todayStr}`;
    const count = await upstashRedis.incr(key);
    if (count === 1) {
      await upstashRedis.expire(key, 86400 * 2); // 48h TTL
    }
    res.json({ success: true, visits24h: count });
  } catch (err) {
    console.warn('[Analytics Track Error]', err.message);
    res.json({ success: false, visits24h: 1 });
  }
});

app.get('/api/analytics/stats', async (req, res) => {
  try {
    const todayStr = getTodayDateString();
    const key = `analytics:visitors:${todayStr}`;
    const count = await upstashRedis.get(key);
    res.json({ visits24h: count ? Number(count) : 1 });
  } catch (err) {
    console.warn('[Analytics Stats Error]', err.message);
    res.json({ visits24h: 1 });
  }
});

// GET Menu Feed (Redis Cached for High Concurrency)
app.get('/api/menus/feed', async (req, res) => {
  try {
    const mealWindow = req.query.window || null;
    const feed = await getMenuFeed(mealWindow);
    res.json(feed);
  } catch (error) {
    console.error('[Feed Fetch Error]', error);
    res.status(500).json({ error: 'Failed to fetch menu feed', message: error.message });
  }
});

// Admin Password Verification
app.post('/api/admin/verify', (req, res) => {
  const { password } = req.body || {};
  const expectedPassword = (process.env.ADMIN_PASSWORD || 'infosys123').trim();
  
  if (password && password.trim() === expectedPassword) {
    res.json({ success: true, message: 'Admin authenticated' });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

// Admin Upload Menu
app.post('/api/admin/upload-menu', async (req, res) => {
  const { password, foodCourtId, outletName, mealWindow, imageUrl, imageUrls, isFixedMenu } = req.body || {};
  const expectedPassword = (process.env.ADMIN_PASSWORD || 'infosys123').trim();

  if (!password || password.trim() !== expectedPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  const images = Array.isArray(imageUrls) && imageUrls.length > 0
    ? imageUrls
    : (imageUrl ? [imageUrl] : []);

  if (!foodCourtId || !outletName || !mealWindow || images.length === 0) {
    return res.status(400).json({ error: 'Missing required fields: foodCourtId, outletName, mealWindow, imageUrl(s)' });
  }

  try {
    const savedMenus = await Promise.all(
      images.map((img) =>
        saveOutletMenu({
          foodCourtId,
          outletName,
          mealWindow,
          imageUrl: img,
          isFixedMenu: Boolean(isFixedMenu),
        })
      )
    );

    res.json({
      success: true,
      message: `${savedMenus.length} menu photo(s) updated successfully and Redis cache purged`,
      menu: savedMenus[0],
      menus: savedMenus,
    });
  } catch (error) {
    console.error('[Upload Menu Error]', error);
    res.status(500).json({ error: 'Failed to save menu', message: error.message });
  }
});

// Admin Delete Menu
app.delete('/api/admin/menu/:id', async (req, res) => {
  const { password } = req.body;
  const expectedPassword = process.env.ADMIN_PASSWORD || 'infosys123';

  if (password !== expectedPassword) {
    return res.status(401).json({ error: 'Unauthorized. Invalid admin password.' });
  }

  const { id } = req.params;
  try {
    await deleteOutletMenu(id);
    res.json({ success: true, message: `Menu ${id} deleted` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete menu', message: error.message });
  }
});

// Automated Cron Cleanup Route (Purge Expired Menus)
app.post('/api/cron/cleanup', async (req, res) => {
  const authHeader = req.headers.authorization;
  const secretKey = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${secretKey}` && req.body?.secret !== secretKey) {
    return res.status(401).json({ error: 'Unauthorized cron request' });
  }

  try {
    const result = await purgeExpiredMenus();
    res.json({
      success: true,
      message: '24-Hour midnight cycle automated cleanup executed successfully',
      purgedCount: result.purgedCount,
      intervalHours: result.intervalHours,
      lastPurgedAt: result.lastPurgedAt,
      nextPurgeAt: result.nextPurgeAt,
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('[Cron Cleanup Error]', error);
    res.status(500).json({ error: 'Failed to execute cleanup', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Infosys Menu API Server listening on port ${PORT}`);
});
