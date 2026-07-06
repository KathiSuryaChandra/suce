// Small shared helpers used across the demo/*Api.js modules.

/** Simulates network latency so loading skeletons are visible briefly,
 *  instead of content flashing in instantly. */
export function wait(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Throws an error shaped like an axios error, so existing
 *  `err.response?.data?.message` handling in pages/components works
 *  unchanged whether the request hit the real API or demo mode. */
export function demoError(message, status = 400) {
  const err = new Error(message)
  err.response = { status, data: { message } }
  return err
}
