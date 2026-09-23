/**
 * Modal.jsx
 * ---------
 * Generic centered modal (white card over a dark overlay) used for
 * "Report New Issue", "Assign Issue", "Register New Worker",
 * "Update Progress", etc. - every popup in the prototype shares
 * this same shell.
 */

import { X } from 'lucide-react';

export default function Modal({
  title,
  icon,
  onClose,
  children,
  width = 520
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 33, 54, 0.55)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '100px 20px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        marginTop: '100px'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width,
          maxWidth: '100%',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
          zIndex: 10000
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '18px 22px',
            borderBottom:
              '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            background: 'white',
            zIndex: 2
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontWeight: 700,
              fontSize: 16
            }}
          >
            {icon}
            {title}
          </div>

          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '22px'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}