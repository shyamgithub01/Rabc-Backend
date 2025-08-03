/**
 * Decodes a JWT access token from localStorage (or passed token).
 * Returns the decoded payload as a JS object.
 */
export default function decodeToken(token = null) {
  try {
    const accessToken = token || localStorage.getItem("access_token");
    if (!accessToken) return null;

    const payload = accessToken.split('.')[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/')); // handle base64url
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Invalid token", error);
    return null;
  }
}
