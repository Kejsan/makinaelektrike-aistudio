import React, { useEffect, useRef, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { useTranslation } from 'react-i18next';
import { Dealer } from '../../types';
import { DEALERSHIP_PLACEHOLDER_IMAGE } from '../../constants/media';
import { useGoogleMapsApi } from '../../hooks/useGoogleMapsApi';

export interface DealerFormValues extends Omit<Dealer, 'id'> {
  id?: string;
  imageFile?: File | null;
  galleryFiles?: File[];
}

interface DealerFormProps {
  initialValues?: Dealer;
  onSubmit: (values: DealerFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface DealerFormState {
  name: string;
  address: string;
  city: string;
  lat: string;
  lng: string;
  phone: string;
  email: string;
  website: string;
  brands: string;
  languages: string;
  notes: string;
  typeOfCars: string;
  priceRange: string;
  image_url: string;
  modelsAvailable: string;
  socialFacebook: string;
  socialInstagram: string;
  socialTwitter: string;
  socialYoutube: string;
  isFeatured: boolean;
}

interface GalleryDraft {
  file: File;
  preview: string;
}

const defaultState: DealerFormState = {
  name: '',
  address: '',
  city: '',
  lat: '',
  lng: '',
  phone: '',
  email: '',
  website: '',
  brands: '',
  languages: '',
  notes: '',
  typeOfCars: '',
  priceRange: '',
  image_url: '',
  modelsAvailable: '',
  socialFacebook: '',
  socialInstagram: '',
  socialTwitter: '',
  socialYoutube: '',
  isFeatured: false,
};

const isValidUrl = (value: string) => {
  if (!value) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

const isValidEmail = (value: string) => {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const DealerForm: React.FC<DealerFormProps> = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const { isLoaded: isMapsApiLoaded } = useGoogleMapsApi();
  const [formState, setFormState] = useState<DealerFormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [previewFromFile, setPreviewFromFile] = useState(false);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [galleryDrafts, setGalleryDrafts] = useState<GalleryDraft[]>([]);
  const galleryDraftsRef = useRef<GalleryDraft[]>([]);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const galleryLimit = 3;

  useEffect(() => {
    if (!initialValues) {
      setFormState(defaultState);
      setImageFile(null);
      setImagePreview('');
      setPreviewFromFile(false);
      setExistingGallery([]);
      setGalleryDrafts(previousDrafts => {
        previousDrafts.forEach(draft => URL.revokeObjectURL(draft.preview));
        return [];
      });
      return;
    }

    setFormState({
      name: initialValues.name ?? '',
      address: initialValues.address ?? '',
      city: initialValues.city ?? '',
      lat: initialValues.lat !== undefined ? String(initialValues.lat) : '',
      lng: initialValues.lng !== undefined ? String(initialValues.lng) : '',
      phone: initialValues.phone ?? '',
      email: initialValues.email ?? '',
      website: initialValues.website ?? '',
      brands: initialValues.brands?.join(', ') ?? '',
      languages: initialValues.languages?.join(', ') ?? '',
      notes: initialValues.notes ?? '',
      typeOfCars: initialValues.typeOfCars ?? '',
      priceRange: initialValues.priceRange ?? '',
      image_url: initialValues.image_url ?? '',
      modelsAvailable: initialValues.modelsAvailable?.join(', ') ?? '',
      socialFacebook: initialValues.social_links?.facebook ?? '',
      socialInstagram: initialValues.social_links?.instagram ?? '',
      socialTwitter: initialValues.social_links?.twitter ?? '',
      socialYoutube: initialValues.social_links?.youtube ?? '',
      isFeatured: Boolean(initialValues.isFeatured),
    });
    setImageFile(null);
    setImagePreview(initialValues.image_url ?? '');
    setPreviewFromFile(false);
    const sanitizedGallery = (initialValues.imageGallery ?? []).filter(Boolean);
    setExistingGallery([...sanitizedGallery]);
    setGalleryDrafts(previousDrafts => {
      previousDrafts.forEach(draft => URL.revokeObjectURL(draft.preview));
      return [];
    });
  }, [initialValues]);

  useEffect(() => {
    if (imageFile) {
      return;
    }
    setImagePreview(formState.image_url.trim());
    setPreviewFromFile(false);
  }, [formState.image_url, imageFile]);

  useEffect(
    () => () => {
      if (previewFromFile && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    },
    [imagePreview, previewFromFile],
  );

  useEffect(() => {
    galleryDraftsRef.current = galleryDrafts;
  }, [galleryDrafts]);

  useEffect(
    () => () => {
      galleryDraftsRef.current.forEach(draft => URL.revokeObjectURL(draft.preview));
    },
    [],
  );

  const clearFieldError = (field: keyof DealerFormState) => {
    setErrors(prev => {
      if (!prev[field]) {
        return prev;
      }
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleAddressInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setFormState(prev => ({
      ...prev,
      address: value,
      ...(value.trim() ? {} : { lat: '', lng: '' }),
    }));
    clearFieldError('address');
  };

  const handlePlaceChanged = () => {
    const autocomplete = autocompleteRef.current;
    if (!autocomplete) {
      return;
    }

    const place = autocomplete.getPlace();
    if (!place) {
      return;
    }

    const pickAddressComponent = (types: string[]) =>
      place.address_components?.find(component => component.types.some(type => types.includes(type)))?.long_name;

    const formattedAddress = place.formatted_address ?? place.name ?? '';
    const location = place.geometry?.location;
    const lat = location?.lat();
    const lng = location?.lng();
    const derivedCity =
      pickAddressComponent(['locality']) ??
      pickAddressComponent(['postal_town']) ??
      pickAddressComponent(['administrative_area_level_2']) ??
      pickAddressComponent(['administrative_area_level_1']);

    setFormState(prev => ({
      ...prev,
      address: formattedAddress || prev.address,
      city: derivedCity ?? prev.city,
      lat: lat !== undefined ? lat.toString() : prev.lat,
      lng: lng !== undefined ? lng.toString() : prev.lng,
    }));

    clearFieldError('address');
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (previewFromFile && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    const nextPreview = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreview(nextPreview);
    setPreviewFromFile(true);
  };

  const handleImageClear = () => {
    if (previewFromFile && imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(null);
    const trimmedUrl = formState.image_url.trim();
    setImagePreview(trimmedUrl);
    setPreviewFromFile(false);
  };

  const handleGalleryFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) {
      return;
    }

    const availableSlots = Math.max(0, galleryLimit - (existingGallery.length + galleryDrafts.length));
    if (availableSlots <= 0) {
      event.target.value = '';
      return;
    }

    const selectedFiles = files.slice(0, availableSlots);
    const drafts = selectedFiles.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setGalleryDrafts(prev => [...prev, ...drafts]);
    event.target.value = '';
  };

  const handleGalleryDraftRemove = (index: number) => {
    setGalleryDrafts(prev => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const handleExistingGalleryRemove = (url: string) => {
    setExistingGallery(prev => prev.filter(item => item !== url));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formState.name.trim()) {
      nextErrors.name = `${t('admin.name')} ${t('admin.required', { defaultValue: 'is required' })}`;
    }

    if (!formState.address.trim()) {
      nextErrors.address = `${t('dealerDetails.address', { defaultValue: 'Address' })} ${t('admin.required', { defaultValue: 'is required' })}`;
    }

    if (!formState.city.trim()) {
      nextErrors.city = `${t('admin.city')} ${t('admin.required', { defaultValue: 'is required' })}`;
    }

    if (!isValidUrl(formState.website)) {
      nextErrors.website = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    if (!isValidUrl(formState.image_url)) {
      nextErrors.image_url = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    if (!isValidEmail(formState.email)) {
      nextErrors.email = t('admin.invalidEmail', { defaultValue: 'Enter a valid email' });
    }

    if (!isValidUrl(formState.socialFacebook)) {
      nextErrors.socialFacebook = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    if (!isValidUrl(formState.socialInstagram)) {
      nextErrors.socialInstagram = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    if (!isValidUrl(formState.socialTwitter)) {
      nextErrors.socialTwitter = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    if (!isValidUrl(formState.socialYoutube)) {
      nextErrors.socialYoutube = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const parseList = (value: string) =>
      value
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

    const latValue = formState.lat.trim();
    const lngValue = formState.lng.trim();
    const latNumber = Number(latValue);
    const lngNumber = Number(lngValue);
    const payload: DealerFormValues = {
      name: formState.name.trim(),
      address: formState.address.trim(),
      city: formState.city.trim(),
      lat: Number.isFinite(latNumber) ? latNumber : 0,
      lng: Number.isFinite(lngNumber) ? lngNumber : 0,
      brands: parseList(formState.brands),
      languages: parseList(formState.languages),
      typeOfCars: formState.typeOfCars.trim() || 'Unknown',
      modelsAvailable: parseList(formState.modelsAvailable),
      isFeatured: formState.isFeatured,
    };

    if (initialValues?.id) {
      payload.id = initialValues.id;
    }

    const phone = formState.phone.trim();
    if (phone) {
      payload.phone = phone;
    }

    const email = formState.email.trim();
    if (email) {
      payload.email = email;
    }

    const website = formState.website.trim();
    if (website) {
      payload.website = website;
    }

    const notes = formState.notes.trim();
    if (notes) {
      payload.notes = notes;
    }

    const priceRange = formState.priceRange.trim();
    if (priceRange) {
      payload.priceRange = priceRange;
    }

    const imageUrl = formState.image_url.trim();
    if (imageUrl) {
      payload.image_url = imageUrl;
    }

    const socialLinks: NonNullable<DealerFormValues['social_links']> = {};
    const facebook = formState.socialFacebook.trim();
    if (facebook) {
      socialLinks.facebook = facebook;
    }
    const instagram = formState.socialInstagram.trim();
    if (instagram) {
      socialLinks.instagram = instagram;
    }
    const twitter = formState.socialTwitter.trim();
    if (twitter) {
      socialLinks.twitter = twitter;
    }
    const youtube = formState.socialYoutube.trim();
    if (youtube) {
      socialLinks.youtube = youtube;
    }

    if (Object.keys(socialLinks).length > 0) {
      payload.social_links = socialLinks;
    }

    if (imageFile) {
      payload.imageFile = imageFile;
    }

    payload.imageGallery = existingGallery.filter(Boolean).slice(0, galleryLimit);
    if (galleryDrafts.length > 0) {
      payload.galleryFiles = galleryDrafts.map(draft => draft.file);
    }

    await onSubmit(payload);
  };

  const renderInput = (
    label: string,
    name: keyof DealerFormState,
    type: string = 'text',
    placeholder?: string,
    options?: { isTextArea?: boolean; rows?: number }
  ) => {
    const error = errors[name as string];
    const commonProps = {
      name,
      value: formState[name],
      onChange: handleChange,
      placeholder,
      className:
        'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-cyan',
    } as const;

    return (
      <label className="block text-sm text-gray-300">
        <span className="mb-1 inline-block font-medium">{label}</span>
        {options?.isTextArea ? (
          <textarea rows={options.rows ?? 4} {...commonProps} />
        ) : (
          <input type={type} {...commonProps} />
        )}
        {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
      </label>
    );
  };

  const currentGalleryCount = existingGallery.length + galleryDrafts.length;
  const availableGallerySlots = Math.max(0, galleryLimit - currentGalleryCount);
  const galleryUploadDisabled = availableGallerySlots <= 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderInput(t('admin.name'), 'name')}
        {renderInput(t('admin.city'), 'city')}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-300">
            <span className="mb-1 inline-block font-medium">
              {t('dealerDetails.address', { defaultValue: 'Address' })}
            </span>
            {isMapsApiLoaded ? (
              <Autocomplete
                onLoad={instance => {
                  autocompleteRef.current = instance;
                }}
                onUnmount={() => {
                  autocompleteRef.current = null;
                }}
                onPlaceChanged={handlePlaceChanged}
                fields={['geometry.location', 'formatted_address', 'address_components', 'name']}
                className="block"
              >
                <input
                  type="text"
                  value={formState.address}
                  onChange={handleAddressInputChange}
                  placeholder={t('admin.searchAddressPlaceholder', { defaultValue: 'Search for an address' })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                />
              </Autocomplete>
            ) : (
              <input
                type="text"
                value={formState.address}
                onChange={handleAddressInputChange}
                placeholder={t('admin.searchAddressPlaceholder', { defaultValue: 'Search for an address' })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
              />
            )}
            {errors.address && <span className="mt-1 block text-xs text-red-400">{errors.address}</span>}
            {formState.lat && formState.lng && (
              <span className="mt-2 block text-xs text-gray-400">
                {t('admin.locationCoordinates', {
                  defaultValue: 'Coordinates: {{lat}}, {{lng}}',
                  lat: formState.lat,
                  lng: formState.lng,
                })}
              </span>
            )}
          </label>
        </div>
        {renderInput(t('admin.fields.typeOfCars'), 'typeOfCars')}
        {renderInput(t('admin.fields.priceRange'), 'priceRange')}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderInput(t('dealerDetails.phone', { defaultValue: 'Phone' }), 'phone')}
        {renderInput(t('dealerDetails.email', { defaultValue: 'Email' }), 'email')}
        {renderInput(t('dealerDetails.website', { defaultValue: 'Website' }), 'website')}
        {renderInput(t('admin.fields.imageUrl'), 'image_url')}
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.uploadDealerImageLabel', { defaultValue: 'Upload dealer image' })}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={imagePreview || DEALERSHIP_PLACEHOLDER_IMAGE}
            alt={formState.name || t('admin.uploadDealerImagePreviewAlt', { defaultValue: 'Dealer image preview' })}
            className="h-24 w-32 rounded-lg border border-white/10 object-cover bg-gray-900/60"
          />
          <div className="flex flex-col gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-cyan px-4 py-2 text-sm font-semibold text-gray-900 transition hover:opacity-90">
              <span>{t('admin.uploadImage', { defaultValue: 'Upload image' })}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
            </label>
            {(imageFile || previewFromFile) && (
              <button
                type="button"
                onClick={handleImageClear}
                className="text-left text-xs text-gray-300 transition hover:text-white"
              >
                {t('admin.removeImage', { defaultValue: 'Remove selected image' })}
              </button>
            )}
            <p className="text-xs text-gray-400">
              {t('admin.imageUploadHint', { defaultValue: 'JPEG or PNG recommended, up to 5MB.' })}
            </p>
          </div>
        </div>
      </div>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.uploadDealerImageLabel', { defaultValue: 'Upload dealer image' })}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={imagePreview || DEALERSHIP_PLACEHOLDER_IMAGE}
            alt={formState.name || t('admin.uploadDealerImagePreviewAlt', { defaultValue: 'Dealer image preview' })}
            className="h-24 w-32 rounded-lg border border-white/10 object-cover bg-gray-900/60"
          />
          <div className="flex flex-col gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-cyan px-4 py-2 text-sm font-semibold text-gray-900 transition hover:opacity-90">
              <span>{t('admin.uploadImage', { defaultValue: 'Upload image' })}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
            </label>
            {(imageFile || previewFromFile) && (
              <button
                type="button"
                onClick={handleImageClear}
                className="text-left text-xs text-gray-300 transition hover:text-white"
              >
                {t('admin.removeImage', { defaultValue: 'Remove selected image' })}
              </button>
            )}
            <p className="text-xs text-gray-400">
              {t('admin.imageUploadHint', { defaultValue: 'JPEG or PNG recommended, up to 5MB.' })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.uploadDealerImageLabel', { defaultValue: 'Upload dealer image' })}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={imagePreview || DEALERSHIP_PLACEHOLDER_IMAGE}
            alt={formState.name || t('admin.uploadDealerImagePreviewAlt', { defaultValue: 'Dealer image preview' })}
            className="h-24 w-32 rounded-lg border border-white/10 object-cover bg-gray-900/60"
          />
          <div className="flex flex-col gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-cyan px-4 py-2 text-sm font-semibold text-gray-900 transition hover:opacity-90">
              <span>{t('admin.uploadImage', { defaultValue: 'Upload image' })}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
            </label>
            {(imageFile || previewFromFile) && (
              <button
                type="button"
                onClick={handleImageClear}
                className="text-left text-xs text-gray-300 transition hover:text-white"
              >
                {t('admin.removeImage', { defaultValue: 'Remove selected image' })}
              </button>
            )}
            <p className="text-xs text-gray-400">
              {t('admin.imageUploadHint', { defaultValue: 'JPEG or PNG recommended, up to 5MB.' })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.uploadDealerImageLabel', { defaultValue: 'Upload dealer image' })}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={imagePreview || DEALERSHIP_PLACEHOLDER_IMAGE}
            alt={formState.name || t('admin.uploadDealerImagePreviewAlt', { defaultValue: 'Dealer image preview' })}
            className="h-24 w-32 rounded-lg border border-white/10 object-cover bg-gray-900/60"
          />
          <div className="flex flex-col gap-2">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-gray-cyan px-4 py-2 text-sm font-semibold text-gray-900 transition hover:opacity-90">
              <span>{t('admin.uploadImage', { defaultValue: 'Upload image' })}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
            </label>
            {(imageFile || previewFromFile) && (
              <button
                type="button"
                onClick={handleImageClear}
                className="text-left text-xs text-gray-300 transition hover:text-white"
              >
                {t('admin.removeImage', { defaultValue: 'Remove selected image' })}
              </button>
            )}
            <p className="text-xs text-gray-400">
              {t('admin.imageUploadHint', { defaultValue: 'JPEG or PNG recommended, up to 5MB.' })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {renderInput(t('admin.brands'), 'brands', 'text', 'BYD, Tesla')}
        {renderInput(t('dealerDetails.languagesSpoken', { defaultValue: 'Languages' }), 'languages', 'text', 'Albanian, English')}
        {renderInput(t('admin.fields.modelsAvailable'), 'modelsAvailable', 'text', 'Model A, Model B')}
      </div>

      {renderInput(t('dealerDetails.notes', { defaultValue: 'Notes' }), 'notes', 'text', undefined, { isTextArea: true, rows: 4 })}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderInput(t('admin.fields.facebookUrl'), 'socialFacebook')}
        {renderInput(t('admin.fields.instagramUrl'), 'socialInstagram')}
        {renderInput(t('admin.fields.twitterUrl'), 'socialTwitter')}
        {renderInput(t('admin.fields.youtubeUrl'), 'socialYoutube')}
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.dealerGalleryLabel', { defaultValue: 'Gallery images (up to 3)' })}
        </span>
        <p className="text-xs text-gray-400">
          {t('admin.dealerGalleryHelp', {
            defaultValue: 'Add extra photos to highlight your showroom. These appear below the available models section.',
          })}
        </p>
        <div className="flex flex-wrap gap-4">
          {existingGallery.map(url => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={t('admin.dealerGalleryPreviewAlt', {
                  defaultValue: 'Dealer gallery image',
                })}
                className="h-24 w-32 rounded-lg border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={() => handleExistingGalleryRemove(url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-black/80"
              >
                {t('admin.removeImage', { defaultValue: 'Remove' })}
              </button>
            </div>
          ))}
          {galleryDrafts.map((draft, index) => (
            <div key={draft.preview} className="relative">
              <img
                src={draft.preview}
                alt={t('admin.dealerGalleryPreviewAlt', {
                  defaultValue: 'Dealer gallery image preview',
                })}
                className="h-24 w-32 rounded-lg border border-dashed border-white/20 object-cover"
              />
              <button
                type="button"
                onClick={() => handleGalleryDraftRemove(index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-black/80"
              >
                {t('admin.removeImage', { defaultValue: 'Remove' })}
              </button>
            </div>
          ))}
          {existingGallery.length === 0 && galleryDrafts.length === 0 && (
            <p className="text-sm text-gray-400">
              {t('admin.dealerGalleryEmpty', { defaultValue: 'No gallery images added yet.' })}
            </p>
          )}
        </div>
        <label
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            galleryUploadDisabled
              ? 'cursor-not-allowed border border-white/10 bg-white/5 text-gray-400'
              : 'bg-gray-cyan text-gray-900 hover:opacity-90'
          }`}
        >
          <span>
            {galleryUploadDisabled
              ? t('admin.dealerGalleryLimitReached', { defaultValue: 'Gallery limit reached' })
              : t('admin.uploadImage', { defaultValue: 'Upload image' })}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryFileChange}
            disabled={galleryUploadDisabled}
          />
        </label>
        <p className="text-xs text-gray-400">
          {t('admin.dealerGalleryHint', {
            defaultValue: 'JPEG or PNG recommended. Maximum of 3 gallery images.',
          })}
        </p>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.dealerGalleryLabel', { defaultValue: 'Gallery images (up to 3)' })}
        </span>
        <p className="text-xs text-gray-400">
          {t('admin.dealerGalleryHelp', {
            defaultValue: 'Add extra photos to highlight your showroom. These appear below the available models section.',
          })}
        </p>
        <div className="flex flex-wrap gap-4">
          {existingGallery.map(url => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={t('admin.dealerGalleryPreviewAlt', {
                  defaultValue: 'Dealer gallery image',
                })}
                className="h-24 w-32 rounded-lg border border-white/10 object-cover"
              />
              <button
                type="button"
                onClick={() => handleExistingGalleryRemove(url)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-black/80"
              >
                {t('admin.removeImage', { defaultValue: 'Remove' })}
              </button>
            </div>
          ))}
          {galleryDrafts.map((draft, index) => (
            <div key={draft.preview} className="relative">
              <img
                src={draft.preview}
                alt={t('admin.dealerGalleryPreviewAlt', {
                  defaultValue: 'Dealer gallery image preview',
                })}
                className="h-24 w-32 rounded-lg border border-dashed border-white/20 object-cover"
              />
              <button
                type="button"
                onClick={() => handleGalleryDraftRemove(index)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-black/80"
              >
                {t('admin.removeImage', { defaultValue: 'Remove' })}
              </button>
            </div>
          ))}
          {existingGallery.length === 0 && galleryDrafts.length === 0 && (
            <p className="text-sm text-gray-400">
              {t('admin.dealerGalleryEmpty', { defaultValue: 'No gallery images added yet.' })}
            </p>
          )}
        </div>
        <label
          className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
            galleryUploadDisabled
              ? 'cursor-not-allowed border border-white/10 bg-white/5 text-gray-400'
              : 'bg-gray-cyan text-gray-900 hover:opacity-90'
          }`}
        >
          <span>
            {galleryUploadDisabled
              ? t('admin.dealerGalleryLimitReached', { defaultValue: 'Gallery limit reached' })
              : t('admin.uploadImage', { defaultValue: 'Upload image' })}
          </span>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleGalleryFileChange}
            disabled={galleryUploadDisabled}
          />
        </label>
        <p className="text-xs text-gray-400">
          {t('admin.dealerGalleryHint', {
            defaultValue: 'JPEG or PNG recommended. Maximum of 3 gallery images.',
          })}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <input
          id="dealer-featured"
          name="isFeatured"
          type="checkbox"
          checked={formState.isFeatured}
          onChange={handleChange}
          className="h-4 w-4 rounded border-white/20 bg-gray-900 text-gray-cyan focus:ring-gray-cyan"
        />
        <label htmlFor="dealer-featured" className="text-sm text-gray-200">
          {t('admin.featured')}
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:bg-white/10"
        >
          {t('admin.cancel')}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? `${t('admin.save')}...` : t('admin.save')}
        </button>
      </div>
    </form>
  );
};

export default DealerForm;
