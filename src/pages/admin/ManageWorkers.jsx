/**
 * ManageWorkers.jsx
 * -----------------
 * Admin worker management with success confirmation
 * after worker activation and deactivation.
 */

import {
  useEffect,
  useState
} from 'react';

import {
  Link
} from 'react-router-dom';

import {
  Users,
  Ban,
  CheckCircle,
  UserPlus
} from 'lucide-react';

import api from '../../api/api';

import TopBar from '../../components/TopBar';

import SuccessModal from '../../components/SuccessModal';

export default function ManageWorkers() {
  const [
    workers,
    setWorkers
  ] = useState([]);

  const [
    loading,
    setLoading
  ] = useState(false);

  const [
    busyWorkerId,
    setBusyWorkerId
  ] = useState(null);

  const [
    success,
    setSuccess
  ] = useState(null);

  async function load() {
    try {
      setLoading(true);

      const response =
        await api.get(
          '/admin/workers'
        );

      setWorkers(
        Array.isArray(
          response.data
        )
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        'Failed to load workers:',
        error
      );

      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleToggleStatus(
    worker
  ) {
    const nextIsActive =
      !worker.IsActive;

    const action =
      nextIsActive
        ? 'reactivate'
        : 'deactivate';

    const confirmed =
      window.confirm(
        `Are you sure you want to ${action} ${worker.FullName}?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setBusyWorkerId(
        worker.WorkerID
      );

      await api.put(
        `/admin/workers/${worker.WorkerID}/status`,
        {
          isActive:
            nextIsActive
        }
      );

      setSuccess({
        workerName:
          worker.FullName,

        workerId:
          worker.WorkerID,

        department:
          worker.DepartmentName ||
          '—',

        email:
          worker.Email ||
          'Not provided',

        previousStatus:
          worker.IsActive
            ? 'Active'
            : 'Inactive',

        newStatus:
          nextIsActive
            ? 'Active'
            : 'Inactive',

        action:
          nextIsActive
            ? 'activated'
            : 'deactivated'
      });

      await load();
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          err.response?.data
            ?.Message ||
          `Failed to ${action} worker.`
      );
    } finally {
      setBusyWorkerId(
        null
      );
    }
  }

  return (
    <div>
      <TopBar
        section="Admin"
        page="Manage Workers"
        onRefresh={
          load
        }
        showExport
      />

      <div
        style={{
          padding: 24
        }}
      >
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              padding:
                '16px 20px',
              borderBottom:
                '1px solid var(--border)'
            }}
          >
            <strong
              style={{
                display: 'flex',
                alignItems:
                  'center',
                gap: 8
              }}
            >
              <Users
                size={17}
              />

              Workers (
              {workers.length})
            </strong>

            <Link
              to="/admin/workers/new"
              className="btn btn-primary"
              style={{
                marginLeft:
                  'auto',
                padding:
                  '8px 14px',
                fontSize: 13,
                textDecoration:
                  'none'
              }}
            >
              <UserPlus
                size={14}
              />

              Register Worker
            </Link>
          </div>

          <div
            style={{
              overflowX: 'auto'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse:
                  'collapse',
                fontSize: 13,
                minWidth: 850
              }}
            >
              <thead>
                <tr
                  style={{
                    textAlign:
                      'left',
                    color:
                      'var(--text-secondary)',
                    fontSize: 11,
                    textTransform:
                      'uppercase'
                  }}
                >
                  {[
                    'Name',
                    'Department',
                    'Email',
                    'Phone',
                    'Issues',
                    'Status',
                    'Actions'
                  ].map(
                    heading => (
                      <th
                        key={
                          heading
                        }
                        style={{
                          padding:
                            '10px 16px'
                        }}
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {workers.map(
                  worker => (
                    <tr
                      key={
                        worker.WorkerID
                      }
                      style={{
                        borderTop:
                          '1px solid var(--border)'
                      }}
                    >
                      <td
                        style={{
                          padding:
                            '12px 16px',
                          fontWeight:
                            600
                        }}
                      >
                        {
                          worker.FullName
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {
                          worker.DepartmentName
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {worker.Email ||
                          '—'}
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {worker.Phone ||
                          '—'}
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <span
                          className="badge"
                          style={{
                            background:
                              'var(--gold-100)',
                            color:
                              'var(--gold-600)'
                          }}
                        >
                          {
                            worker.ActiveIssues
                          }
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <span
                          style={{
                            color:
                              worker.IsActive
                                ? '#22c55e'
                                : 'var(--text-muted)',
                            fontWeight:
                              600,
                            fontSize:
                              12
                          }}
                        >
                          &bull;{' '}
                          {worker.IsActive
                            ? 'Active'
                            : 'Inactive'}
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <StatusToggleBtn
                          worker={
                            worker
                          }
                          disabled={
                            busyWorkerId ===
                            worker.WorkerID
                          }
                          onToggle={() =>
                            handleToggleStatus(
                              worker
                            )
                          }
                        />
                      </td>
                    </tr>
                  )
                )}

                {!loading &&
                  workers.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding:
                            24,
                          textAlign:
                            'center',
                          color:
                            'var(--text-secondary)'
                        }}
                      >
                        No workers
                        registered
                        yet.
                      </td>
                    </tr>
                  )}

                {loading &&
                  workers.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding:
                            24,
                          textAlign:
                            'center',
                          color:
                            'var(--text-secondary)'
                        }}
                      >
                        Loading
                        workers...
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <SuccessModal
        open={!!success}
        title={
          success?.action ===
          'activated'
            ? 'Worker activated successfully'
            : 'Worker deactivated successfully'
        }
        message={
          success?.action ===
          'activated'
            ? 'The worker account is active and can be used again.'
            : 'The worker account has been deactivated successfully.'
        }
        onClose={() =>
          setSuccess(null)
        }
        primaryLabel="Done"
        onPrimary={() =>
          setSuccess(null)
        }
        details={
          success
            ? [
                {
                  label:
                    'Worker ID',
                  value:
                    success.workerId
                },
                {
                  label: 'Worker',
                  value:
                    success.workerName
                },
                {
                  label:
                    'Department',
                  value:
                    success.department
                },
                {
                  label: 'Email',
                  value:
                    success.email
                },
                {
                  label:
                    'Previous Status',
                  value:
                    success.previousStatus
                },
                {
                  label:
                    'New Status',
                  value:
                    success.newStatus,
                  emphasis: true
                }
              ]
            : []
        }
      />
    </div>
  );
}

function StatusToggleBtn({
  worker,
  onToggle,
  disabled
}) {
  const isActive =
    worker.IsActive;

  return (
    <button
      type="button"
      onClick={
        onToggle
      }
      disabled={
        disabled
      }
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding:
          '6px 12px',
        borderRadius: 6,
        border: 'none',
        background:
          isActive
            ? '#fdecec'
            : '#e9f9ef',
        color:
          isActive
            ? '#ef4444'
            : '#22c55e',
        fontSize: 12,
        fontWeight: 600,
        cursor:
          disabled
            ? 'wait'
            : 'pointer',
        opacity:
          disabled
            ? 0.6
            : 1
      }}
    >
      {isActive ? (
        <Ban size={14} />
      ) : (
        <CheckCircle
          size={14}
        />
      )}

      {disabled
        ? 'Saving...'
        : isActive
          ? 'Deactivate'
          : 'Activate'}
    </button>
  );
}