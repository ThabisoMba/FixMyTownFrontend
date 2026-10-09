import {
  useEffect,
  useState
} from 'react';

import {
  UserCog,
  UserPlus2
} from 'lucide-react';

import api from '../../api/api';

import TopBar from '../../components/TopBar';

import Modal from '../../components/Modal';

import SuccessModal from '../../components/SuccessModal';

import StatusBadge from '../../components/StatusBadge';

export default function AssignIssues() {
  const [
    reports,
    setReports
  ] = useState([]);

  const [
    departments,
    setDepartments
  ] = useState([]);

  const [
    workers,
    setWorkers
  ] = useState([]);

  const [
    active,
    setActive
  ] = useState(null);

  const [
    departmentId,
    setDepartmentId
  ] = useState('');

  const [
    workerId,
    setWorkerId
  ] = useState('');

  const [
    note,
    setNote
  ] = useState('');

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    success,
    setSuccess
  ] = useState(null);

  function load() {
    api
      .get(
        '/admin/reports/unassigned'
      )
      .then((res) =>
        setReports(
          Array.isArray(
            res.data
          )
            ? res.data
            : []
        )
      )
      .catch(() =>
        setReports([])
      );

    api
      .get(
        '/lookups/departments'
      )
      .then((res) =>
        setDepartments(
          Array.isArray(
            res.data
          )
            ? res.data
            : []
        )
      )
      .catch(() =>
        setDepartments([])
      );

    api
      .get(
        '/admin/workers'
      )
      .then((res) =>
        setWorkers(
          Array.isArray(
            res.data
          )
            ? res.data
            : []
        )
      )
      .catch(() =>
        setWorkers([])
      );
  }

  useEffect(() => {
    load();
  }, []);

  function openAssign(
    report
  ) {
    setActive(report);

    setDepartmentId('');

    setWorkerId('');

    setNote('');
  }

  async function handleAssign() {
    if (
      !active ||
      !departmentId ||
      !workerId
    ) {
      return;
    }

    const reportBeingAssigned =
      active;

    const chosenDepartment =
      departments.find(
        department =>
          String(
            department.DepartmentID
          ) ===
          String(
            departmentId
          )
      );

    const chosenWorker =
      workers.find(
        worker =>
          String(
            worker.WorkerID
          ) ===
          String(
            workerId
          )
      );

    setSaving(true);

    try {
      await api.post(
        `/admin/reports/${reportBeingAssigned.ReportID}/assign`,
        {
          departmentId,
          workerId,
          note
        }
      );

      setSuccess({
        reportCode:
          reportBeingAssigned.ReportCode,

        reportId:
          reportBeingAssigned.ReportID,

        title:
          reportBeingAssigned.Title,

        category:
          reportBeingAssigned.CategoryName ||
          '—',

        department:
          chosenDepartment?.Name ||
          'Selected department',

        worker:
          chosenWorker?.FullName ||
          'Selected worker',

        note:
          note.trim() ||
          'No assignment note',

        status:
          'Assigned'
      });

      setActive(null);

      setDepartmentId('');

      setWorkerId('');

      setNote('');

      load();
    } catch (err) {
      alert(
        err.response?.data
          ?.message ||
          err.response?.data
            ?.Message ||
          'Could not assign this issue.'
      );
    } finally {
      setSaving(false);
    }
  }

  const workersInDept =
    workers.filter(
      worker =>
        (
          String(
            worker.DepartmentID
          ) ===
            String(
              departmentId
            ) ||
          !departmentId
        ) &&
        worker.IsActive !==
          false
    );

  return (
    <div>
      <TopBar
        section="Admin"
        page="Assign Issues"
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
              padding:
                '16px 20px',
              borderBottom:
                '1px solid var(--border)',
              fontWeight: 700,
              display: 'flex',
              alignItems:
                'center',
              gap: 8
            }}
          >
            <UserCog
              size={17}
            />

            Unassigned Issues
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
                minWidth: 760
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
                    'ID',
                    'Issue',
                    'Category',
                    'Status',
                    'Reported',
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
                {reports.map(
                  report => (
                    <tr
                      key={
                        report.ReportID
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
                            700
                        }}
                      >
                        #
                        {
                          report.ReportCode
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {
                          report.Title
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {
                          report.CategoryName
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <StatusBadge
                          status={
                            report.Status
                          }
                        />
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        {report.CreatedAt
                          ? new Date(
                              report.CreatedAt
                            ).toLocaleDateString()
                          : '—'}
                      </td>

                      <td
                        style={{
                          padding:
                            '12px 16px'
                        }}
                      >
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{
                            padding:
                              '6px 12px',
                            fontSize:
                              12
                          }}
                          onClick={() =>
                            openAssign(
                              report
                            )
                          }
                        >
                          <UserPlus2
                            size={13}
                          />

                          Assign
                        </button>
                      </td>
                    </tr>
                  )
                )}

                {reports.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: 24,
                        textAlign:
                          'center',
                        color:
                          'var(--text-secondary)'
                      }}
                    >
                      Nothing to
                      assign right
                      now — nice and
                      clear!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {active && (
        <Modal
          title="Assign Issue"
          icon={
            <UserPlus2
              size={18}
            />
          }
          onClose={() =>
            setActive(null)
          }
          width={460}
        >
          <div className="field">
            <label>
              Issue
            </label>

            <div
              style={{
                fontWeight:
                  600
              }}
            >
              #{active.ReportCode}{' '}
              {active.Title}
            </div>
          </div>

          <div className="field">
            <label>
              Department *
            </label>

            <select
              value={
                departmentId
              }
              onChange={
                event => {
                  setDepartmentId(
                    event.target
                      .value
                  );

                  setWorkerId(
                    ''
                  );
                }
              }
            >
              <option value="">
                Select
              </option>

              {departments.map(
                department => (
                  <option
                    key={
                      department.DepartmentID
                    }
                    value={
                      department.DepartmentID
                    }
                  >
                    {
                      department.Name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="field">
            <label>
              Worker *
            </label>

            <select
              value={
                workerId
              }
              onChange={
                event =>
                  setWorkerId(
                    event.target
                      .value
                  )
              }
            >
              <option value="">
                Select
              </option>

              {workersInDept.map(
                worker => (
                  <option
                    key={
                      worker.WorkerID
                    }
                    value={
                      worker.WorkerID
                    }
                  >
                    {
                      worker.FullName
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="field">
            <label>
              Note
            </label>

            <textarea
              rows={3}
              value={note}
              onChange={
                event =>
                  setNote(
                    event.target
                      .value
                  )
              }
              placeholder="Optional note for the worker"
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent:
                'flex-end',
              gap: 10
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                setActive(null)
              }
            >
              Cancel
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={
                !departmentId ||
                !workerId ||
                saving
              }
              onClick={
                handleAssign
              }
            >
              {saving
                ? 'Assigning...'
                : 'Assign'}
            </button>
          </div>
        </Modal>
      )}

      <SuccessModal
        open={!!success}
        title="Issue assigned successfully"
        message="The report has been assigned to a municipal worker."
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
                    'Report Reference',
                  value:
                    success.reportCode
                      ? `#${success.reportCode}`
                      : success.reportId,
                  emphasis: true
                },

                {
                  label: 'Issue',
                  value:
                    success.title
                },

                {
                  label:
                    'Category',
                  value:
                    success.category
                },

                {
                  label:
                    'Department',
                  value:
                    success.department
                },

                {
                  label: 'Worker',
                  value:
                    success.worker
                },

                {
                  label:
                    'Assignment Status',
                  value:
                    success.status
                },

                {
                  label: 'Note',
                  value:
                    success.note
                }
              ]
            : []
        }
      />
    </div>
  );
}