"use client";

import React, { useState } from "react";
import { MealWindow, OutletMenu } from "@/types/menu";

export interface CampusOutletCard {
  id: string;
  outletName: string;
  foodCourtId: string;
  foodCourtName: string;
  mealWindow: MealWindow;
  imageUrl: string;
  isFixedMenu: boolean;
  updatedAtFormatted?: string;
  description?: string;
}

interface OutletDetailModalProps {
  outlet: CampusOutletCard | null;
  onClose: () => void;
  onZoomImage?: (menu: OutletMenu) => void;
}

export const RestaurantBookingModal: React.FC<OutletDetailModalProps> = ({
  outlet,
  onClose,
  onZoomImage,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!outlet) return null;

  const isLunch = outlet.mealWindow === "lunch";
  const timingText = isLunch
    ? "12:00 PM – 3:30 PM (Serving Lunch ☀️)"
    : "7:00 PM – 10:30 PM (Serving Dinner 🌙)";

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-end sm:items-center justify-center animate-fade-in p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-[32px] sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Menu Board Image */}
        <div className="relative h-64 sm:h-72 w-full bg-neutral-950 flex-shrink-0 group overflow-hidden">
          <img
            src={outlet.imageUrl}
            alt={outlet.outletName}
            onClick={() => setIsZoomed(!isZoomed)}
            className={`w-full h-full object-cover transition-all duration-300 cursor-zoom-in ${
              isZoomed ? "scale-125" : "scale-100"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none"></div>

          {/* Close Button at top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center font-bold text-sm backdrop-blur-md transition-colors shadow-sm"
          >
            ✕
          </button>

          {/* Menu Type Tag */}
          <div className="absolute top-4 left-4">
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/95 text-neutral-900 shadow-md backdrop-blur-sm">
              {outlet.isFixedMenu ? "📌 Fixed Outlet Menu" : "🔥 Changing Daily Special"}
            </span>
          </div>

          {/* Image hint */}
          <div className="absolute bottom-3 right-4">
            <span className="text-[10px] text-white/80 font-semibold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Tap photo to zoom
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Header Info */}
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200/60">
                <span>📍</span>
                <span>{outlet.foodCourtName}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-extrabold border border-amber-200/60">
                <span>{isLunch ? "☀️ Lunch Menu" : "🌙 Dinner Menu"}</span>
              </span>
            </div>

            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
              {outlet.outletName}
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
              {outlet.description ||
                `Daily prepared fresh menu items served at ${outlet.foodCourtName} food court on Infosys Mysore Campus.`}
            </p>
          </div>

          {/* Fixed Timing Duration Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
            <div className="flex items-center space-x-2 text-neutral-800 text-xs font-bold">
              <span>⏰</span>
              <span className="uppercase tracking-wider text-[11px] text-neutral-500">Service Hours:</span>
            </div>
            <div className="text-sm font-extrabold text-neutral-900 pl-6">
              {timingText}
            </div>
          </div>

          {/* Timestamp Info */}
          <div className="flex items-center justify-between text-xs text-neutral-400 font-medium pt-1 px-1">
            <span>Last Updated:</span>
            <span className="text-neutral-700 font-semibold">
              {outlet.updatedAtFormatted || "Today"}
            </span>
          </div>
        </div>

        {/* Clean Simple Close Button */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-extrabold transition-colors shadow-md flex items-center justify-center space-x-1.5"
          >
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};
