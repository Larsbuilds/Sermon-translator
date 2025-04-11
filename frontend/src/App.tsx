import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useStore } from './store/useStore';
import Layout from './components/Layout';

// Lazy load pages
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Session = lazy(() => import('./pages/Session'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-base-100">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
);

export default function App() {
  const { user } = useStore();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Layout>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public routes */}
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/dashboard" />} 
            />

            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/session/:id" 
              element={user ? <Session /> : <Navigate to="/login" />} 
            />

            {/* Default redirect */}
            <Route 
              path="*" 
              element={<Navigate to={user ? "/dashboard" : "/login"} />} 
            />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}
