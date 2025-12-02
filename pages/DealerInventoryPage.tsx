import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';
import { DataContext } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import EVModelSearch from '../components/admin/EVModelSearch';
import ModalLayout from '../components/ModalLayout';
import type { Dealer, Model } from '../types';

const DealerInventoryPage: React.FC = () => {
  const { user, role } = useAuth();
  const {
    dealers,
    models,
    getModelsForDealer,
    linkModelToDealer,
    unlinkModelFromDealer,
    addModel,
    loading: dataLoading,
  } = useContext(DataContext);
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formModel, setFormModel] = useState<Partial<Model>>({ brand: '', model_name: '' });
  const [priceInput, setPriceInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);
  const [isPrefillLoading, setIsPrefillLoading] = useState(false);

  const dealer: Dealer | null = useMemo(() => {
    if (!user) return null;
    return (
      dealers.find(entry => entry.id === user.uid || entry.ownerUid === user.uid) ?? null
    );
  }, [dealers, user]);

  const linkedModels = useMemo(() => {
    if (!dealer) return [];
    return getModelsForDealer(dealer.id);
  }, [dealer, getModelsForDealer]);

  const handlePrefill = (model: Model) => {
    setFormModel({
      ...model,
      brand: model.brand ?? '',
      model_name: model.model_name ?? '',
    });
  };

  const resetModal = () => {
    setFormModel({ brand: '', model_name: '' });
    setPriceInput('');
    setNotesInput('');
    setIsModalOpen(false);
  };

  const findExistingModel = (brand?: string, modelName?: string) => {
    const normalizedBrand = (brand ?? '').trim().toLowerCase();
    const normalizedModel = (modelName ?? '').trim().toLowerCase();

    if (!normalizedBrand || !normalizedModel) return null;

    return (
      models.find(
        entry =>
          entry.brand.trim().toLowerCase() === normalizedBrand &&
          entry.model_name.trim().toLowerCase() === normalizedModel,
      ) ?? null
    );
  };

  const handleLink = async () => {
    if (!dealer) {
      addToast({ type: 'error', message: 'You must be logged in as a dealer to manage inventory.' });
      return;
    }

    const brand = formModel.brand?.trim();
    const modelName = formModel.model_name?.trim();

    if (!brand || !modelName) {
      addToast({ type: 'error', message: 'Please provide both brand and model name.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const existingModel = findExistingModel(brand, modelName);
      const combinedNotes = [notesInput.trim(), priceInput.trim() ? `Price: ${priceInput.trim()}` : '']
        .filter(Boolean)
        .join(' | ');

      const modelId = existingModel
        ? existingModel.id
        : (
            await addModel({
              ...formModel,
              brand,
              model_name: modelName,
              notes: combinedNotes || formModel.notes,
            } as Omit<Model, 'id'>)
          ).id;

      await linkModelToDealer(dealer.id, modelId);
      addToast({ type: 'success', message: 'Model linked to your dealership.' });
      resetModal();
    } catch (error) {
      console.error('Failed to link model', error);
      addToast({ type: 'error', message: 'Failed to link model. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlink = async (modelId: string) => {
    if (!dealer) return;
    setUnlinkingId(modelId);
    try {
      await unlinkModelFromDealer(dealer.id, modelId);
      addToast({ type: 'success', message: 'Model removed from your inventory.' });
    } catch (error) {
      console.error('Failed to unlink model', error);
      addToast({ type: 'error', message: 'Could not remove model. Please try again.' });
    } finally {
      setUnlinkingId(null);
    }
  };

  const metaTitle = 'Inventory | Dealer Panel';
  const metaDescription = 'Manage electric vehicle models linked to your dealership profile.';
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: metaTitle,
    description: metaDescription,
    url: `${BASE_URL}/dealer/inventory`,
  } as const;

  const isDealer = role === 'dealer' && !!dealer;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <SEO
        title={metaTitle}
        description={metaDescription}
        ogImage={DEFAULT_OG_IMAGE}
        path="/dealer/inventory"
        structuredData={structuredData}
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-blue-300">Dealer Inventory</p>
            <h1 className="text-3xl font-bold">Manage your models</h1>
            <p className="text-gray-300">
              Link or unlink electric vehicle models to keep your storefront up to date.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            disabled={!isDealer}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 font-semibold shadow-lg transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="h-5 w-5" />
            Add Model
          </button>
        </div>

        {!user || !isDealer ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-xl">
            <h2 className="text-2xl font-semibold">Dealer access required</h2>
            <p className="mt-2 text-gray-300">
              Please log in with your dealer account to manage inventory.
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <Link
                to="/login"
                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500"
              >
                Login
              </Link>
              <Link
                to="/register/dealer"
                className="rounded-xl border border-white/10 px-4 py-2 font-semibold text-white transition hover:border-white/30"
              >
                Register as dealer
              </Link>
            </div>
          </div>
        ) : null}

        {isDealer ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/5 bg-slate-900/70 p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Linked models</h2>
                {dataLoading ? <Loader2 className="h-5 w-5 animate-spin text-blue-400" /> : null}
              </div>

              {linkedModels.length === 0 ? (
                <p className="text-gray-400">No models linked yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {linkedModels.map(model => (
                    <div
                      key={model.id}
                      className="flex items-start justify-between rounded-xl border border-white/5 bg-white/5 p-4"
                    >
                      <div>
                        <p className="text-sm uppercase tracking-wide text-blue-300">{model.brand}</p>
                        <h3 className="text-lg font-semibold">{model.model_name}</h3>
                        {model.notes ? (
                          <p className="mt-1 text-sm text-gray-300">{model.notes}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleUnlink(model.id)}
                        disabled={unlinkingId === model.id}
                        className="rounded-lg border border-red-500/40 px-3 py-2 text-sm font-semibold text-red-200 transition hover:border-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {unlinkingId === model.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <ModalLayout
        isOpen={isModalOpen}
        onClose={resetModal}
        title="Search and link"
        description="Use EV database search, then set price and notes."
        maxWidthClass="max-w-3xl"
      >
        <EVModelSearch onPrefill={handlePrefill} onLoadingChange={setIsPrefillLoading} />

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm text-gray-200">Brand</span>
            <input
              type="text"
              value={formModel.brand ?? ''}
              onChange={e => setFormModel(prev => ({ ...prev, brand: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400"
              placeholder="e.g. Tesla"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-200">Model name</span>
            <input
              type="text"
              value={formModel.model_name ?? ''}
              onChange={e => setFormModel(prev => ({ ...prev, model_name: e.target.value }))}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400"
              placeholder="e.g. Model 3"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-200">Price (optional)</span>
            <input
              type="text"
              value={priceInput}
              onChange={e => setPriceInput(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400"
              placeholder="e.g. €35,000"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm text-gray-200">Notes</span>
            <input
              type="text"
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-blue-400"
              placeholder="Special trim, condition, etc."
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={resetModal}
            className="rounded-lg px-4 py-2 font-semibold text-gray-200 transition hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLink}
            disabled={isSubmitting || isPrefillLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
            Confirm &amp; Link
          </button>
        </div>
      </ModalLayout>
    </div>
  );
};

export default DealerInventoryPage;
