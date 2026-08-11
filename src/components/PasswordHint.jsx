/**
 * PasswordHint.jsx
 * ----------------
 * The small checklist that appears under a password field, e.g.:
 *   ✓ 6-15 characters
 *   ✗ At least one uppercase letter
 *   ...
 * Each line turns green with a check once that rule is satisfied.
 * Only rendered once the person has started typing (empty field
 * shows nothing, to avoid cluttering the form before they've begun).
 */

import { Check, X } from 'lucide-react';
import { getPasswordRuleResults } from '../utils/passwordValidation';

export default function PasswordHint({ password }) {
  if (!password) return null;

  const results = getPasswordRuleResults(password);

  return (
    <div style={{ marginTop: 6, marginBottom: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {results.map((r) => (
        <div
          key={r.label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            color: r.met ? '#1e8e3e' : '#98a2b3',
            transition: 'color 0.15s ease'
          }}
        >
          {r.met ? <Check size={12} /> : <X size={12} />}
          {r.label}
        </div>
      ))}
    </div>
  );
}
