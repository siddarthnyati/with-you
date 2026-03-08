# With You 💕

A heartfelt couples push-notification app. One tap sends a message —
"Thinking of you", "Drink water", "I love you" — straight to your partner's phone.

## Quick Start (Expo Go — no Apple Developer account needed)

### 1. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a free project
2. Open the **SQL Editor** and run `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** from Project Settings → API

### 2. Configure the app
```bash
cp .env.example .env
# Edit .env and fill in your Supabase URL and anon key
```

### 3. Run the app
```bash
npx expo start
```

Scan the QR code with **Expo Go** (free on App Store / Play Store) on both phones.

### 4. Set up both phones
1. On each phone, go to **Settings** tab
2. Set your own name (e.g. "Sid") and your partner's name (e.g. "Priya")
3. Grant notification permissions when prompted
4. Tap any button on the main screen to send a notification!

---

## File Structure

```
with-you/
  app/
    (tabs)/
      index.tsx       # Home screen: message buttons
      settings.tsx    # Name setup + partner status
    _layout.tsx       # Tab navigation layout
  components/
    MessageButton.tsx # Animated tap button
  lib/
    supabase.ts       # Supabase client
    notifications.ts  # Push token registration + send helper
    storage.ts        # SecureStore name persistence
  supabase/
    schema.sql        # Run this in Supabase SQL Editor
  .env                # Your Supabase credentials (not committed)
```

## How notifications work

```
You tap "I love you"
  → app calls Expo Push API directly
  → Expo routes to APNs (iOS) or FCM (Android)
  → Partner's phone shows native push notification
```

The app looks up your partner's Expo Push Token in Supabase by name,
then sends directly to Expo's push service. No custom backend needed.

## Tech Stack

- **Expo** (React Native) — cross-platform mobile
- **Expo Push Notifications** — free, handles iOS + Android
- **Supabase** — stores push tokens (free tier: up to 50k MAU)
- **expo-secure-store** — stores your name on-device

## Future (Phase 2 — public launch)

- Supabase Auth (email/phone login)
- Partner invite links
- More message categories
- EAS Build → App Store + Play Store
