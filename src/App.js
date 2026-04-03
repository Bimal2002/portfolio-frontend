import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Portfolio from './pages/Portfolio/Portfolio';
import PublicPortfolio from './pages/Public/PublicPortfolio';
import MessageReply from './pages/Public/MessageReply';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <ErrorBoundary>
            <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/:username" element={<PublicPortfolio />} />
            <Route path="/p/:username" element={<PublicPortfolio />} />
            <Route path="/reply/:token" element={<MessageReply />} />
            
            {/* Private Routes */}
            <Route
              path="/dashboard/*"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/portfolio"
              element={
                <PrivateRoute>
                  <Portfolio />
                </PrivateRoute>
              }
            />
            
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ErrorBoundary>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
