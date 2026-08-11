import { useEffect, useState } from 'react';
import { 
  ClipboardList, Clock, Bell, MessageSquare, Construction, Droplet, Lightbulb,
  MapPin, AlertCircle, CheckCircle2, Loader, XCircle 
} from 'lucide-react';
import api from '../../api/api';

const ICONS = { Pothole: Construction, 'Water Supply': Droplet, 'Street Light': Lightbulb };

const STATUS_STEPS = [
  { key: 'Reported', label: 'Reported', color: '#6b7280', icon: Clock },
  { key: 'Under Review', label: 'Review', color: '#f59e0b', icon: AlertCircle },
  { key: 'In Progress', label: 'Progress', color: '#3b82f6', icon: Loader },
  { key: 'Resolved', label: 'Resolved', color: '#22c55e', icon: CheckCircle2 }
];

const STATUS_MAP = {
  'Reported': 'Reported',
  'InProgress': 'In Progress',
  'In Progress': 'In Progress',
  'Resolved': 'Resolved'
};

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

const fetchReports = async () => {
  try {
    setLoading(true);
    setError(null);

    const response = await api.get('/issues/mine');

    const mappedReports = response.data.map(report => ({
      reportID: report.ReportID,
      reportCode: report.ReportCode,
      title: report.Title,
      description: report.Description,
      status: report.Status,
      priority: report.Priority,
      locationName: report.LocationName,
      createdAt: report.CreatedAt,
      categoryName: report.CategoryName,
      workerName: report.WorkerName
    }));

    setReports(mappedReports);
  } catch (err) {
    console.error('Error fetching reports:', err);

    if (err.response) {
      console.error('Response status:', err.response.status);
      console.error('Response data:', err.response.data);

      if (err.response.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (err.response.status === 500) {
        setError(
          'Server error: ' +
            (err.response.data?.error || 'Internal server error. Please try again later.')
        );
      } else {
        setError(
          'Failed to load your reports: ' +
            (err.response.data?.message || err.message)
        );
      }
    } else if (err.request) {
      setError('Network error: Could not connect to the server. Please check your connection.');
    } else {
      setError('Error: ' + err.message);
    }
  } finally {
    setLoading(false);
  }
};

  function timeAgo(dateStr) {
    if (!dateStr) return 'N/A';
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diffMs / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }

  function normalizeStatus(status) {
    return STATUS_MAP[status] || status || 'Reported';
  }

  function getStatusIndex(status) {
    const normalized = normalizeStatus(status);
    return STATUS_STEPS.findIndex(s => s.key === normalized);
  }

  function getStatusColor(status) {
    const step = STATUS_STEPS.find(s => s.key === normalizeStatus(status));
    return step ? step.color : '#6b7280';
  }

  function getStatusIcon(status) {
    const step = STATUS_STEPS.find(s => s.key === normalizeStatus(status));
    return step ? step.icon : Clock;
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
            <ClipboardList size={18} /> My Reports ({reports.length})
          </div>
          {!loading && reports.length > 0 && (
            <button onClick={fetchReports} style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid var(--border)',
              background: 'white',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text-secondary)'
            }}>
              Refresh
            </button>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Loader size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--navy-800)' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 10 }}>Loading your reports...</p>
          </div>
        )}

        {error && (
          <div style={{ 
            padding: '12px 16px', 
            background: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 16
          }}>
            <XCircle size={18} color="#dc2626" />
            <span style={{ color: '#dc2626', fontSize: 13 }}>{error}</span>
            <button 
              onClick={fetchReports}
              style={{
                marginLeft: 'auto',
                padding: '4px 12px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && reports.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <ClipboardList size={48} color="var(--text-secondary)" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600 }}>No Reports Yet</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
              You haven't reported any issues yet. Click "Report Issue" to get started.
            </p>
          </div>
        )}

        {reports.map((r) => {
          const Icon = ICONS[r.categoryName] || Construction;
          const status = normalizeStatus(r.status);
          const statusIndex = getStatusIndex(r.status);
          
          return (
            <div
              key={r.reportID}
              style={{
                padding: '16px 0',
                borderBottom: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: 14, marginBottom: 16 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--gold-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Icon size={18} color="var(--gold-600)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
                      {r.title || 'Untitled Report'}
                    </h3>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 600,
                      background: `${getStatusColor(r.status)}20`,
                      color: getStatusColor(r.status)
                    }}>
                      {status}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <MapPin size={12} />
                    {r.locationName || 'Location not specified'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    Reported {timeAgo(r.createdAt)} • #{r.reportCode}
                  </div>
                  {r.workerName && (
                    <div style={{ fontSize: 11, color: 'var(--navy-800)', marginTop: 2 }}>
                      Assigned to: {r.workerName}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 4, paddingLeft: 54 }}>
                {STATUS_STEPS.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= statusIndex;
                  const isCurrent = step.key === status;
                  
                  return (
                    <div key={step.key} style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                        <div style={{ 
                          flex: 1, 
                          height: 2, 
                          background: index === 0 ? 'transparent' : isCompleted ? step.color : '#e5e7eb',
                          transition: 'background 0.3s'
                        }} />
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: isCompleted ? step.color : '#e5e7eb',
                          border: isCurrent ? '3px solid var(--navy-800)' : 'none',
                          transition: 'all 0.3s'
                        }}>
                          <StepIcon size={11} color={isCompleted ? 'white' : '#9ca3af'} />
                        </div>
                        <div style={{ 
                          flex: 1, 
                          height: 2, 
                          background: index === STATUS_STEPS.length - 1 ? 'transparent' : isCompleted ? step.color : '#e5e7eb',
                          transition: 'background 0.3s'
                        }} />
                      </div>
                      <div style={{ 
                        fontSize: 10, 
                        fontWeight: isCurrent ? 700 : 500, 
                        color: isCurrent ? step.color : 'var(--text-secondary)',
                        transition: 'color 0.3s'
                      }}>
                        {step.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 16 }}>
        <InfoCard
          icon={<Clock size={18} />}
          title="Response Time"
          text="Most reports are acknowledged within 24 hours. Critical issues are prioritized."
        />
        <InfoCard
          icon={<Bell size={18} />}
          title="Notifications"
          text="You'll receive updates when your issue status changes. Check your notifications regularly."
        />
        <InfoCard
          icon={<MessageSquare size={18} />}
          title="Comments"
          text="Municipal workers may add comments to your report. You can reply for more details."
        />
      </div>
    </div>
  );
}

function InfoCard({ icon, title, text }) {
  return (
    <div className="card" style={{ flex: 1, padding: 18 }}>
      <div style={{ color: 'var(--navy-800)', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 14 }}>{title}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{text}</div>
    </div>
  );
}