# Zone01 Profile

A single-page web app that shows a signed-in user's Zone01 profile: identity,
audit results, and XP per project — all rendered with hand-built SVG charts,
no charting library.

**Live:** hosted at <https://graphql.elmehdirezoug.dev/>

## Features

- **Sign in** with username/email + password via the Zone01 auth API.
  Credentials are base64-encoded (UTF-8 safe, so Arabic or any language works).
- **Identification card** — avatar, username, cohort, total XP, level, audit ratio.
- **Audit donut chart** — succeeded vs. failed audits with percentages.
- **XP bar chart** — XP earned per project, largest first.
- **Session handling** — the JWT is stored in `localStorage`; missing, expired,
  or invalid tokens return you to the login screen with a clear message.

## Tech stack

- Vanilla JavaScript (ES modules, no framework)
- GraphQL (Hasura) with JWT bearer auth
- Hand-built SVG charts
- Plain HTML + CSS

## How to run

The app is static. Open `index.html` in a browser, or serve the folder:

```sh
# any static server works, e.g.
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

## Project structure

```
.
├── index.html            # page skeleton + section containers
├── css/style.css         # all styles
├── js/
│   ├── main.js           # entry point, calls boot()
│   ├── app.js            # orchestration: views, profile load, errors
│   ├── api/
│   │   ├── signin.js     # auth endpoint → JWT
│   │   ├── graphql.js    # generic GraphQL client
│   │   └── profile.js    # profile query + raw data → view data
│   ├── components/
│   │   ├── login-view.js # login form
│   │   ├── profile-view.js
│   │   ├── donut-chart.js# audit donut + legend
│   │   └── bar-chart.js  # project XP bar chart
│   └── utils/
│       ├── format.js     # formatXP, formatRatio, safeValue, ...
│       ├── dom.js        # createElement + empty state
│       ├── svg.js        # SVG element helper
│       └── token.js      # localStorage JWT helpers
└── Readme.md
```


## API endpoints

- GraphQL: `https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql`
- Sign in: `https://learn.zone01oujda.ma/api/auth/signin`

## Flows at a glance

1. **Startup** — `main.js` calls `boot()`; a stored token means "signed in".
2. **Profile load** — one GraphQL query fetches everything; three mapper
   functions shape the data for the identification card, donut, and bar chart.
3. **Sign in** — form submit → `signin()` → store JWT → load profile.
4. **Log out** — clear JWT → back to the login screen.
