// Shared between the login route and the proxy (edge) — WebCrypto only.
// The cookie stores a hash derived from the admin password instead of a
// constant string, so it can't be forged without knowing the password.
const SALT = 'cassette-jury-admin-v1';

export async function adminCookieValue(password: string): Promise<string> {
  const data = new TextEncoder().encode(`${SALT}:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const ADMIN_COOKIE_NAME = 'admin-auth';
