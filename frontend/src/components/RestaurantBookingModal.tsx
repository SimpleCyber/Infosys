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
  isSoftExpired?: boolean;
  statusBanner?: string;
}

interface OutletDetailModalProps {
  outlet: CampusOutletCard | null;
  relatedOutlets?: CampusOutletCard[];
  onClose: () => void;
  onZoomImage?: (menu: OutletMenu) => void;
}

export const RestaurantBookingModal: React.FC<OutletDetailModalProps> = ({
  outlet,
  relatedOutlets = [],
  onClose,
  onZoomImage,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [hasImageError, setHasImageError] = useState(false);

  // Sync current index when outlet opens or changes
  React.useEffect(() => {
    if (outlet && relatedOutlets.length > 0) {
      const idx = relatedOutlets.findIndex((o) => o.id === outlet.id);
      setCurrentIndex(idx >= 0 ? idx : 0);
    } else {
      setCurrentIndex(0);
    }
    setIsZoomed(false);
    setHasImageError(false);
  }, [outlet, relatedOutlets]);

  if (!outlet) return null;

  const photosList = relatedOutlets.length > 0 ? relatedOutlets : [outlet];
  const activeOutlet = photosList[currentIndex] || outlet;

  const isLunch = activeOutlet.mealWindow === "lunch";
  const timingText = isLunch
    ? "12:00 PM – 3:30 PM (Serving Lunch)"
    : "7:00 PM – 10:30 PM (Serving Dinner)";

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasImageError(false);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photosList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHasImageError(false);
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev < photosList.length - 1 ? prev + 1 : 0));
  };

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
        <div className="relative h-64 sm:h-72 w-full bg-neutral-950 flex-shrink-0 group overflow-hidden select-none">
          {hasImageError ? (
            <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center space-y-2 select-none">
              <span className="text-4xl">⏱️</span>
              <span className="text-base font-black text-white">Menu Image Unavailable</span>
              <p className="text-xs text-slate-300 max-w-xs">
                This image was refreshed in the daily midnight cleanup. Waiting for manager update.
              </p>
            </div>
          ) : (
            <img
              src={activeOutlet.imageUrl}
              alt={activeOutlet.outletName}
              onError={() => setHasImageError(true)}
              onClick={() => setIsZoomed(!isZoomed)}
              className={`w-full h-full object-cover transition-all duration-300 cursor-zoom-in ${
                isZoomed ? "scale-125" : "scale-100"
              }`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none"></div>

          {/* Close Button at top right */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center font-bold text-sm backdrop-blur-md transition-colors shadow-sm z-10"
          >
            ✕
          </button>

          {/* Menu Type Tag */}
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white/95 text-neutral-900 shadow-md backdrop-blur-sm">
              {activeOutlet.isFixedMenu ? "📌 Fixed Outlet Menu" : "🔥 Changing Daily Special"}
            </span>
            {activeOutlet.isSoftExpired && (
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-amber-950 shadow-md backdrop-blur-sm">
                Yesterday&apos;s Menu
              </span>
            )}
          </div>

          {/* Multi-Photo Carousel Arrows (when > 1 photo exists) */}
          {photosList.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-lg backdrop-blur-md transition-all active:scale-90 shadow-md z-10"
                title="Previous photo"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-lg backdrop-blur-md transition-all active:scale-90 shadow-md z-10"
                title="Next photo"
              >
                ›
              </button>

              {/* Photo Counter Pill & Dots */}
              <div className="absolute bottom-3 left-4 flex items-center space-x-2 z-10">
                <span className="text-[10px] font-black text-white bg-black/70 backdrop-blur-sm px-2.5 py-0.5 rounded-full border border-white/20 shadow-xs">
                  Photo {currentIndex + 1} / {photosList.length}
                </span>
                <div className="flex items-center space-x-1">
                  {photosList.map((_, dotIdx) => (
                    <button
                      key={dotIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(dotIdx);
                      }}
                      className={`h-1.5 rounded-full transition-all ${
                        dotIdx === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Image zoom hint */}
          <div className="absolute bottom-3 right-4 z-10">
            <span className="text-[10px] text-white/80 font-semibold bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-sm">
              Tap to zoom
            </span>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Soft Expiry Alert Banner */}
          {activeOutlet.isSoftExpired && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-950 text-xs font-semibold flex items-center space-x-2.5 shadow-2xs">
              <span className="text-lg">⚠️</span>
              <div className="leading-snug">
                <span className="font-extrabold">Yesterday&apos;s Menu:</span> This food court hasn&apos;t posted today&apos;s fresh menu yet, so yesterday&apos;s chalkboard photo is displayed above.
              </div>
            </div>
          )}

          {/* Header Info */}
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200/60">
                <span>📍</span>
                <span>{activeOutlet.foodCourtName}</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 text-[11px] font-extrabold border border-amber-200/60">
                <span>{isLunch ? "Lunch Menu" : "Dinner Menu"}</span>
              </span>
            </div>

            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
              {activeOutlet.outletName}
            </h2>
            <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
              {activeOutlet.description ||
                `Daily prepared fresh menu items served at ${activeOutlet.foodCourtName} food court on Infosys Mysore Campus.`}
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
          <div className="flex items-center justify-between text-xs text-neutral-500 font-medium pt-1 px-1">
            <span className="flex items-center space-x-1">
              <span>🕒</span>
              <span>Status:</span>
            </span>
            <span className="text-neutral-800 font-bold px-2.5 py-0.5 rounded-md bg-slate-100 border border-slate-200/60">
              {activeOutlet.updatedAtFormatted || "Today"}
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
