/**
 * termsConsent.js
 * ---------------
 * Tracks whether this browser has accepted the FixMyTown Terms of
 * Service. Deliberately simple - a single localStorage flag, since
 * this only needs to gate anonymous/guest actions (registering,
 * logging in) before an account exists. Once a user has an account,
 * their acceptance travels with this same browser storage.
 */

const STORAGE_KEY = 'fixmytown_tos_accepted';
const SESSION_SHOWN_KEY = 'fixmytown_tos_prompted_this_session';

export function hasAcceptedTerms() {
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export function acceptTerms() {
  localStorage.setItem(STORAGE_KEY, 'true');
}

export function declineTerms() {
  localStorage.setItem(STORAGE_KEY, 'false');
}

/** Has the auto-popup already shown once this browser session? */
export function hasPromptedThisSession() {
  return sessionStorage.getItem(SESSION_SHOWN_KEY) === 'true';
}

export function markPromptedThisSession() {
  sessionStorage.setItem(SESSION_SHOWN_KEY, 'true');
}
