// web-config.jsx — Firebase + access settings for the WEB variant.
// Loaded after theme.jsx so it can override the prototype "TODAY" with the real date.
// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THE FIREBASE CONFIG BLOCK below, then host the folder on GitHub Pages.
//  Login now uses real Firebase Authentication (email + password) — you create
//  the two accounts in the Firebase Console. See WEB_README.md for the steps.
// ─────────────────────────────────────────────────────────────────────────────

// FIREBASE WEB CONFIG ──────────────────────────────────────────────────────────
//    This points the website at the SAME Firebase project as the Android app
//    (Firestore for the shared inventory, Auth for login). The values below are
//    guessed from your google-services.json. If the app shows a "permission" or
//    "API key" error, register a Web app in the Firebase Console (Project
//    settings → Add app → Web </>) and paste the config object it gives you here.
window.FIREBASE_CONFIG = {
  apiKey: 'AIzaSyCSFanf6gBi4E-8tJhT0UR5XVc3h8Hb41M',
  authDomain: 'home-food-storage-tracker.firebaseapp.com',
  projectId: 'home-food-storage-tracker',
  storageBucket: 'home-food-storage-tracker.firebasestorage.app',
  messagingSenderId: '414964215261',
  appId: '1:414964215261:web:0000000000000000000000', // replace if you register a Web app
};

// ─────────────────────────────────────────────────────────────────────────────
//  Below this line: wiring. You normally do not need to touch it.
// ─────────────────────────────────────────────────────────────────────────────

// ── Use the REAL current date (the mock theme.jsx hard-codes 2026-06-02) ──────
// Components call the globals window.daysUntil / window.expiryStatus / etc.,
// so reassigning them here makes the whole UI use today's real date.
(function useRealToday() {
  const EX = window.EXPIRY;
  const startOfDay = d => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  window.daysUntil = function (dateStr) {
    if (!dateStr) return null;
    const d = startOfDay(new Date(dateStr + 'T00:00:00'));
    const t = startOfDay(new Date());
    return Math.round((d - t) / 86400000);
  };

  window.expiryStatus = function (dateStr) {
    if (!dateStr) return EX.none;
    const d = window.daysUntil(dateStr);
    if (d < 0) return EX.expired;
    if (d <= 7) return EX.soon;
    return EX.fine;
  };

  window.expiryPhrase = function (dateStr) {
    if (!dateStr) return 'No expiry';
    const d = window.daysUntil(dateStr);
    if (d === 0) return 'Expires today';
    if (d === 1) return 'Expires tomorrow';
    if (d > 1) return `Expires in ${d} days`;
    if (d === -1) return 'Expired yesterday';
    return `Expired ${Math.abs(d)} days ago`;
  };

  window.isoToday = function () {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  };
})();

// ── Firebase init: Auth (login) + Firestore (shared inventory) ────────────────
// Same project + same path as the Android app: households/home/items.
(function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK failed to load. Check your internet connection / CDN.');
    window.FST = null;
    window.FST_AUTH = null;
    return;
  }

  firebase.initializeApp(window.FIREBASE_CONFIG);
  const auth = firebase.auth();
  const db = firebase.firestore();
  const col = () => db.collection('households').doc('home').collection('items');
  const buyCol = () => db.collection('households').doc('home').collection('toBuy');

  // ── Authentication helpers (email + password) ──
  // Persistence is LOCAL by default: you stay signed in on this device until you
  // sign out, the same way most web apps behave.
  window.FST_AUTH = {
    // Fires now with the current user (or null) and on every sign-in / sign-out.
    onChange(cb) { return auth.onAuthStateChanged(cb); },
    signIn(email, password) { return auth.signInWithEmailAndPassword(email, password); },
    signOut() { return auth.signOut(); },
    // Turn a Firebase error code into a friendly message for the login screen.
    friendlyError(code) {
      switch (code) {
        case 'auth/invalid-email': return 'That email address looks invalid.';
        case 'auth/user-disabled': return 'This account has been disabled.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential': return 'Wrong email or password.';
        case 'auth/too-many-requests': return 'Too many attempts — try again in a minute.';
        case 'auth/network-request-failed': return 'Network error — check your connection.';
        default: return 'Could not sign in. Please try again.';
      }
    },
  };

  window.FST = {
    // Live listener — fires immediately and on every change from any device.
    subscribeToItems(callback, onError) {
      return col().onSnapshot(
        snap => callback(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
        err => { console.error('Firestore snapshot error:', err); onError && onError(err); }
      );
    },

    // Write the 35 starter items only if the collection is completely empty.
    async seedIfEmpty() {
      const snap = await col().limit(1).get();
      if (!snap.empty) return;
      const batch = db.batch();
      (window.SEED_ITEMS || []).forEach(item => {
        const ref = col().doc();
        batch.set(ref, { ...item, id: ref.id });
      });
      await batch.commit();
    },

    // Create (no id) or update (has id). Returns the document id.
    async saveItem(item) {
      if (item.id) {
        await col().doc(item.id).set(item);
        return item.id;
      }
      const ref = col().doc();
      const id = ref.id;
      await ref.set({ ...item, id });
      return id;
    },

    async deleteItem(id) {
      await col().doc(id).delete();
    },

    // ── Shopping ("To Buy") list — separate shared collection ──
    subscribeToBuy(callback, onError) {
      return buyCol().onSnapshot(
        snap => callback(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
        err => { console.error('Firestore shopping error:', err); onError && onError(err); }
      );
    },
    async saveBuy(item) {
      if (item.id) {
        await buyCol().doc(item.id).set(item);
        return item.id;
      }
      const ref = buyCol().doc();
      const id = ref.id;
      await ref.set({ ...item, id });
      return id;
    },
    async deleteBuy(id) {
      await buyCol().doc(id).delete();
    },
  };
})();
