import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { assignmentAPI, submissionAPI, aiAPI } from '../api';

const ProfessorDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showGrade, setShowGrade] = useState(null);
  const [stats, setStats] = useState(null);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    deadline: '',
    department: user.department
  });
  const [gradingData, setGradingData] = useState({ grade: '', feedback: '' });
  const [aiGrading, setAiGrading] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchStats();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await assignmentAPI.getAll();
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async (assignmentId) => {
    try {
      const res = await submissionAPI.getAssignmentSubmissions(assignmentId);
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await submissionAPI.getProfessorStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await assignmentAPI.create(newAssignment);
      setShowCreate(false);
      setNewAssignment({ title: '', description: '', deadline: '', department: user.department });
      fetchAssignments();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleGrade = async (submissionId) => {
    setLoading(true);
    try {
      await submissionAPI.grade(submissionId, gradingData);
      setShowGrade(null);
      setGradingData({ grade: '', feedback: '' });
      setAiGrading(null);
      fetchStats();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const runAIGrading = async (content) => {
    try {
      const res = await aiAPI.grade({ content });
      setAiGrading(res.data);
      setGradingData({ ...gradingData, grade: res.data.suggestedGrade.toString() });
    } catch (err) {
      console.error(err);
    }
  };

  const renderAssignments = () => (
    <div style={styles.contentGrid}>
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.createBtn}
        onClick={() => setShowCreate(true)}
      >
        + Create New Assignment
      </motion.button>

      {assignments.length === 0 ? (
        <p style={styles.emptyText}>No assignments created yet</p>
      ) : (
        assignments.map((assignment) => (
          <motion.div
            key={assignment._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.assignmentCard}
          >
            <div style={styles.assignmentHeader}>
              <h3>{assignment.title}</h3>
              <span style={styles.departmentBadge}>{assignment.department}</span>
            </div>
            <p style={styles.assignmentDesc}>{assignment.description}</p>
            <div style={styles.assignmentMeta}>
              <span>📅 Due: {new Date(assignment.deadline).toLocaleDateString()}</span>
              <button
                style={styles.viewBtn}
                onClick={() => {
                  fetchSubmissions(assignment._id);
                  setActiveTab('submissions');
                }}
              >
                View Submissions
              </button>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );

  const renderSubmissions = () => (
    <div style={styles.contentGrid}>
      {submissions.length === 0 ? (
        <p style={styles.emptyText}>No submissions yet</p>
      ) : (
        submissions.map((sub) => (
          <motion.div
            key={sub._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={styles.submissionCard}
          >
            <div style={styles.submissionHeader}>
              <div>
                <h4>📄 {sub.fileName}</h4>
                <p style={styles.studentInfo}>
                  👤 {sub.studentId?.username} | 🎯 {sub.studentId?.systemId}
                </p>
              </div>
              <span style={sub.grade !== null ? styles.gradedBadge : styles.pendingBadge}>
                {sub.grade !== null ? `Graded: ${sub.grade}/100` : 'Pending'}
              </span>
            </div>

            {sub.originalityScore !== undefined && (
              <div style={styles.plagiarismSection}>
                <h5>🔍 Plagiarism Report</h5>
                <div style={styles.scoreRow}>
                  <div style={styles.scoreItem}>
                    <span>Originality</span>
                    <span style={{
                      ...styles.scoreValue,
                      color: sub.originalityScore > 70 ? '#10b981' : sub.originalityScore > 40 ? '#f59e0b' : '#ef4444'
                    }}>
                      {sub.originalityScore}%
                    </span>
                  </div>
                  <div style={styles.scoreItem}>
                    <span>Plagiarism</span>
                    <span style={{
                      ...styles.scoreValue,
                      color: sub.plagiarismScore < 30 ? '#10b981' : sub.plagiarismScore < 60 ? '#f59e0b' : '#ef4444'
                    }}>
                      {sub.plagiarismScore}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {sub.grammarSuggestions?.length > 0 && (
              <div style={styles.suggestionsSection}>
                <h5>📝 Grammar Suggestions</h5>
                <ul style={styles.suggestionList}>
                  {sub.grammarSuggestions.slice(0, 3).map((s, i) => (
                    <li key={i} style={styles.suggestionItem}>{s.message}</li>
                  ))}
                </ul>
              </div>
            )}

            {sub.grade === null && (
              <button
                style={styles.gradeBtn}
                onClick={() => {
                  setShowGrade(sub);
                  if (sub.content) runAIGrading(sub.content);
                }}
              >
                Grade Submission
              </button>
            )}
          </motion.div>
        ))
      )}
    </div>
  );

  const renderAnalytics = () => {
    const pieData = stats ? [
      { name: 'Graded', value: stats.gradedSubmissions, color: '#10b981' },
      { name: 'Pending', value: stats.pendingSubmissions, color: '#f59e0b' }
    ] : [];

    return (
      <div style={styles.analyticsGrid}>
        <div style={styles.statsCard}>
          <h3>Overview</h3>
          <div style={styles.statsGrid}>
            <div style={styles.statItem}>
              <span style={styles.statValue}>{stats?.totalSubmissions || 0}</span>
              <span style={styles.statLabel}>Total Submissions</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statValue, color: '#10b981'}}>{stats?.gradedSubmissions || 0}</span>
              <span style={styles.statLabel}>Graded</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statValue, color: '#f59e0b'}}>{stats?.pendingSubmissions || 0}</span>
              <span style={styles.statLabel}>Pending</span>
            </div>
            <div style={styles.statItem}>
              <span style={{...styles.statValue, color: '#6366f1'}}>{stats?.avgGrade || 0}%</span>
              <span style={styles.statLabel}>Avg Grade</span>
            </div>
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3>Grading Progress</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={80}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div style={styles.chartLegend}>
            {pieData.map((entry, index) => (
              <div key={index} style={styles.legendItem}>
                <span style={{ ...styles.legendColor, background: entry.color }}></span>
                <span>{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.chartCard}>
          <h3>Originality Analysis</h3>
          <div style={styles.originalityStats}>
            <div style={styles.originalityItem}>
              <span>Average Originality Score</span>
              <span style={{
                ...styles.scoreValue,
                color: stats?.avgOriginality > 70 ? '#10b981' : stats?.avgOriginality > 40 ? '#f59e0b' : '#ef4444'
              }}>
                {stats?.avgOriginality || 0}%
              </span>
            </div>
            <div style={styles.originalityBar}>
              <div style={{
                ...styles.originalityFill,
                width: `${stats?.avgOriginality || 0}%`,
                background: stats?.avgOriginality > 70 ? '#10b981' : stats?.avgOriginality > 40 ? '#f59e0b' : '#ef4444'
              }}></div>
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
          <div style={styles.avatar}>👨‍🏫</div>
          <h3>{user.username}</h3>
          <p>{user.department}</p>
        </div>

        <nav style={styles.nav}>
          <button
            style={activeTab === 'assignments' ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab('assignments')}
          >
            📋 Assignments
          </button>
          <button
            style={activeTab === 'submissions' ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab('submissions')}
          >
            📥 Submissions
          </button>
          <button
            style={activeTab === 'analytics' ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab('analytics')}
          >
            📊 Analytics
          </button>
        </nav>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Professor Dashboard</h2>
        </header>

        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'submissions' && renderSubmissions()}
        {activeTab === 'analytics' && renderAnalytics()}
      </main>

      {showCreate && (
        <div style={styles.modal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modalContent}
          >
            <h3 style={styles.modalTitle}>Create Assignment</h3>
            <form onSubmit={handleCreateAssignment}>
              <div style={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={newAssignment.description}
                  onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                  rows={4}
                  required
                  style={styles.textarea}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Deadline</label>
                <input
                  type="date"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
              <div style={styles.formGroup}>
                <label>Department</label>
                <select
                  value={newAssignment.department}
                  onChange={(e) => setNewAssignment({ ...newAssignment, department: e.target.value })}
                  required
                  style={styles.input}
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                </select>
              </div>
              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn} disabled={loading}>
                  {loading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {showGrade && (
        <div style={styles.modal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modalContent}
          >
            <h3 style={styles.modalTitle}>Grade Submission</h3>
            
            {aiGrading && (
              <div style={styles.aiGradingSection}>
                <h4>🤖 AI Suggested Grade</h4>
                <div style={styles.rubricGrid}>
                  <div style={styles.rubricItem}>
                    <span>Content</span>
                    <span>{aiGrading.rubricEvaluation?.content}/25</span>
                  </div>
                  <div style={styles.rubricItem}>
                    <span>Organization</span>
                    <span>{aiGrading.rubricEvaluation?.organization}/25</span>
                  </div>
                  <div style={styles.rubricItem}>
                    <span>Clarity</span>
                    <span>{aiGrading.rubricEvaluation?.clarity}/25</span>
                  </div>
                  <div style={styles.rubricItem}>
                    <span>Grammar</span>
                    <span>{aiGrading.rubricEvaluation?.grammar}/25</span>
                  </div>
                </div>
                <div style={styles.aiFeedback}>
                  <h5>AI Feedback:</h5>
                  <ul>
                    {aiGrading.feedback?.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              </div>
            )}

            <div style={styles.formGroup}>
              <label>Grade (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradingData.grade}
                onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Feedback</label>
              <textarea
                value={gradingData.feedback}
                onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                rows={4}
                style={styles.textarea}
              />
            </div>
            <div style={styles.modalActions}>
              <button type="button" style={styles.cancelBtn} onClick={() => {
                setShowGrade(null);
                setAiGrading(null);
              }}>
                Cancel
              </button>
              <button
                type="button"
                style={styles.submitBtn}
                onClick={() => handleGrade(showGrade._id)}
                disabled={loading || !gradingData.grade}
              >
                {loading ? 'Saving...' : 'Submit Grade'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
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
  createBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    marginBottom: '20px',
    gridColumn: '1 / -1',
    boxShadow: '0 2px 8px rgba(99,102,241,0.2)'
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px'
  },
  assignmentCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  assignmentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px'
  },
  assignmentDesc: {
    color: '#64748b',
    marginBottom: '15px',
    lineHeight: 1.6,
    fontSize: '0.95rem'
  },
  departmentBadge: {
    background: '#dbeafe',
    color: '#1e40af',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: 500
  },
  assignmentMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: '#64748b',
    marginTop: '15px',
    fontSize: '0.9rem'
  },
  viewBtn: {
    background: 'transparent',
    border: '1px solid #10b981',
    color: '#10b981',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.85rem'
  },
  submissionCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  submissionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px'
  },
  studentInfo: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginTop: '4px'
  },
  gradedBadge: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  pendingBadge: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  plagiarismSection: {
    marginTop: '14px',
    padding: '14px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  scoreRow: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px'
  },
  scoreItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  scoreValue: {
    fontSize: '1.4rem',
    fontWeight: 700
  },
  suggestionsSection: {
    marginTop: '14px',
    padding: '14px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  suggestionList: {
    marginTop: '10px',
    paddingLeft: '20px',
    color: '#64748b'
  },
  suggestionItem: {
    marginBottom: '4px',
    fontSize: '0.9rem'
  },
  gradeBtn: {
    marginTop: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    fontSize: '0.9rem',
    boxShadow: '0 2px 8px rgba(99,102,241,0.2)'
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
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
    fontSize: '2rem',
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
  chartLegend: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginTop: '14px'
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#64748b',
    fontSize: '0.9rem'
  },
  legendColor: {
    width: '12px',
    height: '12px',
    borderRadius: '3px'
  },
  originalityStats: {
    marginTop: '18px'
  },
  originalityItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    color: '#64748b',
    fontSize: '0.95rem'
  },
  originalityBar: {
    height: '10px',
    background: '#f1f5f9',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  originalityFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.5s ease'
  },
  emptyText: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '40px',
    gridColumn: '1 / -1'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(15, 23, 42, 0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modalContent: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    padding: '36px',
    width: '90%',
    maxWidth: '560px',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
  },
  modalTitle: {
    fontSize: '1.4rem',
    marginBottom: '24px',
    color: '#1e293b',
    fontWeight: 600
  },
  formGroup: {
    marginBottom: '18px'
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#1e293b',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem'
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '10px',
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    color: '#1e293b',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.95rem',
    resize: 'vertical'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  },
  cancelBtn: {
    background: 'transparent',
    border: '1px solid #e2e8f0',
    color: '#64748b',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500
  },
  submitBtn: {
    background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 500,
    boxShadow: '0 4px 12px rgba(99,102,241,0.25)'
  },
  aiGradingSection: {
    background: '#d1fae5',
    border: '1px solid #a7f3d0',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px'
  },
  rubricGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
    marginTop: '14px'
  },
  rubricItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px',
    background: 'white',
    borderRadius: '6px',
    fontSize: '0.9rem'
  },
  aiFeedback: {
    marginTop: '14px'
  }
};

export default ProfessorDashboard;