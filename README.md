# AuraUp (Glow Up Tracker)

Mobile-first glow-up tracker: simple habits + one photo per day + progress + a downloadable share image.

## Tech

- Frontend: React + Vite + Tailwind CSS
- Backend: Supabase (Auth, Postgres, Storage)
- Hosting: Vercel

## Supabase setup

1. Create a Supabase project.
2. Enable Email auth: Authentication -> Providers -> Email.
3. Create a Storage bucket named `photos` (keep it **private**).
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Get project keys:
   - Project Settings -> API -> `URL`
   - Project Settings -> API -> `anon public` key

## Local run

1. Install deps: `npm install`
2. Create `.env.local`:

```bash
VITE_SUPABASE_URL="https://YOUR-PROJECT.supabase.co"
VITE_SUPABASE_ANON_KEY="YOUR_ANON_KEY"
```

3. Start dev server: `npm run dev`

## Deploy (Vercel)

1. Push this project to GitHub.
2. Import into Vercel.
3. Set Environment Variables in Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build settings (usually auto-detected):
   - Build Command: `npm run build`
   - Output Directory: `dist`

Client-side routing is handled via `vercel.json`.

## Notes

- Habits:
  - Legacy: `habits` (fixed 3 habits).
  - Recommended: `user_habits` + `habit_logs` (supports custom habits). The app UI uses the recommended tables.
- Daily photos live in `photos` and the image file is stored in Supabase Storage under `photos/<user_id>/...`.
- The “Share” image is generated on-device (no external APIs).

## Future scope (not built)

- AI “future glow” preview
- Video progress generation
- Advanced analytics
