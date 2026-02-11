importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// Note: We need to use the actual config values here because process.env is not available in SW
firebase.initializeApp({
  apiKey: "self.firebaseConfig.apiKey",
  authDomain: "self.firebaseConfig.authDomain",
  projectId: "self.firebaseConfig.projectId",
  storageBucket: "self.firebaseConfig.storageBucket",
  messagingSenderId: "self.firebaseConfig.messagingSenderId",
  appId: "self.firebaseConfig.appId",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png', // Fallback icon path 
    badge: '/badge.png' // Optional badge
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
