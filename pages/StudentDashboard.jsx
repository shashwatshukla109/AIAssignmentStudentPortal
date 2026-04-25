import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { assignmentAPI, submissionAPI, aiAPI } from '../api';

const StudentDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    try {
      const res = await assignmentAPI.getAll();
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      const res = await submissionAPI.getStudentSubmissions();
      setSubmissions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!selectedAssignment || (!file && !content)) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('assignmentId', selectedAssignment);
      if (file) formData.append('file', file);
      if (content) formData.append('content', content);

      const res = await submissionAPI.create(formData);
      
      if (content) {
        await runAIAnalysis(res.data._id, content);
      }
      
      setShowUpload(false);
      setFile(null);
      setContent('');
      setSelectedAssignment(null);
      fetchSubmissions();
    } catch (err) {
      console.error(err);
    }
    setUploading(false);
  };

  const runAIAnalysis = async (submissionId, text) => {
    setAnalyzing(true);
    try {
      const [plagiarism, grammar, summary, suggestions] = await Promise.all([
        aiAPI.plagiarismCheck({ content: text, submissionId }),
        aiAPI.grammarCheck({ content: text }),
        aiAPI.summarize({ content: text }),
        aiAPI.suggestions({ content: text })
      ]);

      setAiAnalysis({
        plagiarism: plagiarism.data,
        grammar: grammar.data,
        summary: summary.data,
        suggestions: suggestions.data
      });
    } catch (err) {
      console.error(err);
    }
    setAnalyzing(false);
  };

  const renderAssignments = () => (
    <div style={styles.contentGrid}>
      {assignments.length === 0 ? (
        <p style={styles.emptyText}>No assignments available</p>
      ) : (
        assignments.map((assignment) => {
          const submission = submissions.find(s => s.assignmentId?._id === assignment._id);
          const deadline = new Date(assignment.deadline);
          const isPast = deadline < new Date();
          
          return (
            <motion.div
              key={assignment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.assignmentCard}
            >
              <div style={styles.assignmentHeader}>
                <h3>{assignment.title}</h3>
                <span style={isPast ? styles.deadlinePast : styles.deadline}>
                  {isPast ? 'Past Due' : `Due: ${deadline.toLocaleDateString()}`}
                </span>
              </div>
              <p style={styles.assignmentDesc}>{assignment.description}</p>
              
              {submission ? (
                <div style={styles.submissionStatus}>
                  <span style={styles.submittedBadge}>✓ Submitted</span>
                  {submission.grade !== null && (
                    <span style={styles.gradeBadge}>Grade: {submission.grade}</span>
                  )}
                </div>
              ) : (
                !isPast && (
                  <button
                    style={styles.uploadBtn}
                    onClick={() => {
                      setSelectedAssignment(assignment._id);
                      setShowUpload(true);
                    }}
                  >
                    Upload Assignment
                  </button>
                )
              )}
            </motion.div>
          );
        })
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
              <h4>{sub.assignmentId?.title || 'Assignment'}</h4>
              <span style={sub.grade !== null ? styles.gradeBadge : styles.pendingBadge}>
                {sub.grade !== null ? `Grade: ${sub.grade}` : 'Pending'}
              </span>
            </div>
            <p style={styles.fileName}>📄 {sub.fileName}</p>
            <p style={styles.submissionDate}>
              Submitted: {new Date(sub.submittedAt).toLocaleString()}
            </p>
            
            {sub.originalityScore !== undefined && (
              <div style={styles.aiScoreSection}>
                <h5>AI Analysis</h5>
                <div style={styles.scoreBar}>
                  <div style={styles.scoreLabel}>
                    <span>Originality Score</span>
                    <span style={styles.scoreValue}>{sub.originalityScore}%</span>
                  </div>
                  <div style={styles.progressBg}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${sub.originalityScore}%`,
                        background: sub.originalityScore > 70 ? '#10b981' : sub.originalityScore > 40 ? '#f59e0b' : '#ef4444'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))
      )}
    </div>
  );

  return (
    <div style={styles.dashboard}>
      <aside style={styles.sidebar}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>🎓</div>
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
            📤 My Submissions
          </button>
          <button
            style={activeTab === 'ai' ? styles.navBtnActive : styles.navBtn}
            onClick={() => setActiveTab('ai')}
          >
            🤖 AI Assistant
          </button>
        </nav>

        <button style={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Student Dashboard</h2>
        </header>

        {activeTab === 'assignments' && renderAssignments()}
        {activeTab === 'submissions' && renderSubmissions()}
        
        {activeTab === 'ai' && (
          <div style={styles.aiSection}>
            <div style={styles.aiCard}>
              <h3>AI-Powered Features</h3>
              <div style={styles.aiFeatures}>
                <div style={styles.aiFeature}>
                  <span style={styles.aiIcon}>🔍</span>
                  <h4>Plagiarism Detection</h4>
                  <p>Check originality of your work</p>
                </div>
                <div style={styles.aiFeature}>
                  <span style={styles.aiIcon}>📝</span>
                  <h4>Grammar Suggestions</h4>
                  <p>Improve writing clarity</p>
                </div>
                <div style={styles.aiFeature}>
                  <span style={styles.aiIcon}>📚</span>
                  <h4>Assignment Summary</h4>
                  <p>AI-generated summaries</p>
                </div>
                <div style={styles.aiFeature}>
                  <span style={styles.aiIcon}>💡</span>
                  <h4>Study Tips</h4>
                  <p>Personalized learning tips</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {showUpload && (
        <div style={styles.modal}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.modalContent}
          >
            <h3 style={styles.modalTitle}>Upload Assignment</h3>
            
            <div style={styles.uploadArea}>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={(e) => setFile(e.target.files[0])}
                style={styles.fileInput}
              />
              <p style={styles.uploadHint}>PDF, DOCX, or TXT files only</p>
            </div>

            <div style={styles.formGroup}>
              <label>Or paste your content:</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your assignment content here..."
                rows={6}
                style={styles.textarea}
              />
            </div>

            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setShowUpload(false)}>
                Cancel
              </button>
              <button
                style={styles.submitBtn}
                onClick={handleUpload}
                disabled={uploading || analyzing}
              >
                {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Submit'}
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
  deadline: {
    color: '#10b981',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  deadlinePast: {
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  uploadBtn: {
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
  submissionStatus: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  submittedBadge: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 500
  },
  gradeBadge: {
    background: '#dbeafe',
    color: '#1e40af',
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
    alignItems: 'center',
    marginBottom: '12px'
  },
  fileName: {
    color: '#64748b',
    marginBottom: '8px',
    fontSize: '0.95rem'
  },
  submissionDate: {
    color: '#94a3b8',
    fontSize: '0.85rem'
  },
  aiScoreSection: {
    marginTop: '18px',
    paddingTop: '18px',
    borderTop: '1px solid #f1f5f9'
  },
  scoreBar: {
    marginTop: '10px'
  },
  scoreLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
    fontSize: '0.9rem'
  },
  scoreValue: {
    color: '#6366f1',
    fontWeight: 600
  },
  progressBg: {
    height: '8px',
    background: '#f1f5f9',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s ease'
  },
  aiSection: {
    padding: '20px 0'
  },
  aiCard: {
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
  },
  aiFeatures: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '30px'
  },
  aiFeature: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center'
  },
  aiIcon: {
    fontSize: '2.5rem',
    display: 'block',
    marginBottom: '12px'
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
  uploadArea: {
    border: '2px dashed #e2e8f0',
    borderRadius: '12px',
    padding: '28px',
    textAlign: 'center',
    marginBottom: '20px',
    background: '#f8fafc'
  },
  fileInput: {
    marginBottom: '10px'
  },
  uploadHint: {
    color: '#94a3b8',
    fontSize: '0.85rem'
  },
  formGroup: {
    marginBottom: '20px'
  },
  textarea: {
    width: '100%',
    padding: '14px',
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
  }
};

export default StudentDashboard;