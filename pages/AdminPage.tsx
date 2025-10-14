import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
  Shield,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  XCircle,
  Loader2,
  Upload,
  ClipboardList,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { DataContext } from '../contexts/DataContext';
import { Dealer, Model, BlogPost } from '../types';
import DealerForm, { DealerFormValues } from '../components/admin/DealerForm';
import ModelForm, { ModelFormValues } from '../components/admin/ModelForm';
import BlogPostForm, { BlogPostFormValues } from '../components/admin/BlogPostForm';
import BulkImportModal, { BulkImportEntity } from '../components/admin/BulkImportModal';
import OfflineQueuePanel from '../components/admin/OfflineQueuePanel';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';
import { listOfflineMutations, OFFLINE_QUEUE_EVENT } from '../services/offlineQueue';

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

const formatDate = (value: Dealer['createdAt']) => {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toLocaleDateString();
  }

  if (typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    try {
      return value.toDate().toLocaleDateString();
    } catch (error) {
      console.error('Failed to format timestamp', error);
    }
  }

  return null;
};

const AdminPage: React.FC = () => {
  const { logout, user, role } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    dealers,
    models,
    blogPosts,
    loading,
    loadError,
    dealerMutations,
    modelMutations,
    blogPostMutations,
    addDealer,
    updateDealer,
    deleteDealer,
    approveDealer,
    rejectDealer,
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
  const [bulkEntity, setBulkEntity] = useState<BulkImportEntity | null>(null);
  const [dealerSubmitting, setDealerSubmitting] = useState(false);
  const [modelSubmitting, setModelSubmitting] = useState(false);
  const [blogSubmitting, setBlogSubmitting] = useState(false);
  const [dealerAction, setDealerAction] = useState<{ id: string; type: 'approve' | 'reject' } | null>(null);
  const [offlineQueueOpen, setOfflineQueueOpen] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(() =>
    typeof window !== 'undefined' ? listOfflineMutations().length : 0,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const updateCount = () => setOfflineQueueCount(listOfflineMutations().length);
    window.addEventListener(OFFLINE_QUEUE_EVENT, updateCount);
    return () => {
      window.removeEventListener(OFFLINE_QUEUE_EVENT, updateCount);
    };
  }, []);

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

  const getBulkModalTitle = (entity: BulkImportEntity) => {
    switch (entity) {
      case 'dealers':
        return t('admin.bulkUploadDealers', { defaultValue: 'Bulk upload dealers' });
      case 'models':
        return t('admin.bulkUploadModels', { defaultValue: 'Bulk upload models' });
      case 'blog':
      default:
        return t('admin.bulkUploadPosts', { defaultValue: 'Bulk upload blog posts' });
    }
  };

  const pendingDealers = useMemo(
    () => dealers.filter(dealer => dealer.approved === false),
    [dealers],
  );

  const approvedDealers = useMemo(
    () => dealers.filter(dealer => dealer.approved !== false),
    [dealers],
  );

  const isAdmin = role === 'admin';

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: t('admin.dashboardMetaTitle'),
    description: t('admin.dashboardMetaDescription'),
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'All',
    url: `${BASE_URL}/admin`,
  };

  const handleApproveDealer = async (dealerId: string) => {
    if (!isAdmin) {
      return;
    }

    setDealerAction({ id: dealerId, type: 'approve' });
    try {
      await approveDealer(dealerId);
    } catch (error) {
      console.error('Failed to approve dealer', error);
    } finally {
      setDealerAction(null);
    }
  };

  const handleRejectDealer = async (dealerId: string) => {
    if (!isAdmin) {
      return;
    }

    setDealerAction({ id: dealerId, type: 'reject' });
    try {
      await rejectDealer(dealerId);
    } catch (error) {
      console.error('Failed to reject dealer', error);
    } finally {
      setDealerAction(null);
    }
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

  const renderEmptyState = (message: string) => (
    <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-gray-300">
      {message}
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/5 py-16 text-gray-300">
      <Loader2 className="h-8 w-8 animate-spin text-gray-cyan" />
      <p className="text-sm font-medium">{t('admin.loading')}</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-6 py-10 text-center text-sm text-red-200">
      <p className="text-base font-semibold">{t('admin.errorTitle')}</p>
      {loadError && <p className="mt-2 text-sm text-red-100/80">{loadError}</p>}
      <button
        onClick={() => window.location.reload()}
        className="mt-6 inline-flex items-center justify-center rounded-lg bg-red-500/30 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-100 transition hover:bg-red-500/40"
      >
        {t('admin.tryAgain')}
      </button>
    </div>
  );

  const renderDealersPanel = () => {
    const dealerUpdateLoading = dealerMutations.update.loading;
    const dealerDeleteLoading = dealerMutations.delete.loading;

    let content: React.ReactNode;
    if (loadError) {
      content = renderErrorState();
    } else if (loading) {
      content = renderLoadingState();
    } else {
      content = (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <header className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{t('admin.pendingDealers')}</h3>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
                {pendingDealers.length}
              </span>
            </header>

            {pendingDealers.length === 0 ? (
              renderEmptyState(t('admin.noPendingDealers'))
            ) : (
              <ul className="divide-y divide-white/5">
                {pendingDealers.map(dealer => {
                  const isProcessing =
                    dealerUpdateLoading && dealerAction?.id === dealer.id;
                  const createdAt = formatDate(dealer.createdAt);
                  const updatedAt = formatDate(dealer.updatedAt);

                  return (
                    <li key={dealer.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-white">{dealer.name}</p>
                        <p className="mt-1 text-sm text-gray-300">{dealer.city}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          {dealer.brands?.length ? dealer.brands.join(', ') : t('admin.noBrands', { defaultValue: 'No brands listed' })}
                        </p>
                        {dealer.ownerUid && (
                          <p className="mt-2 text-xs text-gray-500">
                            {t('admin.ownerUid', { defaultValue: 'Owner UID: {{uid}}', uid: dealer.ownerUid })}
                          </p>
                        )}
                        {createdAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            {t('admin.createdOn', { defaultValue: 'Created on {{date}}', date: createdAt })}
                          </p>
                        )}
                        {updatedAt && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {t('admin.updatedOn', { defaultValue: 'Updated on {{date}}', date: updatedAt })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => setDealerFormState({ mode: 'edit', entity: dealer })}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
                          aria-label={t('admin.editDealer')}
                        >
                          <Pencil size={14} />
                          <span>{t('admin.edit')}</span>
                        </button>
                        <button
                          onClick={() => handleApproveDealer(dealer.id)}
                          disabled={!isAdmin || dealerUpdateLoading}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30 hover:text-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={t('admin.approve')}
                        >
                          {isProcessing && dealerAction?.type === 'approve' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check size={14} />
                          )}
                          <span>{t('admin.approve')}</span>
                        </button>
                        <button
                          onClick={() => handleRejectDealer(dealer.id)}
                          disabled={!isAdmin || dealerUpdateLoading}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={t('admin.reject')}
                        >
                          {isProcessing && dealerAction?.type === 'reject' ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle size={14} />
                          )}
                          <span>{t('admin.reject')}</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
            <header className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{t('admin.approvedDealers')}</h3>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">
                {approvedDealers.length}
              </span>
            </header>

            {approvedDealers.length === 0 ? (
              renderEmptyState(t('admin.noApprovedDealers'))
            ) : (
              <ul className="divide-y divide-white/5">
                {approvedDealers.map(dealer => {
                  const createdAt = formatDate(dealer.createdAt);
                  const updatedAt = formatDate(dealer.updatedAt);

                  return (
                    <li key={dealer.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                      <div>
                        <p className="font-semibold text-white">{dealer.name}</p>
                        <p className="mt-1 text-sm text-gray-300">{dealer.city}</p>
                        <p className="mt-2 text-xs text-gray-400">
                          {dealer.brands?.length ? dealer.brands.join(', ') : t('admin.noBrands', { defaultValue: 'No brands listed' })}
                        </p>
                        {dealer.ownerUid && (
                          <p className="mt-2 text-xs text-gray-500">
                            {t('admin.ownerUid', { defaultValue: 'Owner UID: {{uid}}', uid: dealer.ownerUid })}
                          </p>
                        )}
                        {createdAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            {t('admin.createdOn', { defaultValue: 'Created on {{date}}', date: createdAt })}
                          </p>
                        )}
                        {updatedAt && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            {t('admin.updatedOn', { defaultValue: 'Updated on {{date}}', date: updatedAt })}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => setDealerFormState({ mode: 'edit', entity: dealer })}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
                          aria-label={t('admin.editDealer')}
                        >
                          <Pencil size={14} />
                          <span>{t('admin.edit')}</span>
                        </button>
                        <button
                          onClick={() => handleRejectDealer(dealer.id)}
                          disabled={!isAdmin || dealerUpdateLoading}
                          className="inline-flex items-center gap-1 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/30 hover:text-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={t('admin.reject')}
                        >
                          <XCircle size={14} />
                          <span>{t('admin.reject')}</span>
                        </button>
                        <button
                          onClick={() => confirmAndDelete(() => deleteDealer(dealer.id))}
                          disabled={!isAdmin || dealerDeleteLoading}
                          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label={t('admin.delete')}
                        >
                          {dealerDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={14} />}
                          <span>{t('admin.delete')}</span>
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">{t('admin.manageDealers')}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBulkEntity('dealers')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Upload size={16} />
              <span>{t('admin.bulkUploadDealers', { defaultValue: 'Bulk upload dealers' })}</span>
            </button>
            <button
              onClick={() => setDealerFormState({ mode: 'create' })}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90"
            >
              <Plus size={16} />
              <span>{t('admin.addNewDealer')}</span>
            </button>
          </div>
        </div>

        {content}
      </div>
    );
  };
  const renderModelsPanel = () => {
    const modelUpdateLoading = modelMutations.update.loading;
    const modelDeleteLoading = modelMutations.delete.loading;
    let content: React.ReactNode;
    if (loadError) {
      content = renderErrorState();
    } else if (loading) {
      content = renderLoadingState();
    } else {
      content = (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <header className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">{t('admin.modelsList', { defaultValue: 'Models' })}</h3>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">{models.length}</span>
          </header>

          {models.length === 0 ? (
            renderEmptyState(t('admin.noModels'))
          ) : (
            <ul className="divide-y divide-white/5">
              {models.map(model => (
                <li key={model.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-white">{model.brand} {model.model_name}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {model.range_wltp
                        ? t('modelsPage.range', { defaultValue: 'Range (WLTP)' }) + ': ' + model.range_wltp + ' km'
                        : t('admin.rangeUnknown', { defaultValue: 'Range unknown' })}
                    </p>
                    {model.isFeatured && (
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200">
                        {t('admin.featured')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => setModelFormState({ mode: 'edit', entity: model })}
                      disabled={modelUpdateLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={t('admin.editModel')}
                    >
                      <Pencil size={14} />
                      <span>{t('admin.edit')}</span>
                    </button>
                    <button
                      onClick={() => confirmAndDelete(() => deleteModel(model.id))}
                      disabled={modelDeleteLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={t('admin.delete')}
                    >
                      {modelDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={14} />}
                      <span>{t('admin.delete')}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">{t('admin.manageModels')}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBulkEntity('models')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Upload size={16} />
              <span>{t('admin.bulkUploadModels', { defaultValue: 'Bulk upload models' })}</span>
            </button>
            <button
              onClick={() => setModelFormState({ mode: 'create' })}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90"
            >
              <Plus size={16} />
              <span>{t('admin.addNewModel')}</span>
            </button>
          </div>
        </div>

        {content}
      </div>
    );
  };
  const renderBlogPanel = () => {
    const blogUpdateLoading = blogPostMutations.update.loading;
    const blogDeleteLoading = blogPostMutations.delete.loading;
    let content: React.ReactNode;
    if (loadError) {
      content = renderErrorState();
    } else if (loading) {
      content = renderLoadingState();
    } else {
      content = (
        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <header className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">{t('admin.blogPosts')}</h3>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-300">{blogPosts.length}</span>
          </header>

          {blogPosts.length === 0 ? (
            renderEmptyState(t('admin.noBlogPosts'))
          ) : (
            <ul className="divide-y divide-white/5">
              {blogPosts.map(post => (
                <li key={post.id} className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-white">{post.title}</p>
                    <p className="mt-1 text-sm text-gray-300">{post.author}</p>
                    <p className="mt-2 text-xs text-gray-400">
                      {post.date
                        ? new Date(post.date).toLocaleDateString()
                        : t('admin.dateUnknown', { defaultValue: 'Date unknown' })}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <button
                      onClick={() => setBlogFormState({ mode: 'edit', entity: post })}
                      disabled={blogUpdateLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={t('admin.editBlogPost')}
                    >
                      <Pencil size={14} />
                      <span>{t('admin.edit')}</span>
                    </button>
                    <button
                      onClick={() => confirmAndDelete(() => deleteBlogPost(post.id))}
                      disabled={blogDeleteLoading}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30 hover:text-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={t('admin.delete')}
                    >
                      {blogDeleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 size={14} />}
                      <span>{t('admin.delete')}</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-white">{t('admin.manageBlog')}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setBulkEntity('blog')}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Upload size={16} />
              <span>{t('admin.bulkUploadPosts', { defaultValue: 'Bulk upload blog posts' })}</span>
            </button>
            <button
              onClick={() => setBlogFormState({ mode: 'create' })}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90"
            >
              <Plus size={16} />
              <span>{t('admin.addBlogPost')}</span>
            </button>
          </div>
        </div>

        {content}
      </div>
    );
  };
  if (!user) {
    return null;
  }

  return (
    <div className="py-16">
      <SEO
        title={t('admin.dashboardMetaTitle')}
        description={t('admin.dashboardMetaDescription')}
        keywords={t('admin.dashboardMetaKeywords', { returnObjects: true }) as string[]}
        canonical={`${BASE_URL}/admin`}
        robots="noindex, nofollow"
        openGraph={{
          title: t('admin.dashboardMetaTitle'),
          description: t('admin.dashboardMetaDescription'),
          url: `${BASE_URL}/admin`,
          type: 'website',
          images: [DEFAULT_OG_IMAGE],
        }}
        twitter={{
          title: t('admin.dashboardMetaTitle'),
          description: t('admin.dashboardMetaDescription'),
          image: DEFAULT_OG_IMAGE,
          site: '@makinaelektrike',
        }}
        structuredData={structuredData}
      />
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => setOfflineQueueOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10 hover:text-white"
              >
                <ClipboardList size={18} />
                <span>{t('admin.offlineQueueButton', { defaultValue: 'Offline queue' })}</span>
                {offlineQueueCount > 0 && (
                  <span className="rounded-full bg-gray-cyan px-2 py-0.5 text-xs font-semibold text-white">
                    {offlineQueueCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-2 rounded-lg bg-gray-cyan/20 px-4 py-2 font-semibold text-white transition hover:bg-gray-cyan/30"
              >
                <LogOut size={18} />
                <span>{t('admin.logout')}</span>
              </button>
            </div>
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
              {activeTab === 'dealers' && renderDealersPanel()}
              {activeTab === 'models' && renderModelsPanel()}
              {activeTab === 'blog' && renderBlogPanel()}
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
          title={
            blogFormState.mode === 'edit' ? t('admin.editBlogPost') : t('admin.addBlogPost')
          }
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

      {offlineQueueOpen && (
        <AdminModal
          title={t('admin.offlineQueueTitle', { defaultValue: 'Offline submissions' })}
          onClose={() => setOfflineQueueOpen(false)}
        >
          <OfflineQueuePanel onClose={() => setOfflineQueueOpen(false)} />
        </AdminModal>
      )}

      {bulkEntity && (
        <AdminModal title={getBulkModalTitle(bulkEntity)} onClose={() => setBulkEntity(null)}>
          <BulkImportModal entity={bulkEntity} onClose={() => setBulkEntity(null)} />
        </AdminModal>
      )}
    </div>
  );
};

export default AdminPage;
