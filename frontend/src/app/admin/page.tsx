"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MealWindow } from "@/types/menu";
import { verifyAdminPassword, uploadMenuPhoto } from "@/lib/api";
import { ALL_8_CAMPUS_FOOD_COURTS } from "@/components/FoodCourtFeed";

const SUGGESTED_OUTLETS = [
  "Shivam Caterers",
  "Purple Grapes",
  "Annapurna Meals",
];

export default function AdminPage() {
  const router = useRouter();

  // Auth State
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State
  const [selectedCourtId, setSelectedCourtId] = useState(ALL_8_CAMPUS_FOOD_COURTS[0].id);
  const [outletName, setOutletName] = useState("");
  const [mealWindow, setMealWindow] = useState<MealWindow>("lunch");
  const [isFixedMenu, setIsFixedMenu] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-select meal window based on current time & check saved session
  useEffect(() => {
    const now = new Date();
    const istHours = new Date(now.getTime() + 5.5 * 3600000).getUTCHours();
    const currentWindow: MealWindow = istHours >= 12 && istHours < 17 ? "lunch" : "dinner";
    setMealWindow(currentWindow);

    const saved = sessionStorage.getItem("infosys_manager_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
      const savedPw = sessionStorage.getItem("infosys_manager_pw");
      if (savedPw) setPassword(savedPw);
    }
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsVerifying(true);
    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        setIsAuthenticated(true);
        sessionStorage.setItem("infosys_manager_auth", "true");
        sessionStorage.setItem("infosys_manager_pw", password);
      } else {
        setAuthError("Incorrect manager password. Please try again.");
      }
    } catch {
      setAuthError("Failed to connect to authentication server");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("infosys_manager_auth");
    sessionStorage.removeItem("infosys_manager_pw");
    setIsAuthenticated(false);
    setPassword("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName.trim()) {
      setStatusMessage("Please enter or select an outlet name");
      return;
    }
    if (!imagePreview) {
      setStatusMessage("Please take or upload a menu photo");
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Uploading menu & updating live campus feed...");

    try {
      await uploadMenuPhoto({
        password,
        foodCourtId: selectedCourtId,
        outletName: outletName.trim(),
        mealWindow,
        imageUrl: imagePreview,
        isFixedMenu,
      });

      setIsSuccess(true);
      setStatusMessage("Menu uploaded successfully! Live feed updated.");
      setTimeout(() => {
        router.push("/");
      }, 1400);
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to upload menu photo");
      setIsSubmitting(false);
    }
  };

  const activeCourt =
    ALL_8_CAMPUS_FOOD_COURTS.find((c) => c.id === selectedCourtId) ||
    ALL_8_CAMPUS_FOOD_COURTS[0];

  return (
    <div className="bg-[#D4E2DC] h-[100dvh] sm:min-h-screen sm:h-auto text-slate-900 flex flex-col items-center justify-center sm:p-4 overflow-hidden sm:overflow-auto selection:bg-emerald-600 selection:text-white antialiased font-sans">
      <main className="w-full max-w-[392px] h-full sm:h-auto sm:min-h-[820px] bg-white sm:rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] sm:border sm:border-slate-300/60 flex flex-col relative overflow-hidden">
        {/* Warm, Spacious Header Bar matching App Palette */}
        <div className="bg-gradient-to-b from-[#FDF1DF] via-[#FDF3E3] to-[#FAF8F5] pt-5 pb-4 px-5 border-b border-amber-100/60 space-y-3 shadow-xs select-none flex-shrink-0">
          {/* Top Row: Back Navigation Button & Logout Button (if authenticated) */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-neutral-700 hover:text-neutral-900 bg-white/90 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-amber-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all active:scale-95"
            >
              <span>←</span>
              <span>Back to Food Courts</span>
            </Link>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={handleLogout}
                className="text-[11px] font-extrabold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/80 px-3 py-1.5 rounded-full border border-rose-200/70 transition-all active:scale-95 shadow-2xs"
              >
                Logout
              </button>
            ) : (
              <span className="text-[11px] font-bold text-neutral-400 bg-white/60 px-2.5 py-1 rounded-full border border-amber-200/40">
                Staff Only
              </span>
            )}
          </div>

          {/* Title Row: Clean, Prominent & Uncluttered */}
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#1E4D3E] bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded-md">
                Manager Portal
              </span>
              <span className="text-[11px] font-semibold text-neutral-500">
                Infosys Mysore Campus
              </span>
            </div>
            <h1 className="text-xl sm:text-[22px] font-black text-neutral-900 tracking-tight leading-tight">
              Daily Menu Upload
            </h1>
          </div>
        </div>

        {/* Auth Screen if not logged in */}
        {!isAuthenticated ? (
          <div className="flex-1 p-6 flex flex-col justify-center text-center space-y-5 bg-gradient-to-b from-white to-slate-50/50">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-900 flex items-center justify-center text-3xl mx-auto shadow-sm border border-amber-200/60">
              🔐
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-neutral-900 tracking-tight">
                Manager Verification
              </h2>
              <p className="text-xs text-neutral-500 font-medium max-w-xs mx-auto">
                Enter manager password to upload and update daily food court menus.
              </p>
            </div>

            <form onSubmit={handleVerify} className="space-y-3.5 pt-2">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter manager password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm text-neutral-900 font-medium text-center placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all shadow-xs"
                  required
                />
                {authError && (
                  <p className="text-xs text-rose-500 font-bold mt-1.5">{authError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50 active:scale-98"
              >
                <span>{isVerifying ? "Verifying..." : "Verify Access"}</span>
                <span>→</span>
              </button>
            </form>
          </div>
        ) : (
          /* Manager Upload Form */
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-5 space-y-5 pb-[max(3rem,env(safe-area-inset-bottom))]"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* 6-Hour Menu Lifecycle Notice Banner */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 flex items-start space-x-2.5 shadow-2xs">
              <span className="text-base flex-shrink-0 mt-0.5">⏱️</span>
              <div className="space-y-0.5">
                <p className="text-xs font-black text-amber-950 tracking-tight">6-Hour Menu Rotation Cycle</p>
                <p className="text-[11px] text-amber-900/80 leading-relaxed font-medium">
                  Uploaded menu images remain live for this 6-hour window and are automatically purged by the campus cron job every 6 hours.
                </p>
              </div>
            </div>

            {/* 1. Food Court Selection: Scrollable Carousel with Safe Padding to Prevent Any Ring Cropping */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-800 tracking-tight uppercase">
                  1. Choose Food Court:
                </label>
                <span className="text-[11px] font-extrabold text-[#1E4D3E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {activeCourt.name} Selected
                </span>
              </div>

              <div className="relative -mx-5 px-5">
                <div className="flex space-x-3 overflow-x-auto pt-2.5 pb-2.5 px-1 scrollbar-none no-scrollbar snap-x snap-mandatory">
                  {ALL_8_CAMPUS_FOOD_COURTS.map((court) => {
                    const isSelected = selectedCourtId === court.id;
                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => setSelectedCourtId(court.id)}
                        className="snap-start flex-shrink-0 flex flex-col items-center group focus:outline-none w-[68px] sm:w-[72px] p-1 select-none transition-transform active:scale-95"
                      >
                        {/* Rounded Pastel Box */}
                        <div
                          className={`w-full aspect-square rounded-[20px] flex items-center justify-center transition-all duration-200 border ${
                            court.bg
                          } ${
                            isSelected
                              ? "border-[#1E4D3E] ring-2 ring-[#1E4D3E]/40 ring-offset-2 ring-offset-white shadow-[0_4px_16px_rgba(30,77,62,0.2)] scale-[1.04]"
                              : `${court.border} opacity-80 hover:opacity-100`
                          }`}
                        >
                          <div className="scale-90">{court.icon}</div>
                        </div>

                        {/* Label */}
                        <span
                          className={`text-[11px] font-bold tracking-tight mt-1.5 transition-colors truncate max-w-full text-center ${
                            isSelected
                              ? "text-[#1E4D3E] font-black underline underline-offset-2"
                              : "text-neutral-600"
                          }`}
                        >
                          {court.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Outlet Name */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-800 tracking-tight uppercase">
                2. Outlet Name:
              </label>
              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                placeholder='e.g., "Shivam Caterers", "Purple Grapes"...'
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-bold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 shadow-xs"
                required
              />

              {/* Quick suggestions pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {SUGGESTED_OUTLETS.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setOutletName(name)}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Meal Window Switcher (Segmented Control matching Navbar) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-800 tracking-tight uppercase">
                3. Meal Window:
              </label>
              <div className="grid grid-cols-2 gap-2 bg-black/[0.05] p-1 rounded-2xl border border-black/[0.06]">
                <button
                  type="button"
                  onClick={() => setMealWindow("lunch")}
                  className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
                    mealWindow === "lunch"
                      ? "bg-white text-neutral-900 shadow-sm scale-[1.01]"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <span>☀️</span>
                  <span>Lunch Window</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMealWindow("dinner")}
                  className={`py-2.5 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 transition-all ${
                    mealWindow === "dinner"
                      ? "bg-neutral-900 text-white shadow-sm scale-[1.01]"
                      : "text-neutral-500 hover:text-neutral-800"
                  }`}
                >
                  <span>🌙</span>
                  <span>Dinner Window</span>
                </button>
              </div>
            </div>

            {/* 4. Menu Type Toggle */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-800 tracking-tight uppercase">
                4. Menu Type:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsFixedMenu(false)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all text-left ${
                    !isFixedMenu
                      ? "bg-emerald-50 text-emerald-950 border-emerald-500 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <div>🔥 Daily Special</div>
                  <div className="text-[10px] text-neutral-400 font-normal">Changes daily</div>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFixedMenu(true)}
                  className={`py-2.5 px-3 rounded-2xl text-xs font-extrabold border transition-all text-left ${
                    isFixedMenu
                      ? "bg-emerald-50 text-emerald-950 border-emerald-500 shadow-xs"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  <div>📌 Fixed Menu</div>
                  <div className="text-[10px] text-neutral-400 font-normal">Standard outlet card</div>
                </button>
              </div>
            </div>

            {/* 5. Menu Photo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-800 tracking-tight uppercase">
                5. Take / Upload Menu Photo:
              </label>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-neutral-950 h-52 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Menu preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="absolute top-3 right-3 bg-black/70 hover:bg-black/90 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs backdrop-blur-sm transition-colors"
                    title="Remove and retake"
                  >
                    ✕
                  </button>
                  <div className="absolute bottom-3 left-3 text-white text-xs font-bold">
                    ✓ Photo Ready for {activeCourt.name}
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/20 transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-2xl shadow-xs">
                    📸
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-neutral-800">
                      Tap to photograph or select menu image
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Supports phone camera & file upload (JPG, PNG, WebP)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Status Message */}
            {statusMessage && (
              <p
                className={`text-xs font-bold text-center ${
                  isSuccess ? "text-emerald-700" : "text-rose-600"
                }`}
              >
                {statusMessage}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !imagePreview || !outletName.trim()}
              className="w-full py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 active:scale-98"
            >
              <span>{isSubmitting ? "Publishing Menu..." : `Publish Menu to ${activeCourt.name}`}</span>
              <span>→</span>
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
