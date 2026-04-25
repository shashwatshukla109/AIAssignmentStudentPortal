import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Landing = () => {
  return (
    <div style={styles.container}>
      <div style={styles.background}>
        <div style={styles.gradientOrb1}></div>
        <div style={styles.gradientOrb2}></div>
        <div style={styles.gradientOrb3}></div>
      </div>
      
      <nav style={styles.nav}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>◈</div>
          <h1 style={styles.logo}>Assignment AI</h1>
        </div>
        <div style={styles.navButtons}>
          <Link to="/signin" style={styles.navLink}>Sign In</Link>
          <Link to="/signup" style={styles.navBtn}>Get Started</Link>
        </div>
      </nav>

      <section style={styles.hero}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={styles.badge}>
            <span style={styles.badgeDot}></span>
            AI-Powered Learning Platform
          </div>
          <h2 style={styles.heroTitle}>
            Smart Assignment <span style={styles.accent}>Grading</span> & Analytics
          </h2>
          <p style={styles.heroSubtitle}>
            Transform your educational experience with intelligent grading, 
            plagiarism detection, and personalized AI assistance.
          </p>
          <div style={styles.heroButtons}>
            <Link to="/signup" style={styles.primaryBtn}>Create Account</Link>
            <Link to="/signin" style={styles.secondaryBtn}>Sign In</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={styles.features}
        >
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>⚡</div>
            <h3 style={styles.featureTitle}>Smart Grading</h3>
            <p style={styles.featureText}>AI-powered rubric-based evaluation with detailed feedback</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>🛡️</div>
            <h3 style={styles.featureTitle}>Plagiarism Detection</h3>
            <p style={styles.featureText}>Advanced originality scoring and similarity analysis</p>
          </div>
          <div style={styles.featureCard}>
            <div style={styles.featureIcon}>📈</div>
            <h3 style={styles.featureTitle}>Analytics</h3>
            <p style={styles.featureText}>Comprehensive performance insights and reporting</p>
          </div>
        </motion.div>
      </section>

      <section style={styles.userTypes}>
        <h3 style={styles.sectionTitle}>Choose Your Path</h3>
        <div style={styles.userCards}>
          <div style={styles.userCard}>
            <div style={styles.userIcon}>🎓</div>
            <h4 style={styles.userTitle}>Students</h4>
            <p style={styles.userText}>Submit assignments and receive instant AI feedback</p>
          </div>
          <div style={styles.userCard}>
            <div style={styles.userIcon}>👨‍🏫</div>
            <h4 style={styles.userTitle}>Professors</h4>
            <p style={styles.userText}>Create assignments and grade with AI assistance</p>
          </div>
          <div style={styles.userCard}>
            <div style={styles.userIcon}>⚙️</div>
            <h4 style={styles.userTitle}>Admin</h4>
            <p style={styles.userText}>Manage users and monitor system analytics</p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© 2024 Assignment AI. Built for modern education.</p>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden'
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
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
    top: '-200px',
    right: '-100px',
    animation: 'float 20s infinite ease-in-out'
  },
  gradientOrb2: {
    position: 'absolute',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
    bottom: '10%',
    left: '-50px',
    animation: 'float 25s infinite ease-in-out reverse'
  },
  gradientOrb3: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)',
    top: '40%',
    right: '10%',
    animation: 'pulse 15s infinite ease-in-out'
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 60px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoIcon: {
    fontSize: '1.8rem',
    color: '#6366f1'
  },
  logo: {
    fontFamily: "'Inter', sans-serif",
    fontSize: '1.4rem',
    color: '#1e293b',
    fontWeight: 700,
    letterSpacing: '-0.02em'
  },
  navButtons: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center'
  },
  navLink: {
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 500,
    transition: 'color 0.2s',
    cursor: 'pointer'
  },
  navBtn: {
    background: '#6366f1',
    color: 'white',
    padding: '10px 22px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  hero: {
    textAlign: 'center',
    padding: '100px 20px 60px',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'white',
    padding: '8px 16px',
    borderRadius: '9999px',
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: 500,
    marginBottom: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#10b981'
  },
  heroTitle: {
    fontSize: '3.2rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '20px',
    lineHeight: 1.15,
    letterSpacing: '-0.03em'
  },
  accent: {
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  heroSubtitle: {
    fontSize: '1.15rem',
    color: '#64748b',
    marginBottom: '36px',
    maxWidth: '580px',
    margin: '0 auto 36px',
    lineHeight: 1.6
  },
  heroButtons: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginBottom: '80px'
  },
  primaryBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    color: 'white',
    padding: '14px 36px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
  },
  secondaryBtn: {
    background: 'white',
    color: '#6366f1',
    border: '1px solid #e2e8f0',
    padding: '14px 36px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: 500,
    fontSize: '1rem',
    transition: 'all 0.2s'
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
    marginTop: '40px'
  },
  featureCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '32px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '16px'
  },
  featureTitle: {
    fontSize: '1.15rem',
    color: '#1e293b',
    marginBottom: '10px',
    fontWeight: 600
  },
  featureText: {
    fontSize: '0.95rem',
    color: '#64748b',
    lineHeight: 1.5
  },
  userTypes: {
    padding: '60px 20px',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: '1.75rem',
    color: '#1e293b',
    marginBottom: '40px',
    fontWeight: 600
  },
  userCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px'
  },
  userCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '40px 32px',
    textAlign: 'center',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  userIcon: {
    fontSize: '3rem',
    marginBottom: '16px'
  },
  userTitle: {
    fontSize: '1.2rem',
    color: '#1e293b',
    marginBottom: '8px',
    fontWeight: 600
  },
  userText: {
    fontSize: '0.95rem',
    color: '#64748b'
  },
  footer: {
    textAlign: 'center',
    padding: '32px',
    color: '#94a3b8',
    borderTop: '1px solid #e2e8f0'
  }
};

export default Landing;