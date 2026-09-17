"use client";

import React from "react";
import { FoodCourtGroup, MealWindow } from "@/types/menu";
import {
  PixelBurgerIcon,
  PixelPizzaIcon,
  PixelCoffeeIcon,
  PixelBakeryIcon,
  PixelAsianIcon,
} from "./PixelFoodIcons";
import { CampusOutletCard } from "./RestaurantBookingModal";
import Link from "next/link";

export interface CampusFoodCourtMeta {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  bg: string;
  border: string;
}

export const ALL_8_CAMPUS_FOOD_COURTS: CampusFoodCourtMeta[] = [
  {
    id: "magna",
    name: "Magna",
    shortName: "Magna",
    icon: <PixelBurgerIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#FEEDD7]",
    border: "border-amber-200/60",
  },
  {
    id: "amoeba",
    name: "Amoeba",
    shortName: "Amoeba",
    icon: <PixelPizzaIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#EBF0F7]",
    border: "border-slate-200/70",
  },
  {
    id: "maitri",
    name: "Maitri",
    shortName: "Maitri",
    icon: <PixelCoffeeIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#E2EDE9]",
    border: "border-emerald-200/60",
  },
  {
    id: "oasis",
    name: "Oasis",
    shortName: "Oasis",
    icon: <PixelBakeryIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#FEE7DF]",
    border: "border-rose-200/60",
  },
  {
    id: "enroute",
    name: "Enroute",
    shortName: "Enroute",
    icon: <PixelAsianIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#F3EBF7]",
    border: "border-purple-200/60",
  },
  {
    id: "eli",
    name: "ELI",
    shortName: "ELI",
    icon: <PixelBurgerIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#FEE8D6]",
    border: "border-orange-200/60",
  },
  {
    id: "arena",
    name: "Arena",
    shortName: "Arena",
    icon: <PixelPizzaIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#E6F4EA]",
    border: "border-teal-200/60",
  },
  {
    id: "fc8",
    name: "FC 8",
    shortName: "FC 8",
    icon: <PixelCoffeeIcon className="w-9 h-9 sm:w-10 sm:h-10" />,
    bg: "bg-[#EDE7F6]",
    border: "border-indigo-200/60",
  },
];

interface FoodCourtFeedProps {
  foodCourts: FoodCourtGroup[];
  currentWindow: MealWindow;
  selectedCourtId: string | null; // null means 'Show All'
  onSelectCourt: (courtId: string | null) => void;
  searchQuery: string;
  onSelectOutlet: (outlet: CampusOutletCard) => void;
  isLoading: boolean;
}

export const FoodCourtFeed: React.FC<FoodCourtFeedProps> = ({
  foodCourts,
  currentWindow,
  selectedCourtId,
  onSelectCourt,
  searchQuery,
  onSelectOutlet,
  isLoading,
}) => {
  // Find currently selected court metadata
  const currentCourtMeta = ALL_8_CAMPUS_FOOD_COURTS.find(
    (c) => c.id === selectedCourtId
  );

  // Map all outlets flattened from active data
  const allOutlets: CampusOutletCard[] = foodCourts.flatMap((fc) =>
    fc.outlets.map((o) => ({
      id: o.id,
      outletName: o.outletName,
      foodCourtId: o.foodCourtId,
      foodCourtName: o.foodCourtName,
      mealWindow: o.mealWindow,
      imageUrl: o.imageUrl,
      isFixedMenu: o.isFixedMenu,
      updatedAtFormatted: o.updatedAtFormatted || o.updatedAt,
      description: `${o.foodCourtName} • ${o.isFixedMenu ? "Fixed daily menu" : "Daily changing special"}`,
    }))
  );

  const isSearching = searchQuery.trim().length > 0;

  // Filter helper for outlets matching search query
  const filterOutlet = (outlet: CampusOutletCard) => {
    if (!isSearching) return true;
    const q = searchQuery.toLowerCase();
    return (
      outlet.outletName.toLowerCase().includes(q) ||
      outlet.foodCourtName.toLowerCase().includes(q)
    );
  };

  // Dynamic Section Title: e.g. "Magna" instead of "Magna Menus", or "All Food Courts"
  let sectionTitle = "Magna";
  if (isSearching) {
    sectionTitle = `Results for "${searchQuery}"`;
  } else if (selectedCourtId === null) {
    sectionTitle = "All Food Courts";
  } else if (currentCourtMeta) {
    sectionTitle = currentCourtMeta.name;
  }

  // Timing text without sun/moon symbol
  const timingDuration =
    currentWindow === "lunch"
      ? "Lunch Window (12:00 PM – 3:30 PM)"
      : "Dinner Window (7:00 PM – 10:30 PM)";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <p className="text-slate-400 text-xs font-semibold">Loading campus menus...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6 pt-3">
      {/* 1. CATEGORIES SECTION: 8 Infosys Food Courts */}
      <section className="space-y-2 px-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[22px] font-extrabold text-[#15191E] tracking-tight">
            Categories
          </h2>
          <button
            onClick={() => onSelectCourt(selectedCourtId === null ? "magna" : null)}
            className="text-[13px] font-bold text-[#1E5B7B] hover:opacity-80 transition-opacity"
          >
            {selectedCourtId === null ? "Show Magna" : "Show all"}
          </button>
        </div>

        {/* Scrollable Row of 8 Food Courts with Safe Padding & Steady/Constant Hover */}
        <div className="relative -mx-5 px-5">
          <div className="flex space-x-3.5 overflow-x-auto pt-3 pb-3 px-1 scroll-px-1 scrollbar-none snap-x snap-mandatory">
            {ALL_8_CAMPUS_FOOD_COURTS.map((court) => {
              const isSelected = selectedCourtId === court.id;
              return (
                <button
                  key={court.id}
                  type="button"
                  onClick={() => onSelectCourt(court.id)}
                  className="snap-start flex-shrink-0 flex flex-col items-center focus:outline-none w-[72px] sm:w-[76px] p-1 select-none"
                >
                  {/* Rounded Pastel Box with Bold Highlight & No Hover Jitter */}
                  <div
                    className={`w-full aspect-square rounded-[22px] flex items-center justify-center transition-all duration-150 border ${
                      court.bg
                    } ${
                      isSelected
                        ? "border-[#1E4D3E] ring-4 ring-[#1E4D3E]/30 scale-105 shadow-md"
                        : `${court.border} shadow-[0_2px_8px_rgba(0,0,0,0.03)]`
                    }`}
                  >
                    {court.icon}
                  </div>

                  {/* Food Court Label: Bold and Underlined when Highlighted */}
                  <span
                    className={`text-[12px] sm:text-[13px] tracking-tight mt-1.5 transition-colors truncate max-w-full text-center ${
                      isSelected
                        ? "text-[#1E4D3E] font-black underline underline-offset-4"
                        : "text-[#2B3037] font-bold"
                    }`}
                  >
                    {court.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 5-Dot Carousel Indicator */}
        <div className="flex items-center justify-center space-x-1.5 pt-0.5 pb-1">
          <span className="w-2 h-2 rounded-full bg-[#1C2530]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#CBD5E1]"></span>
        </div>
      </section>

      {/* 2. DYNAMIC MENUS SECTION */}
      <section className="space-y-4">
        {/* Main Section Header */}
        <div className="flex items-center justify-between px-5">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#15191E] tracking-tight">
              {sectionTitle}
            </h2>
            <p className="text-xs text-neutral-500 font-semibold mt-0.5">
              {timingDuration}
            </p>
          </div>

          {selectedCourtId !== null && (
            <button
              onClick={() => onSelectCourt(null)}
              className="text-[13px] font-bold text-[#1E5B7B] hover:opacity-80 transition-opacity"
            >
              Show all
            </button>
          )}
        </div>

        {/* CONDITION A: If "Show all" is active, display food courts grouped row by row! */}
        {selectedCourtId === null && !isSearching ? (
          <div className="space-y-6">
            {ALL_8_CAMPUS_FOOD_COURTS.map((court) => {
              const courtOutlets = allOutlets.filter(
                (o) => o.foodCourtId === court.id
              );

              return (
                <div key={court.id} className="space-y-2.5">
                  {/* Category Subheader */}
                  <div className="flex items-center justify-between px-5">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-base font-black text-neutral-900 tracking-tight">
                        {court.name}
                      </h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {courtOutlets.length} {courtOutlets.length === 1 ? "outlet" : "outlets"}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectCourt(court.id)}
                      className="text-xs font-bold text-[#1E5B7B] hover:underline"
                    >
                      View only
                    </button>
                  </div>

                  {/* Outlets row or placeholder */}
                  {courtOutlets.length === 0 ? (
                    <div className="mx-5 p-4 rounded-2xl bg-white border border-slate-200/70 text-center text-xs text-neutral-400 font-medium">
                      No images uploaded for {court.name} yet.
                    </div>
                  ) : (
                    <div
                      className="flex space-x-3.5 overflow-x-auto px-5 scroll-px-5 pb-3 scrollbar-none snap-x snap-mandatory"
                      style={{ scrollPaddingLeft: "20px", scrollPaddingRight: "20px" }}
                    >
                      {courtOutlets.map((outlet) => (
                        <div
                          key={outlet.id}
                          onClick={() => onSelectOutlet(outlet)}
                          className="snap-start flex-shrink-0 w-[275px] sm:w-[295px] bg-white rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-neutral-100 hover:shadow-md transition-all duration-150 cursor-pointer group flex flex-col"
                        >
                          <div className="relative h-44 w-full bg-slate-900 overflow-hidden rounded-t-[24px]">
                            <img
                              src={outlet.imageUrl}
                              alt={outlet.outletName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute top-3 left-3">
                              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/95 text-neutral-900 shadow-xs backdrop-blur-sm">
                                {outlet.isFixedMenu ? "📌 Fixed Menu" : "🔥 Daily Special"}
                              </span>
                            </div>
                            <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center space-x-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                              <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                            </div>
                          </div>

                          <div className="p-3.5 bg-white flex items-center justify-between text-[11px] font-bold">
                            <div className="flex items-center space-x-1.5 text-[#305F4E]">
                              <div className="w-4 h-4 rounded-full border border-[#305F4E]/50 flex items-center justify-center text-[8px]">
                                <svg className="w-2.5 h-2.5 text-[#305F4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 0 0 7M21 5L10 16M4 20l4-4" />
                                </svg>
                              </div>
                              <span className="truncate max-w-[130px] tracking-tight">{outlet.foodCourtName}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-[#256385] truncate max-w-[130px]">
                              <span className="truncate">{outlet.outletName}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="w-1.5 flex-shrink-0" aria-hidden="true" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* CONDITION B: Single Food Court Selected (or Search Active) */
          <div>
            {(() => {
              const displayedOutlets = isSearching
                ? allOutlets.filter(filterOutlet)
                : allOutlets.filter((o) => o.foodCourtId === selectedCourtId);

              if (displayedOutlets.length === 0) {
                return (
                  <div className="mx-5 p-8 rounded-3xl bg-white border border-slate-200/80 text-center space-y-3 shadow-xs">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 text-3xl flex items-center justify-center mx-auto">
                      🍽️
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-extrabold text-neutral-900">
                        No images uploaded yet.
                      </h3>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto font-medium">
                        Food court managers haven't uploaded menus for {currentWindow === "lunch" ? "Lunch" : "Dinner"} yet.
                      </p>
                    </div>
                    <Link
                      href="/admin"
                      className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold shadow-xs hover:bg-neutral-800 transition-colors"
                    >
                      <span>📸</span>
                      <span>Manager Upload</span>
                    </Link>
                  </div>
                );
              }

              return (
                <div
                  className="flex space-x-3.5 overflow-x-auto px-5 scroll-px-5 pb-3 scrollbar-none snap-x snap-mandatory"
                  style={{ scrollPaddingLeft: "20px", scrollPaddingRight: "20px" }}
                >
                  {displayedOutlets.map((outlet) => (
                    <div
                      key={outlet.id}
                      onClick={() => onSelectOutlet(outlet)}
                      className="snap-start flex-shrink-0 w-[275px] sm:w-[295px] bg-white rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-neutral-100 hover:shadow-md transition-all duration-150 cursor-pointer group flex flex-col"
                    >
                      <div className="relative h-44 w-full bg-slate-900 overflow-hidden rounded-t-[24px]">
                        <img
                          src={outlet.imageUrl}
                          alt={outlet.outletName}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-white/95 text-neutral-900 shadow-xs backdrop-blur-sm">
                            {outlet.isFixedMenu ? "📌 Fixed Menu" : "🔥 Daily Special"}
                          </span>
                        </div>
                        <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white shadow-xs"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                        </div>
                      </div>

                      <div className="p-3.5 bg-white flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center space-x-1.5 text-[#305F4E]">
                          <div className="w-4 h-4 rounded-full border border-[#305F4E]/50 flex items-center justify-center text-[8px]">
                            <svg className="w-2.5 h-2.5 text-[#305F4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 0 0 7M21 5L10 16M4 20l4-4" />
                            </svg>
                          </div>
                          <span className="truncate max-w-[130px] tracking-tight">{outlet.foodCourtName}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-[#256385] truncate max-w-[130px]">
                          <span className="truncate">{outlet.outletName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="w-1.5 flex-shrink-0" aria-hidden="true" />
                </div>
              );
            })()}
          </div>
        )}
      </section>
    </div>
  );
};
