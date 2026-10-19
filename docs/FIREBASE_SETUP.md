# Firebase setup — Cenit

This project is migrating from Supabase/Postgres + NextAuth to **Firebase
(Firestore + Firebase Auth)**. Follow these steps once; then paste the values
into `.env.local`. Everything in the code already reads from these env vars.

---

## 1. Create the Firebase project

1. Go to <https://console.firebase.google.com> and click **Add project**.
2. Name it (e.g. `cenit`). Google Analytics is optional — you can skip it.
3. Wait for it to provision, then open the project.

## 2. Register a Web app (gives you the client config)

1. On the project overview, click the **`</>`** (Web) icon.
2. App nickname: `Cenit Web`. **Don't** check "Firebase Hosting" (we host on our own).
3. Firebase shows a `firebaseConfig` object. Copy each value into `.env.local`:

   | firebaseConfig field | .env.local variable |
   |----------------------|---------------------|
   | `apiKey`             | `NEXT_PUBLIC_FIREBASE_API_KEY` |
   | `authDomain`         | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` |
   | `projectId`          | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` |
   | `storageBucket`      | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId`  | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId`              | `NEXT_PUBLIC_FIREBASE_APP_ID` |

   (These are public by design — security comes from Auth + Firestore Rules.)

## 3. Enable Firestore

1. Left sidebar → **Build → Firestore Database → Create database**.
2. Start in **production mode** (we'll ship Security Rules).
3. Pick a location close to your users (e.g. `eur3` / `europe-west`). **This
   is permanent**, so choose deliberately.

## 4. Enable Authentication providers

Left sidebar → **Build → Authentication → Get started**, then under
**Sign-in method** enable:

- **Email/Password** → toggle **Enable** (leave "Email link" off). Firebase
  handles password reset + email verification emails for you.
- **Google** → Enable, set a support email, Save.
- **Apple** → Enable. This one needs a **paid Apple Developer account**: you
  create a Services ID, a Sign in with Apple key, and paste the Team ID / Key ID
  / private key into Firebase. (Full guide:
  <https://firebase.google.com/docs/auth/web/apple>.) If you don't have the
  Apple account yet, leave Apple off — the button will simply be hidden.

Then open **Authentication → Settings → Authorized domains** and make sure
`localhost` is listed (it is by default) and add your production domain when you
deploy.

## 5. Get the Admin SDK service account (server credentials)

1. Gear icon → **Project settings → Service accounts**.
2. Click **Generate new private key** → confirm. A JSON file downloads.
3. From that JSON, copy into `.env.local`:

   | JSON field       | .env.local variable |
   |------------------|---------------------|
   | `project_id`     | `FIREBASE_PROJECT_ID` |
   | `client_email`   | `FIREBASE_CLIENT_EMAIL` |
   | `private_key`    | `FIREBASE_PRIVATE_KEY` |

   ⚠️ For `FIREBASE_PRIVATE_KEY`, keep it **on one line, wrapped in double
   quotes**, with the `\n` sequences intact, e.g.
   `FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"`.
   The code converts the `\n` back into real newlines.

   🔒 **Never commit this JSON or these values.** `.env.local` is gitignored.

## 6. Restart the dev server

```bash
npm run dev
```

That's it — hand the branch back and I'll wire the app to it.

---

## What I do after you've done the above

- **Phase 1 — Auth:** replace NextAuth with Firebase Auth (email/password +
  Google + Apple), a client auth context, server-side ID-token verification, and
  user **roles as custom claims** (GUEST / HOST / ADMIN). Password reset + email
  verification switch to Firebase's built-in emails.
- **Phase 2 — Data:** move every API route and host/admin page from Prisma to
  Firestore (see the collection model below).
- **Phase 3 — Migration:** a one-time script copies your existing Supabase rows
  (12 users + venues/gifts/bookings/…) into Firestore, and seeds demo venues.
- **Cleanup:** remove Prisma, NextAuth, and the Supabase `DATABASE_URL`.

## Firestore data model (planned)

| Firestore collection | From Prisma model | Notes |
|----------------------|-------------------|-------|
| `users/{uid}`        | User              | `uid` = Firebase Auth UID; role also mirrored as a custom claim |
| `venues/{id}`        | Venue             | `addOns` embedded as an array; `blockedDates` as a subcollection |
| `venues/{id}/bookings/{id}` | Booking + BookingAddOn | booking add-ons embedded |
| `gifts/{id}`         | Gift + ClubTicketOption | club option embedded |
| `gifts/{id}/contributions/{id}` | GiftContribution | subcollection |
| `payments/{id}`      | Payment           | keyed by Stripe id where useful |
| `consentLogs/{id}`   | ConsentLog        | |
| `contactMessages/{id}` | ContactMessage  | |

`Account` / `Session` / `VerificationToken` (NextAuth tables) are **dropped** —
Firebase Auth manages sessions and tokens natively.
