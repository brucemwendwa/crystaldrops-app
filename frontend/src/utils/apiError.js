/**
 * Turn axios / fetch errors into a single user-visible string.
 */
export function formatApiError(err) {
  if (!err) return 'Something went wrong. Please try again.';

  const res = err.response;
  if (res) {
    const { status, data } = res;

    if (data && typeof data === 'object') {
      if (typeof data.error === 'string' && data.error.trim()) return data.error.trim();
      if (typeof data.message === 'string' && data.message.trim()) return data.message.trim();
      if (data.errors && typeof data.errors === 'object') {
        const first = Object.values(data.errors)[0];
        if (first && typeof first === 'object' && typeof first.message === 'string') {
          return first.message;
        }
      }
    }

    if (typeof data === 'string') {
      const stripped = data.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (stripped && stripped.length < 400 && !stripped.toLowerCase().startsWith('<!doctype')) {
        return stripped.slice(0, 280);
      }
    }

    if (status === 404) {
      return 'API not found (404). Start the backend on port 5000 and use dev/preview so /api is proxied, or set VITE_API_URL.';
    }
    if (status === 502 || status === 503) {
      return 'Could not reach the API (bad gateway). Is the backend running on port 5000?';
    }
    return `Request failed (${status}). Check that the backend is running.`;
  }

  if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
    return 'Cannot reach the server. Start the backend (port 5000), then reload this page.';
  }

  if (typeof err.message === 'string' && err.message.trim()) {
    return err.message.trim();
  }

  return 'Something went wrong. Please try again.';
}
