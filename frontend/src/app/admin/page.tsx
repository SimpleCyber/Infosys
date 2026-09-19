"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { MealWindow, OutletMenu } from "@/types/menu";
import { verifyAdminPassword, uploadMenuPhoto, deleteMenu, fetchMenuFeed } from "@/lib/api";
import { compressImage } from "@/lib/imageCompression";
import { ALL_8_CAMPUS_FOOD_COURTS } from "@/components/FoodCourtFeed";
import { Trash2, X } from "lucide-react";

const SUGGESTED_OUTLETS = [
  "Shivam Caterers",
  "Purple Grapes",
  "Royal Caterers",
  "Fit Bite",
  "Chettais"
];

export default function AdminPage() {
  // Auth State
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Form State (5-Step Flow)
  // Step 1: Food Court
  const [selectedCourtId, setSelectedCourtId] = useState(ALL_8_CAMPUS_FOOD_COURTS[0].id);
  // Step 2: Outlet Name
  const [outletName, setOutletName] = useState("");
  // Step 3: Meal Window
  const [mealWindow, setMealWindow] = useState<MealWindow>("lunch");
  // Step 4: Upload New Photos
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Step 5: Uploaded Photos
  const [uploadedMenus, setUploadedMenus] = useState<OutletMenu[]>([]);
  const [isLoadingUploaded, setIsLoadingUploaded] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [photoToDelete, setPhotoToDelete] = useState<OutletMenu | null>(null);

  // Load uploaded photos from server for selected court & meal window
  const loadUploadedPhotos = useCallback(async () => {
    setIsLoadingUploaded(true);
    try {
      const feed = await fetchMenuFeed(mealWindow);
      if (feed?.data?.foodCourts) {
        const court = feed.data.foodCourts.find((c) => c.foodCourtId === selectedCourtId);
        if (court && Array.isArray(court.outlets)) {
          setUploadedMenus(court.outlets);
        } else {
          setUploadedMenus([]);
        }
      } else {
        setUploadedMenus([]);
      }
    } catch (err) {
      console.warn("Could not load uploaded photos:", err);
      setUploadedMenus([]);
    } finally {
      setIsLoadingUploaded(false);
    }
  }, [mealWindow, selectedCourtId]);

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

  // Whenever authenticated, food court or meal window changes, load uploaded photos
  useEffect(() => {
    if (isAuthenticated) {
      loadUploadedPhotos();
    }
  }, [isAuthenticated, loadUploadedPhotos]);

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
    setUploadedMenus([]);
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
        console.error("Image processing error:", err);
        setStatusMessage("Failed to process some images. Please try again.");
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
    setStatusMessage(
      `Uploading ${imagePreviews.length} menu photo${imagePreviews.length > 1 ? "s" : ""} & updating live feed...`
    );

    try {
      await uploadMenuPhoto({
        password,
        foodCourtId: selectedCourtId,
        outletName: outletName.trim(),
        mealWindow,
        imageUrls: imagePreviews,
        imageUrl: imagePreviews[0],
      });

      setIsSuccess(true);
      setStatusMessage(
        `✓ ${imagePreviews.length} photo${imagePreviews.length > 1 ? "s" : ""} updated successfully! See Step 5 below.`
      );
      // Clear selected previews so manager can upload more or manage uploaded photos
      setImagePreviews([]);
      // Reload Step 5 uploaded photos immediately
      await loadUploadedPhotos();
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(err.message || "Failed to upload menu photo");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (photo: OutletMenu) => {
    setDeletingId(photo.id);
    setDeleteMessage("");
    try {
      await deleteMenu(photo.id, password);
      // Optimistic update: remove from local state immediately
      setUploadedMenus((prev) => prev.filter((m) => m.id !== photo.id));
      setDeleteMessage(`✓ Photo for "${photo.outletName}" removed successfully.`);
      setPhotoToDelete(null);
      // Sync with server
      loadUploadedPhotos();
    } catch (err: any) {
      setDeleteMessage(err.message || "Failed to delete photo. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const activeCourt =
    ALL_8_CAMPUS_FOOD_COURTS.find((c) => c.id === selectedCourtId) ||
    ALL_8_CAMPUS_FOOD_COURTS[0];

  // Filter Step 5 photos: if outletName is specified, filter to it; else show all for court
  const filteredUploaded = outletName.trim()
    ? uploadedMenus.filter((m) =>
        m.outletName.toLowerCase().includes(outletName.trim().toLowerCase())
      )
    : uploadedMenus;

  return (
    <div className="bg-[#D4E2DC] h-[100dvh] sm:min-h-screen sm:h-auto text-slate-900 flex flex-col items-center justify-center sm:p-4 overflow-hidden sm:overflow-auto selection:bg-emerald-600 selection:text-white antialiased font-sans">
      <main className="w-full max-w-[410px] h-full sm:h-auto sm:min-h-[840px] bg-white sm:rounded-[40px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.22)] sm:border sm:border-slate-300/60 flex flex-col relative overflow-hidden">
        {/* Warm, Spacious Header Bar */}
        <div className="bg-gradient-to-b from-[#FDF1DF] via-[#FDF3E3] to-[#FAF8F5] pt-5 pb-4 px-5 border-b border-amber-100/60 space-y-3 shadow-xs select-none flex-shrink-0">
          {/* Top Row: Back Navigation Button & Logout Button */}
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

          {/* Title Row */}
          <div className="space-y-0.5">
            <h1 className="text-xl sm:text-[22px] font-black text-neutral-900 tracking-tight leading-tight">
              Food Court Manager Portal
            </h1>
            <p className="text-[11px] text-neutral-500 font-medium">
              Update and manage daily menu photos for campus outlets
            </p>
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
          /* Manager 5-Step Portal */
          <div
            className="flex-1 overflow-y-auto overscroll-contain no-scrollbar p-5 space-y-6 pb-[max(3rem,env(safe-area-inset-bottom))]"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* 1. Choose Food Court */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-800 tracking-tight uppercase flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Choose Food Court:</span>
                </label>
                <span className="text-[11px] font-extrabold text-[#1E4D3E] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {activeCourt.name} Selected
                </span>
              </div>

              <div className="relative -mx-5 px-5">
                <div className="flex space-x-3 overflow-x-auto pt-2 pb-2.5 px-1 scrollbar-none no-scrollbar snap-x snap-mandatory">
                  {ALL_8_CAMPUS_FOOD_COURTS.map((court) => {
                    const isSelected = selectedCourtId === court.id;
                    return (
                      <button
                        key={court.id}
                        type="button"
                        onClick={() => setSelectedCourtId(court.id)}
                        className="snap-start flex-shrink-0 flex flex-col items-center group focus:outline-none w-[68px] sm:w-[72px] p-1 select-none transition-transform active:scale-95"
                      >
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
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-800 tracking-tight uppercase flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Outlet Name:</span>
                </label>
                {outletName && (
                  <button
                    type="button"
                    onClick={() => setOutletName("")}
                    className="text-[10px] font-bold text-neutral-400 hover:text-rose-600"
                  >
                    Clear
                  </button>
                )}
              </div>

              <input
                type="text"
                value={outletName}
                onChange={(e) => setOutletName(e.target.value)}
                placeholder='e.g., "Shivam Caterers", "Fit Bite"...'
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
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-colors ${
                      outletName === name
                        ? "bg-neutral-900 text-white border-neutral-900 shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200"
                    }`}
                  >
                    + {name}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Meal Window */}
            <div className="space-y-2">
              <label className="text-xs font-black text-neutral-800 tracking-tight uppercase flex items-center space-x-1.5">
                <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                <span>Meal Window:</span>
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

            {/* 4. Upload New Photos (Form Section) */}
            <form onSubmit={handleSubmit} className="space-y-3 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-neutral-800 tracking-tight uppercase flex items-center space-x-1.5">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center font-bold">
                    4
                  </span>
                  <span>Upload New Photos:</span>
                </label>
                {imagePreviews.length > 0 && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {imagePreviews.length} selected
                  </span>
                )}
              </div>

              {imagePreviews.length > 0 ? (
                <div className="space-y-3">
                  {/* Photo Cards Grid for New Selection */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {imagePreviews.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-neutral-950 aspect-[4/3] shadow-xs group"
                      >
                        <img
                          src={img}
                          alt={`New preview ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none"></div>

                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                          #{idx + 1}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs backdrop-blur-sm shadow-sm transition-transform active:scale-90 cursor-pointer"
                          title="Remove this preview"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <div className="absolute bottom-2 left-2 text-white/90 text-[10px] font-bold truncate pr-2">
                          New Photo {idx + 1} of {imagePreviews.length}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add More Photos & Clear Row */}
                  <div className="flex items-center space-x-2">
                    <label className="flex-1 border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 rounded-2xl py-2.5 px-3 flex items-center justify-center space-x-1.5 cursor-pointer transition-all active:scale-98">
                      <span className="text-sm">➕</span>
                      <span className="text-xs font-bold text-emerald-800">Add More Photos</span>
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
                      className="px-3.5 py-2.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-2xl border border-rose-200/60 transition-colors"
                      title="Clear selection"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-300 rounded-2xl p-5 flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/20 transition-all">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center text-xl shadow-xs">
                    📸
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-neutral-800">
                      Tap to photograph or select menu photos
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Supports camera capture & multiple photos (JPG, PNG, WebP)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

              {/* Status Message */}
              {statusMessage && (
                <div
                  className={`p-3 rounded-2xl text-xs font-bold text-center border ${
                    isSuccess
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {statusMessage}
                </div>
              )}

              {/* Update Photo Action Button */}
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  isCompressing ||
                  imagePreviews.length === 0 ||
                  !outletName.trim()
                }
                className="w-full py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-40 active:scale-98"
              >
                <span>
                  {isCompressing
                    ? "Optimizing Photos..."
                    : isSubmitting
                    ? "Updating Photos..."
                    : imagePreviews.length > 0
                    ? `Update ${imagePreviews.length > 1 ? `${imagePreviews.length} Photos` : "Photo"} for ${outletName || activeCourt.name}`
                    : "Update Photo"}
                </span>
                <span>→</span>
              </button>
            </form>

            {/* 5. Uploaded Photos: "These are the last updated photos for today" */}
            <div className="space-y-3 pt-3 border-t-2 border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-black text-neutral-800 tracking-tight uppercase flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] flex items-center justify-center font-bold">
                      5
                    </span>
                    <span>Uploaded Photos:</span>
                  </label>
                  <p className="text-[11px] text-neutral-500 font-medium">
                    These are the last updated photos for today.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={loadUploadedPhotos}
                  disabled={isLoadingUploaded}
                  className="text-[11px] font-bold text-neutral-600 hover:text-neutral-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full border border-slate-200 transition-colors flex items-center space-x-1"
                  title="Refresh uploaded photos list"
                >
                  <span className={isLoadingUploaded ? "animate-spin" : ""}>🔄</span>
                  <span>Refresh</span>
                </button>
              </div>

              {deleteMessage && (
                <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-neutral-800 text-center">
                  {deleteMessage}
                </div>
              )}

              {isLoadingUploaded ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-neutral-400 font-medium">Loading uploaded photos...</p>
                </div>
              ) : filteredUploaded.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] font-bold text-neutral-600 px-0.5">
                    <span>
                      {outletName.trim() ? (
                        <>Photos for <span className="text-neutral-900 underline font-black">{outletName}</span></>
                      ) : (
                        <>All photos for <span className="text-neutral-900">{activeCourt.name}</span></>
                      )}
                    </span>
                    <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {filteredUploaded.length} Active
                    </span>
                  </div>

                  {/* Clean 2-Column Photo Cards matching Step 4 */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {filteredUploaded.map((photo) => (
                      <div
                        key={photo.id}
                        className="relative rounded-2xl overflow-hidden border border-slate-200 bg-neutral-950 aspect-[4/3] shadow-xs group"
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.outletName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35 pointer-events-none"></div>

                        {/* Timestamp Badge at Top Left */}
                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md border border-white/15 shadow-2xs">
                          {photo.updatedAtFormatted || "Today"}
                        </div>

                        {/* Cross Button at Top Right */}
                        <button
                          type="button"
                          onClick={() => setPhotoToDelete(photo)}
                          className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs backdrop-blur-sm shadow-sm transition-transform active:scale-90 cursor-pointer"
                          title={`Remove ${photo.outletName} photo`}
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        {/* Outlet Name at Bottom */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <span className="text-white text-xs font-black truncate drop-shadow block">
                            {photo.outletName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                  <div className="text-2xl">📸</div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-neutral-800">
                      {outletName.trim()
                        ? `No photos uploaded yet for "${outletName}" today.`
                        : `No photos uploaded yet for ${activeCourt.name} today.`}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      Use Step 4 above to upload menu photos.
                    </p>
                  </div>
                  {outletName.trim() && uploadedMenus.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setOutletName("")}
                      className="text-[11px] font-extrabold text-neutral-800 underline pt-1"
                    >
                      View all {uploadedMenus.length} photos in {activeCourt.name}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Custom Pop-up Delete Confirmation Modal */}
        {photoToDelete && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div
              className="bg-white w-full max-w-[320px] rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col items-center space-y-4 text-center"
              role="dialog"
              aria-modal="true"
            >
              {/* Lucide Trash Icon Badge */}
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                <Trash2 className="w-6 h-6 stroke-[2.2]" />
              </div>

              {/* Photo Preview Container */}
              <div className="w-full relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200 bg-neutral-950 shadow-xs">
                <img
                  src={photoToDelete.imageUrl}
                  alt={photoToDelete.outletName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-3 right-3 text-left">
                  <span className="text-white text-xs font-black truncate drop-shadow block">
                    {photoToDelete.outletName}
                  </span>
                  {photoToDelete.updatedAtFormatted && (
                    <span className="text-white/80 text-[10px] font-medium block">
                      {photoToDelete.updatedAtFormatted}
                    </span>
                  )}
                </div>
              </div>

              {/* Confirmation Text */}
              <div className="space-y-1">
                <h3 className="text-sm font-black text-neutral-900 tracking-tight">
                  Do you want to remove this image?
                </h3>
                <p className="text-[11px] text-neutral-500 font-medium">
                  This menu photo will be permanently deleted.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
                <button
                  type="button"
                  onClick={() => setPhotoToDelete(null)}
                  disabled={deletingId === photoToDelete.id}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-neutral-800 font-bold text-xs transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmDelete(photoToDelete)}
                  disabled={deletingId === photoToDelete.id}
                  className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center space-x-1.5 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>{deletingId === photoToDelete.id ? "Removing..." : "Remove"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
