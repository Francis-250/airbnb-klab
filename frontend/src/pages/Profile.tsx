import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, apiFormData } from "../lib/api";
import { toast } from "sonner";

export default function Profile() {
  const { user, refetch } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    username: user?.username || "",
    phone: user?.phone || "",
    bio: user?.bio || "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiFormData.patch("/auth/update-profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully");
      setIsEditing(false);
      setAvatarFile(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await apiFormData.put("/auth/avatar", formData);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Avatar updated successfully");
      setAvatarFile(null);
      refetch();
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      toast.error("Failed to update avatar");
    },
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete("/auth/avatar");
      return response.data;
    },
    onSuccess: () => {
      toast.success("Avatar deleted successfully");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: () => {
      toast.error("Failed to delete avatar");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("username", formData.username);
    data.append("phone", formData.phone);
    data.append("bio", formData.bio);
    if (avatarFile) {
      data.append("avatar", avatarFile);
    }
    updateProfileMutation.mutate(data);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleAvatarUpdate = () => {
    if (avatarFile) {
      updateAvatarMutation.mutate(avatarFile);
    }
  };

  const handleDeleteAvatar = () => {
    deleteAvatarMutation.mutate();
  };

  if (!user) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Profile</h1>

      <div className="bg-white p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-24 h-24 object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 flex items-center justify-center text-2xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="ml-6">
            <h2 className="text-2xl font-semibold">{user.name}</h2>
            <p className="text-gray-600">@{user.username}</p>
            <p className="text-sm text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="input-grid">
              <div className="input-container">
                <label className="label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
              <div className="input-container">
                <label className="label">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="input-container">
              <label className="label">Email</label>
              <input
                type="email"
                value={formData.email}
                className="input bg-gray-100"
                disabled
              />
              <p className="text-sm text-gray-500">Email cannot be changed</p>
            </div>

            <div className="input-container">
              <label className="label">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="input"
              />
            </div>

            <div className="input-container">
              <label className="label">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                className="input min-h-32"
                rows={4}
              />
            </div>

            <div className="input-container">
              <label className="label">Avatar</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="input"
              />
              {avatarFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    New avatar: {avatarFile.name}
                  </p>
                  <button
                    type="button"
                    onClick={handleAvatarUpdate}
                    className="button-primary mt-2"
                    disabled={updateAvatarMutation.isPending}
                  >
                    {updateAvatarMutation.isPending
                      ? "Updating..."
                      : "Update Avatar"}
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="button-primary"
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
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
                  setAvatarFile(null);
                }}
                className="button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="font-medium">@{user.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user.phone || "Not provided"}</p>
              </div>
            </div>

            {user.bio && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Bio</p>
                <p className="font-medium">{user.bio}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="button-primary"
              >
                Edit Profile
              </button>
              {user.avatar && (
                <button
                  onClick={handleDeleteAvatar}
                  className="button-close"
                  disabled={deleteAvatarMutation.isPending}
                >
                  {deleteAvatarMutation.isPending
                    ? "Deleting..."
                    : "Delete Avatar"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
