import React, { useContext, useMemo, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import DealersListPage from './pages/DealersListPage';
import DealerDetailPage from './pages/DealerDetailPage';
import ModelsListPage from './pages/ModelsListPage';
import ModelDetailPage from './pages/ModelDetailPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import FavoritesPage from './pages/FavoritesPage';
import RegisterUserPage from './pages/RegisterUserPage';
import RegisterDealerPage from './pages/RegisterDealerPage';
import ScrollToTopButton from './components/ScrollToTopButton';
import AdminPage from './pages/AdminPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AwaitingApprovalPage from './pages/AwaitingApprovalPage';
import DealerDashboardPage from './pages/DealerDashboardPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataContext, DataProvider } from './contexts/DataContext';
import { ToastProvider, ToastContainer } from './contexts/ToastContext';
import ChatButton from './components/ChatButton';
import ChatWidget from './components/ChatWidget';

const LoadingScreen = () => (
  <div className="flex items-center justify-center py-24">
    <span className="text-gray-300">Loading...</span>
  </div>
);

const AdminRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, role, loading, initializing } = useAuth();

  if (initializing || loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role === 'pending') {
    return <Navigate to="/awaiting-approval" replace />;
  }

  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const DealerRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, role, loading: authLoading, initializing } = useAuth();
  const { dealers, loading: dataLoading } = useContext(DataContext);

  const dealerRecord = useMemo(() => {
    if (!user) {
      return null;
    }
    return dealers.find(dealer => dealer.id === user.uid) ?? null;
  }, [dealers, user]);

  if (initializing || authLoading || dataLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (role !== 'dealer') {
    return <Navigate to="/" replace />;
  }

  if (!dealerRecord || dealerRecord.approved !== true) {
    return <Navigate to="/awaiting-approval" replace />;
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
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/favorites" element={<FavoritesPage />} />
                  <Route path="/register" element={<RegisterUserPage />} />
                  <Route path="/register-dealer" element={<RegisterDealerPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/awaiting-approval" element={<AwaitingApprovalPage />} />
                  <Route
                    path="/dealer/dashboard"
                    element={(
                      <DealerRoute>
                        <DealerDashboardPage />
                      </DealerRoute>
                    )}
                  />
                  <Route
                    path="/admin"
                    element={(
                      <AdminRoute>
                        <AdminPage />
                      </AdminRoute>
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
