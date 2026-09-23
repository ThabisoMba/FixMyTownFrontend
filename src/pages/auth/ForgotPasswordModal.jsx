import { useState } from 'react';
import { Mail, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../api/api';
import Modal from '../../components/Modal';
import PasswordHint from '../../components/PasswordHint';
import PasswordInput from '../../components/PasswordInput';
import { isPasswordValid } from '../../utils/passwordValidation';

export default function ForgotPasswordModal({ onClose }) {
  const [step, setStep] = useState(1); // 1 = email, 2 = new password, 3 = otp, 4 = done
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleCheckEmail(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password/check-email', { email });
      if (data.exists) {
        setStep(2);
      } else {
        setError("We couldn't find an account with that email.");
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestOtp(e) {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(newPassword)) {
      setError('Please meet all the password requirements below.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password/request-otp', { email, newPassword });
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password/verify-otp', { email, otp });
      setStep(4);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Reset Your Password" icon={<KeyRound size={18} />} onClose={onClose} width={440}>
      {error && (
        <div style={{ background: '#fdecec', color: '#c0362c', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Step 1: Email */}
      {step === 1 && (
        <form onSubmit={handleCheckEmail}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Enter the email on your account and we'll help you reset your password.
          </p>
          <div className="field">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} style={{ position: 'absolute', left: 12, top: 13, color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                style={{ paddingLeft: 34 }}
                required
                autoFocus
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0' }} disabled={loading}>
            {loading ? 'Checking...' : 'Continue'} <ArrowRight size={15} />
          </button>
        </form>
      )}

      {/* Step 2: New password */}
      {step === 2 && (
        <form onSubmit={handleRequestOtp}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Choose a new password for <strong>{email}</strong>. We'll send a verification code to confirm it's really you.
          </p>
          <div className="field">
            <label>New Password</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Create a new password"
              required
              autoFocus
            />
            <PasswordHint password={newPassword} />
          </div>
          <div className="field">
            <label>Confirm New Password</label>
            <PasswordInput
              showIcon={false}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0' }} disabled={loading}>
            {loading ? 'Sending code...' : 'Send Verification Code'} <ArrowRight size={15} />
          </button>
        </form>
      )}

      {/* Step 3: OTP */}
      {step === 3 && (
        <form onSubmit={handleVerifyOtp}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
            We've sent a 6-digit code to <strong>{email}</strong>. Enter it below to confirm your new password.
          </p>
          <div className="field">
            <label>Verification Code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit code"
              maxLength={6}
              style={{ textAlign: 'center', fontSize: 20, letterSpacing: 6, fontWeight: 700 }}
              required
              autoFocus
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px 0' }} disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Reset Password'}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 12.5, marginTop: 12, width: '100%' }}
          >
            Didn't get a code? Go back and try again
          </button>
        </form>
      )}

      {/* Step 4: Done */}
      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '10px 0' }}>
          <CheckCircle2 size={40} color="#22c55e" style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Password reset successfully</div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>
            You can now log in with your new password.
          </p>
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px 0' }} onClick={onClose}>
            Back to Login
          </button>
        </div>
      )}
    </Modal>
  );
}
