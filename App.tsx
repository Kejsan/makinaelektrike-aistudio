import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DealersListPage from './pages/DealersListPage';
import DealerDetailPage from './pages/DealerDetailPage';
import ModelsListPage from './pages/ModelsListPage';
import ModelDetailPage from './pages/ModelDetailPage';
import BlogPage from './pages/BlogPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FavoritesPage from './pages/FavoritesPage';
import ScrollToTopButton from './components/ScrollToTopButton';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider, ToastContainer } from './contexts/ToastContext';
import ChatButton from './components/ChatButton';
import ChatWidget from './components/ChatWidget';

const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, loading, initializing } = useAuth();

  if (initializing || loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-gray-300">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <DataProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/dealers" element={<DealersListPage />} />
                  <Route path="/dealers/:id" element={<DealerDetailPage />} />
                  <Route path="/models" element={<ModelsListPage />} />
                  <Route path="/models/:id" element={<ModelDetailPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/admin"
                    element={(
                      <RequireAuth>
                        <AdminPage />
                      </RequireAuth>
                    )}
                  />
                </Routes>
              </main>
              <Footer />
              <ScrollToTopButton />
              <ChatButton onClick={() => setIsChatOpen(true)} />
              <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
              <ToastContainer />
            </div>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
};

export default App;
