# Grass

A gentle place to use your time well. A study planner that shows your academic progress, strikes tasks off as you finish them, and plans study sessions from how driven you feel and the hour of the day.

## Run it

```bash
npm install
cp .env.example .env.local   # add your Claude API key if you want photo / PDF / text reading
npm run dev
```

Open http://localhost:3000. Everything you enter is stored in the browser on the device you use.

## Where things come from

- **Classes & sources → Classes**: classes, current and target grade, and the evaluation rubric. Tasks linked to a rubric line take its weight divided by the number of items.
- **Documents & scans**: photos of syllabi, rubric tables, assignment pages, PDFs or pasted text. The server route `/api/extract` reads them with Claude and proposes classes, rubrics and tasks for you to confirm. Needs `ANTHROPIC_API_KEY`.
- **Connections**: Canvas (personal access token, proxied through `/api/canvas`) and any iCal feed (Google Calendar, Outlook / Teams calendar, Canvas calendar) through `/api/ics`.

## How the numbers work

- **Priority** = weight on final grade × urgency × grade risk (how far the class sits below its target).
- **Time still needed** = estimate × effort left (the last stretch is slower, more so for hard tasks) × difficulty × fit with the hour (4–12 analytical, 12–18 reset, 18–4 creative) × drive from the five stars.
- **Background**: the crayon grass is drawn once on a canvas and stays still.
- **Sessions** run in 30-minute blocks with a 5-minute break after each full block; sessions under 30 minutes have none.
