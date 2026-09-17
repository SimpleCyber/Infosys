import { rtdb } from '../config/firebase.js';
import { ref, get, set, remove, child } from 'firebase/database';
import { upstashRedis } from '../config/redis.js';

export const CAMPUS_FOOD_COURTS = [
  { id: 'amoeba', name: 'Amoeba', description: 'Central Food Court' },
  { id: 'maitri', name: 'Maitri', description: 'Main Dining Hall' },
  { id: 'oasis', name: 'Oasis', description: 'South Zone Court' },
  { id: 'enroute', name: 'Enroute', description: 'Express Food Court' },
  { id: 'eli', name: 'ELI', description: 'Executive Lounge & Dining' },
  { id: 'magna', name: 'Magna', description: 'North Zone Court' },
  { id: 'arena', name: 'Arena', description: 'Sports Complex Dining' },
  { id: 'fc8', name: 'Food Court 8', description: 'Guest Food Court' },
];

// In-Memory store fallback in case Firebase rules block unauthenticated reads
const memoryMenuStore = new Map();

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

  // Filter menus matching today and requested meal window
  const activeMenus = rawMenus.filter(item => {
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

  const result = {
    dateStr: todayStr,
    mealWindow: targetWindow,
    timestamp: new Date().toISOString(),
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

  const record = {
    id: menuId,
    foodCourtId,
    foodCourtName: fcObj.name,
    outletName,
    mealWindow,
    imageUrl,
    isFixedMenu: Boolean(isFixedMenu),
    dateStr: todayStr,
    updatedAt: now.toISOString(),
    updatedAtFormatted: `Today at ${timeFormatted}`,
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

export const purgeExpiredMenus = async () => {
  const todayStr = getTodayDateString();
  let purgedCount = 0;

  for (const [key, item] of memoryMenuStore.entries()) {
    if (!item.isFixedMenu && item.dateStr < todayStr) {
      memoryMenuStore.delete(key);
      purgedCount++;
    }
  }

  try {
    const dbRef = ref(rtdb);
    const snapshot = await get(child(dbRef, 'menus'));
    if (snapshot.exists()) {
      const val = snapshot.val();
      for (const key of Object.keys(val)) {
        const item = val[key];
        if (!item.isFixedMenu && item.dateStr < todayStr) {
          await remove(ref(rtdb, `menus/${key}`));
        }
      }
    }
  } catch (err) {
    console.warn('[Firebase Purge Warning]', err.message);
  }

  // Clear Redis Feed Caches
  try {
    await upstashRedis.del(`menus:feed:${todayStr}:lunch`);
    await upstashRedis.del(`menus:feed:${todayStr}:dinner`);
  } catch (err) {
    console.error('[Redis Clear Error]', err.message);
  }

  return { purgedCount, timestamp: new Date().toISOString() };
};
