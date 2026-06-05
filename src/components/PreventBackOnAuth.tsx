import { useEffect } from 'react'

/**
 * Prevents the browser back navigation from leaving the app while the user
 * appears authenticated (checks for `access_token` in localStorage).
 *
 * This works by pushing a history state and re-pushing it when the user
 * attempts to go back. It is intentionally minimal and only active when an
 * access token exists.
 */
export function PreventBackOnAuth() {
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    // Push an extra state so a single back won't leave the current page.
    try {
      window.history.pushState(null, document.title, window.location.href)
    } catch (e) {
      // ignore in non-browser environments
    }

    const onPop = () => {
      if (localStorage.getItem('access_token')) {
        // Re-push the state to prevent going back while authenticated
        try {
          window.history.pushState(null, document.title, window.location.href)
        } catch (e) {
          // ignore
        }
      }
    }

    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  return null
}
