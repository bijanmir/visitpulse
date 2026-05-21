# VisitPulse

Visit prep and medication timeline for psychiatrists.

## Demo login

1. `npm run dev` → [http://localhost:3000/login](http://localhost:3000/login)
2. Email: `elena@harborpsychiatry.demo` (or whatever you set in Settings)
3. Password: `demo1234`
4. MFA code (when enabled): `123456`

## Features (demo)

- **Schedule** — browse visits by day (prev/next, date picker, quick day chips)
- **Patient check-ins** — browse submissions by day on each patient chart
- **Patients** — add, edit, remove patients (saved in browser storage)
- **Settings** — update your name, practice, specialty, email; toggle MFA
- **Fixed sidebar** — stays in place while the main panel scrolls

## Routes

| Route | Purpose |
|-------|---------|
| `/login` | Sign in + MFA |
| `/dashboard` | Day-based schedule |
| `/dashboard/patients` | Manage patients |
| `/dashboard/patients/:id` | Visit brief + check-in history |
| `/check-in/:token` | Patient check-in link |

Synthetic data only until HIPAA mode is enabled.
