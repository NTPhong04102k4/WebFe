importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB9VeIQA752Y5S5iJ4Gyc2_gikPKSDm_ck",
  authDomain: "lazynerdcarweb.firebaseapp.com",
  projectId: "lazynerdcarweb",
  storageBucket: "lazynerdcarweb.firebasestorage.app",
  messagingSenderId: "637322035022",
  appId: "1:637322035022:web:5505bb2546d3b89542a81f",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  self.registration.showNotification(title ?? "Thông báo", {
    body,
    icon: "/logo.png",
    data: payload.data,
  });
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const { eventType, orderNumber } = event.notification.data ?? {};
  let url = "/";

  if (eventType === "workorder_completed" || eventType === "workorder_status_changed") {
    url = `/workshop/work-orders?highlight=${orderNumber}`;
  } else if (eventType?.startsWith("order_")) {
    url = `/orders?highlight=${orderNumber}`;
  }

  event.waitUntil(clients.openWindow(url));
});
