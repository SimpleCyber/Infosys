"use client";

import React, { useState } from "react";
import { MealWindow } from "@/types/menu";
import { verifyAdminPassword, uploadMenuPhoto } from "@/lib/api";

const PRESET_FOOD_COURTS = [
  { id: "amoeba", name: "Amoeba (Central FC)" },
  { id: "maitri", name: "Maitri (Main Dining)" },
  { id: "oasis", name: "Oasis (South Zone)" },
  { id: "enroute", name: "Enroute (Express FC)" },
  { id: "eli", name: "ELI (Executive Lounge)" },
  { id: "magna", name: "Magna (North Zone)" },
  { id: "arena", name: "Arena (Sports Complex)" },
  { id: "fc8", name: "Food Court 8 (Guest FC)" },
];

const SUGGESTED_OUTLETS = [
  "Shivam Caterers",
  "Purple Grapes",
  "Annapurna",
  "Shawarma Point",
  "Juice & Shakes",
  "Coffee Day Express",
  "South Indian Special",
  "Tandoori Junction",
];

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  
  // Form State
  const [foodCourtId, setFoodCourtId] = useState(PRESET_FOOD_COURTS[0].id);
  const [outletName, setOutletName] = useState("");
  const [mealWindow, setMealWindow] = useState<MealWindow>("lunch");
  const [isFixedMenu, setIsFixedMenu] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      const isValid = await verifyAdminPassword(password);
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        setAuthError("Incorrect manager password");
      }
    } catch {
      setAuthError("Failed to connect to authentication server");
    }
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
    setStatusMessage("Uploading menu & purging Redis cache...");

    try {
      await uploadMenuPhoto({
        password,
        foodCourtId,
        outletName: outletName.trim(),
        mealWindow,
        imageUrl: imagePreview,
        isFixedMenu,
      });

      setStatusMessage("Menu updated successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
        setIsAuthenticated(false);
        setPassword("");
        setImagePreview(null);
        setOutletName("");
      }, 1000);
    } catch (err: any) {
      setStatusMessage(err.message || "Failed to upload menu");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Dialog Box (Matching Reference Image 2 in White Theme) */}
      <div
        className="relative max-w-sm w-full bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Round Close Button at Top Right (Matching Reference Image 2) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center font-bold text-sm transition-colors"
        >
          ✕
        </button>

        {/* Password Screen (Matching Reference Screenshot 2 layout) */}
        {!isAuthenticated ? (
          <div className="space-y-6 pt-2 text-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Manager Access
              </h2>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                AUTH TO YOUR ACCOUNT
              </p>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Enter manager password to upload daily food court menu images.
            </p>

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1 text-left">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter manager password..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all text-center"
                  required
                />
                {authError && (
                  <p className="text-xs text-rose-500 font-semibold text-center pt-1">
                    {authError}
                  </p>
                )}
              </div>

              {/* Login Button (Matching Google Button style in Image 2) */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-xl transition-all flex items-center justify-center space-x-2"
              >
                <span>🔑 Verify Manager Access</span>
              </button>

              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                SECURE MANAGER LOGIN
              </p>
            </form>
          </div>
        ) : (
          /* Menu Upload Form */
          <div className="space-y-4">
            <div className="space-y-0.5">
              <h3 className="text-xl font-black text-slate-900">Upload Menu</h3>
              <p className="text-xs text-slate-400 font-medium">
                Select food court & upload photo
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              {/* Food Court Select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">1. Food Court</label>
                <select
                  value={foodCourtId}
                  onChange={(e) => setFoodCourtId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {PRESET_FOOD_COURTS.map((fc) => (
                    <option key={fc.id} value={fc.id}>
                      {fc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Outlet Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">2. Outlet / Caterer Name</label>
                <input
                  type="text"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="e.g. Shivam Caterers, Purple Grapes..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <div className="flex flex-wrap gap-1 pt-1">
                  {SUGGESTED_OUTLETS.slice(0, 4).map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setOutletName(name)}
                      className="text-[9px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-lg transition-colors"
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Meal Window & Fixed Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Meal Window</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setMealWindow("lunch")}
                      className={`flex-1 py-1 rounded-lg font-bold text-[10px] ${
                        mealWindow === "lunch" ? "bg-amber-400 text-slate-950 shadow-sm" : "text-slate-500"
                      }`}
                    >
                      ☀️ Lunch
                    </button>
                    <button
                      type="button"
                      onClick={() => setMealWindow("dinner")}
                      className={`flex-1 py-1 rounded-lg font-bold text-[10px] ${
                        mealWindow === "dinner" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"
                      }`}
                    >
                      🌙 Dinner
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Menu Type</label>
                  <button
                    type="button"
                    onClick={() => setIsFixedMenu(!isFixedMenu)}
                    className={`w-full py-1.5 px-2 rounded-xl border font-bold text-[10px] transition-colors ${
                      isFixedMenu
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {isFixedMenu ? "📌 Fixed Menu" : "🔥 Changing Daily"}
                  </button>
                </div>
              </div>

              {/* Menu Photo Upload */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">3. Take Photo / Upload Image</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 rounded-2xl p-2.5 text-center">
                  {imagePreview ? (
                    <div className="space-y-1">
                      <img
                        src={imagePreview}
                        alt="Menu preview"
                        className="max-h-28 mx-auto rounded-lg object-contain border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="text-[10px] text-rose-500 font-bold hover:underline"
                      >
                        Remove photo
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer space-y-1 block py-2">
                      <div className="text-xl">📷</div>
                      <p className="text-xs text-slate-700 font-bold">Tap to capture or upload</p>
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
              </div>

              {statusMessage && (
                <p className="text-xs text-center font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Updating & Purging Cache..." : "Save Menu & Update Feed"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
