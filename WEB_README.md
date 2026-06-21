# Home Food Storage Tracker — Web variant

A browser version of the app that **shares the same live inventory as the Android phone app**
(same Firebase Firestore database, `households/home/items`). Add something on your phone, it
appears on the website within a second or two, and vice-versa. Opening the page requires a
real **email + password login** (Firebase Authentication) — only your accounts can get in.

It is plain static files — no build step, no server — so it hosts for free on **GitHub Pages**.

---

## Files (web variant)

| File | Role |
|---|---|
| `index.html` | Web entry point. Loads React + Firebase from CDN, then the shared UI + web files. |
| `web-config.jsx` | **The only file you edit.** Firebase config + Auth/Firestore wiring + real-date override. |
| `web-app.jsx` | Web app root: login gate, Firestore live sync, responsive layout. |

It **reuses** the existing UI files unchanged: `theme.jsx`, `data.jsx`, `icons.jsx`,
`components.jsx`, `screens.jsx`, `overlays.jsx`. The phone mock (`Food Storage Tracker.html`,
`app.jsx`, `android-frame.jsx`) is untouched and still works on its own.

---

## 1. Set up login (Firebase Authentication)

Login is now real, server-enforced Firebase Auth — there is **no password to edit in the
code**. You create the accounts once in the Firebase Console:

1. [Firebase Console](https://console.firebase.google.com/) → your project
   **home-food-storage-tracker** → **Authentication**.
2. Click **Get started**, then under **Sign-in method** enable **Email/Password**. Save.
3. Go to the **Users** tab → **Add user**. Create one account for each person, e.g.
   - `alex@yourhouse.com` + a password
   - `madalina@yourhouse.com` + a password

   (Any email works — it doesn't have to be a real inbox, it's just the login name.)
4. That's it. On the website you sign in with one of those email/password pairs. You stay
   signed in on that device until you tap the **sign-out** icon (top-right of the app bar).

> **Why this is better:** the password is checked by Google's servers, not in the page source,
> and Firestore is locked so only signed-in users can read/write (see step 2 below). Unlike a
> password hard-coded in the page, nobody can bypass it by viewing source.

---

## 2. Point it at your Firebase + set Firestore rules

`web-config.jsx` already contains a `window.FIREBASE_CONFIG` guessed from your
`google-services.json`, pointing at project **home-food-storage-tracker**.

If the site loads but shows *"Can't reach the shared inventory"* or you see an
**API-key / permission** error in the browser console (F12), it's almost certainly because the
auto-generated key is **restricted to the Android app**. Fix in 2 minutes:

1. [Firebase Console](https://console.firebase.google.com/) → your project → **Project settings**.
2. Under *Your apps*, click **Add app → Web** (the `</>` icon). Give it any nickname.
3. Firebase shows a `const firebaseConfig = { ... }` snippet. Copy those values into
   `window.FIREBASE_CONFIG` in `web-config.jsx`.

### Firestore security rules — pick one

> ⚠️ **Important:** the Android phone app does **not** sign in. If you lock the rules to
> require authentication (Option B), the **phone app will stop being able to read/write**
> until it also signs in. Choose based on whether you want to touch the phone app.

> These rules use a wildcard so they cover **both** the inventory (`items`) and the shopping
> list (`toBuy`) collections under the household — the same paths the Android app uses.

**Option A — leave rules open (phone app keeps working as-is).** The website still requires
login, so casual visitors can't use it; the database itself stays open like today.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{householdId}/{document=**} {
      allow read, write: if true;
    }
  }
}
```

**Option B — require login at the database level (strongest).** Only signed-in users can
read/write. **This needs the Android app to authenticate too** — ask me and I'll add a sign-in
(anonymous or email/password) to the React Native app so it keeps working.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /households/{householdId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 3. Host on GitHub Pages

1. Create a GitHub repo and push **all** these files (keep them in the same folder):
   `index.html`, `web-config.jsx`, `web-app.jsx`, `theme.jsx`, `data.jsx`, `icons.jsx`,
   `components.jsx`, `screens.jsx`, `overlays.jsx`.
2. Repo → **Settings → Pages**.
3. *Source:* **Deploy from a branch**. *Branch:* `main`, folder `/ (root)`. Save.
4. Wait ~1 minute. Your site is live at `https://<your-username>.github.io/<repo-name>/`.
5. Open that URL on any device, type the password, enter your name — done. Both you and
   Madalina open the same URL and see the same inventory as the phone app.

To update later: edit a file, commit, push — Pages redeploys automatically.

---

## Testing locally before you push

Because `index.html` loads the `.jsx` files over `fetch`, opening it via `file://` is blocked
by the browser. Run a tiny local server instead:

```bash
# from this folder
python -m http.server 8000
# then open http://localhost:8000  in your browser
```

(Any static server works — `npx serve`, VS Code "Live Server", etc.)

---

## How it stays in sync

`web-config.jsx` defines a `window.FST` data layer that mirrors the Android app's
`src/services/storage.js`: same collection, same `subscribeToItems` / `saveItem` /
`deleteItem` / `seedIfEmpty`. The web app subscribes with Firestore's real-time listener, so
every device editing the same Firestore project sees changes live.
