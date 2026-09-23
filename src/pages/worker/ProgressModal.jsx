/**
 * ProgressModal.jsx
 * -----------------
 * Recreates "Worker Work Progress Update": a note field, multiple
 * optional photo uploads, and a "Mark as Fully Resolved" toggle
 * button, matching the prototype's Update Progress popup.
 */

import { useState } from 'react';
import { Send, UploadCloud, X } from 'lucide-react';
import api from '../../api/api';
import Modal from '../../components/Modal';

const MAX_PHOTOS = 5;

export default function ProgressModal({ report, onClose, onUpdated }) {
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState([]);
  const [markResolved, setMarkResolved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handlePhotoChange(e) {
    const selected = Array.from(e.target.files || []);
    setPhotos((prev) => [...prev, ...selected].slice(0, MAX_PHOTOS));
    e.target.value = '';
  }

  function removePhoto(index) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setSaving(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('note', note);
      formData.append('markResolved', markResolved);
      photos.forEach((file) => formData.append('photos', file));

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
        <label>Upload Progress Photos</label>
        <label
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            padding: '30px 0', border: '2px dashed var(--border)', borderRadius: 10,
            cursor: 'pointer', color: 'var(--text-secondary)', background: '#fafbfc'
          }}
        >
          <UploadCloud size={26} />
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Click to Upload Photos</div>
          <div style={{ fontSize: 12 }}>Show the work completed (up to {MAX_PHOTOS})</div>
          <input type="file" accept="image/*" multiple hidden onChange={handlePhotoChange} />
        </label>

        {photos.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {photos.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#f1f5f9', borderRadius: 999,
                  padding: '4px 6px 4px 12px', fontSize: 12, color: 'var(--text-secondary)'
                }}
              >
                <span style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove ${file.name}`}
                  style={{
                    width: 18, height: 18, borderRadius: '50%', border: 'none',
                    background: '#e2e8f0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                  }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}
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

