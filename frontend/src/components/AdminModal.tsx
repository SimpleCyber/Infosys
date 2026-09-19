"use client";

import React, { useState, useEffect } from "react";
import { MealWindow } from "@/types/menu";
import { verifyAdminPassword, uploadMenuPhoto } from "@/lib/api";
import { compressImage } from "@/lib/imageCompression";

const PRESET_FOOD_COURTS = [
  { id: "magna", name: "Magna (North Zone)" },
  { id: "arena", name: "Arena (Sports Complex)" },
  { id: "oasis", name: "Oasis (South Zone)" },
  { id: "maitri", name: "Maitri (Main Dining)" },
  { id: "enroute", name: "Enroute (Express FC)" },
  { id: "eli", name: "ILI (Executive Lounge)" },
  { id: "amoeba", name: "Ameba (Central FC)" },
  { id: "fc8", name: "FC 8 (Guest FC)" },
];

const SUGGESTED_OUTLETS = [
  "Shivam Caterers",
  "Purple Grapes",
  "Royal Caterers",
  "Fit Bite",
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const istHours = new Date(now.getTime() + 5.5 * 3600000).getUTCHours();
      setMealWindow(istHours >= 12 && istHours < 17 ? "lunch" : "dinner");
    }
  }, [isOpen]);

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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setIsCompressing(true);
      setStatusMessage("Optimizing photos for fast upload...");

      try {
        const compressedList = await Promise.all(
          fileList.map((file) => compressImage(file))
        );
        setImagePreviews((prev) => [...prev, ...compressedList]);
        setStatusMessage("");
      } catch (err) {
        console.error("Image compression error:", err);
        setStatusMessage("Failed to process images. Please try again.");
      } finally {
        setIsCompressing(false);
        e.target.value = "";
      }
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outletName.trim()) {
      setStatusMessage("Please enter or select an outlet name");
      return;
    }
    if (imagePreviews.length === 0) {
      setStatusMessage("Please take or upload at least one menu photo");
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
        imageUrls: imagePreviews,
        imageUrl: imagePreviews[0],
        isFixedMenu,
      });

      setStatusMessage("Menu updated successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
        setIsAuthenticated(false);
        setPassword("");
        setImagePreviews([]);
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
              {/* 24-Hour Daily Midnight Lifecycle Notice Banner */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/80 flex items-start space-x-2 shadow-2xs">
                <span className="text-sm flex-shrink-0 mt-0.5">🌙</span>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-black text-emerald-950">24-Hour Daily Refresh Cycle</p>
                  <p className="text-[10px] text-emerald-900/80 leading-relaxed font-medium">
                    Menus stay active all day and automatically reset at 12:00 midnight IST. Uploading a new photo replaces today&apos;s active chalkboard photo.
                  </p>
                </div>
              </div>

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
                  placeholder="e.g. Royal Caterers, Fit Bite..."
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
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">3. Take Photo / Upload Images</label>
                  {imagePreviews.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {imagePreviews.length} photo{imagePreviews.length > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                {imagePreviews.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {imagePreviews.map((img, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[4/3] bg-black">
                          <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm"
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    <label className="block text-center py-2 px-3 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer text-[11px] font-bold text-emerald-800 transition-colors">
                      ➕ Add Another Photo
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 rounded-2xl p-2.5 text-center">
                    <label className="cursor-pointer space-y-1 block py-2">
                      <div className="text-xl">📷</div>
                      <p className="text-xs text-slate-700 font-bold">Tap to capture or upload</p>
                      <p className="text-[10px] text-slate-400">Supports multiple photos</p>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        capture="environment"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {statusMessage && (
                <p className="text-xs text-center font-bold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || isCompressing || imagePreviews.length === 0}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl transition-all disabled:opacity-50"
              >
                {isCompressing
                  ? "Optimizing Photos..."
                  : isSubmitting
                  ? "Updating & Purging Cache..."
                  : "Save Menu & Update Feed"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
