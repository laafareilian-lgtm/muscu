/** Demande la permission notifications (à appeler depuis un geste utilisateur). */
export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
}

/** Notification locale via Service Worker (plus fiable en PWA). */
export async function showRestDoneNotification(): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const title = "Repos terminé";
  const options = {
    body: "C'est reparti — prochaine série !",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "muscu-rest-done",
    renotify: true,
    silent: false,
    vibrate: [200, 100, 200, 100, 400],
  } as NotificationOptions;

  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return;
    }
  } catch {
    // fallback below
  }

  try {
    new Notification(title, options);
  } catch {
    // ignore
  }
}
