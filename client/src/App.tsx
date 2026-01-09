import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MapProvider } from './context/MapContext';
import { ThemeProvider } from './context/ThemeContext';
import MapDashboard from './pages/MapDashboard';
import AdminDashboard from './pages/AdminDashboard';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-screen w-screen bg-gray-900 text-white overflow-hidden font-sans selection:bg-cyan-500/30 flex-col">
    <Navbar />
    <main className="flex-1 relative w-full h-full overflow-hidden pt-16">
      {children}
    </main>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <MapProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<MapDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                      </Routes>
                    </Layout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </Router>
        </MapProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
