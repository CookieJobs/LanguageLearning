export function forceLogout() {
  try {
    localStorage.removeItem('linguaCraft_token')
    localStorage.removeItem('linguaCraft_refresh')
  } catch {}
  try {
    window.dispatchEvent(new Event('force-logout'))
  } catch {}
}
