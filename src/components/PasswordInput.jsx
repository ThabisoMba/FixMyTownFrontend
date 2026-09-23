/**
 * PasswordInput.jsx
 * ------------------
 * A drop-in replacement for <input type="password"> that adds a
 * clickable eye icon so the user can reveal what they've typed and
 * confirm it's correct, before submitting a login, registration, or
 * password reset form.
 *
 * Usage:
 *   <PasswordInput name="password" value={value} onChange={onChange} placeholder="..." required />
 *
 * Pass showIcon={false} for fields that don't need the left-hand
 * lock icon (e.g. a "Confirm Password" field directly under one that
 * already has it).
 */

import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordInput({
  icon: Icon = Lock,
  showIcon = true,
  style,
  ...inputProps
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {showIcon && (
        <Icon
          size={15}
          style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)', pointerEvents: 'none' }}
        />
      )}

      <input
        {...inputProps}
        type={visible ? 'text' : 'password'}
        style={{
          paddingLeft: showIcon ? 34 : undefined,
          paddingRight: 38,
          ...style
        }}
      />

      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        style={{
          position: 'absolute',
          right: 8,
          top: 0,
          bottom: 0,
          background: 'none',
          border: 'none',
          padding: '0 8px',
          margin: 0,
          cursor: 'pointer',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}
