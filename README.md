# Grass

A gentle place to use your time well. A study planner that shows your academic progress, strikes tasks off as you finish them, and plans study sessions from how driven you feel and the hour of the day.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. Everything you enter is stored in the browser on the device you use.

## Where things come from

- **Classes & sources → Classes**: classes, current and target grade, and the evaluation rubric. Tasks linked to a rubric line take its weight divided by the number of items.
- **Documents & scans**: copy the prompt, attach your syllabus photos or PDFs in the Claude app, and paste Claude's reply back. The app turns it into classes, rubrics and tasks for you to confirm. No API key needed.
  - Optional: put `ANTHROPIC_API_KEY` in `.env.local` (see `.env.example`) and the Documents tab switches to a one-tap built-in reader through `/api/extract`. This is billed by the Claude API.
- **Connections**: Canvas (personal access token, proxied through `/api/canvas`) and any iCal feed (Google Calendar, Outlook / Teams calendar, Canvas calendar) through `/api/ics`.

## Sync across devices (Supabase)

The app signs you in with an emailed link or code and keeps one copy of your planner per person in Supabase. The newest change to each class, task or session wins, and deletions carry over. Canvas tokens and calendar feed addresses stay on each device.

One-time setup in the Supabase dashboard:

1. **SQL Editor → New query**: paste `supabase/schema.sql` and run it. It creates the table and the rule that each person can only read their own row.
2. **Authentication → URL Configuration**: set Site URL to the Vercel address, and add it plus `http://localhost:3000` under Redirect URLs.
3. Optional, recommended for the home-screen app: **Authentication → Emails → Magic Link** template, add `{{ .Token }}` so the email also shows a 6-digit code you can type into the app.

The project URL and publishable key are built in (`src/lib/supabase.ts`) and can be overridden with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## How the numbers work

- **Priority** = weight on final grade × urgency × grade risk (how far the class sits below its target).
- **Time still needed** = estimate × effort left (the last stretch is slower, more so for hard tasks) × difficulty × fit with the hour (4–12 analytical, 12–18 reset, 18–4 creative) × drive from the five stars.
- **Background**: the crayon grass is drawn once on a canvas and stays still.
- **Sessions** run in 30-minute blocks with a 5-minute break after each full block; sessions under 30 minutes have none.
