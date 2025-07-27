import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LuckyDrawPage from './pages/LuckyDrawPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import { Gift } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './contexts/AuthContext';
import { Settings } from './types';
import { useSettings } from './services/apiService';

const AdminLink = () => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  return (
    <Link 
      to="/admin" 
      className="flex items-center px-3 py-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
    >
      <Gift className="w-4 h-4 mr-1" />
      <span>Admin</span>
    </Link>
  );
};

function App() {
  const { settings, loading: settingsLoading } = useSettings();
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100"
          style={
            settings.backgroundImage
              ? {
                  backgroundImage: `url(${settings.backgroundImage})`,
                  backgroundSize: 'cover',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }
              : {}
          }
        >
          
          <main className="container mx-auto py-6 px-4">
            <Routes>
              <Route path="/" element={<LuckyDrawPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute>
                    <AdminPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          
          <footer className="text-amber-200 py-4 mt-auto">
            <div className="container mx-auto px-4 text-center">
              <p>&copy; {new Date().getFullYear()} Lucky Draw System. All rights reserved.</p>
            </div>
          </footer>
          
          <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;