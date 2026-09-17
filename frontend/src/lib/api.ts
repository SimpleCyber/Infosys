import { FeedResponse, MealWindow } from '@/types/menu';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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
  imageUrl: string;
  isFixedMenu: boolean;
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
