/**
 * Modal.jsx
 * ---------
 * Generic centered modal (white card over a dark overlay) used for
 * "Report New Issue", "Assign Issue", "Register New Worker",
 * "Update Progress", etc. - every popup in the prototype shares
 * this same shell.
 */

import { X } from 'lucide-react';

export default function Modal({ title, icon, onClose, children, width = 520 }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 33, 54, 0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width, maxWidth: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '18px 22px',
            borderBottom: '1px solid var(--border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16 }}>
            {icon}
            {title}
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: '22px' }}>{children}</div>
      </div>
    </div>
  );
}
