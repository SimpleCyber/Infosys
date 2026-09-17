import { rtdb } from '../config/firebase.js';
import { ref, get, set, remove, child } from 'firebase/database';
import { upstashRedis } from '../config/redis.js';

export const CAMPUS_FOOD_COURTS = [
  { id: 'magna', name: 'Meghna', description: 'North Zone Court' },
  { id: 'arena', name: 'Arena', description: 'Sports Complex Dining' },
  { id: 'oasis', name: 'Oasis', description: 'South Zone Court' },
  { id: 'maitri', name: 'Maitri', description: 'Main Dining Hall' },
  { id: 'enroute', name: 'Enroute', description: 'Express Food Court' },
  { id: 'eli', name: 'ILI', description: 'Executive Lounge & Dining' },
  { id: 'amoeba', name: 'Ameba', description: 'Central Food Court' },
  { id: 'fc8', name: 'FC 8', description: 'Guest Food Court' },
];

// In-Memory store fallback in case Firebase rules block unauthenticated reads
const memoryMenuStore = new Map();

// Cycle Tracking (6-Hour Deletion Interval)
let lastPurgedAt = new Date().toISOString();
let nextPurgeAt = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

export const getCycleStatus = async () => {
  try {
    const cached = await upstashRedis.get('system:cycle');
    if (cached) {
      return typeof cached === 'string' ? JSON.parse(cached) : cached;
    }
  } catch (err) {
    console.warn('[Redis Cycle Fetch Warning]', err.message);
  }
  return {
    intervalHours: 6,
    lastPurgedAt,
    nextPurgeAt,
  };
};

export const getCurrentMealWindow = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const hours = istDate.getUTCHours();
  
  if (hours >= 12 && hours < 17) {
    return 'lunch';
  }
  return 'dinner';
};

export const getTodayDateString = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
};

export const getMenuFeed = async (mealWindow = null) => {
  const targetWindow = mealWindow || getCurrentMealWindow();
  const todayStr = getTodayDateString();
  const cacheKey = `menus:feed:${todayStr}:${targetWindow}`;

  // 1. Try Upstash Redis Cache First (0 DB cost on hit)
  try {
    const cachedData = await upstashRedis.get(cacheKey);
    if (cachedData) {
      const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
      return { source: 'cache', data: parsed };
    }
  } catch (err) {
    console.error('[Redis Cache Read Error]', err.message);
  }

  // 2. Query Primary Store (Firebase Realtime DB with Fallback)
  let rawMenus = [];
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'menus'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      rawMenus = Object.keys(val).map(key => ({ id: key, ...val[key] }));
    }
  } catch (err) {
    console.warn('[Firebase DB Access Warning]', err.message, 'Falling back to high-speed local store');
    rawMenus = Array.from(memoryMenuStore.values());
  }

  const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
  const currentTimeMs = Date.now();

  // Filter menus matching today, requested meal window, AND strictly within 6-hour cycle
  const activeMenus = rawMenus.filter(item => {
    // Exclude if older than 6 hours
    if (item.updatedAt) {
      const ageMs = currentTimeMs - new Date(item.updatedAt).getTime();
      if (ageMs >= SIX_HOURS_MS) {
        return false;
      }
    }
    return item.dateStr === todayStr && (item.mealWindow === targetWindow || item.isFixedMenu);
  });

  // Group by Food Court (Y-Axis)
  const groupedFeed = CAMPUS_FOOD_COURTS.map(fc => {
    const courtOutlets = activeMenus.filter(m => m.foodCourtId === fc.id);
    return {
      foodCourtId: fc.id,
      foodCourtName: fc.name,
      description: fc.description,
      outlets: courtOutlets,
      hasActiveMenus: courtOutlets.length > 0,
    };
  }).filter(group => group.hasActiveMenus);

  const cycle = await getCycleStatus();

  const result = {
    dateStr: todayStr,
    mealWindow: targetWindow,
    timestamp: new Date().toISOString(),
    cycle,
    foodCourts: groupedFeed,
  };

  // 3. Cache in Upstash Redis (5-minute TTL)
  try {
    await upstashRedis.set(cacheKey, JSON.stringify(result), { ex: 300 });
  } catch (err) {
    console.error('[Redis Cache Set Error]', err.message);
  }

  return { source: 'database', data: result };
};

export const saveOutletMenu = async (menuData) => {
  const { foodCourtId, outletName, mealWindow, imageUrl, isFixedMenu = false } = menuData;
  const todayStr = getTodayDateString();
  const fcObj = CAMPUS_FOOD_COURTS.find(f => f.id === foodCourtId);
  
  if (!fcObj) {
    throw new Error(`Invalid food court ID: ${foodCourtId}`);
  }

  const sanitizedOutlet = outletName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const menuId = `${foodCourtId}_${sanitizedOutlet}_${mealWindow}_${todayStr}`;

  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const timeFormatted = istDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  });

  const expiresAt = new Date(now.getTime() + 6 * 60 * 60 * 1000).toISOString();

  const record = {
    id: menuId,
    foodCourtId,
    foodCourtName: fcObj.name,
    outletName,
    mealWindow,
    imageUrl,
    isFixedMenu: Boolean(isFixedMenu),
    dateStr: todayStr,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    updatedAtFormatted: `Today at ${timeFormatted}`,
    expiresAt,
    cycleHours: 6,
  };

  // Save to Memory Store
  memoryMenuStore.set(menuId, record);

  // Attempt save to Firebase
  try {
    await set(ref(rtdb, `menus/${menuId}`), record);
  } catch (err) {
    console.warn('[Firebase Save Warning]', err.message);
  }

  // Invalidate Redis Cache
  try {
    await upstashRedis.del(`menus:feed:${todayStr}:lunch`);
    await upstashRedis.del(`menus:feed:${todayStr}:dinner`);
  } catch (err) {
    console.error('[Redis Cache Purge Error]', err.message);
  }

  return record;
};

export const deleteOutletMenu = async (id) => {
  memoryMenuStore.delete(id);
  const todayStr = getTodayDateString();

  try {
    await remove(ref(rtdb, `menus/${id}`));
  } catch (err) {
    console.warn('[Firebase Delete Warning]', err.message);
  }

  try {
    await upstashRedis.del(`menus:feed:${todayStr}:lunch`);
    await upstashRedis.del(`menus:feed:${todayStr}:dinner`);
  } catch (err) {
    console.error('[Redis Purge Error]', err.message);
  }
};

/**
 * 6-Hour Cron Deletion Purge:
 * Deletes all existing uploaded images from memory, Firebase RTDB, and Redis.
 * Sets cycle timestamps for the next 6-hour window.
 */
export const purgeExpiredMenus = async () => {
  const now = new Date();
  const nextPurge = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  lastPurgedAt = now.toISOString();
  nextPurgeAt = nextPurge.toISOString();

  // 1. Purge all items in local memory store
  let purgedCount = memoryMenuStore.size;
  memoryMenuStore.clear();

  // 2. Purge all items in Firebase RTDB menus node
  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'menus'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      const rtdbKeys = Object.keys(val);
      purgedCount = Math.max(purgedCount, rtdbKeys.length);
      await remove(ref(rtdb, 'menus'));
    }
  } catch (err) {
    console.warn('[Firebase Purge Warning]', err.message);
  }

  // 3. Clear Redis Feed Caches and record cycle status
  const todayStr = getTodayDateString();
  try {
    await upstashRedis.del(`menus:feed:${todayStr}:lunch`);
    await upstashRedis.del(`menus:feed:${todayStr}:dinner`);
    await upstashRedis.set('system:cycle', JSON.stringify({
      intervalHours: 6,
      lastPurgedAt,
      nextPurgeAt,
    }), { ex: 86400 * 2 });
  } catch (err) {
    console.error('[Redis Purge Error]', err.message);
  }

  return {
    purgedCount,
    intervalHours: 6,
    lastPurgedAt,
    nextPurgeAt,
    timestamp: now.toISOString(),
  };
};
