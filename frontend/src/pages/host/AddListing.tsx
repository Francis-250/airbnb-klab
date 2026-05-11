import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Car,
  Check,
  ChevronDown,
  Dumbbell,
  Eye,
  Flame,
  Home,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Plus,
  Save,
  Trash2,
  Upload,
  Waves,
  Wifi,
  Wind,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import type { Listing, ListingStatus, ListingType } from "../../types";

type Tab = "general" | "advanced";

type FormState = {
  title: string;
  location: string;
  status: ListingStatus;
  type: ListingType | "";
  pricePerNight: string;
  guests: string;
  description: string;
  amenities: string[];
  photos: (File | string)[];
};

type AddListingProps = {
  listing?: Listing | null;
  mode?: "create" | "edit";
};

const listingTypes: { value: ListingType; label: string }[] = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "villa", label: "Villa" },
  { value: "cabin", label: "Cabin" },
];

const listingStatuses: { value: ListingStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "booked", label: "Booked" },
  { value: "unavailable", label: "Unavailable" },
];

const amenities = [
  { key: "wifi", label: "WiFi", icon: Wifi },
  { key: "parking", label: "Parking", icon: Car },
  { key: "kitchen", label: "Kitchen", icon: Home },
  { key: "ac", label: "Air conditioning", icon: Wind },
  { key: "pool", label: "Pool", icon: Waves },
  { key: "gym", label: "Gym", icon: Dumbbell },
  { key: "fireplace", label: "Fireplace", icon: Flame },
];

const amenityAliases: Record<string, string> = {
  "air conditioning": "ac",
  ac: "ac",
  bbq: "kitchen",
  "chef's kitchen": "kitchen",
  fireplace: "fireplace",
  "fully equipped kitchen": "kitchen",
  gym: "gym",
  kitchen: "kitchen",
  parking: "parking",
  pool: "pool",
  "private pool": "pool",
  wifi: "wifi",
};

const normalizeAmenity = (amenity: string) => {
  const normalized = amenity
    .replace(/^\[?"?/, "")
    .replace(/"?\]?$/, "")
    .trim()
    .toLowerCase();

  return amenityAliases[normalized] || normalized;
};

const normalizeAmenities = (items?: string[]) =>
  Array.from(new Set((items || []).map(normalizeAmenity).filter(Boolean)));

const getInitialForm = (listing?: Listing | null): FormState => ({
  title: listing?.title || "",
  location: listing?.location || "",
  status: listing?.status || "available",
  type: listing?.type || "",
  pricePerNight: listing?.pricePerNight?.toString() || "",
  guests: listing?.guests?.toString() || "",
  description: listing?.description || "",
  amenities: normalizeAmenities(listing?.amenities),
  photos: listing?.photos || [],
});

const inputClass =
  "w-full rounded-xl border border-[#DDE2EA] dark:border-[#2A2A2A] bg-white dark:bg-[#111827] px-3 py-2.5 text-sm text-[#111827] dark:text-white outline-none transition focus:border-[#111827] dark:focus:border-white focus:ring-2 focus:ring-black/5 dark:focus:ring-white/5 placeholder:text-[#98A2B3]";

const getErrorMessage = (error: unknown, action: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || `Failed to ${action} listing`;
  }

  return `Failed to ${action} listing`;
};

export default function AddListing({
  listing = null,
  mode = "create",
}: AddListingProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [form, setForm] = useState<FormState>(() => getInitialForm(listing));
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const isEdit = mode === "edit";

  const previews = useMemo(
    () =>
      form.photos.map((photo) =>
        typeof photo === "string" ? photo : URL.createObjectURL(photo),
      ),
    [form.photos],
  );

  const publishMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      data.append("location", form.location.trim());
      data.append("pricePerNight", form.pricePerNight);
      data.append("guests", form.guests);
      data.append("status", form.status);
      data.append("type", form.type);
      data.append("rating", "0");
      data.append("amenities", JSON.stringify(form.amenities));

      const existingPhotos = form.photos.filter(
        (photo): photo is string => typeof photo === "string",
      );
      const newPhotos = form.photos.filter(
        (photo): photo is File => photo instanceof File,
      );

      if (isEdit) {
        data.append("existingPhotos", JSON.stringify(existingPhotos));
      }
      newPhotos.forEach((photo) => data.append("photos", photo));

      const response = isEdit
        ? await api.put(`/listings/${listing?.id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await api.post("/listings", data, {
            headers: { "Content-Type": "multipart/form-data" },
          });

      return response.data;
    },
    onSuccess: (savedListing) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings", "me"] });
      if (isEdit && listing?.id) {
        queryClient.invalidateQueries({ queryKey: ["listing", listing.id] });
      }
      navigate(
        isEdit
          ? `/dashboard/listings/${savedListing?.id || listing?.id}`
          : "/dashboard/listings",
      );
    },
  });

  const draftMutation = useMutation({
    mutationFn: async () => {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("description", form.description.trim());
      data.append("location", form.location.trim());
      data.append("pricePerNight", form.pricePerNight);
      data.append("guests", form.guests);
      data.append("status", "unavailable");
      data.append("type", form.type);
      data.append("rating", "0");
      data.append("amenities", JSON.stringify(form.amenities));

      const existingPhotos = form.photos.filter(
        (photo): photo is string => typeof photo === "string",
      );
      const newPhotos = form.photos.filter(
        (photo): photo is File => photo instanceof File,
      );

      if (isEdit) {
        data.append("existingPhotos", JSON.stringify(existingPhotos));
      }
      newPhotos.forEach((photo) => data.append("photos", photo));

      const response = isEdit
        ? await api.put(`/listings/${listing?.id}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await api.post("/listings", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      return response.data;
    },
    onSuccess: (savedListing) => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["listings", "me"] });
      if (isEdit && listing?.id) {
        queryClient.invalidateQueries({ queryKey: ["listing", listing.id] });
      }
      navigate(`/dashboard/listings/${savedListing?.id || listing?.id}`);
    },
  });

  const update = (key: keyof FormState, value: FormState[keyof FormState]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    update("photos", [...form.photos, ...imageFiles].slice(0, 5));
  };

  const removePhoto = (index: number) => {
    update(
      "photos",
      form.photos.filter((_, photoIndex) => photoIndex !== index),
    );
  };

  const toggleAmenity = (key: string) => {
    update(
      "amenities",
      form.amenities.includes(key)
        ? form.amenities.filter((amenity) => amenity !== key)
        : [...form.amenities, key],
    );
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!form.title.trim()) nextErrors.title = "Listing name is required";
    if (!form.location.trim()) nextErrors.location = "Location is required";
    if (!form.type) nextErrors.type = "Choose a property type";
    if (!Number(form.pricePerNight) || Number(form.pricePerNight) <= 0) {
      nextErrors.pricePerNight = "Enter a valid nightly price";
    }
    if (!Number(form.guests) || Number(form.guests) < 1) {
      nextErrors.guests = "Add at least one guest";
    }
    if (form.description.trim().length < 20) {
      nextErrors.description = "Description needs at least 20 characters";
    }
    if (form.photos.length === 0) nextErrors.photos = "Add at least one photo";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handlePublish = () => {
    if (!validate()) return;
    publishMutation.mutate();
  };

  const handleSaveDraft = () => {
    if (!validate()) return;
    draftMutation.mutate();
  };

  return (
    <div className="min-h-full bg-[#F4F6F9] dark:bg-[#111827] -m-4 sm:-m-6 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-[#111827] dark:text-white">
                {isEdit ? "Edit Listing" : "Add New Listing"}
              </h1>
              <p className="text-xs text-[#667085] dark:text-[#AAAAAA]">
                Last update {new Date().toLocaleDateString()} at{" "}
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setForm(getInitialForm(listing))}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-900/20"
              aria-label="Clear listing"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={draftMutation.isPending || publishMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#DDE2EA] dark:border-[#2A2A2A] px-4 text-sm font-semibold text-[#344054] dark:text-white transition hover:bg-[#F2F4F7] dark:hover:bg-[#222]"
            >
              {draftMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Unavailable
            </button>
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishMutation.isPending || draftMutation.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-[#111827]"
            >
              {publishMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Save Changes" : "Publish"}
            </button>
          </div>
        </div>

        {publishMutation.isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
            {getErrorMessage(publishMutation.error, isEdit ? "update" : "publish")}
          </div>
        )}
        {draftMutation.isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">
            {getErrorMessage(draftMutation.error, "save")}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-4">
            <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-4 shadow-sm">
              <div className="grid gap-3 sm:grid-cols-[1.3fr_1fr]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative flex min-h-72 items-center justify-center overflow-hidden rounded-xl border ${
                    errors.photos
                      ? "border-red-300"
                      : "border-[#DDE2EA] dark:border-[#2A2A2A]"
                  } bg-[#F8FAFC] dark:bg-[#111827]`}
                >
                  {previews[0] ? (
                    <img
                      src={previews[0]}
                      alt="Listing cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-[#667085]">
                      <Upload className="h-8 w-8" />
                      <span className="text-sm font-semibold">
                        Upload cover photo
                      </span>
                    </div>
                  )}
                  {previews[0] && (
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#344054]">
                      Cover
                    </span>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3].map((slot) => (
                    <PhotoSlot
                      key={slot}
                      src={previews[slot]}
                      onAdd={() => fileInputRef.current?.click()}
                      onRemove={() => removePhoto(slot)}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-[#8EC5FF] bg-[#F8FAFC] text-[#1570EF] transition hover:bg-blue-50 dark:bg-[#111827]"
                    aria-label="Add listing photo"
                  >
                    <Plus className="h-7 w-7" />
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              {errors.photos && (
                <p className="mt-2 text-xs text-red-500">{errors.photos}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-[#111827] dark:text-white">
                  Visibility
                </h2>
                <p className="mt-1 text-sm text-[#667085] dark:text-[#AAAAAA]">
                  Current Prisma status for this listing.
                </p>
                <span className="mt-6 inline-flex rounded-full bg-[#ECFDF3] px-3 py-1 text-sm font-semibold capitalize text-[#027A48] dark:bg-emerald-900/30 dark:text-emerald-300">
                  {form.status}
                </span>
              </div>

              <div className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-[#111827] dark:text-white">
                      Preview
                    </h2>
                    <p className="mt-1 text-sm text-[#667085] dark:text-[#AAAAAA]">
                      See how the listing summary will look.
                    </p>
                  </div>
                  <Eye className="h-5 w-5 text-[#98A2B3]" />
                </div>
                <div className="mt-4 rounded-xl border border-[#EAECF0] dark:border-[#2A2A2A] p-3">
                  <p className="truncate text-sm font-semibold text-[#111827] dark:text-white">
                    {form.title || "Untitled listing"}
                  </p>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#667085]">
                    <MapPin className="h-3 w-3" />
                    {form.location || "Location"}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#111827] dark:text-white">
                    ${form.pricePerNight || "0"}{" "}
                    <span className="text-xs font-normal text-[#667085]">
                      / night
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white dark:bg-[#1A1A1A] border border-white/70 dark:border-[#2A2A2A] p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#111827] dark:text-white">
                  Listing Details
                </h2>
                <p className="text-sm text-[#667085] dark:text-[#AAAAAA]">
                  Key info guests need before booking your place.
                </p>
              </div>
              <span className="w-fit rounded-full bg-[#F8FAFC] dark:bg-[#111827] px-3 py-1 text-xs font-semibold text-[#344054] dark:text-white">
                Status: {form.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 rounded-xl border border-[#DDE2EA] dark:border-[#2A2A2A] p-1">
              {(["general", "advanced"] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize transition ${
                    activeTab === tab
                      ? "bg-white text-[#111827] shadow-sm dark:bg-[#222] dark:text-white"
                      : "text-[#667085] hover:text-[#111827] dark:hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-5">
              {activeTab === "general" ? (
                <>
                  <Field label="Listing Name" required error={errors.title}>
                    <input
                      className={inputClass}
                      placeholder="e.g. Sunny apartment near city center"
                      value={form.title}
                      onChange={(event) => update("title", event.target.value)}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Status" required>
                      <select
                        className={`${inputClass} appearance-none capitalize`}
                        value={form.status}
                        onChange={(event) =>
                          update("status", event.target.value as ListingStatus)
                        }
                      >
                        {listingStatuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                    </Field>
                    <Field label="Property Type" required error={errors.type}>
                      <select
                        className={`${inputClass} appearance-none`}
                        value={form.type}
                        onChange={(event) =>
                          update("type", event.target.value as ListingType)
                        }
                      >
                        <option value="">Choose property type</option>
                        {listingTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Location" required error={errors.location}>
                      <input
                        className={inputClass}
                        placeholder="Kigali, Rwanda"
                        value={form.location}
                        onChange={(event) =>
                          update("location", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="Max Guests" required error={errors.guests}>
                      <input
                        className={inputClass}
                        type="number"
                        min={1}
                        placeholder="2"
                        value={form.guests}
                        onChange={(event) =>
                          update("guests", event.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Price per Night"
                      required
                      error={errors.pricePerNight}
                    >
                      <input
                        className={inputClass}
                        type="number"
                        min={1}
                        placeholder="e.g. 75 USD"
                        value={form.pricePerNight}
                        onChange={(event) =>
                          update("pricePerNight", event.target.value)
                        }
                      />
                    </Field>
                    <Field label="Rating">
                      <input className={inputClass} value="0" disabled />
                    </Field>
                  </div>

                  <Field
                    label="Description"
                    required
                    error={errors.description}
                  >
                    <textarea
                      className={`${inputClass} min-h-40 resize-none`}
                      placeholder="Write a short description highlighting the space, neighborhood, and guest experience"
                      value={form.description}
                      onChange={(event) =>
                        update("description", event.target.value)
                      }
                    />
                  </Field>
                </>
              ) : (
                <>
                  <Field label="Amenities">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {amenities.map(({ key, label, icon: Icon }) => {
                        const selected = form.amenities.includes(key);
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => toggleAmenity(key)}
                            className={`flex items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition ${
                              selected
                                ? "border-[#111827] bg-[#F8FAFC] text-[#111827] dark:border-white dark:bg-[#222] dark:text-white"
                                : "border-[#DDE2EA] text-[#667085] hover:border-[#98A2B3] dark:border-[#2A2A2A]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </span>
                            {selected && <Check className="h-4 w-4" />}
                          </button>
                        );
                      })}
                    </div>
                  </Field>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#344054] dark:text-white">
        {label}
        {required && <span className="text-[#F84525]"> *</span>}
      </span>
      <span className="relative block">{children}</span>
      {error && (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      )}
    </label>
  );
}

function PhotoSlot({
  src,
  onAdd,
  onRemove,
}: {
  src?: string;
  onAdd: () => void;
  onRemove: () => void;
}) {
  if (!src) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="flex aspect-square items-center justify-center rounded-xl border border-[#DDE2EA] bg-[#F8FAFC] text-[#98A2B3] transition hover:bg-[#F2F4F7] dark:border-[#2A2A2A] dark:bg-[#111827]"
        aria-label="Add listing photo"
      >
        <ImageIcon className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-[#DDE2EA] dark:border-[#2A2A2A]">
      <img src={src} alt="Listing" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
        aria-label="Remove listing photo"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
