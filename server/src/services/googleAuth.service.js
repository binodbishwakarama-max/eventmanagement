import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

let oauthClient = null;

function getClient() {
  if (!oauthClient) {
    oauthClient = new OAuth2Client({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      redirectUri: env.GOOGLE_REDIRECT_URI
    });
  }
  return oauthClient;
}

/**
 * Cryptographically verifies a Google ID token from OpenID Connect / Google Sign-In.
 * Validates signature, issuer, audience, expiration, and email_verified claim.
 *
 * @param {string} idToken - The JWT ID token issued by Google Accounts
 * @returns {Promise<{ sub: string, email: string, name: string, picture: string, hd?: string }>}
 */
export async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw ApiError.badRequest('A valid Google ID token credential is required.');
  }

  // Isolated test harness hook for automated tests
  if (env.NODE_ENV === 'test' && idToken.startsWith('test-google-token:')) {
    const [, sub, email, name, verified] = idToken.split(':');
    if (verified === 'false') {
      throw ApiError.badRequest('Google account email has not been verified.');
    }
    return {
      sub: sub || 'google-test-sub-12345',
      email: email || 'student@dsu.edu.in',
      name: name || 'Test Student',
      picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      hd: (email || '').split('@')[1]
    };
  }

  if (!env.GOOGLE_CLIENT_ID) {
    throw ApiError.internal('Google OAuth is not configured on this server. GOOGLE_CLIENT_ID is missing.');
  }

  const client = getClient();

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw ApiError.unauthorized('Google token payload is empty or invalid.');
    }

    // Validate Issuer
    const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
    if (!validIssuers.includes(payload.iss)) {
      throw ApiError.unauthorized(`Invalid token issuer: ${payload.iss}`);
    }

    // Validate Audience
    if (payload.aud !== env.GOOGLE_CLIENT_ID) {
      throw ApiError.unauthorized('Token audience does not match configured Google Client ID.');
    }

    // Validate Email Verification
    if (!payload.email_verified) {
      throw ApiError.badRequest('Your Google account email has not been verified by Google.');
    }

    return {
      sub: payload.sub,
      email: payload.email.toLowerCase().trim(),
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture || '',
      hd: payload.hd || ''
    };
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized(`Google token verification failed: ${err.message}`);
  }
}

/**
 * Exchanges an OAuth 2.0 authorization code for tokens and verifies identity.
 *
 * @param {string} code - Authorization code from OAuth 2.0 redirect
 * @returns {Promise<{ sub: string, email: string, name: string, picture: string, hd?: string }>}
 */
export async function exchangeGoogleAuthCode(code) {
  if (!code) {
    throw ApiError.badRequest('Authorization code is required');
  }

  const client = getClient();
  const { tokens } = await client.getToken(code);
  return verifyGoogleIdToken(tokens.id_token);
}

