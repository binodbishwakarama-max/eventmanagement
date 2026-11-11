/**
 * NoSQL Injection Defense Middleware
 * Recursively strips keys starting with '$' or containing '.' from req.body, req.query, and req.params
 * to prevent MongoDB query selector injection attacks.
 */

function sanitizePayload(target) {
  if (!target || typeof target !== 'object') {
    return target;
  }

  if (Array.isArray(target)) {
    return target.map(sanitizePayload);
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    // Block Mongo operators ($gt, $where, $ne, etc.) and dot-path navigation (profile.role)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizePayload(value);
  }

  return clean;
}

export function sanitize(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizePayload(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizePayload(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizePayload(req.params);
  }
  next();
}

