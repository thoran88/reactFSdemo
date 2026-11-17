# FastSpring React Checkouts

Reference app with each FastSpring checkout on its own page. Split into a frontend and a backend so each deploys as its own Vercel project.

```
frontend/   Vite + React Router SPA (popup, embedded, Checkout Components)
backend/    Session API for Checkout Components (Vercel function + local Express)
```

| Route | Checkout | How it loads |
|---|---|---|
| `/components` | Checkout Components | `@fastspring/checkout-sdk` + session from backend |
| `/embedded` | Embedded checkout | Store Builder Library, `embedded-react` storefront |
| `/popup` | Popup checkout | Store Builder Library, `popup-react` storefront |
| `/complete` | Thank you page | Shared by all three |

## Local dev

```bash
npm run install:all
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env    # add API creds
npm run dev                             # web :3000, api :4000
```

Locally `VITE_API_BASE_URL` is empty and Vite proxies `/api` to the backend on :4000.

## Deploy to Vercel

Create two Vercel projects from this repo.

**Backend**
* Root Directory: `backend`
* Framework preset: Other, no build command
* Env vars: `FS_CHECKOUT_PATH`, `FS_API_USERNAME`, `FS_API_PASSWORD`, `ALLOWED_ORIGINS` (the frontend URL, e.g. `https://fastspring-checkouts.vercel.app`)
* `api/session.js` is deployed as `POST /api/session`. `server.js` is only for local dev.

**Frontend**
* Root Directory: `frontend`
* Framework preset: Vite
* Env vars: every `VITE_` var from `.env.example`, with `VITE_API_BASE_URL` set to the backend URL
* `vercel.json` rewrites all routes to `index.html` so deep links like `/popup` work

`VITE_` vars are baked in at build time, so redeploy the frontend after changing them.

## FastSpring app config for the deployed domain

Add the frontend Vercel URL to:
1. Component Checkout > Implementation > allowed domains (otherwise `frame-ancestors` error)
2. The embedded storefront's allowed domains

## Notes

* Country: with API creds set, the backend passes the buyer IP so FastSpring picks country and currency. `FS_DEFAULT_COUNTRY` is only used when there is no buyer IP or no creds.
* Sessions are single use, the frontend creates a new one per page load.
* The thank you page is UX only. Fulfil from the `order.completed` webhook.
* StrictMode is off so dev does not double load SBL or burn two sessions.
