import { useEffect, useState } from 'react';
import { FileText, Download, RefreshCw } from 'lucide-react';
import api from '../../api/api';
import StatusBadge from '../../components/StatusBadge';
import PriorityDot from '../../components/PriorityDot';

const STATUSES = ['', 'Reported', 'Assigned', 'In Progress', 'Resolved'];

export default function DynamicReport() {
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api.get('/lookups/categories').then((res) => setCategories(res.data)).catch(() => {});
    api.get('/lookups/departments').then((res) => setDepartments(res.data)).catch(() => {});
  }, []);

  function buildParams() {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (categoryId) params.categoryId = categoryId;
    if (departmentId) params.departmentId = departmentId;
    if (status) params.status = status;
    return params;
  }

  function loadReport() {
    setLoading(true);
    api
      .get('/admin/reports/dynamic', { params: buildParams() })
      .then((res) => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }

  useEffect(loadReport, []);

  function resetFilters() {
    setFrom('');
    setTo('');
    setCategoryId('');
    setDepartmentId('');
    setStatus('');
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      const res = await api.get('/admin/reports/export/excel', { params: buildParams(), responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `fixmytown-issue-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Could not export the report right now. Please try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
          <FileText size={18} /> Issue reports
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
          Dynamic report - live data from FixMyTownDB
        </div>

        {report && (
  <div
    style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      alignItems: 'center',
      background: 'var(--bg-page)',
      padding: '10px 14px',
      borderRadius: 8,
      marginBottom: 16,
      border: '1px solid var(--navy-100)',
    }}
  >
    <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--navy-800)' }}>
      Filters applied:
    </span>

    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--navy-800)',
        background: '#fff',
        border: '1px solid var(--navy-100)',
        borderRadius: 999,
        padding: '4px 10px',
      }}
    >
      Date: {report.filtersApplied.From || '(any)'} → {report.filtersApplied.To || '(any)'}
    </span>

    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--navy-800)',
        background: '#fff',
        border: '1px solid var(--navy-100)',
        borderRadius: 999,
        padding: '4px 10px',
      }}
    >
      Category: {report.filtersApplied.CategoryName}
    </span>

    <span
      style={{
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--navy-800)',
        background: '#fff',
        border: '1px solid var(--navy-100)',
        borderRadius: 999,
        padding: '4px 10px',
      }}
    >
      Department: {report.filtersApplied.DepartmentName}
    </span>

    <span
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: 'var(--navy-900, var(--navy-800))',
        background: 'var(--lime-100, #eaffc7)',
        border: '1px solid var(--lime-300, #c8f27a)',
        borderRadius: 999,
        padding: '4px 10px',
      }}
    >
      Status: {report.filtersApplied.StatusName}
    </span>
  </div>
)}

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
          Filters
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, alignItems: 'end' }}>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.CategoryID} value={c.CategoryID}>{c.Name}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d.DepartmentID} value={d.DepartmentID}>{d.Name}</option>
              ))}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s || 'All statuses'}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={loadReport} disabled={loading}>
              <RefreshCw size={14} /> Apply
            </button>
            <button className="btn btn-outline" onClick={resetFilters}>Reset</button>
          </div>
        </div>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: 11, textTransform: 'uppercase' }}>
              {['Report', 'Category', 'Priority', 'Status', 'Location', 'Reported'].map((h) => (
                <th key={h} style={{ padding: '10px 16px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading report...</td></tr>
            )}
            {!loading && report?.lineItems.length === 0 && (
              <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No reports match these filters.</td></tr>
            )}
            {!loading && report?.lineItems.map((r) => (
              <tr key={r.ReportID} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600 }}>{r.Title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{r.ReportCode}</div>
                </td>
                <td style={{ padding: '12px 16px' }}>{r.CategoryName}</td>
                <td style={{ padding: '12px 16px' }}><PriorityDot priority={r.Priority} /></td>
                <td style={{ padding: '12px 16px' }}><StatusBadge status={r.Status} /></td>
                <td style={{ padding: '12px 16px' }}>{r.LocationName}</td>
                <td style={{ padding: '12px 16px' }}>{new Date(r.CreatedAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {report && (
        <div
          className="card"
          style={{ marginTop: 12, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}
        >
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{report.summary.TotalReports}</strong> reports shown
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{report.summary.Resolved}</strong> resolved
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)' }}>{report.summary.InProgress}</strong> in progress
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 'auto' }}>
            Generated {new Date(report.summary.GeneratedAt).toLocaleString()}
          </div>
          <button className="btn btn-gold" onClick={handleExportExcel} disabled={exporting}>
            <Download size={14} /> {exporting ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      )}
    </div>
  );
}
