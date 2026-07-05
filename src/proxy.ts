// Proxy is not needed for i18n — locale is resolved from the NEXT_LOCALE
// cookie directly in the root layout. This file is kept as a no-op so
// Next.js 16 doesn't complain about a missing proxy.

export function proxy() {
  // pass-through — no middleware logic needed
}
