import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { userAPI } from '../api';

const AdminDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getUsers({ search: searchTerm, userType: filterType });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await userAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userAPI.deleteUser(userId);
      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, filterType]);

  const renderUsers = () => (
    <div style={styles.usersSection}>
      <div style={styles.filterBar}>
        <input
          type="text"
          placeholder="Search by username, ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={styles.filterSelect}
        >
          <option value="">All Users</option>
          <option value="student">Students</option>
          <option value="professor">Professors</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div style={styles.usersTable}>
        <div style={styles.tableHeader}>
          <span>Username</span>
          <span>Type</span>
          <span>ID</span>
          <span>Department</span>
          <span>Actions</span>
        </div>
        
        {loading ? (
          <div style={styles.loading}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={styles.emptyText}>No users found</div>
        ) : (
          users.map((u) => (
            <motion.div
              key={u._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.tableRow}
            >
              <span style={styles.username}>{u.username}</span>
              <span style={{
                ...styles.typeBadge,
                background: u.userType === 'student' ? '#d1fae5' :
                           u.userType === 'professor' ? '#dbeafe' :
                           '#fef3c7',
                color: u.userType === 'student' ? '#065f46' :
                       u.userType === 'professor' ? '#1e40af' :
                       '#92400e'
              }}>
                {u.userType}
              </span>
              <span style={styles.userId}>{u.systemId || u.employeeId || '-'}</span>
              <span style={styles.department}>{u.department}</span>
              <button
                style={styles.deleteBtn}
                onClick={() => handleDeleteUser(u._id)}
              >
                🗑️ Delete
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderAnalytics = () => {
    const chartData = stats?.departments?.map(d => ({
      name: d._id,
      count: d.count
    })) || [];

    return (
      <div style={styles.analyticsGrid}>
        <div style={styles.statsCard}>
          <h3>System Overview</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{stats?.totalUsers || 0}</span>
              <span style={styles.statLabel}>Total Users</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statValue, color: '#10b981'}}>{stats?.students || 0}</span>
              <span style={styles.statLabel}>Students</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statValue, color: '#6366f1'}}>{stats?.professors || 0}</span>
              <span style={styles.statLabel}>Professors</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statValue, color: '#f59e0b'}}>{stats?.admins || 0}</span>
              <span style={styles.statLabel}>Admins</span>
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3>Users by Department</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  background: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.reportCard}>
          <h3>System Performance</h3>
          <div style={styles.performanceList}>
            <div style={styles.performanceItem}>
              <span>AI Services</span>
              <span style={styles.statusActive}>Active</span>
            </div>
            <div style={styles.performanceItem}>
              <span>Database</span>
              <span style={styles.statusActive}>Connected</span>
            </div>
            <div style={styles.performanceItem}>
              <span>API Services</span>
              <span style={styles.statusActive}>Operational</span>
            </div>
            <div style={styles.performanceItem}>
              <span>File Storage</span>
              <span style={styles.statusActive}>Available</span>
            </div>
          </div>
        </div>

        <div style={styles.reportCard}>
          <h3>AI Capabilities</h3>
          <div style={styles.aiCapabilities}>
            <div style={styles.capability}>
              <span>🤖</span>
              <div>
                <h4>Plagiarism Detection</h4>
                <p>Real-time text similarity analysis</p>
              </div>
            </div>
            <div style={styles.capability}>
              <span>📝</span>
              <div>
                <h4>Grammar Checking</h4>
                <p>Advanced grammar and style suggestions</p>
              </div>
            </div>
            <div style={styles.capability}>
              <span>📚</span>
              <div>
                <h4>Content Summarization</h4>
                <p>AI-generated assignment summaries</p>
              </div>
            </div>
            <div style={styles.capability}>
              <span>📊</span>
              <div>
                <h4>Smart Grading</h4>
                <p>Rubric-based evaluation assistance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.dashboard}>
      <aside style={styles.sidebar}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>⚙️</div>
          <h3>{user.username}</h3>
          <p>Administrator</p>
        </div>

        <nav style={styles.nav}>
          <button
            style={activeTab === 'users' ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
          <button
            style={activeTab === 'analytics' ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics & Reports
          </button>
        </nav>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Admin Dashboard</h2>
        </header>

        {activeTab === 'users' && renderUsers()}
        {activeTab === 'analytics' && renderAnalytics()}
      </main>
    </div>
  );
};

const styles = {
  dashboard: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  sidebar: {
    width: '280px',
    background: 'white',
    padding: '30px 20px',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e2e8f0',
    boxShadow: '1px 0 3px rgba(0,0,0,0.02)'
  },
  userInfo: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  avatar: {
    fontSize: '3rem',
    marginBottom: '10px'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1
  },
  navBtn: {
    padding: '14px 18px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#64748b',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  navBtnActive: {
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    boxShadow: '0 2px 8px rgba(99,102,241,0.25)'
  },
  logoutBtn: {
    padding: '14px',
    background: 'transparent',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    marginTop: 'auto',
    transition: 'all 0.2s'
  },
  main: {
    flex: 1,
    padding: '30px 40px',
    overflowY: 'auto'
  },
  header: {
    marginBottom: '30px'
  },
  usersSection: {
    width: '100%'
  },
  filterBar: {
    display: 'flex',
    gap: '14px',
    marginBottom: '20px'
  },
  searchInput: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'white',
    border: '1px solid #e2e8f0',
    color: '#1e293b',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem'
  },
  filterSelect: {
    padding: '12px 16px',
    borderRadius: '10px',
    background: 'white',
    border: '1px solid #e2e8f0',
    color: '#1e293b',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    minWidth: '150px'
  },
  usersTable: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 1fr',
    padding: '16px 20px',
    background: '#f8fafc',
    fontWeight: 600,
    color: '#64748b',
    fontSize: '0.9rem'
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 1fr',
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    alignItems: 'center'
  },
  username: {
    fontWeight: 500,
    color: '#1e293b'
  },
  typeBadge: {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    textTransform: 'capitalize',
    textAlign: 'center',
    fontWeight: 500
  },
  userId: {
    color: '#64748b'
  },
  department: {
    color: '#64748b'
  },
  deleteBtn: {
    background: 'transparent',
    border: '1px solid #fecaca',
    color: '#ef4444',
    padding: '8px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.85rem',
    fontWeight: 500
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b'
  },
  emptyText: {
    textAlign: 'center',
    padding: '40px',
    color: '#94a3b8'
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '20px'
  },
  statsCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginTop: '20px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  statValue: {
    fontSize: '2.2rem',
    fontWeight: 700,
    color: '#6366f1'
  },
  statLabel: {
    color: '#64748b',
    fontSize: '0.85rem'
  },
  chartCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  reportCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  performanceList: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  performanceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  statusActive: {
    color: '#10b981',
    fontWeight: 500,
    fontSize: '0.9rem'
  },
  aiCapabilities: {
    marginTop: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },
  capability: {
    display: 'flex',
    gap: '14px',
    padding: '14px',
    background: '#f8fafc',
    borderRadius: '8px',
    alignItems: 'flex-start'
  }
};

export default AdminDashboard;