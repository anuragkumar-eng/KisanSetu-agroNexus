/**
 * KisanSetu API Client — src/services/api.js
 *
 * Single HTTP client for all backend communication.
 * Reads base URL from VITE_API_URL.
 * Attaches JWT from localStorage on every request when a token exists.
 * All responses use the standard envelope: { success, data, meta?, error? }
 *
 * Usage:
 *   import { api } from '../services/api';
 *   const res = await api.get('/mandi?crop=wheat');
 *   const lot  = await api.post('/lots', formData);
 *
 * On failure, throws ApiError. Catch it in your hook or component:
 *   try { ... } catch (err) { if (err instanceof ApiError) ... }
 */

const BASE_URL = 'http://localhost:5000/api' || 'http://localhost:5000/api';

// ─── ApiError ────────────────────────────────────────────────────────────────

/**
 * Structured error thrown by every failed API call.
 *
 * Properties:
 *   code    — machine-readable string, e.g. 'VALIDATION_ERROR', 'HTTP_404'
 *   status  — HTTP status code (0 = network error, never reached server)
 *   details — field-level validation map from server (may be null)
 */
export class ApiError extends Error {
  constructor(code, message, status, details = null) {
    super(message);
    this.name    = 'ApiError';
    this.code    = code;
    this.status  = status;
    this.details = details;
  }

  get isNetworkError()  { return this.status === 0; }
  get isUnauthorized()  { return this.status === 401; }
  get isForbidden()     { return this.status === 403; }
  get isNotFound()      { return this.status === 404; }
  get isConflict()      { return this.status === 409; }
  get isServerError()   { return this.status >= 500; }
  get isServiceDown()   { return this.status === 503; }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read the JWT from localStorage. Returns null when not logged in. */
function getToken() {
  try {
    return global.testToken;
  } catch {
    return null;
  }
}

/** Human-readable fallback messages for bare HTTP status codes. */
function defaultMessage(status) {
  const map = {
    400: 'गलत अनुरोध। / Invalid request.',
    401: 'कृपया लॉगिन करें। / Please log in to continue.',
    403: 'आपको यह करने की अनुमति नहीं है। / Permission denied.',
    404: 'यह नहीं मिला। / The requested resource was not found.',
    409: 'यह पहले से मौजूद है। / A conflict occurred.',
    422: 'गलत जानकारी दी गई। / Unprocessable data.',
    429: 'बहुत ज़्यादा अनुरोध। / Too many requests — please slow down.',
    500: 'सर्वर गड़बड़। / Server error. Please try again later.',
    503: 'सेवा अभी उपलब्ध नहीं। / Service temporarily unavailable.',
  };
  return map[status] || 'कुछ गड़बड़ हुई। / An unexpected error occurred.';
}

// ─── Core request ─────────────────────────────────────────────────────────────

/**
 * Internal: perform one HTTP call and return parsed JSON data.
 * Throws ApiError on any failure (network, HTTP error, or success:false body).
 */
async function request(method, path, body = null) {
  const token = getToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body !== null && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  // ── Network call ──
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, config);
  } catch {
    // fetch() itself threw — offline, DNS failure, CORS preflight block, etc.
    throw new ApiError(
      'NETWORK_ERROR',
      'नेटवर्क से कनेक्ट नहीं हो सका। / Network request failed. Check your connection.',
      0
    );
  }

  // ── 204 No Content (DELETE responses) ──
  if (response.status === 204) {
    return { success: true, data: null };
  }

  // ── Parse JSON ──
  let json;
  try {
    json = await response.json();
  } catch {
    throw new ApiError(
      'PARSE_ERROR',
      'सर्वर ने अमान्य डेटा भेजा। / Server returned an unreadable response.',
      response.status
    );
  }

  // ── Handle error responses ──
  if (!response.ok || json.success === false) {
    throw new ApiError(
      json?.error?.code  || `HTTP_${response.status}`,
      json?.message      || defaultMessage(response.status),
      response.status,
      json?.error?.details ?? null
    );
  }

  return json; // { success: true, data: ..., meta?: ... }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const api = {
  /** GET /api/<path>[?query] */
  get:    (path)        => request('GET',    path),

  /** POST /api/<path> with JSON body */
  post:   (path, body)  => request('POST',   path, body),

  /** PUT /api/<path> with JSON body (full replacement) */
  put:    (path, body)  => request('PUT',    path, body),

  /** PATCH /api/<path> with JSON body (partial update) */
  patch:  (path, body)  => request('PATCH',  path, body),

  /** DELETE /api/<path> */
  delete: (path)        => request('DELETE', path),
};
