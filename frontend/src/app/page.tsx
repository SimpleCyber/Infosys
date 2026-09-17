"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FeedResponse, MealWindow } from "@/types/menu";
import { fetchMenuFeed } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { FoodCourtFeed } from "@/components/FoodCourtFeed";
import { RestaurantBookingModal, CampusOutletCard } from "@/components/RestaurantBookingModal";
import { CampusServicesDrawer } from "@/components/CampusServicesDrawer";
import { RecreationalModal } from "@/components/RecreationalModal";
import { MultiplexModal } from "@/components/MultiplexModal";

const EMPTY_FEED_DATA: FeedResponse = {
  source: "database",
  data: {
    dateStr: new Date().toISOString().split("T")[0],
    mealWindow: "lunch",
    timestamp: new Date().toISOString(),
    foodCourts: [],
  },
};

export default function Home() {
  const [mealWindow, setMealWindow] = useState<MealWindow>("lunch");
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>("magna"); // Default to first food court
  const [searchQuery, setSearchQuery] = useState("");
  const [feedData, setFeedData] = useState<FeedResponse>(EMPTY_FEED_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // Modals & Drawers State
  const [selectedOutlet, setSelectedOutlet] = useState<CampusOutletCard | null>(null);
  const [isServicesDrawerOpen, setIsServicesDrawerOpen] = useState(false);
  const [isRecreationalOpen, setIsRecreationalOpen] = useState(false);
  const [isMultiplexOpen, setIsMultiplexOpen] = useState(false);

  const loadFeed = async (window: MealWindow) => {
    setIsLoading(true);
    try {
      const data = await fetchMenuFeed(window);
      if (data && data.data && Array.isArray(data.data.foodCourts)) {
        setFeedData(data);
      } else {
        setFeedData({
          source: "database",
          data: {
            dateStr: new Date().toISOString().split("T")[0],
            mealWindow: window,
            timestamp: new Date().toISOString(),
            foodCourts: [],
          },
        });
      }
    } catch (err) {
      console.warn("Using live campus menu data", err);
      setFeedData({
        source: "database",
        data: {
          dateStr: new Date().toISOString().split("T")[0],
          mealWindow: window,
          timestamp: new Date().toISOString(),
          foodCourts: [],
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const istHours = new Date(now.getTime() + 5.5 * 3600000).getUTCHours();
    const defaultWindow: MealWindow = istHours >= 12 && istHours < 17 ? "lunch" : "dinner";
    setMealWindow(defaultWindow);
    loadFeed(defaultWindow);
  }, []);

  const handleWindowChange = (newWindow: MealWindow) => {
    setMealWindow(newWindow);
    loadFeed(newWindow);
  };

  return (
    <div className="bg-[#D4E2DC] min-h-screen text-slate-900 flex flex-col items-center justify-center sm:p-4 selection:bg-emerald-600 selection:text-white antialiased font-sans">
      {/* Phone container frame */}
      <main className="w-full max-w-[392px] min-h-screen sm:min-h-[820px] bg-white sm:rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] sm:border sm:border-slate-300/60 flex flex-col relative overflow-hidden">
        {/* Warm Hero Navbar: 'Ready for lunch? / dinner?' */}
        <Navbar
          currentWindow={mealWindow}
          onWindowChange={handleWindowChange}
        />

        {/* Scrollable Feed Area (Categories & Dynamic Menus Section) */}
        <div className="flex-1 overflow-y-auto">
          <FoodCourtFeed
            foodCourts={feedData.data.foodCourts}
            currentWindow={mealWindow}
            selectedCourtId={selectedCourtId}
            onSelectCourt={(courtId) => setSelectedCourtId(courtId)}
            searchQuery={searchQuery}
            onSelectOutlet={(outlet) => setSelectedOutlet(outlet)}
            isLoading={isLoading}
          />
        </div>

        {/* Default Manager Portal Bottom Action Bar */}
        <div className="bg-white/95 backdrop-blur-md border-t border-slate-100/90 pt-3 pb-4 px-5 shadow-[0_-4px_25px_rgba(0,0,0,0.04)] select-none">
          <Link
            href="/admin"
            className="w-full py-3.5 px-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-black transition-all shadow-md flex items-center justify-center space-x-2 active:scale-98"
          >
            <span>📸</span>
            <span>Food Court Manager Portal</span>
            <span className="text-neutral-400 text-xs">→</span>
          </Link>
          {/* iPhone Home Indicator Pill */}
          <div className="w-28 h-1 bg-black/80 rounded-full mx-auto mt-2.5"></div>
        </div>

        {/* Clean Outlet Detail Modal */}
        <RestaurantBookingModal
          outlet={selectedOutlet}
          onClose={() => setSelectedOutlet(null)}
        />

        {/* Search / Campus Services Drawer (3 options: Food Courts, Recreation, Multiplex) */}
        <CampusServicesDrawer
          isOpen={isServicesDrawerOpen}
          onClose={() => setIsServicesDrawerOpen(false)}
          onSelectFoodCourts={() => {
            setSelectedCourtId(null);
            setSearchQuery("");
          }}
          onSelectRecreational={() => setIsRecreationalOpen(true)}
          onSelectMultiplex={() => setIsMultiplexOpen(true)}
        />

        {/* Recreational Activities & Rules Modal */}
        <RecreationalModal
          isOpen={isRecreationalOpen}
          onClose={() => setIsRecreationalOpen(false)}
        />

        {/* Campus Multiplex Schedule Modal */}
        <MultiplexModal
          isOpen={isMultiplexOpen}
          onClose={() => setIsMultiplexOpen(false)}
        />
      </main>
    </div>
  );
}
