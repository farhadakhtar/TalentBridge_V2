import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DEMO_ACCOUNTS = [
  { email: 'aarav@mail.com', name: 'Aarav Sharma', role: 'Job Seeker', password: '123456' },
  { email: 'priya@mail.com', name: 'Priya Patel', role: 'Job Seeker', password: '123456' },
  { email: 'rohan@mail.com', name: 'Rohan Mehta', role: 'Job Seeker', password: '123456' },
  { email: 'sneha@mail.com', name: 'Sneha Kapoor', role: 'Job Seeker', password: '123456' },
  { email: 'recruiter1@mail.com', name: 'Nikhil Verma', role: 'Recruiter', password: '123456' },
  { email: 'recruiter2@mail.com', name: 'Ananya Iyer', role: 'Recruiter', password: '123456' },
  { email: 'cyber@mail.com', name: 'Vikram Rao', role: 'Company', password: '123456' },
  { email: 'eng@mail.com', name: 'Dev Menon', role: 'Company', password: '123456' },
  { email: 'ceo@mail.com', name: 'Meera Nair', role: 'Company', password: '123456' }
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const route = user.role === 'job_seeker' ? '/seeker' : `/${user.role}`;
      navigate(route, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
    setLoading(true);
    try {
      const user = await login(account.email, account.password);
      const route = user.role === 'job_seeker' ? '/seeker' : `/${user.role}`;
      navigate(route, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">TB</div>
          <h1>TalentBridge V2</h1>
          <p>Candidate Collaboration Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="quick-login">
          <h3>Quick Login (Demo Accounts)</h3>
          <div className="quick-buttons">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleQuickLogin(acc)}
                className={`quick-btn quick-btn-${acc.role.toLowerCase().replace(' ', '-')}`}
                disabled={loading}
              >
                <span className="quick-name">{acc.name}</span>
                <span className="quick-role">{acc.role}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
