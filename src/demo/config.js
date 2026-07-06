/**
 * DEMO MODE
 * =========
 * When true, every service in `src/services/*` answers from local seed data
 * (src/demo/seedData.js) and browser localStorage instead of calling the
 * real backend. This lets the full app — browsing, cart, wishlist,
 * checkout, order history, and the admin dashboard — work end to end with
 * zero backend running, which is useful while the SUCE API is still being
 * built.
 *
 * ── TO SWITCH TO YOUR REAL BACKEND ──────────────────────────────────────
 * 1. Open `.env` (create it from `.env.example` if you haven't).
 * 2. Set:  VITE_DEMO_MODE=false
 * 3. Make sure VITE_API_BASE_URL points at your running Spring Boot API.
 * 4. Restart `npm run dev`.
 *
 * That's it — every service file already has its real axios implementation
 * sitting right below the demo short-circuit; nothing else needs to change.
 * The demo data/components themselves (src/demo/, public/products/) are
 * inert once this flag is false — delete them whenever you're ready.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false'
