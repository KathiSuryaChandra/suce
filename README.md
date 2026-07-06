# SUCE Frontend

The React 18 + Vite client for the SUCE e-commerce platform. Black / white / silver
design system, Bootstrap 5 grid + custom theme layer, JWT auth against the SUCE
Spring Boot API (built in later phases).

## Stack

- React 18, React Router DOM 6
- Vite (dev server + build)
- Axios (with a refresh-token interceptor)
- Bootstrap 5 (grid/utilities) + custom CSS design tokens in `src/index.css`
- Bootstrap Icons (via CDN in `index.html`)

## Brand assets

- **Logo**: `src/assets/logo-light.png` (for dark surfaces — navbar, footer,
  admin sidebar) and `src/assets/logo-dark.png` (ink-colored, for light
  surfaces — sign in/register). Both are cropped tight to the mark with a
  transparent background; resize via the `.suce-logo-mark` CSS class.
- **Favicon**: `public/favicon.png` / `public/apple-touch-icon.png` — the
  light mark on an ink rounded tile, generated for contrast on any browser
  chrome theme.
- **Welcome splash**: `public/brand-intro.mp4` (the "Welcome to My SuCe"
  brand animation, 5s, no audio) plays once per browser session via
  `src/components/BrandIntro.jsx`, mounted at the top of `App.jsx`. It:
  - shows once per session (`sessionStorage`), not on every route change
  - is skippable from the moment it appears
  - is skipped entirely if the visitor has `prefers-reduced-motion` set
  - uses `public/brand-intro-poster.jpg` as a poster frame so something
    paints instantly before the video buffers

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_BASE_URL to your backend
npm run dev             # http://localhost:3000
```

```bash
npm run build            # production build to dist/
npm run preview          # preview the production build locally
```

> This project was authored without network access in the build sandbox, so
> dependencies have **not** been installed or build-verified here. Run
> `npm install` locally before `npm run dev`. If anything doesn't compile,
> it's most likely a small import path or prop-name mismatch — share the
> error and it's a quick fix.

## Auth model — what the backend needs to support

`AuthContext` keeps the **access token in memory only** (not localStorage) and expects:

- `POST /auth/login`, `POST /auth/register` → `{ accessToken, user }`, and set a
  **httpOnly, secure refresh-token cookie** in the response.
- `POST /auth/refresh` → reads the refresh cookie, returns a new `{ accessToken, user }`.
  Called once on app load to silently restore a session, and again by the axios
  interceptor whenever a request gets a 401.
- `POST /auth/logout` → clears the refresh cookie server-side.

This means CORS on the backend must allow credentials
(`Access-Control-Allow-Credentials: true`) and the frontend origin specifically
(not `*`). `withCredentials: true` is already set on the axios instance in
`src/services/api.js`.

## Folder structure

```
src/
├── components/   reusable UI (ProductCard, Navbar, Footer, RatingStars…)
├── pages/        route-level views, pages/admin/* for the admin dashboard
├── layouts/       CustomerLayout (navbar+footer), AdminLayout (sidebar)
├── routes/        AppRoutes.jsx, ProtectedRoute, AdminRoute
├── context/       AuthContext, CartContext, ToastContext
├── hooks/         useAuth, useCart, useDebounce
├── services/      one axios-based module per backend domain
└── index.css       design tokens + component styles (see below)
```

## Design system

- **Palette**: ink `#0a0a0b`, charcoal `#1e1f22`, paper `#fafafa`, silver
  `#b8bcc2`, silver-light `#e4e5e8`, steel `#6b6e76`.
- **Type**: Fraunces (display/headlines), Inter (body), IBM Plex Mono
  (prices, SKUs, status labels, eyebrows).
- **Signature element**: product cards sweep a diagonal silver sheen on
  hover/focus (`.product-card::before` in `index.css`) — the one deliberate
  flourish; everything else stays quiet (hairline dividers, generous
  whitespace, no heavy shadows).
- All tokens live as CSS custom properties at the top of `src/index.css` —
  change them there to retheme globally.

## Connecting to the backend

Every API call goes through `src/services/*.js`, all of which sit on the
shared `src/services/api.js` axios instance. Once the SUCE backend (Phase 2–3)
is running, set `VITE_API_BASE_URL` in `.env` and the app should work
end-to-end with no other changes — the request/response shapes here
(`{ content, totalPages }` for paginated lists, `{ accessToken, user }` for
auth, etc.) match what's specified in the backend plan.

## What's stubbed vs. real

- **Payments**: the checkout flow collects a payment method choice and sends
  it with the order; the actual Razorpay/Stripe SDK handshake happens in
  Phase 7 once the backend's `PaymentGatewayService` exists.
- **Product images**: `productService.uploadImages` is wired up but the admin
  product form here doesn't yet include a file-upload UI — add an `<input
  type="file" multiple>` calling it when you're ready for image management.
