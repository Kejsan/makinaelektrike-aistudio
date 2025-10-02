import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const AdminPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/5 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden text-center p-8 md:p-12">
            <div className="flex items-center justify-between text-left">
              <div>
                <Shield className="text-gray-cyan h-12 w-12"/>
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl mt-4">
                  Admin Panel
                </h1>
                {user && (
                  <p className="mt-2 text-sm text-gray-300">
                    {user.email}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 bg-gray-cyan/20 hover:bg-gray-cyan/30 text-white font-semibold px-4 py-2 rounded-md transition-colors"
              >
                <LogOut size={18} />
                <span>{t('admin.logout')}</span>
              </button>
            </div>
            <p className="mt-6 text-lg text-gray-300 max-w-2xl mx-auto">
              This is a restricted area. In a full application, this panel would provide tools to manage dealerships, vehicle models, and blog content.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button className="bg-gray-cyan/80 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-cyan transition-colors">Manage Dealers</button>
              <button className="bg-gray-cyan/80 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-cyan transition-colors">Manage Models</button>
              <button className="bg-gray-cyan/80 text-white font-bold py-3 px-6 rounded-md hover:bg-gray-cyan transition-colors">Manage Blog</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
