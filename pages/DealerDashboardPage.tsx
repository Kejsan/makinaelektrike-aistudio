import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { DataContext } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { uploadDealerImage } from '../services/storage';
import type { Dealer, Model } from '../types';

interface ProfileFormState {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  city: string;
  notes: string;
  brands: string;
  languages: string;
  typeOfCars: string;
  priceRange: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  imageUrl: string;
}

interface NewModelFormState {
  brand: string;
  model_name: string;
  body_type: string;
  range_wltp: string;
  power_kw: string;
  notes: string;
  image_url: string;
}

const defaultProfileState: ProfileFormState = {
  name: '',
  contactName: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  city: '',
  notes: '',
  brands: '',
  languages: '',
  typeOfCars: '',
  priceRange: '',
  facebook: '',
  instagram: '',
  twitter: '',
  youtube: '',
  imageUrl: '',
};

const defaultModelState: NewModelFormState = {
  brand: '',
  model_name: '',
  body_type: '',
  range_wltp: '',
  power_kw: '',
  notes: '',
  image_url: '',
};

const formatList = (items?: string[]) => (items && items.length ? items.join(', ') : '');
const parseList = (value: string) =>
  value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
const parseNumericField = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const DealerDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const {
    dealers,
    models,
    getModelsForDealer,
    updateDealer,
    addModel,
    linkModelToDealer,
    unlinkModelFromDealer,
    dealerMutations,
    modelMutations,
  } = useContext(DataContext);
  const { addToast } = useToast();

  const [profileState, setProfileState] = useState<ProfileFormState>(defaultProfileState);
  const [newModelState, setNewModelState] = useState<NewModelFormState>(defaultModelState);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [creatingModel, setCreatingModel] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const dealer: Dealer | null = useMemo(() => {
    if (!user) {
      return null;
    }
    return dealers.find(entry => entry.id === user.uid) ?? null;
  }, [dealers, user]);

  const assignedModels: Model[] = useMemo(() => {
    if (!dealer) {
      return [];
    }
    return getModelsForDealer(dealer.id);
  }, [dealer, getModelsForDealer]);

  const availableModels: Model[] = useMemo(() => {
    if (!assignedModels.length) {
      return models;
    }
    const assignedIds = new Set(assignedModels.map(model => model.id));
    return models.filter(model => !assignedIds.has(model.id));
  }, [assignedModels, models]);

  useEffect(() => {
    if (!dealer) {
      setProfileState(defaultProfileState);
      return;
    }

    setProfileState({
      name: dealer.name ?? dealer.companyName ?? '',
      contactName: dealer.contactName ?? '',
      phone: dealer.phone ?? '',
      email: dealer.email ?? '',
      website: dealer.website ?? '',
      address: dealer.address ?? '',
      city: dealer.city ?? '',
      notes: dealer.notes ?? '',
      brands: formatList(dealer.brands),
      languages: formatList(dealer.languages),
      typeOfCars: dealer.typeOfCars ?? '',
      priceRange: dealer.priceRange ?? '',
      facebook: dealer.social_links?.facebook ?? '',
      instagram: dealer.social_links?.instagram ?? '',
      twitter: dealer.social_links?.twitter ?? '',
      youtube: dealer.social_links?.youtube ?? '',
      imageUrl: dealer.image_url ?? '',
    });
  }, [dealer]);

  useEffect(() => {
    if (!availableModels.find(model => model.id === selectedModelId)) {
      setSelectedModelId('');
    }
  }, [availableModels, selectedModelId]);

  const handleProfileChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setProfileState(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dealer) {
      return;
    }

    if (!profileState.name.trim()) {
      addToast('Please provide a dealership name.', 'error');
      return;
    }

    if (!profileState.address.trim() || !profileState.city.trim()) {
      addToast('Address and city are required to publish your profile.', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const socialLinks = {
        facebook: profileState.facebook.trim(),
        instagram: profileState.instagram.trim(),
        twitter: profileState.twitter.trim(),
        youtube: profileState.youtube.trim(),
      };

      const sanitizedSocialLinks = Object.fromEntries(
        Object.entries(socialLinks).filter(([, value]) => Boolean(value)),
      );

      await updateDealer(dealer.id, {
        name: profileState.name.trim(),
        companyName: profileState.name.trim(),
        contactName: profileState.contactName.trim() || undefined,
        address: profileState.address.trim(),
        city: profileState.city.trim(),
        phone: profileState.phone.trim() || undefined,
        email: profileState.email.trim() || undefined,
        website: profileState.website.trim() || undefined,
        notes: profileState.notes.trim() || undefined,
        brands: parseList(profileState.brands),
        languages: parseList(profileState.languages),
        typeOfCars: profileState.typeOfCars.trim() || dealer.typeOfCars || 'Electric Vehicles',
        priceRange: profileState.priceRange.trim() || undefined,
        image_url: profileState.imageUrl.trim() || undefined,
        social_links: Object.keys(sanitizedSocialLinks).length
          ? sanitizedSocialLinks
          : undefined,
        ownerUid: dealer.ownerUid ?? user?.uid,
      });
    } catch (error) {
      console.error('Failed to update dealer profile', error);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!dealer) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingImage(true);
    try {
      const imageUrl = await uploadDealerImage(dealer.id, file);
      setProfileState(prev => ({ ...prev, imageUrl }));
      await updateDealer(dealer.id, {
        image_url: imageUrl,
        imageGallery: Array.from(new Set([...(dealer.imageGallery ?? []), imageUrl])),
      });
    } catch (error) {
      console.error('Failed to upload dealer image', error);
      addToast('Image upload failed. Please try again.', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = async () => {
    if (!dealer) {
      return;
    }

    setProfileState(prev => ({ ...prev, imageUrl: '' }));
    try {
      const updatedGallery = (dealer.imageGallery ?? []).filter(
        url => url && url !== (dealer.image_url ?? ''),
      );
      await updateDealer(dealer.id, { image_url: '', imageGallery: updatedGallery });
    } catch (error) {
      console.error('Failed to remove dealer image', error);
    }
  };

  const handleAttachModel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dealer) {
      return;
    }

    if (!selectedModelId) {
      addToast('Select a model before attaching it to your profile.', 'error');
      return;
    }

    try {
      await linkModelToDealer(dealer.id, selectedModelId);
      setSelectedModelId('');
    } catch (error) {
      console.error('Failed to attach model', error);
    }
  };

  const handleDetachModel = async (modelId: string) => {
    if (!dealer) {
      return;
    }
    try {
      await unlinkModelFromDealer(dealer.id, modelId);
    } catch (error) {
      console.error('Failed to detach model', error);
    }
  };

  const handleNewModelChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;
    setNewModelState(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateModel = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!dealer) {
      return;
    }

    if (!newModelState.brand.trim() || !newModelState.model_name.trim()) {
      addToast('Brand and model name are required.', 'error');
      return;
    }

    setCreatingModel(true);
    try {
      const payload = {
        brand: newModelState.brand.trim(),
        model_name: newModelState.model_name.trim(),
        ownerDealerId: dealer.id,
        createdBy: user?.uid ?? dealer.ownerUid ?? dealer.id,
        body_type: newModelState.body_type.trim() || undefined,
        range_wltp: parseNumericField(newModelState.range_wltp),
        power_kw: parseNumericField(newModelState.power_kw),
        notes: newModelState.notes.trim() || undefined,
        image_url: newModelState.image_url.trim() || undefined,
      } satisfies Omit<Model, 'id'>;

      const createdModel = await addModel(payload);
      await linkModelToDealer(dealer.id, createdModel.id);
      setNewModelState(defaultModelState);
    } catch (error) {
      console.error('Failed to create and attach model', error);
    } finally {
      setCreatingModel(false);
    }
  };

  if (!dealer) {
    return (
      <div className="py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <p>Your dealer profile could not be found. Please contact support.</p>
        </div>
      </div>
    );
  }

  const isUpdatingDealer = savingProfile || dealerMutations.update.loading || uploadingImage;
  const isCreatingModel = creatingModel || modelMutations.create.loading;

  return (
    <div className="py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
        <div className="mb-10 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Dealer Dashboard</h1>
            <p className="text-gray-300">
              Manage your public dealer profile, contact information, imagery, and the models you represent.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Approved Dealer
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Contact information</h2>
                <button
                  type="submit"
                  form="dealer-profile-form"
                  className="inline-flex items-center gap-2 rounded-full bg-gray-cyan px-4 py-2 text-sm font-semibold text-gray-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isUpdatingDealer}
                >
                  {isUpdatingDealer ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  <span>Save changes</span>
                </button>
              </div>
              <form id="dealer-profile-form" className="space-y-6" onSubmit={handleProfileSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="name">
                      Dealership name
                    </label>
                    <input
                      id="name"
                      name="name"
                      value={profileState.name}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="Makina Elektrike Dealer"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="contactName">
                      Primary contact
                    </label>
                    <input
                      id="contactName"
                      name="contactName"
                      value={profileState.contactName}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="phone">
                      Phone number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={profileState.phone}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="+355 69 123 4567"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={profileState.email}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="dealer@example.com"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="website">
                      Website
                    </label>
                    <input
                      id="website"
                      name="website"
                      value={profileState.website}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="city">
                      City
                    </label>
                    <input
                      id="city"
                      name="city"
                      value={profileState.city}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="Tirana"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="address">
                      Street address
                    </label>
                    <input
                      id="address"
                      name="address"
                      value={profileState.address}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="123 Electric Ave"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="brands">
                      Brands you carry
                    </label>
                    <input
                      id="brands"
                      name="brands"
                      value={profileState.brands}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="Tesla, Hyundai, Kia"
                    />
                    <p className="mt-1 text-xs text-gray-400">Separate entries with commas.</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="languages">
                      Languages spoken
                    </label>
                    <input
                      id="languages"
                      name="languages"
                      value={profileState.languages}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="Albanian, English, Italian"
                    />
                    <p className="mt-1 text-xs text-gray-400">Separate entries with commas.</p>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="typeOfCars">
                      Vehicle focus
                    </label>
                    <input
                      id="typeOfCars"
                      name="typeOfCars"
                      value={profileState.typeOfCars}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="New EVs, Certified Pre-Owned"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="priceRange">
                      Typical price range
                    </label>
                    <input
                      id="priceRange"
                      name="priceRange"
                      value={profileState.priceRange}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="€20,000 - €60,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="notes">
                    Highlights & notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={profileState.notes}
                    onChange={handleProfileChange}
                    rows={4}
                    className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                    placeholder="Share what makes your dealership unique."
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="facebook">
                      Facebook URL
                    </label>
                    <input
                      id="facebook"
                      name="facebook"
                      value={profileState.facebook}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="https://facebook.com/your-page"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="instagram">
                      Instagram URL
                    </label>
                    <input
                      id="instagram"
                      name="instagram"
                      value={profileState.instagram}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="https://instagram.com/your-handle"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="twitter">
                      X / Twitter URL
                    </label>
                    <input
                      id="twitter"
                      name="twitter"
                      value={profileState.twitter}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="https://x.com/your-handle"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="youtube">
                      YouTube URL
                    </label>
                    <input
                      id="youtube"
                      name="youtube"
                      value={profileState.youtube}
                      onChange={handleProfileChange}
                      className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                      placeholder="https://youtube.com/@your-channel"
                    />
                  </div>
                </div>
              </form>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Models you represent</h2>
              </div>
              <div className="space-y-6">
                <form className="flex flex-col gap-4 md:flex-row" onSubmit={handleAttachModel}>
                  <select
                    className="flex-1 rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                    value={selectedModelId}
                    onChange={event => setSelectedModelId(event.target.value)}
                  >
                    <option value="">Select an existing model</option>
                    {availableModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.brand} · {model.model_name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-gray-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!selectedModelId || dealerMutations.update.loading}
                  >
                    {dealerMutations.update.loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>Attach model</span>
                  </button>
                </form>

                {assignedModels.length ? (
                  <ul className="space-y-3">
                    {assignedModels.map(model => (
                      <li
                        key={model.id}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-gray-900/60 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium">
                            {model.brand} · {model.model_name}
                          </p>
                          {model.body_type && (
                            <p className="text-sm text-gray-400">{model.body_type}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDetachModel(model.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-red-500/60 px-3 py-1 text-sm text-red-200 transition hover:bg-red-500/10"
                          disabled={dealerMutations.update.loading}
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-300">
                    No models linked yet. Attach an existing model or create a new one below to showcase the vehicles you offer.
                  </p>
                )}

                <div className="rounded-xl border border-white/10 bg-gray-900/50 p-5">
                  <h3 className="text-lg font-semibold">Add a new model</h3>
                  <p className="mt-1 text-sm text-gray-300">
                    Can&apos;t find the model you need? Create it here and we&apos;ll automatically attach it to your dealer page.
                  </p>
                  <form className="mt-4 space-y-4" onSubmit={handleCreateModel}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="brand">
                          Brand
                        </label>
                        <input
                          id="brand"
                          name="brand"
                          value={newModelState.brand}
                          onChange={handleNewModelChange}
                          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          placeholder="Brand"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="model_name">
                          Model name
                        </label>
                        <input
                          id="model_name"
                          name="model_name"
                          value={newModelState.model_name}
                          onChange={handleNewModelChange}
                          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          placeholder="Model"
                          required
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="body_type">
                          Body type
                        </label>
                        <input
                          id="body_type"
                          name="body_type"
                          value={newModelState.body_type}
                          onChange={handleNewModelChange}
                          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          placeholder="SUV, Hatchback..."
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="range_wltp">
                          Range (WLTP km)
                        </label>
                        <input
                          id="range_wltp"
                          name="range_wltp"
                          value={newModelState.range_wltp}
                          onChange={handleNewModelChange}
                          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          placeholder="480"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="power_kw">
                          Power (kW)
                        </label>
                        <input
                          id="power_kw"
                          name="power_kw"
                          value={newModelState.power_kw}
                          onChange={handleNewModelChange}
                          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          placeholder="150"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="image_url">
                          Image URL (optional)
                        </label>
                        <input
                          id="image_url"
                          name="image_url"
                          value={newModelState.image_url}
                          onChange={handleNewModelChange}
                          className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          placeholder="https://"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-200" htmlFor="notes">
                        Model notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={newModelState.notes}
                        onChange={handleNewModelChange}
                        rows={3}
                        className="w-full rounded-lg border border-white/10 bg-gray-900/60 px-4 py-2 text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                        placeholder="Charging speeds, standout features, etc."
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isCreatingModel}
                    >
                      {isCreatingModel ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      <span>Create & attach model</span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Hero imagery</h2>
              <p className="mt-2 text-sm text-gray-300">
                Upload a feature image that appears on your public dealer page. High-resolution landscape photos work best.
              </p>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-gray-900/60">
                {profileState.imageUrl ? (
                  <img
                    src={profileState.imageUrl}
                    alt={profileState.name}
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center text-sm text-gray-500">
                    No image uploaded yet
                  </div>
                )}
              </div>
              <label className="mt-4 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-cyan px-4 py-2 text-sm font-semibold text-gray-900 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                {uploadingImage ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                <span>{uploadingImage ? 'Uploading…' : 'Upload image'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </label>
              {profileState.imageUrl && (
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="mt-3 inline-flex items-center gap-2 text-sm text-gray-300 transition hover:text-white"
                  disabled={dealerMutations.update.loading}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove image
                </button>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="text-xl font-semibold">Need help?</h2>
              <p className="mt-2 text-sm text-gray-300">
                Changes go live immediately after they are saved. If you need assistance with imagery, copywriting, or have other
                questions, reach out to our support team anytime.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default DealerDashboardPage;
