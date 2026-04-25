import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Landing from './pages/Landing';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import StudentDashboard from './pages/StudentDashboard';
import ProfessorDashboard from './pages/ProfessorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const setUserData = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
    setUser(userData);
  };

  const getDashboard = () => {
    if (!user) return <Navigate to="/signin" />;
    switch (user.userType) {
      case 'student':
        return <StudentDashboard user={user} logout={() => setUserData(null)} />;
      case 'professor':
        return <ProfessorDashboard user={user} logout={() => setUserData(null)} />;
      case 'admin':
        return <AdminDashboard user={user} logout={() => setUserData(null)} />;
      default:
        return <Navigate to="/signin" />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<SignUp setUser={setUserData} />} />
        <Route path="/signin" element={<SignIn setUser={setUserData} />} />
        <Route path="/dashboard/*" element={getDashboard()} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;