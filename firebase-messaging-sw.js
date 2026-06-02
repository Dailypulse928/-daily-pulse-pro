// firebase-messaging-sw.js
// This service worker handles background FCM push notifications

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyAeHxZ3rqwYK-pQRYWdEmxt21qGKnDPWeg",
    authDomain: "daily-pulse-pro.firebaseapp.com",
    projectId: "daily-pulse-pro",
    storageBucket: "daily-pulse-pro.firebasestorage.app",
    messagingSenderId: "83050511273",
    appId: "1:83050511273:web:64f29e34f2be9fdd96e2b8"
});

const messaging = firebase.messaging();

// Handle background messages (app is closed or in background)
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Background message received:', payload);

    const { title, body, icon } = payload.notification || {};
    const data = payload.data || {};

    self.registration.showNotification(title || 'Daily Pulse Pro', {
        body:    body  || 'You have a notification.',
        icon:    icon  || '/icon-192.png',
        badge:        '/icon-192.png',
        tag:          data.tag    || 'pulse-notification',
        data:         data,
        vibrate:      [200, 100, 200],
        requireInteraction: false,
        actions: [
            { action: 'open', title: 'Open App' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) return clients.openWindow('/');
        })
    );
});
