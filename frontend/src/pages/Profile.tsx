import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiFormData } from "../lib/api";
import { toast } from "sonner";

export default function Profile() {
  const { user, refetch } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "avatar">("info");
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiFormData.patch("/auth/update-profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Failed to update profile"),
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("avatar", file);
      const response = await apiFormData.put("/auth/avatar", fd);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Avatar updated");
      setAvatarFile(null);
      setAvatarPreview(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Failed to update avatar"),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete("/auth/avatar");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Avatar removed");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => toast.error("Failed to remove avatar"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("username", formData.username);
    data.append("phone", formData.phone);
    data.append("bio", formData.bio);
    updateProfileMutation.mutate(data);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-scree">
        <div className="flex items-center gap-3">
          <div
            className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    );
  }

  const displayAvatar = avatarPreview || user.avatar;
  const initials = user.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold  tracking-tight">
            Account
          </h1>
          <p className="text-sm  mt-1">
            Manage your profile and personal information
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* LEFT SIDEBAR */}
          <div className="flex flex-col gap-4 w-full lg:w-72 shrink-0">
            {/* Avatar card */}
            <div className="bg-neutral-900 rounded-2xl p-6 flex flex-col items-center text-center border border-neutral-800">
              <div className="relative mb-4 group">
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-2xl object-cover border border-neutral-700"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-2xl font-bold text-neutral-300">
                    {initials}
                  </div>
                )}
                <span className="absolute -bottom-1.5 -right-1.5 bg-neutral-800 border border-neutral-700 text-neutral-400 text-[10px] px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                  {user.role}
                </span>
              </div>

              <h2 className="text-base font-semibold text-neutral-100 leading-snug">
                {user.name}
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                @{user.username}
              </p>
              {user.bio && (
                <p className="text-xs text-neutral-500 mt-3 leading-relaxed line-clamp-3">
                  {user.bio}
                </p>
              )}

              {/* Avatar actions */}
              <div className="mt-5 w-full flex flex-col gap-2">
                <label className="w-full cursor-pointer text-center text-sm font-medium py-2 px-4 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors border border-neutral-700">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                {avatarFile && (
                  <button
                    onClick={() => updateAvatarMutation.mutate(avatarFile)}
                    disabled={updateAvatarMutation.isPending}
                    className="w-full text-sm font-medium py-2 px-4 rounded-xl bg-neutral-100 text-neutral-900 hover:bg-white transition-colors disabled:opacity-50"
                  >
                    {updateAvatarMutation.isPending
                      ? "Uploading…"
                      : "Upload Photo"}
                  </button>
                )}
                {user.avatar && !avatarFile && (
                  <button
                    onClick={() => deleteAvatarMutation.mutate()}
                    disabled={deleteAvatarMutation.isPending}
                    className="w-full text-sm font-medium py-2 px-4 rounded-xl bg-neutral-800 text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors border border-neutral-700 disabled:opacity-50"
                  >
                    {deleteAvatarMutation.isPending
                      ? "Removing…"
                      : "Remove Photo"}
                  </button>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="bg-neutral-900 rounded-2xl p-5 border border-neutral-800 space-y-4">
              <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
                Details
              </p>
              <InfoLine icon="✉" label={user.email} />
              <InfoLine
                icon="☎"
                label={user.phone || "No phone"}
                muted={!user.phone}
              />
              <InfoLine icon="◈" label={user.role} />
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="flex-1 bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-neutral-800 px-6">
              {(["info", "avatar"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 mr-6 text-sm font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? "border-neutral-100 text-neutral-100"
                      : "border-transparent text-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  {tab === "info" ? "Personal Info" : "Photo & Avatar"}
                </button>
              ))}
            </div>

            <div className="p-6 lg:p-8">
              {activeTab === "info" && (
                <>
                  {!isEditing ? (
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-semibold text-neutral-100">
                            Personal Information
                          </h3>
                          <p className="text-sm text-neutral-500 mt-0.5">
                            Your public profile details
                          </p>
                        </div>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-sm font-medium px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors border border-neutral-700"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <ViewField label="Full Name" value={user.name} />
                        <ViewField
                          label="Username"
                          value={`@${user.username}`}
                        />
                        <ViewField label="Email" value={user.email} />
                        <ViewField
                          label="Phone"
                          value={user.phone || "—"}
                          muted={!user.phone}
                        />
                      </div>

                      {user.bio && (
                        <div className="mt-5">
                          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
                            Bio
                          </p>
                          <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-800 rounded-xl p-4 border border-neutral-700">
                            {user.bio}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-base font-semibold text-neutral-100">
                            Edit Profile
                          </h3>
                          <p className="text-sm text-neutral-500 mt-0.5">
                            Update your personal details
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                        <FormField label="Full Name">
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                            placeholder="Your full name"
                            required
                          />
                        </FormField>
                        <FormField label="Username">
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 text-sm select-none">
                              @
                            </span>
                            <input
                              type="text"
                              value={formData.username}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  username: e.target.value,
                                })
                              }
                              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                              placeholder="username"
                              required
                            />
                          </div>
                        </FormField>
                        <FormField label="Email" note="Cannot be changed">
                          <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full bg-neutral-800 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-600 cursor-not-allowed"
                          />
                        </FormField>
                        <FormField label="Phone">
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors"
                            placeholder="+1 234 567 890"
                          />
                        </FormField>
                      </div>

                      <FormField label="Bio">
                        <textarea
                          value={formData.bio}
                          onChange={(e) =>
                            setFormData({ ...formData, bio: e.target.value })
                          }
                          rows={3}
                          className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500 transition-colors resize-none"
                          placeholder="Write a short bio…"
                        />
                      </FormField>

                      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-800">
                        <button
                          type="submit"
                          disabled={updateProfileMutation.isPending}
                          className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-900 hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {updateProfileMutation.isPending
                            ? "Saving…"
                            : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: user.name,
                              email: user.email,
                              username: user.username,
                              phone: user.phone || "",
                              bio: user.bio || "",
                            });
                          }}
                          className="text-sm font-medium px-5 py-2.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700 transition-colors border border-neutral-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {activeTab === "avatar" && (
                <div>
                  <div className="mb-6">
                    <h3 className="text-base font-semibold text-neutral-100">
                      Photo & Avatar
                    </h3>
                    <p className="text-sm text-neutral-500 mt-0.5">
                      Upload a photo to personalize your profile
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Preview */}
                    <div className="shrink-0">
                      {displayAvatar ? (
                        <img
                          src={displayAvatar}
                          alt={user.name}
                          className="w-32 h-32 rounded-2xl object-cover border border-neutral-700"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-3xl font-bold text-neutral-400">
                          {initials}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-4">
                      <div className="border-2 border-dashed border-neutral-700 rounded-2xl p-6 text-center hover:border-neutral-500 transition-colors">
                        <p className="text-sm text-neutral-400 mb-3">
                          PNG, JPG or GIF · Max 5MB
                        </p>
                        <label className="cursor-pointer inline-block text-sm font-medium px-4 py-2 rounded-xl bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-neutral-100 transition-colors border border-neutral-700">
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                        </label>
                        {avatarFile && (
                          <p className="text-xs text-neutral-500 mt-2 truncate">
                            {avatarFile.name}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {avatarFile && (
                          <button
                            onClick={() =>
                              updateAvatarMutation.mutate(avatarFile)
                            }
                            disabled={updateAvatarMutation.isPending}
                            className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-neutral-100 text-neutral-900 hover:bg-white transition-colors disabled:opacity-50"
                          >
                            {updateAvatarMutation.isPending
                              ? "Uploading…"
                              : "Upload"}
                          </button>
                        )}
                        {user.avatar && (
                          <button
                            onClick={() => deleteAvatarMutation.mutate()}
                            disabled={deleteAvatarMutation.isPending}
                            className="text-sm font-medium px-5 py-2.5 rounded-xl bg-neutral-800 text-red-400 hover:bg-red-950 hover:text-red-300 transition-colors border border-neutral-700 disabled:opacity-50"
                          >
                            {deleteAvatarMutation.isPending
                              ? "Removing…"
                              : "Remove"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoLine({
  icon,
  label,
  muted,
}: {
  icon: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-neutral-600 text-sm w-4 shrink-0">{icon}</span>
      <span
        className={`text-sm truncate ${muted ? "text-neutral-600 italic" : "text-neutral-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

function ViewField({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="bg-neutral-800 rounded-xl px-4 py-3 border border-neutral-700">
      <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className={`text-sm font-medium ${muted ? "text-neutral-600" : "text-neutral-100"}`}
      >
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
          {label}
        </label>
        {note && <span className="text-xs text-neutral-600">{note}</span>}
      </div>
      {children}
    </div>
  );
}
