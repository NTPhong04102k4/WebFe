import { useAuthStore } from "@/stores/authStore";
import {
  useMyProfile,
  useUpdateProfile,
  type ProfileEditValues,
} from "@/query/user/useProfileQuery";
import { notify } from "@/components/core/Feedback/toast";

import { AvatarSection } from "./components/AvatarSection";
import { InfoSection } from "./components/InfoSection";
import { ChangePasswordSection } from "./components/ChangePasswordSection";
import { SubscriptionSection } from "./components/SubscriptionSection";

function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-40 rounded bg-slate-200" />
            <div className="h-4 w-56 rounded bg-slate-200" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="h-4 w-32 rounded bg-slate-200" />
        <div className="mt-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-full rounded bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const profileQuery = useMyProfile();
  const updateProfile = useUpdateProfile();

  const isSocialAccount = !!(profileQuery.data as { idSocial?: string })?.idSocial;

  const handleAvatarChange = async (file: File) => {
    try {
      await updateProfile.mutateAsync({
        fullName: user?.fullName ?? "",
        email: profileQuery.data?.email ?? user?.email ?? "",
        username: profileQuery.data?.username ?? user?.username ?? "",
        identityNumber: profileQuery.data?.identityNumber ?? user?.identityNumber ?? "",
        imageFile: file,
      });
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const handleSave = async (values: ProfileEditValues) => {
    try {
      await updateProfile.mutateAsync(values);
      notify.success("Cập nhật thông tin thành công!");
    } catch {
      // interceptor đã hiện toast lỗi
    }
  };

  const profile = profileQuery.data;
  const displayName = user?.fullName || user?.username || "";
  const username = profile?.username ?? user?.username ?? "";
  const email = profile?.email ?? user?.email ?? "";
  const identityNumber = profile?.identityNumber ?? user?.identityNumber ?? "";
  const role = user?.role ?? "Customer";
  const imageUrl = user?.image ?? profile?.image ?? "";

  const defaultValues: ProfileEditValues & { gender?: string; dateOfBirth?: string } = {
    fullName: user?.fullName ?? "",
    email,
    username,
    identityNumber,
    phone: user?.phone ?? profile?.phone ?? "",
    address: user?.address ?? profile?.address ?? "",
    gender: (["Male", "Female", "Other"].includes(profile?.gender ?? "")
      ? profile?.gender
      : undefined) as "Male" | "Female" | "Other" | undefined,
    dateOfBirth: profile?.dateOfBirth
      ? new Date(profile.dateOfBirth).toISOString().split("T")[0]
      : undefined,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-slate-900">Hồ sơ cá nhân</h1>

      {profileQuery.isLoading && !user ? (
        <div className="mt-6">
          <ProfileSkeleton />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <AvatarSection
            name={displayName}
            username={username}
            email={email}
            role={role}
            imageUrl={imageUrl}
            onImageChange={handleAvatarChange}
            isUploading={updateProfile.isPending}
          />

          {profileQuery.isLoading ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-4 w-full rounded bg-slate-100" />
                ))}
              </div>
            </div>
          ) : (
            <InfoSection
              defaultValues={defaultValues}
              onSave={handleSave}
              isSaving={updateProfile.isPending}
            />
          )}

          {!isSocialAccount && <ChangePasswordSection />}

          <SubscriptionSection />
        </div>
      )}
    </div>
  );
}
