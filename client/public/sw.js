// // // self.addEventListener('push', function(event) {
// // //   let payload = {};
// // //   try {
// // //     payload = event.data ? event.data.json() : {};
// // //   } catch(e) {
// // //     payload = { title: 'Reminder', body: 'You have a reminder' };
// // //   }
// // //   const title = payload.title || 'Reminder';
// // //   const options = {
// // //     body: payload.body || '',
// // //     data: payload.data || {}
// // //   };
// // //   event.waitUntil(self.registration.showNotification(title, options));
// // // });

// // // self.addEventListener('notificationclick', function(event) {
// // //   event.notification.close();
// // //   event.waitUntil(clients.openWindow('/reminders'));
// // // });









// // // client/public/sw.js
// // self.addEventListener('push', function(event) {
// //   let payload = {};
// //   try {
// //     payload = event.data ? event.data.json() : {};
// //   } catch (e) {
// //     payload = { title: 'Reminder', body: 'You have a reminder' };
// //   }
// //   const title = payload.title || 'Reminder';
// //   const options = {
// //     body: payload.body || '',
// //     data: payload.data || {},
// //     icon: '/favicon.ico'
// //   };
// //   event.waitUntil(self.registration.showNotification(title, options));
// // });

// // self.addEventListener('notificationclick', function(event) {
// //   event.notification.close();
// //   event.waitUntil(clients.openWindow('/reminders'));
// // });

















// // public/sw.js - Place this file in your client's public folder

// self.addEventListener('push', function(event) {
//   const data = event.data ? event.data.json() : {};
  
//   const title = data.title || 'Reminder';
//   const options = {
//     body: data.body || 'You have a reminder',
//     icon: data.icon || '/favicon.ico',
//     badge: data.badge || '/badge.png',
//     tag: data.tag || 'reminder',
//     requireInteraction: data.requireInteraction || false,
//     vibrate: [200, 100, 200]
//   };

//   event.waitUntil(
//     self.registration.showNotification(title, options)
//   );
// });

// self.addEventListener('notificationclick', function(event) {
//   event.notification.close();
//   event.waitUntil(
//     clients.openWindow('/')
//   );
// });


















// public/sw.js
self.addEventListener('push', function(event) {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (e) {
    payload = { title: 'Reminder', body: 'You have a reminder' };
  }
  const title = payload.title || 'Reminder';
  const options = {
    body: payload.body || '',
    data: payload.data || {},
    icon: '/favicon.ico',
    badge: '/favicon.ico'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/reminders'));
});



