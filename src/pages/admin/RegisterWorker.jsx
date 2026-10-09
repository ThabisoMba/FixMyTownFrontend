/**
 * RegisterWorker.jsx
 * ------------------
 * Admin worker registration.
 * The registration card is centered inside the usable
 * admin content area.
 */

import {
  useEffect,
  useState
} from 'react';

import {
  useNavigate
} from 'react-router-dom';

import {
  UserPlus2,
  RefreshCw
} from 'lucide-react';

import api from '../../api/api';

import TopBar from '../../components/TopBar';

import SuccessModal from '../../components/SuccessModal';

function generatePassword() {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';

  let out = '';

  for (
    let i = 0;
    i < 10;
    i += 1
  ) {
    out +=
      chars[
        Math.floor(
          Math.random() *
            chars.length
        )
      ];
  }

  return out;
}

const EMPTY_FORM = {
  fullName: '',
  email: '',
  departmentId: '',
  phone: ''
};

export default function RegisterWorker() {
  const [
    departments,
    setDepartments
  ] = useState([]);

  const [
    form,
    setForm
  ] = useState(
    EMPTY_FORM
  );

  const [
    password,
    setPassword
  ] = useState(
    generatePassword()
  );

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    error,
    setError
  ] = useState('');

  const [
    success,
    setSuccess
  ] = useState(null);

  const navigate =
    useNavigate();

  useEffect(() => {
    api
      .get(
        '/lookups/departments'
      )
      .then((res) => {
        setDepartments(
          Array.isArray(
            res.data
          )
            ? res.data
            : []
        );
      })
      .catch(() => {
        setDepartments([]);
      });
  }, []);

  function handleChange(
    event
  ) {
    const {
      name,
      value
    } = event.target;

    setForm(
      current => ({
        ...current,
        [name]: value
      })
    );
  }

  function resetForm() {
    setForm(
      EMPTY_FORM
    );

    setPassword(
      generatePassword()
    );

    setError('');
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    setError('');

    if (
      !form.fullName ||
      !form.departmentId
    ) {
      setError(
        'Full name and department are required.'
      );

      return;
    }

    setSaving(true);

    try {
      const response =
        await api.post(
          '/admin/workers',
          {
            ...form,
            password
          }
        );

      const department =
        departments.find(
          item =>
            String(
              item.DepartmentID
            ) ===
            String(
              form.departmentId
            )
        );

      const createdWorker =
        response.data || {};

      setSuccess({
        workerName:
          createdWorker.FullName ||
          form.fullName,

        email:
          createdWorker.Email ||
          form.email ||
          'Not provided',

        phone:
          createdWorker.Phone ||
          form.phone ||
          'Not provided',

        department:
          createdWorker.DepartmentName ||
          department?.Name ||
          'Selected department',

        workerId:
          createdWorker.WorkerID ||
          createdWorker.WorkerId ||
          null,

        password
      });
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          err.response?.data
            ?.Message ||
          'Could not register this worker.'
      );
    } finally {
      setSaving(false);
    }
  }

  function goToWorkers() {
    setSuccess(null);

    navigate(
      '/admin/workers'
    );
  }

  function registerAnother() {
    setSuccess(null);

    resetForm();
  }

  return (
    <div>
      <TopBar
        section="Admin"
        page="Register Worker"
      />

      {/* =====================================================
          CENTERED REGISTER WORKER AREA
      ===================================================== */}

      <div
        className="register-worker-page"
      >
        <div
          className="card register-worker-card"
        >
          <div
            style={{
              display: 'flex',
              alignItems:
                'center',
              gap: 8,
              fontWeight: 700,
              fontSize: 16,
              marginBottom: 18
            }}
          >
            <UserPlus2
              size={19}
            />

            Register New Worker
          </div>

          {error && (
            <div
              style={{
                background:
                  '#fdecec',
                color:
                  '#c0362c',
                fontSize: 13,
                padding:
                  '10px 14px',
                borderRadius: 8,
                marginBottom: 16
              }}
            >
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div className="field">
              <label>
                Full Name *
              </label>

              <input
                name="fullName"
                value={
                  form.fullName
                }
                onChange={
                  handleChange
                }
                placeholder="Enter worker's full name"
              />
            </div>

            <div className="field">
              <label>
                Email
              </label>

              <input
                name="email"
                type="email"
                value={
                  form.email
                }
                onChange={
                  handleChange
                }
                placeholder="Enter worker's email"
              />
            </div>

            <div className="field">
              <label>
                Department *
              </label>

              <select
                name="departmentId"
                value={
                  form.departmentId
                }
                onChange={
                  handleChange
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
                Phone Number
              </label>

              <input
                name="phone"
                value={
                  form.phone
                }
                onChange={
                  handleChange
                }
                placeholder="Enter phone number"
              />
            </div>

            <div
              style={{
                background:
                  'var(--gold-100)',
                border:
                  '1px solid #f3d9a8',
                borderRadius: 10,
                padding: 16,
                marginBottom: 20
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 13,
                  marginBottom: 6
                }}
              >
                Auto-Generated
                Password
              </div>

              <div
                style={{
                  fontFamily:
                    'monospace',
                  fontSize: 18,
                  fontWeight: 700,
                  marginBottom: 8
                }}
              >
                {password}
              </div>

              <button
                type="button"
                className="btn btn-outline"
                style={{
                  padding:
                    '6px 12px',
                  fontSize: 12
                }}
                onClick={() =>
                  setPassword(
                    generatePassword()
                  )
                }
              >
                <RefreshCw
                  size={12}
                />

                Generate New
              </button>

              <p
                style={{
                  fontSize: 12,
                  color:
                    'var(--text-secondary)',
                  marginTop: 8,
                  marginBottom: 0
                }}
              >
                Give this password
                to the worker. They
                will use it to login.
              </p>
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
                  navigate(
                    '/admin/workers'
                  )
                }
              >
                Cancel
              </button>

              <button
                type="submit"
                className="btn"
                style={{
                  background:
                    '#22c55e',
                  color:
                    'white'
                }}
                disabled={saving}
              >
                {saving
                  ? 'Registering...'
                  : 'Register Worker'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <SuccessModal
        open={!!success}
        title="Worker registered successfully"
        message="The municipal worker account has been created successfully."
        onClose={
          goToWorkers
        }
        primaryLabel="View Workers"
        onPrimary={
          goToWorkers
        }
        secondaryLabel="Register Another"
        onSecondary={
          registerAnother
        }
        note="Keep the temporary password secure and provide it directly to the worker."
        details={
          success
            ? [
                ...(success.workerId
                  ? [
                      {
                        label:
                          'Worker ID',
                        value:
                          success.workerId
                      }
                    ]
                  : []),

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
                  label: 'Phone',
                  value:
                    success.phone
                },

                {
                  label:
                    'Account Status',
                  value: 'Active'
                },

                {
                  label:
                    'Temporary Password',
                  value:
                    success.password,
                  emphasis: true,
                  monospace: true
                }
              ]
            : []
        }
      />

      <style>
        {`
          .register-worker-page {
            min-height:
              calc(100vh - 70px);

            width: 100%;

            display: flex;

            align-items: center;

            justify-content: center;

            padding:
              32px 24px 48px;

            box-sizing:
              border-box;
          }

          .register-worker-card {
            width: 100%;

            max-width: 520px;

            padding: 24px;
          }

          @media (max-width: 900px) {
            .register-worker-page {
              min-height:
                calc(
                  100vh - 116px
                );

              padding:
                24px 16px 40px;
            }

            .register-worker-card {
              max-width: 560px;
            }
          }

          @media (max-width: 620px) {
            .register-worker-page {
              align-items:
                flex-start;

              padding:
                18px 12px 32px;
            }

            .register-worker-card {
              padding: 18px;
            }
          }
        `}
      </style>
    </div>
  );
}