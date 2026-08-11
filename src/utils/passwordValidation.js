/**
 * passwordValidation.js
 * ---------------------
 * One shared definition of "what makes a valid password" - used by
 * both the registration form and the Forgot Password flow's new
 * password step, so the rules (and the hint text shown under the
 * field) never drift out of sync between the two.
 *
 * Must match the server-side check in
 * backend/Controllers/AuthController.cs -> ValidatePasswordStrength().
 */

export const PASSWORD_RULES = [
  { label: '6-15 characters', test: (pw) => pw.length >= 6 && pw.length <= 15 },
  { label: 'At least one uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'At least one number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'At least one special character (e.g. ! @ # $)', test: (pw) => /[^A-Za-z0-9]/.test(pw) }
];

export function getPasswordRuleResults(password) {
  return PASSWORD_RULES.map((rule) => ({ label: rule.label, met: rule.test(password) }));
}

export function isPasswordValid(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
