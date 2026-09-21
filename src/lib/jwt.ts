/**
 * Reads the claims out of a JWT.
 *
 * This does **not** verify the signature, and must never be used to decide
 * anything security-sensitive — the server does that. It is only for reading
 * what the backend chose to put in the token, such as the member's own
 * details, so the app does not have to ask for them again.
 */

/** Base64url → string, without relying on a Buffer or atob polyfill. */
function decodeBase64Url(value: string): string | null {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
  try {
     
    const binary = globalThis.atob ? globalThis.atob(padded) : null;
    if (binary === null) return null;
    // atob gives bytes-as-chars; re-read them as UTF-8 so non-ASCII names survive.
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function decodeJwtClaims(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const json = decodeBase64Url(parts[1]);
  if (!json) return null;

  try {
    const claims: unknown = JSON.parse(json);
    return claims && typeof claims === 'object' ? (claims as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** `exp` is seconds since the epoch, when present. */
export function jwtExpiresAt(claims: Record<string, unknown>): Date | null {
  return typeof claims.exp === 'number' ? new Date(claims.exp * 1000) : null;
}
