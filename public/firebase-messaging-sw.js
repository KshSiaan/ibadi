importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCsQ39r6-yYumBsxLpirIcjJUwzIpBkdBo",
  authDomain: "service-provider-umi.firebaseapp.com",
  projectId: "service-provider-umi",
  storageBucket: "service-provider-umi.firebasestorage.app",
  messagingSenderId: "102179953373",
  appId: "1:102179953373:web:91f95932433488a1211934",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification ?? {};
  self.registration.showNotification(title ?? "New notification", {
    body: body ?? "",
    icon: icon ?? "/favicon.ico",
  });
});
