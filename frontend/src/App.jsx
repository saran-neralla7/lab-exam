import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import axios from 'axios';
import { useEffect } from 'react';

const PrivateRoute = ({ children, roles }) => {
  const user = useAuthStore(state => state.user);
  
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  
  return children;
};

function App() {
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    if (user?.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    }
  }, [user]);

  return (
    <Routes>
      <Route 
        path="/" 
        element={
          !user ? <Navigate to="/login" replace /> :
          user.role === 'Admin' ? <Navigate to="/admin" replace /> :
          <Navigate to="/faculty" replace />
        } 
      />
      <Route path="/login" element={<Login />} />
      
      <Route path="/admin/*" element={
        <PrivateRoute roles={['Admin']}>
          <AdminDashboard />
        </PrivateRoute>
      } />

      <Route path="/faculty/*" element={
        <PrivateRoute roles={['Faculty']}>
          <FacultyDashboard />
        </PrivateRoute>
      } />
    </Routes>
  );
}

export default App;
