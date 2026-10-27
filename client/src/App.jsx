import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import './App.css';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={`/${user.role === 'job_seeker' ? 'seeker' : user.role}`} replace /> : <Login />} />
      <Route path="/seeker" element={<PrivateRoute allowedRoles={['job_seeker']}><JobSeekerDashboard /></PrivateRoute>} />
      <Route path="/recruiter" element={<PrivateRoute allowedRoles={['recruiter']}><RecruiterDashboard /></PrivateRoute>} />
      <Route path="/company" element={<PrivateRoute allowedRoles={['company']}><CompanyDashboard /></PrivateRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
