import { FeedResponse, MealWindow } from '@/types/menu';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://infosys-t54l.vercel.app/api';

export async function fetchMenuFeed(window?: MealWindow): Promise<FeedResponse> {
  const url = `${API_BASE}/menus/feed${window ? `?window=${window}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch menu feed');
  }
  return res.json();
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/admin/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  return data.success === true;
}

export async function uploadMenuPhoto(payload: {
  password: string;
  foodCourtId: string;
  outletName: string;
  mealWindow: MealWindow;
  imageUrl?: string;
  imageUrls?: string[];
  isFixedMenu?: boolean;
}) {
  const res = await fetch(`${API_BASE}/admin/upload-menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload menu');
  }
  return data;
}

export async function deleteMenu(id: string, password: string) {
  const res = await fetch(`${API_BASE}/admin/menu/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete menu');
  }
  return data;
}

export async function recordVisitor(): Promise<number> {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const sessionKey = `infosys_visit_${todayStr}`;
    const alreadyCounted = typeof window !== "undefined" && sessionStorage.getItem(sessionKey);

    // Use Next.js local API route if in browser, or fallback to API_BASE
    const targetUrl = typeof window !== "undefined" ? "/api/analytics/visit" : `${API_BASE}/analytics/visit`;

    if (alreadyCounted) {
      const res = await fetch(targetUrl, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        return Number(data.visits24h) || 1;
      }
      return 1;
    }

    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined") {
        sessionStorage.setItem(sessionKey, "true");
      }
      return Number(data.visits24h) || 1;
    }
  } catch (err) {
    console.warn("Visitor analytics fallback", err);
  }
  return 1;
}
