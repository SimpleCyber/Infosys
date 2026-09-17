"use client";

import React, { useEffect, useState } from "react";
import { FeedResponse, MealWindow } from "@/types/menu";
import { fetchMenuFeed } from "@/lib/api";
import { Navbar } from "@/components/Navbar";
import { FoodCourtFeed } from "@/components/FoodCourtFeed";
import { FloatingNav } from "@/components/FloatingNav";
import { RestaurantBookingModal, CampusOutletCard } from "@/components/RestaurantBookingModal";
import { CampusServicesDrawer } from "@/components/CampusServicesDrawer";
import { RecreationalModal } from "@/components/RecreationalModal";
import { MultiplexModal } from "@/components/MultiplexModal";

const MOCK_INITIAL_DATA: FeedResponse = {
  source: "cache",
  data: {
    dateStr: new Date().toISOString().split("T")[0],
    mealWindow: "lunch",
    timestamp: new Date().toISOString(),
    foodCourts: [
      {
        foodCourtId: "magna",
        foodCourtName: "Magna",
        description: "North Zone Food Court",
        hasActiveMenus: true,
        outlets: [
          {
            id: "magna_shivam_lunch",
            foodCourtId: "magna",
            foodCourtName: "Magna",
            outletName: "Shivam Caterers",
            mealWindow: "lunch",
            imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80",
            isFixedMenu: false,
            dateStr: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString(),
            updatedAtFormatted: "Today at 12:10 PM",
          },
          {
            id: "magna_grapes_lunch",
            foodCourtId: "magna",
            foodCourtName: "Magna",
            outletName: "Purple Grapes",
            mealWindow: "lunch",
            imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
            isFixedMenu: false,
            dateStr: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString(),
            updatedAtFormatted: "Today at 12:25 PM",
          },
        ],
      },
      {
        foodCourtId: "amoeba",
        foodCourtName: "Amoeba",
        description: "Central Food Court",
        hasActiveMenus: true,
        outlets: [
          {
            id: "amoeba_shawarma_lunch",
            foodCourtId: "amoeba",
            foodCourtName: "Amoeba",
            outletName: "Shawarma Point",
            mealWindow: "lunch",
            imageUrl: "https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600&auto=format&fit=crop&q=80",
            isFixedMenu: false,
            dateStr: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString(),
            updatedAtFormatted: "Today at 12:15 PM",
          },
        ],
      },
      {
        foodCourtId: "maitri",
        foodCourtName: "Maitri",
        description: "Main Dining Hall",
        hasActiveMenus: true,
        outlets: [
          {
            id: "maitri_annapurna_lunch",
            foodCourtId: "maitri",
            foodCourtName: "Maitri",
            outletName: "Annapurna Meals",
            mealWindow: "lunch",
            imageUrl: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80",
            isFixedMenu: false,
            dateStr: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString(),
            updatedAtFormatted: "Today at 12:20 PM",
          },
        ],
      },
      {
        foodCourtId: "oasis",
        foodCourtName: "Oasis",
        description: "South Zone Court",
        hasActiveMenus: true,
        outlets: [
          {
            id: "oasis_coffeeday_fixed",
            foodCourtId: "oasis",
            foodCourtName: "Oasis",
            outletName: "Coffee Day Express",
            mealWindow: "lunch",
            imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80",
            isFixedMenu: true,
            dateStr: new Date().toISOString().split("T")[0],
            updatedAt: new Date().toISOString(),
            updatedAtFormatted: "Fixed Menu",
          },
        ],
      },
    ],
  },
};

export default function Home() {
  const [mealWindow, setMealWindow] = useState<MealWindow>("lunch");
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>("magna"); // Default to first food court
  const [searchQuery, setSearchQuery] = useState("");
  const [feedData, setFeedData] = useState<FeedResponse>(MOCK_INITIAL_DATA);
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
      if (data && data.data && data.data.foodCourts && data.data.foodCourts.length > 0) {
        setFeedData(data);
      }
    } catch (err) {
      console.warn("Using fallback campus menu data", err);
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

        {/* Docked 3-option Bottom Bar (Food Courts, Explore/Search, Manager) */}
        <FloatingNav onOpenSearch={() => setIsServicesDrawerOpen(true)} />

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
