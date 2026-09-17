import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

export async function POST() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `analytics:visitors:${todayStr}`;
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, 86400 * 2); // 48-hour auto-clean TTL
    }
    return NextResponse.json({ success: true, visits24h: count });
  } catch (err) {
    console.warn("Analytics route error", err);
    return NextResponse.json({ success: false, visits24h: 1 });
  }
}

export async function GET() {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const key = `analytics:visitors:${todayStr}`;
    const count = await redis.get(key);
    return NextResponse.json({ visits24h: count ? Number(count) : 1 });
  } catch (err) {
    return NextResponse.json({ visits24h: 1 });
  }
}
