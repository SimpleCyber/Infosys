import { db } from '../config/firebase.js';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { upstashRedis } from '../config/redis.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

export const CAMPUS_FOOD_COURTS = [
  { id: 'magna', name: 'Magna', description: 'North Zone Court' },
  { id: 'arena', name: 'Arena', description: 'Sports Complex Dining' },
  { id: 'oasis', name: 'Oasis', description: 'South Zone Court' },
  { id: 'maitri', name: 'Maitri', description: 'Main Dining Hall' },
  { id: 'enroute', name: 'Enroute', description: 'Express Food Court' },
  { id: 'eli', name: 'ILI', description: 'Executive Lounge & Dining' },
  { id: 'amoeba', name: 'Ameba', description: 'Central Food Court' },
  { id: 'fc8', name: 'FC 8', description: 'Guest Food Court' },
];

// In-Memory store fallback
const memoryMenuStore = new Map();

export const getTodayDateString = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  return istDate.toISOString().split('T')[0];
};

export const getYesterdayDateString = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  istDate.setUTCDate(istDate.getUTCDate() - 1);
  return istDate.toISOString().split('T')[0];
};

export const getNextMidnightIST = () => {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const nextMidnightIST = new Date(istDate);
  nextMidnightIST.setUTCDate(nextMidnightIST.getUTCDate() + 1);
  nextMidnightIST.setUTCHours(0, 0, 0, 0);
  const nextMidnightUTC = new Date(nextMidnightIST.getTime() - istOffset);
  return nextMidnightUTC.toISOString();
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

export const formatTimeToIST = (dateObj = new Date()) => {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(dateObj.getTime() + istOffset);
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

// Cycle Tracking (24-Hour Daily Midnight Deletion Interval)
export const getCycleStatus = async () => {
  try {
    const cached = await upstashRedis.get('system:cycle');
    if (cached) {
      const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached;
      return {
        ...parsed,
        intervalHours: 24,
      };
    }
  } catch (err) {
    console.warn('[Redis Cycle Fetch Warning]', err.message);
  }

  return {
    intervalHours: 24,
    lastPurgedAt: new Date().toISOString(),
    nextPurgeAt: getNextMidnightIST(),
  };
};

/**
 * Fetches menu feed using Firestore as primary database:
 * 1. Checks Redis cache first (0 DB cost on hit)
 * 2. Queries Firestore collection `menus` directly
 * 3. Applies Soft Expiry: fallback to yesterday's menu if today's menu isn't uploaded yet
 * 4. Applies Hard Expiry: menus older than yesterday are excluded from active feed
 */
export const getMenuFeed = async (mealWindow = null) => {
  const targetWindow = mealWindow || getCurrentMealWindow();
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  const cacheKey = `menus:feed:${todayStr}:${targetWindow}`;

  // 1. Try Upstash Redis Cache First
  try {
    const cachedData = await upstashRedis.get(cacheKey);
    if (cachedData) {
      const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
      return { source: 'cache', data: parsed };
    }
  } catch (err) {
    console.error('[Redis Cache Read Error]', err.message);
  }

  // 2. Query Primary Store: Firebase Firestore
  let rawMenus = [];
  try {
    const menusSnapshot = await getDocs(collection(db, 'menus'));
    if (!menusSnapshot.empty) {
      rawMenus = menusSnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    }
  } catch (err) {
    console.warn('[Firebase Firestore Read Warning]', err.message);
  }

  // Fallback to Redis active documents if Firestore was empty or failed
  if (rawMenus.length === 0) {
    try {
      const activeIds = await upstashRedis.smembers('menus:active_ids');
      if (activeIds && activeIds.length > 0) {
        const pipelineKeys = activeIds.map((id) => `menu:${id}`);
        const docs = await upstashRedis.mget(...pipelineKeys);
        rawMenus = docs
          .filter(Boolean)
          .map((doc) => (typeof doc === 'string' ? JSON.parse(doc) : doc));
      }
    } catch (err) {
      console.warn('[Redis Read Fallback Warning]', err.message);
    }
  }

  if (rawMenus.length === 0) {
    rawMenus = Array.from(memoryMenuStore.values());
  }

  // Only consider active, current (non-superseded) menus for the target meal slot
  const relevantMenus = rawMenus.filter((item) => {
    if (item.isCurrent === false) return false;
    return item.mealWindow === targetWindow || item.isFixedMenu;
  });

  const todayMenus = relevantMenus.filter((item) => item.dateStr === todayStr);
  const yesterdayMenus = relevantMenus.filter((item) => item.dateStr === yesterdayStr);

  const activeMenus = [];
  const processedOutlets = new Set();

  // First add all today's fresh menus
  for (const item of todayMenus) {
    const outletKey = `${item.foodCourtId}_${item.outletName.toLowerCase()}_${item.mealWindow}`;
    activeMenus.push({
      ...item,
      isSoftExpired: false,
    });
    processedOutlets.add(outletKey);
  }

  // For outlets not posted today, fallback to yesterday's menu with soft expiry banner
  for (const item of yesterdayMenus) {
    const outletKey = `${item.foodCourtId}_${item.outletName.toLowerCase()}_${item.mealWindow}`;
    if (!processedOutlets.has(outletKey)) {
      activeMenus.push({
        ...item,
        isSoftExpired: true,
        statusBanner: "Yesterday's menu — may be outdated",
      });
      processedOutlets.add(outletKey);
    }
  }

  // Group by Food Court (Y-Axis)
  const groupedFeed = CAMPUS_FOOD_COURTS.map((fc) => {
    const courtOutlets = activeMenus.filter((m) => m.foodCourtId === fc.id);
    return {
      foodCourtId: fc.id,
      foodCourtName: fc.name,
      description: fc.description,
      outlets: courtOutlets,
      hasActiveMenus: courtOutlets.length > 0,
    };
  }).filter((group) => group.hasActiveMenus);

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

/**
 * Saves outlet menu directly into Firebase Firestore:
 * 1. Streams photo to Cloudinary CDN using user's CLOUDINARY_URL
 * 2. Formats timestamp in IST (e.g. "Updated 8:42 AM")
 * 3. Replaces previous current version for this slot on same day, preserving audit trail
 * 4. Creates a dedicated, separate document in Firebase Firestore collection `menus`
 */
export const saveOutletMenu = async (menuData) => {
  const { foodCourtId, outletName, mealWindow, imageUrl, isFixedMenu = false } = menuData;
  const todayStr = getTodayDateString();
  const fcObj = CAMPUS_FOOD_COURTS.find((f) => f.id === foodCourtId);

  if (!fcObj) {
    throw new Error(`Invalid food court ID: ${foodCourtId}`);
  }

  // 1. Upload photo to Cloudinary CDN
  let cdnImageUrl = imageUrl;
  let cloudinaryPublicId = null;
  try {
    const uploadRes = await uploadToCloudinary(imageUrl, 'infosys_menus');
    cdnImageUrl = uploadRes.secureUrl;
    cloudinaryPublicId = uploadRes.publicId;
  } catch (uploadErr) {
    console.warn('[Cloudinary Upload Warning]', uploadErr.message, 'Using raw image source');
  }

  const sanitizedOutlet = outletName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const menuId = `${foodCourtId}_${sanitizedOutlet}_${mealWindow}_${todayStr}_${uniqueSuffix}`;

  const now = new Date();
  const timeFormatted = formatTimeToIST(now);
  const updatedAtFormatted = `Updated ${timeFormatted}`;

  // 2. Photo Replacement & Audit Trail in Firestore:
  // If an active menu exists for this slot today, archive it (isCurrent: false, replacedBy)
  try {
    const snap = await getDocs(collection(db, 'menus'));
    const batch = writeBatch(db);
    let hasUpdates = false;

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (
        data.foodCourtId === foodCourtId &&
        data.outletName?.toLowerCase() === outletName.toLowerCase() &&
        data.mealWindow === mealWindow &&
        data.dateStr === todayStr &&
        data.isCurrent !== false
      ) {
        batch.update(doc(db, 'menus', docSnap.id), {
          isCurrent: false,
          archivedAt: now.toISOString(),
          replacedBy: menuId,
        });
        hasUpdates = true;

        // Also update Redis & local memory
        data.isCurrent = false;
        data.archivedAt = now.toISOString();
        data.replacedBy = menuId;
        await upstashRedis.set(`menu:${docSnap.id}`, JSON.stringify(data));
        await upstashRedis.srem('menus:active_ids', docSnap.id);
        memoryMenuStore.set(docSnap.id, data);
      }
    }

    if (hasUpdates) {
      await batch.commit();
    }
  } catch (archiveErr) {
    console.warn('[Firestore Audit Trail Archive Warning]', archiveErr.message);
  }

  // 3. Create Dedicated Document Record
  const record = {
    id: menuId,
    foodCourtId,
    foodCourtName: fcObj.name,
    outletName,
    mealWindow,
    imageUrl: cdnImageUrl,
    cloudinaryPublicId,
    isFixedMenu: Boolean(isFixedMenu),
    dateStr: todayStr,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    updatedAtFormatted,
    isCurrent: true,
    cycleHours: 24,
  };

  // 4. Save directly as Dedicated Document in Firebase Firestore
  try {
    await setDoc(doc(db, 'menus', menuId), record);
  } catch (err) {
    console.error('[Firebase Firestore Save Error]', err.message);
    throw err;
  }

  // 5. Persist to Upstash Redis & local memory
  try {
    await upstashRedis.set(`menu:${menuId}`, JSON.stringify(record));
    await upstashRedis.sadd('menus:active_ids', menuId);
  } catch (err) {
    console.warn('[Redis Document Save Warning]', err.message);
  }
  memoryMenuStore.set(menuId, record);

  // 6. Invalidate Redis Feed Caches
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

  // Delete directly from Firestore
  try {
    await deleteDoc(doc(db, 'menus', id));
  } catch (err) {
    console.warn('[Firebase Firestore Delete Warning]', err.message);
  }

  // Delete from Redis
  try {
    await upstashRedis.del(`menu:${id}`);
    await upstashRedis.srem('menus:active_ids', id);
  } catch (err) {
    console.error('[Redis Delete Error]', err.message);
  }

  try {
    await upstashRedis.del(`menus:feed:${todayStr}:lunch`);
    await upstashRedis.del(`menus:feed:${todayStr}:dinner`);
  } catch (err) {
    console.error('[Redis Purge Error]', err.message);
  }
};

/**
 * 24-Hour Midnight Deletion Purge:
 * Resets active menus for the daily 12:00 AM midnight fresh start.
 * Purges Firestore menus collection and Redis cache.
 */
export const purgeExpiredMenus = async () => {
  const now = new Date();
  const nextPurgeAt = getNextMidnightIST();
  const lastPurgedAt = now.toISOString();

  let purgedCount = memoryMenuStore.size;
  memoryMenuStore.clear();

  // Purge documents from Firestore using writeBatch
  try {
    const snap = await getDocs(collection(db, 'menus'));
    if (!snap.empty) {
      purgedCount = Math.max(purgedCount, snap.size);
      const batch = writeBatch(db);
      snap.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    }
  } catch (err) {
    console.warn('[Firestore Purge Warning]', err.message);
  }

  // Purge active IDs from Redis
  try {
    const activeIds = await upstashRedis.smembers('menus:active_ids');
    if (activeIds && activeIds.length > 0) {
      purgedCount = Math.max(purgedCount, activeIds.length);
      const keys = activeIds.map((id) => `menu:${id}`);
      await upstashRedis.del(...keys);
      await upstashRedis.del('menus:active_ids');
    }
  } catch (err) {
    console.warn('[Redis Purge Warning]', err.message);
  }

  // Clear Redis Feed Caches and record cycle status
  const todayStr = getTodayDateString();
  const yesterdayStr = getYesterdayDateString();
  try {
    await upstashRedis.del(`menus:feed:${todayStr}:lunch`);
    await upstashRedis.del(`menus:feed:${todayStr}:dinner`);
    await upstashRedis.del(`menus:feed:${yesterdayStr}:lunch`);
    await upstashRedis.del(`menus:feed:${yesterdayStr}:dinner`);
    await upstashRedis.set(
      'system:cycle',
      JSON.stringify({
        intervalHours: 24,
        lastPurgedAt,
        nextPurgeAt,
      }),
      { ex: 86400 * 2 }
    );
  } catch (err) {
    console.error('[Redis Purge Error]', err.message);
  }

  return {
    purgedCount,
    intervalHours: 24,
    lastPurgedAt,
    nextPurgeAt,
    timestamp: now.toISOString(),
  };
};
