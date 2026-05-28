import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";

import { UserResponse } from "src/shared/types/Reponse/auth/user";
import apiClient from "@/services/api/axiosInstance";
import { authAPI } from "@/services/api/functions/auth/authFn";
import { API } from "@/services/api/endpoints";
import { useAuthStore } from "@/stores/authStore";
import { profileQueryKey } from "@/query/auth/useAuthQuery";

// ─── Validation schemas ────────────────────────────────────────────────────

export const profileEditSchema = z.object({
  fullName: z.string().min(1, "Họ tên không được để trống").max(100),
  email: z.string().min(1, "Email là bắt buộc.").email("Email không đúng định dạng."),
  username: z.string().min(1, "Username là bắt buộc."),
  identityNumber: z.string().min(1, "IdentiNumber là bắt buộc."),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, "Số điện thoại phải có 10-11 chữ số")
    .or(z.literal(""))
    .optional(),
  address: z.string().max(200).optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  dateOfBirth: z.string().optional(),
});

export type ProfileEditValues = z.infer<typeof profileEditSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới tối thiểu 8 ký tự")
      .max(128),
    confirmPassword: z.string().min(1, "Xác nhận mật khẩu"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ─── useMyProfile ──────────────────────────────────────────────────────────
// Hook dành riêng cho Profile page — chỉ mount khi navigate vào /profile
// Sync data về Zustand sau khi fetch thành công
export function useMyProfile() {
  const username = useAuthStore((s) => s.user?.username);
  const accessToken = useAuthStore((s) => s.accessToken);
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const query = useQuery({
    queryKey: profileQueryKey(username ?? ""),
    queryFn: () => authAPI.getProfile(username!),
    enabled: !!accessToken && !!username,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (count, error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403 || status === 404) return false;
      return count < 1;
    },
    select: (res) => {
      const payload = res.data as any;
      return (payload && typeof payload === "object" && "data" in payload
        ? payload.data
        : payload) as UserResponse;
    },
  });

  // Merge profile API data vào Zustand — chỉ overwrite field mutable
  // Giữ nguyên: role, userUUID, userCode (source of truth là JWT)
  useEffect(() => {
    if (query.data && currentUser) {
      setUser({
        ...currentUser,
        fullName: query.data.fullName || currentUser.fullName,
        email: query.data.email ?? currentUser.email,
        username: query.data.username ?? currentUser.username,
        identityNumber: query.data.identityNumber ?? currentUser.identityNumber,
        phone: query.data.phone ?? currentUser.phone,
        address: query.data.address ?? currentUser.address,
        image: query.data.image ?? currentUser.image,
        firstName: query.data.firstName ?? currentUser.firstName,
        lastName: query.data.lastName ?? currentUser.lastName,
        dateOfBirth: query.data.dateOfBirth
          ? String(query.data.dateOfBirth)
          : currentUser.dateOfBirth,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data]);

  return query;
}

// ─── useUpdateProfile ──────────────────────────────────────────────────────
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const username = useAuthStore((s) => s.user?.username ?? "");
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (data: ProfileEditValues & { imageFile?: File }) => {
      const formData = new FormData();
      formData.append("fullName", data.fullName);
      formData.append("email", data.email);
      formData.append("username", data.username);
      formData.append("identiNumber", data.identityNumber);
      if (data.phone) formData.append("phone", data.phone);
      if (data.address) formData.append("address", data.address);
      if (data.gender) formData.append("gender", data.gender);
      if (data.dateOfBirth) formData.append("dateOfBirth", data.dateOfBirth);
      if (data.imageFile) formData.append("image", data.imageFile);
      return authAPI.updateProfile(formData);
    },
    onSuccess: (res) => {
      const payload = res.data as any;
      const updated = payload && typeof payload === "object" && "data" in payload
        ? payload.data
        : payload;

      if (currentUser && updated) {
        setUser({
          ...currentUser,
          fullName: updated.fullName ?? currentUser.fullName,
          email: updated.email ?? currentUser.email,
          username: updated.username ?? currentUser.username,
          identityNumber: updated.identityNumber ?? currentUser.identityNumber,
          phone: updated.phone ?? currentUser.phone,
          address: updated.address ?? currentUser.address,
          image: updated.image ?? currentUser.image,
          firstName: updated.firstName ?? currentUser.firstName,
          lastName: updated.lastName ?? currentUser.lastName,
          dateOfBirth: updated.dateOfBirth
            ? String(updated.dateOfBirth)
            : currentUser.dateOfBirth,
        });
      }
      queryClient.invalidateQueries({ queryKey: profileQueryKey(username) });
    },
  });
}

// ─── useChangePassword ─────────────────────────────────────────────────────
export function useChangePassword() {
  const username = useAuthStore((s) => s.user?.username ?? "");

  return useMutation({
    mutationFn: (data: ChangePasswordValues) =>
      apiClient.patch(API.user.changePassword, null, {
        params: {
          passwordOld: data.currentPassword,
          newPassword: data.newPassword,
          username,
        },
      }),
  });
}

// ─── useUploadAvatar ───────────────────────────────────────────────────────
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const username = useAuthStore((s) => s.user?.username ?? "");
  const currentUser = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      return apiClient.post<{ imageUrl?: string; image?: string }>(
        API.user.filesUpload,
        formData,
      );
    },
    onSuccess: (res) => {
      const imageUrl = res.data.imageUrl ?? res.data.image ?? "";
      if (currentUser && imageUrl) {
        setUser({ ...currentUser, image: imageUrl });
      }
      queryClient.invalidateQueries({ queryKey: profileQueryKey(username) });
    },
  });
}
