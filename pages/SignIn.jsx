import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../api';

const SignIn = ({ setUser }) => {
  const [userType, setUserType] = useState('student');
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.signin({ ...formData, userType });
      setUser(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.gradientOrb1}></div>
        <div style={styles.gradientOrb2}></div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
      >
        <Link to="/" style={styles.backLink}>
          <span style={styles.backArrow}>←</span> Back to Home
        </Link>
        
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Sign in to continue to your dashboard</p>
        </div>
        
        <div style={styles.typeSelector}>
          <button
            type="button"
            style={userType === 'student' ? styles.typeBtnActive : styles.typeBtn}
            onClick={() => setUserType('student')}
          >
            <span style={styles.typeIcon}>🎓</span>
            Student
          </button>
          <button
            type="button"
            style={userType === 'professor' ? styles.typeBtnActive : styles.typeBtn}
            onClick={() => setUserType('professor')}
          >
            <span style={styles.typeIcon}>👨‍🏫</span>
            Professor
          </button>
          <button
            type="button"
            style={userType === 'admin' ? styles.typeBtnActive : styles.typeBtn}
            onClick={() => setUserType('admin')}
          >
            <span style={styles.typeIcon}>⚙️</span>
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label>{userType === 'student' ? 'System ID / Username' : 'Employee ID / Username'}</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder={userType === 'student' ? 'Enter System ID or Username' : 'Enter Employee ID or Username'}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              style={styles.input}
            />
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account? <Link to="/signup" style={styles.link}>Create one</Link>
        </p>
      </motion.div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: '20px'
  },
  background: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)',
    zIndex: -1
  },
  gradientOrb1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    top: '-150px',
    left: '-100px'
  },
  gradientOrb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
    bottom: '-100px',
    right: '-100px'
  },
  card: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '24px',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.05)'
  },
  backLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.9rem',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '24px',
    fontWeight: 500,
    transition: 'color 0.2s'
  },
  backArrow: {
    fontSize: '1.1rem'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  title: {
    fontSize: '1.75rem',
    color: '#1e293b',
    marginBottom: '8px',
    fontWeight: 700
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.95rem'
  },
  typeSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '28px',
    background: '#f8fafc',
    padding: '6px',
    borderRadius: '12px'
  },
  typeBtn: {
    flex: 1,
    padding: '10px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    transition: 'all 0.2s'
  },
  typeBtnActive: {
    flex: 1,
    padding: '10px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#6366f1',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  typeIcon: {
    fontSize: '1rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    background: '#f8fafc',
    border: '1px solid #e2e8f0'
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    color: 'white',
    border: 'none',
    padding: '14px',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '8px',
    fontFamily: "'Inter', sans-serif",
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
  },
  error: {
    color: '#ef4444',
    textAlign: 'center',
    fontSize: '0.875rem',
    padding: '10px',
    background: '#fef2f2',
    borderRadius: '8px'
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  link: {
    color: '#6366f1',
    textDecoration: 'none',
    fontWeight: 500
  }
};

export default SignIn;