import { useEffect } from "react";
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from "@/config/firebase";
import { userRouteFn } from "@/services/api/functions/user/Routes.Fn";
import { useAuthStore } from "@/stores/authStore";
import { notify } from "@/components/core/Feedback/toast";
import { ENV } from "@/config/environment";

const VAPID_KEY =
  ENV.FIREBASE_VAPID_KEY ??
  "BLyBqXj3P1E3cZW1u8vkvo-otY5WQxElXQ3LaFEF4mG7_V6BR9JxJpZqdASqynGuNCzAMGq55xRrQD3yUmaXdJA";

export function useFcmToken() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);

  useEffect(() => {
    if (!accessToken) return;
    // Chỉ Customer mới có FcmToken trên backend — Staff/Admin không có endpoint này
    if (role !== "Customer") return;

    let unsubscribeForeground: (() => void) | undefined;

    const setup = async () => {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const messaging = await getFirebaseMessaging();
      if (!messaging) return;

      const fcmToken = await getToken(messaging, { vapidKey: VAPID_KEY });
      if (!fcmToken) return;

      await userRouteFn.registerFcmToken(fcmToken);

      unsubscribeForeground = onMessage(messaging, (payload) => {
        const title = payload.notification?.title ?? "Thông báo";
        const body = payload.notification?.body;
        notify.info(body ? `${title} — ${body}` : title);
      });
    };

    setup().catch(() => {});

    return () => {
      unsubscribeForeground?.();
    };
  }, [accessToken, role]);
}
