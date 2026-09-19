"use client";

import React, { useState, useEffect, useCallback } from "react";
import { MealWindow, OutletMenu } from "@/types/menu";
import { verifyAdminPassword, uploadMenuPhoto, deleteMenu, fetchMenuFeed } from "@/lib/api";
import { compressImage } from "@/lib/imageCompression";

const PRESET_FOOD_COURTS = [
  { id: "fc8", name: "Feasta (Guest FC)" },
  { id: "arena", name: "Arena (Sports Complex)" },
  { id: "oasis", name: "Oasis (South Zone)" },
  { id: "magna", name: "Magna (North Zone)" },
  { id: "maitri", name: "Maitri (Main Dining)" },
  { id: "enroute", name: "Enroute (Express FC)" },
  { id: "eli", name: "ILI (Executive Lounge)" },
  { id: "amoeba", name: "Ameba (Central FC)" },
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
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State (5-Step Flow)
  const [foodCourtId, setFoodCourtId] = useState(PRESET_FOOD_COURTS[0].id);
  const [outletName, setOutletName] = useState("");
  const [mealWindow, setMealWindow] = useState<MealWindow>("lunch");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 5: Uploaded Photos State
  const [uploadedMenus, setUploadedMenus] = useState<OutletMenu[]>([]);
  const [isLoadingUploaded, setIsLoadingUploaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  const loadUploadedPhotos = useCallback(async () => {
    setIsLoadingUploaded(true);
    try {
      const feed = await fetchMenuFeed(mealWindow);
      if (feed?.data?.foodCourts) {
        const court = feed.data.foodCourts.find((c) => c.foodCourtId === foodCourtId);
        if (court && Array.isArray(court.outlets)) {
          setUploadedMenus(court.outlets);
        } else {
          setUploadedMenus([]);
        }
      } else {
        setUploadedMenus([]);
      }
    } catch (err) {
      console.warn("Could not load uploaded photos in modal:", err);
      setUploadedMenus([]);
    } finally {
      setIsLoadingUploaded(false);
    }
  }, [mealWindow, foodCourtId]);

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const istHours = new Date(now.getTime() + 5.5 * 3600000).getUTCHours();
      setMealWindow(istHours >= 12 && istHours < 17 ? "lunch" : "dinner");

      const savedPw = sessionStorage.getItem("infosys_manager_pw");
      const savedAuth = sessionStorage.getItem("infosys_manager_auth");
      if (savedAuth === "true" && savedPw) {
        setIsAuthenticated(true);
        setPassword(savedPw);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadUploadedPhotos();
    }
  }, [isOpen, isAuthenticated, loadUploadedPhotos]);

  if (!isOpen) return null;

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
    setStatusMessage("Uploading menu photos & updating live feed...");

    try {
      await uploadMenuPhoto({
        password,
        foodCourtId,
        outletName: outletName.trim(),
        mealWindow,
        imageUrls: imagePreviews,
        imageUrl: imagePreviews[0],
      });

      setIsSuccess(true);
      setStatusMessage(`✓ ${imagePreviews.length} photo(s) updated successfully! See Step 5 below.`);
      setImagePreviews([]);
      await loadUploadedPhotos();
      onSuccess();
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(err.message || "Failed to upload menu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePhoto = async (id: string, outlet: string) => {
    const confirmed = window.confirm(`Delete this menu photo for "${outlet}"?`);
    if (!confirmed) return;

    setDeletingId(id);
    setDeleteMessage("");
    try {
      await deleteMenu(id, password);
      setUploadedMenus((prev) => prev.filter((m) => m.id !== id));
      setDeleteMessage(`✓ Photo for "${outlet}" deleted successfully.`);
      loadUploadedPhotos();
      onSuccess();
    } catch (err: any) {
      setDeleteMessage(err.message || "Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUploaded = outletName.trim()
    ? uploadedMenus.filter((m) =>
        m.outletName.toLowerCase().includes(outletName.trim().toLowerCase())
      )
    : uploadedMenus;

  const currentCourt = PRESET_FOOD_COURTS.find((fc) => fc.id === foodCourtId) || PRESET_FOOD_COURTS[0];

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      {/* Modal Dialog Box */}
      <div
        className="relative max-w-md w-full max-h-[90vh] bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Round Close Button at Top Right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition-colors z-20"
        >
          ✕
        </button>

        {/* Header */}
        <div className="bg-gradient-to-b from-[#FDF1DF] via-[#FDF3E3] to-[#FAF8F5] pt-5 pb-3 px-5 border-b border-amber-100/60 select-none flex-shrink-0">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            Food Court Manager Portal
          </h2>
          <p className="text-[11px] text-slate-500 font-medium">
            5-Step Menu Management Flow
          </p>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Password Screen */}
          {!isAuthenticated ? (
            <div className="space-y-5 pt-2 text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center text-2xl mx-auto border border-amber-200/60">
                🔐
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Manager Access
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Enter password to upload or remove daily food court menus.
                </p>
              </div>

              <form onSubmit={handleVerify} className="space-y-3.5">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter manager password..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-900 font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 text-center"
                    required
                  />
                  {authError && (
                    <p className="text-xs text-rose-500 font-bold pt-1.5">
                      {authError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <span>{isVerifying ? "Verifying..." : "Verify Manager Access"}</span>
                  <span>→</span>
                </button>
              </form>
            </div>
          ) : (
            /* 5-Step Upload & Photo Management Form */
            <div className="space-y-5">
              {/* 1. Choose Food Court */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Choose Food Court:</span>
                </label>
                <select
                  value={foodCourtId}
                  onChange={(e) => setFoodCourtId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  {PRESET_FOOD_COURTS.map((fc) => (
                    <option key={fc.id} value={fc.id}>
                      {fc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Outlet Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Outlet Name:</span>
                </label>
                <input
                  type="text"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="e.g. Shivam Caterers, Fit Bite..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {SUGGESTED_OUTLETS.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setOutletName(name)}
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border transition-colors ${
                        outletName === name
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                      }`}
                    >
                      + {name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Meal Window */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>Meal Window:</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMealWindow("lunch")}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1 transition-all ${
                      mealWindow === "lunch" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <span>☀️</span>
                    <span>Lunch</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMealWindow("dinner")}
                    className={`py-2 rounded-lg font-bold text-xs flex items-center justify-center space-x-1 transition-all ${
                      mealWindow === "dinner" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"
                    }`}
                  >
                    <span>🌙</span>
                    <span>Dinner</span>
                  </button>
                </div>
              </div>

              {/* 4. Upload New Photos */}
              <form onSubmit={handleSubmit} className="space-y-2.5 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                      4
                    </span>
                    <span>Upload New Photos:</span>
                  </label>
                  {imagePreviews.length > 0 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {imagePreviews.length} selected
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
                            title="Remove preview"
                          >
                            ✕
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2">
                      <label className="flex-1 text-center py-2 px-3 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer text-[11px] font-bold text-emerald-800 transition-colors">
                        ➕ Add More Photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setImagePreviews([])}
                        className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200/60 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 bg-slate-50 rounded-2xl p-3 text-center">
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

                {statusMessage && (
                  <div
                    className={`p-2.5 rounded-xl text-xs font-bold text-center border ${
                      isSuccess
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {statusMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || isCompressing || imagePreviews.length === 0 || !outletName.trim()}
                  className="w-full py-3 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all disabled:opacity-40"
                >
                  {isCompressing
                    ? "Optimizing Photos..."
                    : isSubmitting
                    ? "Updating Photos..."
                    : imagePreviews.length > 0
                    ? `Update ${imagePreviews.length > 1 ? `${imagePreviews.length} Photos` : "Photo"}`
                    : "Update Photo"}
                </button>
              </form>

              {/* 5. Uploaded Photos: "These are the last updated photos for today" */}
              <div className="space-y-2.5 pt-2 border-t-2 border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase flex items-center space-x-1.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                        5
                      </span>
                      <span>Uploaded Photos:</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-medium">
                      These are the last updated photos for today.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={loadUploadedPhotos}
                    disabled={isLoadingUploaded}
                    className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-full border border-slate-200 transition-colors"
                  >
                    {isLoadingUploaded ? "Refreshing..." : "🔄 Refresh"}
                  </button>
                </div>

                {deleteMessage && (
                  <div className="p-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 text-center">
                    {deleteMessage}
                  </div>
                )}

                {isLoadingUploaded ? (
                  <div className="py-6 text-center space-y-1.5">
                    <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                    <p className="text-[11px] text-slate-400">Loading uploaded photos...</p>
                  </div>
                ) : filteredUploaded.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>{outletName.trim() ? `Photos for ${outletName}` : `Photos in ${currentCourt.name}`}</span>
                      <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {filteredUploaded.length} Active
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {filteredUploaded.map((photo) => (
                        <div
                          key={photo.id}
                          className="flex items-center space-x-3 p-2 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/60 transition-colors"
                        >
                          <div className="w-14 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0 relative">
                            <img
                              src={photo.imageUrl}
                              alt={photo.outletName}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-black text-slate-900 truncate">
                              {photo.outletName}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center space-x-1.5 pt-0.5">
                              <span className="font-bold text-emerald-700">{photo.updatedAtFormatted || "Today"}</span>
                              <span>•</span>
                              <span>{photo.mealWindow === "lunch" ? "☀️ Lunch" : "🌙 Dinner"}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleDeletePhoto(photo.id, photo.outletName)}
                            disabled={deletingId === photo.id}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors disabled:opacity-50 flex-shrink-0"
                            title="Delete this photo"
                          >
                            {deletingId === photo.id ? "..." : "Remove"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                    <p className="text-xs font-bold text-slate-700">
                      No photos uploaded yet for today.
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Use Step 4 above to upload photos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
