import React, { useContext, useMemo, useState } from 'react';
import { Shield, LogOut, Plus, Pencil, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';
import { Dealer, Model, BlogPost } from '../types';
import DealerForm, { DealerFormValues } from '../components/admin/DealerForm';
import ModelForm, { ModelFormValues } from '../components/admin/ModelForm';
import BlogPostForm, { BlogPostFormValues } from '../components/admin/BlogPostForm';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const AdminModal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
    <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 text-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 text-gray-400 transition hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>
      <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
    </div>
  </div>
);

type FormState<T> = { mode: 'create' | 'edit'; entity?: T } | null;

type TabKey = 'dealers' | 'models' | 'blog';

const AdminPage: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    dealers,
    models,
    blogPosts,
    loading,
    addDealer,
    updateDealer,
    deleteDealer,
    addModel,
    updateModel,
    deleteModel,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
  } = useContext(DataContext);

  const [activeTab, setActiveTab] = useState<TabKey>('dealers');
  const [dealerFormState, setDealerFormState] = useState<FormState<Dealer>>(null);
  const [modelFormState, setModelFormState] = useState<FormState<Model>>(null);
  const [blogFormState, setBlogFormState] = useState<FormState<BlogPost>>(null);
  const [dealerSubmitting, setDealerSubmitting] = useState(false);
  const [modelSubmitting, setModelSubmitting] = useState(false);
  const [blogSubmitting, setBlogSubmitting] = useState(false);

  const tabs = useMemo(
    () => [
      { id: 'dealers' as TabKey, label: t('admin.manageDealers') },
      { id: 'models' as TabKey, label: t('admin.manageModels') },
      { id: 'blog' as TabKey, label: t('admin.manageBlog') },
    ],
    [t]
  );

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const closeAllModals = () => {
    setDealerFormState(null);
    setModelFormState(null);
    setBlogFormState(null);
  };

  const handleDealerSubmit = async (values: DealerFormValues) => {
    setDealerSubmitting(true);
    try {
      if (dealerFormState?.mode === 'edit' && dealerFormState.entity) {
        const { id, ...rest } = values;
        await updateDealer(dealerFormState.entity.id, rest);
      } else {
        const { id: _omit, ...rest } = values;
        await addDealer(rest);
      }
      closeAllModals();
    } catch (error) {
      console.error(error);
    } finally {
      setDealerSubmitting(false);
    }
  };

  const handleModelSubmit = async (values: ModelFormValues) => {
    setModelSubmitting(true);
    try {
      if (modelFormState?.mode === 'edit' && modelFormState.entity) {
        const { id, ...rest } = values;
        await updateModel(modelFormState.entity.id, rest);
      } else {
        const { id: _omit, ...rest } = values;
        await addModel(rest);
      }
      closeAllModals();
    } catch (error) {
      console.error(error);
    } finally {
      setModelSubmitting(false);
    }
  };

  const handleBlogSubmit = async (values: BlogPostFormValues) => {
    setBlogSubmitting(true);
    try {
      if (blogFormState?.mode === 'edit' && blogFormState.entity) {
        const { id, ...rest } = values;
        await updateBlogPost(blogFormState.entity.id, rest);
      } else {
        const { id: _omit, ...rest } = values;
        await addBlogPost(rest);
      }
      closeAllModals();
    } catch (error) {
      console.error(error);
    } finally {
      setBlogSubmitting(false);
    }
  };

  const confirmAndDelete = async (action: () => Promise<void>) => {
    const confirmation = window.confirm(t('admin.deleteConfirm'));
    if (!confirmation) return;

    try {
      await action();
    } catch (error) {
      console.error(error);
    }
  };

  const renderDealersTable = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{t('admin.manageDealers')}</h2>
        <button
          onClick={() => setDealerFormState({ mode: 'create' })}
          className="inline-flex items-center space-x-2 rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90"
        >
          <Plus size={16} />
          <span>{t('admin.addNewDealer')}</span>
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3">{t('admin.name')}</th>
                <th className="px-4 py-3">{t('admin.city')}</th>
                <th className="px-4 py-3">{t('admin.brands')}</th>
                <th className="px-4 py-3">{t('admin.featured')}</th>
                <th className="px-4 py-3 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {dealers.map(dealer => (
                <tr key={dealer.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{dealer.name}</td>
                  <td className="px-4 py-3">{dealer.city}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{dealer.brands?.join(', ') || '-'}</td>
                  <td className="px-4 py-3">
                    {dealer.isFeatured ? (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {t('admin.featured')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setDealerFormState({ mode: 'edit', entity: dealer })}
                        className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                        aria-label={t('admin.editDealer')}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() =>
                          confirmAndDelete(() => deleteDealer(dealer.id))
                        }
                        className="inline-flex items-center rounded-lg border border-white/10 bg-red-500/20 p-2 text-red-300 transition hover:bg-red-500/30 hover:text-red-100"
                        aria-label={t('admin.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderModelsTable = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{t('admin.manageModels')}</h2>
        <button
          onClick={() => setModelFormState({ mode: 'create' })}
          className="inline-flex items-center space-x-2 rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90"
        >
          <Plus size={16} />
          <span>{t('admin.addNewModel')}</span>
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3">{t('admin.name')}</th>
                <th className="px-4 py-3">{t('admin.brand')}</th>
                <th className="px-4 py-3">{t('modelsPage.range', { defaultValue: 'Range (WLTP)' })}</th>
                <th className="px-4 py-3">{t('admin.featured')}</th>
                <th className="px-4 py-3 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {models.map(model => (
                <tr key={model.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{model.model_name}</td>
                  <td className="px-4 py-3">{model.brand}</td>
                  <td className="px-4 py-3">{model.range_wltp ? `${model.range_wltp} km` : '-'}</td>
                  <td className="px-4 py-3">
                    {model.isFeatured ? (
                      <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {t('admin.featured')}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setModelFormState({ mode: 'edit', entity: model })}
                        className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                        aria-label={t('admin.editModel')}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => confirmAndDelete(() => deleteModel(model.id))}
                        className="inline-flex items-center rounded-lg border border-white/10 bg-red-500/20 p-2 text-red-300 transition hover:bg-red-500/30 hover:text-red-100"
                        aria-label={t('admin.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBlogTable = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">{t('admin.manageBlog')}</h2>
        <button
          onClick={() => setBlogFormState({ mode: 'create' })}
          className="inline-flex items-center space-x-2 rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90"
        >
          <Plus size={16} />
          <span>Add Blog Post</span>
        </button>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {blogPosts.map(post => (
                <tr key={post.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{post.title}</td>
                  <td className="px-4 py-3">{post.author}</td>
                  <td className="px-4 py-3">{post.date ? new Date(post.date).toLocaleDateString() : '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setBlogFormState({ mode: 'edit', entity: post })}
                        className="inline-flex items-center rounded-lg border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                        aria-label={t('admin.edit')}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => confirmAndDelete(() => deleteBlogPost(post.id))}
                        className="inline-flex items-center rounded-lg border border-white/10 bg-red-500/20 p-2 text-red-300 transition hover:bg-red-500/30 hover:text-red-100"
                        aria-label={t('admin.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return null;
  }

  return (
    <div className="py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl backdrop-blur-xl md:p-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center space-x-4">
                <Shield className="h-12 w-12 text-gray-cyan" />
                <div>
                  <h1 className="text-3xl font-extrabold sm:text-4xl">{t('admin.dashboard')}</h1>
                  <p className="mt-1 text-sm text-gray-300">{user.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 rounded-lg bg-gray-cyan/20 px-4 py-2 font-semibold text-white transition hover:bg-gray-cyan/30"
            >
              <LogOut size={18} />
              <span>{t('admin.logout')}</span>
            </button>
          </div>

          <div className="mt-10">
            <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/5 p-1 text-sm font-medium text-gray-300">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 rounded-lg px-4 py-2 transition ${
                    activeTab === tab.id
                      ? 'bg-gray-cyan text-white'
                      : 'hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {loading ? (
                <div className="flex items-center justify-center py-16 text-gray-300">Loading...</div>
              ) : (
                <>
                  {activeTab === 'dealers' && renderDealersTable()}
                  {activeTab === 'models' && renderModelsTable()}
                  {activeTab === 'blog' && renderBlogTable()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {dealerFormState && (
        <AdminModal
          title={dealerFormState.mode === 'edit' ? t('admin.editDealer') : t('admin.addNewDealer')}
          onClose={closeAllModals}
        >
          <DealerForm
            initialValues={dealerFormState.entity}
            onSubmit={handleDealerSubmit}
            onCancel={closeAllModals}
            isSubmitting={dealerSubmitting}
          />
        </AdminModal>
      )}

      {modelFormState && (
        <AdminModal
          title={modelFormState.mode === 'edit' ? t('admin.editModel') : t('admin.addNewModel')}
          onClose={closeAllModals}
        >
          <ModelForm
            initialValues={modelFormState.entity}
            onSubmit={handleModelSubmit}
            onCancel={closeAllModals}
            isSubmitting={modelSubmitting}
          />
        </AdminModal>
      )}

      {blogFormState && (
        <AdminModal
          title={blogFormState.mode === 'edit' ? 'Edit Blog Post' : 'Add Blog Post'}
          onClose={closeAllModals}
        >
          <BlogPostForm
            initialValues={blogFormState.entity}
            onSubmit={handleBlogSubmit}
            onCancel={closeAllModals}
            isSubmitting={blogSubmitting}
          />
        </AdminModal>
      )}
    </div>
  );
};

export default AdminPage;
