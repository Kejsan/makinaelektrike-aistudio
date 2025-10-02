import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { ToastProvider, ToastContainer } from './contexts/ToastContext';

const App: React.FC = () => {
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
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </main>
              <Footer />
              <ScrollToTopButton />
              <ToastContainer />
            </div>
          </DataProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
};

export default App;
