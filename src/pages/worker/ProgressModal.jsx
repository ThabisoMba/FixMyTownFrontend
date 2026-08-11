/**
 * ProgressModal.jsx
 * -----------------
 * Recreates "Worker Work Progress Update": a note field, optional
 * photo upload, and a "Mark as Fully Resolved" toggle button,
 * matching the prototype's Update Progress popup exactly.
 */

import { useState } from 'react';
import { Send, UploadCloud } from 'lucide-react';
import api from '../../api/api';
import Modal from '../../components/Modal';

export default function ProgressModal({ report, onClose, onUpdated }) {
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [markResolved, setMarkResolved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('note', note);
      formData.append('markResolved', markResolved);
      if (photo) formData.append('photo', photo);

      await api.post(`/worker/reports/${report.ReportID}/progress`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update progress.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Update Progress" onClose={onClose} width={480}>
      <div style={{ fontWeight: 700, marginBottom: 16 }}>{report.Title}</div>

      {error && (
        <div style={{ background: '#fdecec', color: '#c0362c', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="field">
        <label>Progress Note</label>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the work completed so far..." />
      </div>

      <div className="field">
        <label>Upload Progress Photo</label>
        <label
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '30px 0', border: '2px dashed var(--border)', borderRadius: 10,
            cursor: 'pointer', color: 'var(--text-secondary)', background: '#fafbfc'
          }}
        >
          <UploadCloud size={26} />
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Click to Upload Photo</div>
          <div style={{ fontSize: 12 }}>Show the work completed</div>
          <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files[0])} />
        </label>
        {photo && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>{photo.name}</p>}
      </div>

      <button
        onClick={() => setMarkResolved(!markResolved)}
        className="btn"
        style={{
          width: '100%',
          background: markResolved ? '#16a34a' : '#22c55e',
          color: 'white',
          marginBottom: 18
        }}
      >
        {markResolved ? '\u2713 Will Mark as Fully Resolved' : 'Mark as Fully Resolved'}
      </button>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
        <button className="btn btn-outline" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
          <Send size={14} /> {saving ? 'Submitting...' : 'Submit Update'}
        </button>
      </div>
    </Modal>
  );
}
