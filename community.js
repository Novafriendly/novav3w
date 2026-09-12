import {initializeApp, getApps, getApp} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {getDatabase, ref, onValue, get, update, set, serverTimestamp} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import {startCommunity} from './community-core.js';
const app = getApps().some(app => app.name === '[DEFAULT]') ? getApp() : initializeApp({
  apiKey: 'AIzaSyDV9MRbv7IDXjowddQoXAN1hJPlCGMyxR8',
  authDomain: 'nova-chat-43a18.firebaseapp.com',
  databaseURL: 'https://nova-chat-43a18-default-rtdb.firebaseio.com',
  projectId: 'nova-chat-43a18', storageBucket: 'nova-chat-43a18.firebasestorage.app',
  messagingSenderId: '1090469740208', appId: '1:1090469740208:web:94adbe3ee21abb3cf14575'
});
const db = getDatabase(app);
let offset = 0;
onValue(ref(db, '.info/serverTimeOffset'), snap => { offset = snap.val() || 0; });
startCommunity({
  now: () => Date.now() + offset,
  timestamp: serverTimestamp,
  subscribe: (path, callback, error) => onValue(ref(db, path), snap => callback(snap.val()), error),
  read: async path => (await get(ref(db, path))).val(),
  write: (path, value) => set(ref(db, path), value),
  update: values => update(ref(db), values)
});
