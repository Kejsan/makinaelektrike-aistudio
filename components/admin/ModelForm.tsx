import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Model } from '../../types';
import { MODEL_PLACEHOLDER_IMAGE } from '../../constants/media';
import EVModelSearch from './EVModelSearch';

export interface ModelFormValues extends Omit<Model, 'id'> {
  id?: string;
  imageFile?: File | null;
  galleryFiles?: File[];
}

interface ModelFormProps {
  initialValues?: Model;
  onSubmit: (values: ModelFormValues) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

interface ModelFormState {
  brand: string;
  model_name: string;
  year_start: string;
  body_type: string;
  battery_capacity: string;
  battery_useable_capacity: string;
  battery_type: string;
  battery_voltage: string;
  range_wltp: string;
  power_kw: string;
  torque_nm: string;
  acceleration_0_100: string;
  top_speed: string;
  drive_type: string;
  seats: string;
  charging_ac: string;
  charging_dc: string;
  notes: string;
  image_url: string;
  isFeatured: boolean;
}

interface GalleryDraft {
  file: File;
  preview: string;
}

const defaultState: ModelFormState = {
  brand: '',
  model_name: '',
  year_start: '',
  body_type: '',
  battery_capacity: '',
  battery_useable_capacity: '',
  battery_type: '',
  battery_voltage: '',
  range_wltp: '',
  power_kw: '',
  torque_nm: '',
  acceleration_0_100: '',
  top_speed: '',
  drive_type: '',
  seats: '',
  charging_ac: '',
  charging_dc: '',
  notes: '',
  image_url: '',
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

const parseNumber = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const parseInteger = (value: string) => {
  if (!value.trim()) return undefined;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const ModelForm: React.FC<ModelFormProps> = ({ initialValues, onSubmit, onCancel, isSubmitting }) => {
  const { t } = useTranslation();
  const [formState, setFormState] = useState<ModelFormState>(defaultState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [previewFromFile, setPreviewFromFile] = useState(false);
  const [existingGallery, setExistingGallery] = useState<string[]>([]);
  const [galleryDrafts, setGalleryDrafts] = useState<GalleryDraft[]>([]);
  const [isPrefillLoading, setIsPrefillLoading] = useState(false);
  const [hasUsedPrefill, setHasUsedPrefill] = useState(false);
  const galleryDraftsRef = useRef<GalleryDraft[]>([]);

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
      setHasUsedPrefill(false);
      return;
    }

    setFormState({
      brand: initialValues.brand ?? '',
      model_name: initialValues.model_name ?? '',
      year_start: initialValues.year_start !== undefined && initialValues.year_start !== null ? String(initialValues.year_start) : '',
      body_type: initialValues.body_type ?? '',
      battery_capacity: initialValues.battery_capacity !== undefined && initialValues.battery_capacity !== null ? String(initialValues.battery_capacity) : '',
      battery_useable_capacity:
        initialValues.battery_useable_capacity !== undefined && initialValues.battery_useable_capacity !== null
          ? String(initialValues.battery_useable_capacity)
          : '',
      battery_type: initialValues.battery_type ?? '',
      battery_voltage:
        initialValues.battery_voltage !== undefined && initialValues.battery_voltage !== null
          ? String(initialValues.battery_voltage)
          : '',
      range_wltp: initialValues.range_wltp !== undefined && initialValues.range_wltp !== null ? String(initialValues.range_wltp) : '',
      power_kw: initialValues.power_kw !== undefined && initialValues.power_kw !== null ? String(initialValues.power_kw) : '',
      torque_nm: initialValues.torque_nm !== undefined && initialValues.torque_nm !== null ? String(initialValues.torque_nm) : '',
      acceleration_0_100: initialValues.acceleration_0_100 !== undefined && initialValues.acceleration_0_100 !== null ? String(initialValues.acceleration_0_100) : '',
      top_speed: initialValues.top_speed !== undefined && initialValues.top_speed !== null ? String(initialValues.top_speed) : '',
      drive_type: initialValues.drive_type ?? '',
      seats: initialValues.seats !== undefined && initialValues.seats !== null ? String(initialValues.seats) : '',
      charging_ac: initialValues.charging_ac ?? '',
      charging_dc: initialValues.charging_dc ?? '',
      notes: initialValues.notes ?? '',
      image_url: initialValues.image_url ?? '',
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
    setHasUsedPrefill(false);
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

  const handlePrefill = (model: Model) => {
    setFormState(prev => ({
      ...prev,
      brand: model.brand ?? prev.brand,
      model_name: model.model_name ?? prev.model_name,
      year_start: model.year_start !== undefined && model.year_start !== null ? String(model.year_start) : prev.year_start,
      body_type: model.body_type ?? prev.body_type,
      battery_capacity:
        model.battery_capacity !== undefined && model.battery_capacity !== null
          ? String(model.battery_capacity)
          : prev.battery_capacity,
      battery_useable_capacity:
        model.battery_useable_capacity !== undefined && model.battery_useable_capacity !== null
          ? String(model.battery_useable_capacity)
          : prev.battery_useable_capacity,
      battery_type: model.battery_type ?? prev.battery_type,
      battery_voltage:
        model.battery_voltage !== undefined && model.battery_voltage !== null
          ? String(model.battery_voltage)
          : prev.battery_voltage,
      range_wltp:
        model.range_wltp !== undefined && model.range_wltp !== null ? String(model.range_wltp) : prev.range_wltp,
      power_kw: model.power_kw !== undefined && model.power_kw !== null ? String(model.power_kw) : prev.power_kw,
      torque_nm: model.torque_nm !== undefined && model.torque_nm !== null ? String(model.torque_nm) : prev.torque_nm,
      acceleration_0_100:
        model.acceleration_0_100 !== undefined && model.acceleration_0_100 !== null
          ? String(model.acceleration_0_100)
          : prev.acceleration_0_100,
      top_speed: model.top_speed !== undefined && model.top_speed !== null ? String(model.top_speed) : prev.top_speed,
      drive_type: model.drive_type ?? prev.drive_type,
      seats: model.seats !== undefined && model.seats !== null ? String(model.seats) : prev.seats,
      charging_ac: model.charging_ac ?? prev.charging_ac,
      charging_dc: model.charging_dc ?? prev.charging_dc,
      notes: model.notes ?? prev.notes,
      image_url: model.image_url ?? prev.image_url,
      isFeatured: model.isFeatured ?? prev.isFeatured,
    }));

    if (model.image_url) {
      setImageFile(null);
      setImagePreview(model.image_url);
      setPreviewFromFile(false);
    }

    if (model.imageGallery?.length) {
      const sanitizedGallery = model.imageGallery.filter(Boolean).slice(0, galleryLimit);
      setExistingGallery(sanitizedGallery);
      setGalleryDrafts(previousDrafts => {
        previousDrafts.forEach(draft => URL.revokeObjectURL(draft.preview));
        return [];
      });
    }

    setHasUsedPrefill(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    const isNewModel = !initialValues;

    if (!formState.brand.trim()) {
      nextErrors.brand = `${t('admin.brand')} ${t('admin.required', { defaultValue: 'is required' })}`;
    }

    if (!formState.model_name.trim()) {
      nextErrors.model_name = `${t('admin.name')} ${t('admin.required', { defaultValue: 'is required' })}`;
    }

    if (isNewModel) {
      if (!formState.year_start.trim()) {
        nextErrors.year_start = `${t('admin.fields.yearStart', { defaultValue: 'Production start year' })} ${t('admin.requiredNew', { defaultValue: 'is required for new models' })}`;
      }

      if (!formState.battery_useable_capacity.trim()) {
        nextErrors.battery_useable_capacity = `${t('admin.fields.batteryUsableCapacity', { defaultValue: 'Usable battery capacity' })} ${t('admin.requiredNew', { defaultValue: 'is required for new models' })}`;
      }

      if (!formState.battery_type.trim()) {
        nextErrors.battery_type = `${t('admin.fields.batteryType', { defaultValue: 'Battery type' })} ${t('admin.requiredNew', { defaultValue: 'is required for new models' })}`;
      }

      if (!formState.battery_voltage.trim()) {
        nextErrors.battery_voltage = `${t('admin.fields.batteryVoltage', { defaultValue: 'Battery voltage' })} ${t('admin.requiredNew', { defaultValue: 'is required for new models' })}`;
      }

      if (!formState.image_url.trim() && !imageFile) {
        nextErrors.image_url = t('admin.mediaRequired', { defaultValue: 'Add at least one image URL or upload a cover image.' });
      }
    }

    const numericFields: Array<[keyof ModelFormState, string]> = [
      ['year_start', t('admin.fields.yearStart', { defaultValue: 'Production start year' })],
      ['battery_capacity', t('admin.fields.batteryCapacity', { defaultValue: 'Battery (kWh)' })],
      ['battery_useable_capacity', t('admin.fields.batteryUsableCapacity', { defaultValue: 'Usable battery capacity' })],
      ['battery_voltage', t('admin.fields.batteryVoltage', { defaultValue: 'Battery voltage' })],
      ['range_wltp', t('admin.fields.rangeWltp', { defaultValue: 'Range (WLTP)' })],
      ['power_kw', t('admin.fields.powerKw', { defaultValue: 'Power (kW)' })],
      ['torque_nm', t('admin.fields.torqueNm', { defaultValue: 'Torque (Nm)' })],
      ['acceleration_0_100', t('admin.fields.acceleration', { defaultValue: '0-100 km/h (s)' })],
      ['top_speed', t('admin.fields.topSpeed', { defaultValue: 'Top speed (km/h)' })],
    ];

    numericFields.forEach(([key, label]) => {
      const value = formState[key];
      if (value.trim() && Number.isNaN(Number(value))) {
        nextErrors[key] = `${label} ${t('admin.invalidNumber', { defaultValue: 'must be numeric' })}`;
      }
    });

    if (formState.seats.trim() && Number.isNaN(Number(formState.seats))) {
      nextErrors.seats = `${t('modelDetails.seats', { defaultValue: 'Seats' })} ${t('admin.invalidNumber', { defaultValue: 'must be numeric' })}`;
    }

    if (!isValidUrl(formState.image_url)) {
      nextErrors.image_url = t('admin.invalidUrl', { defaultValue: 'Enter a valid URL' });
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    const brand = formState.brand.trim();
    const modelName = formState.model_name.trim();
    const payload: ModelFormValues = {
      brand,
      model_name: modelName,
      isFeatured: formState.isFeatured,
    };

    if (initialValues?.id) {
      payload.id = initialValues.id;
    }

    const bodyType = formState.body_type.trim();
    if (bodyType) {
      payload.body_type = bodyType;
    }

    const yearStart = parseInteger(formState.year_start);
    if (yearStart !== undefined) {
      payload.year_start = yearStart;
    }

    const batteryCapacity = parseNumber(formState.battery_capacity);
    if (batteryCapacity !== undefined) {
      payload.battery_capacity = batteryCapacity;
    }

    const batteryUseableCapacity = parseNumber(formState.battery_useable_capacity);
    if (batteryUseableCapacity !== undefined) {
      payload.battery_useable_capacity = batteryUseableCapacity;
    }

    const batteryType = formState.battery_type.trim();
    if (batteryType) {
      payload.battery_type = batteryType;
    }

    const batteryVoltage = parseNumber(formState.battery_voltage);
    if (batteryVoltage !== undefined) {
      payload.battery_voltage = batteryVoltage;
    }

    const rangeWltp = parseNumber(formState.range_wltp);
    if (rangeWltp !== undefined) {
      payload.range_wltp = rangeWltp;
    }

    const powerKw = parseNumber(formState.power_kw);
    if (powerKw !== undefined) {
      payload.power_kw = powerKw;
    }

    const torqueNm = parseNumber(formState.torque_nm);
    if (torqueNm !== undefined) {
      payload.torque_nm = torqueNm;
    }

    const acceleration = parseNumber(formState.acceleration_0_100);
    if (acceleration !== undefined) {
      payload.acceleration_0_100 = acceleration;
    }

    const topSpeed = parseNumber(formState.top_speed);
    if (topSpeed !== undefined) {
      payload.top_speed = topSpeed;
    }

    const driveType = formState.drive_type.trim();
    if (driveType) {
      payload.drive_type = driveType;
    }

    const seats = parseInteger(formState.seats);
    if (seats !== undefined) {
      payload.seats = seats;
    }

    const chargingAc = formState.charging_ac.trim();
    if (chargingAc) {
      payload.charging_ac = chargingAc;
    }

    const chargingDc = formState.charging_dc.trim();
    if (chargingDc) {
      payload.charging_dc = chargingDc;
    }

    const notes = formState.notes.trim();
    if (notes) {
      payload.notes = notes;
    }

    const imageUrl = formState.image_url.trim();
    if (imageUrl) {
      payload.image_url = imageUrl;
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
    name: keyof ModelFormState,
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
    <div className="space-y-6">
      <EVModelSearch
        onPrefill={handlePrefill}
        onLoadingChange={setIsPrefillLoading}
        isPrefillUsed={hasUsedPrefill}
      />
      <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderInput(t('admin.brand'), 'brand')}
        {renderInput(t('admin.name'), 'model_name')}
        {renderInput(t('admin.fields.yearStart', { defaultValue: 'Production start year' }), 'year_start')}
        {renderInput(t('modelsPage.bodyType', { defaultValue: 'Body Type' }), 'body_type')}
        {renderInput(t('admin.fields.driveType'), 'drive_type')}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {renderInput(t('admin.fields.batteryCapacity'), 'battery_capacity')}
        {renderInput(t('admin.fields.batteryUsableCapacity', { defaultValue: 'Usable battery capacity' }), 'battery_useable_capacity')}
        {renderInput(t('admin.fields.batteryType', { defaultValue: 'Battery type' }), 'battery_type')}
        {renderInput(t('admin.fields.batteryVoltage', { defaultValue: 'Battery voltage' }), 'battery_voltage')}
        {renderInput(t('admin.fields.rangeWltp'), 'range_wltp')}
        {renderInput(t('admin.fields.powerKw'), 'power_kw')}
        {renderInput(t('admin.fields.torqueNm'), 'torque_nm')}
        {renderInput(t('admin.fields.acceleration'), 'acceleration_0_100')}
        {renderInput(t('admin.fields.topSpeed'), 'top_speed')}
        {renderInput(t('modelDetails.seats', { defaultValue: 'Seats' }), 'seats')}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderInput(t('admin.fields.chargingAc'), 'charging_ac')}
        {renderInput(t('admin.fields.chargingDc'), 'charging_dc')}
      </div>

      {renderInput(t('modelDetails.notes', { defaultValue: 'Notes' }), 'notes', 'text', undefined, { isTextArea: true, rows: 4 })}

      {renderInput(t('admin.fields.imageUrl'), 'image_url')}

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.uploadModelImageLabel', { defaultValue: 'Upload model image' })}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={imagePreview || MODEL_PLACEHOLDER_IMAGE}
            alt={`${formState.brand || 'Model'} preview`}
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
          {t('admin.modelGalleryLabel', { defaultValue: 'Gallery images (up to 3)' })}
        </span>
        <p className="text-xs text-gray-400">
          {t('admin.modelGalleryHelp', {
            defaultValue: 'Add supporting shots for this EV. They appear below the dealer availability section on the public page.',
          })}
        </p>
        <div className="flex flex-wrap gap-4">
          {existingGallery.map(url => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={t('admin.modelGalleryPreviewAlt', { defaultValue: 'Model gallery image' })}
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
                alt={t('admin.modelGalleryPreviewAlt', { defaultValue: 'Model gallery image preview' })}
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
              {t('admin.modelGalleryEmpty', { defaultValue: 'No gallery images added yet.' })}
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
              ? t('admin.modelGalleryLimitReached', { defaultValue: 'Gallery limit reached' })
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
          {t('admin.modelGalleryHint', {
            defaultValue: 'JPEG or PNG recommended. Maximum of 3 gallery images.',
          })}
        </p>
      </div>

      <div className="space-y-3">
        <span className="block text-sm font-medium text-gray-300">
          {t('admin.uploadModelImageLabel', { defaultValue: 'Upload model image' })}
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <img
            src={imagePreview || MODEL_PLACEHOLDER_IMAGE}
            alt={`${formState.brand || 'Model'} preview`}
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
          {t('admin.modelGalleryLabel', { defaultValue: 'Gallery images (up to 3)' })}
        </span>
        <p className="text-xs text-gray-400">
          {t('admin.modelGalleryHelp', {
            defaultValue: 'Add supporting shots for this EV. They appear below the dealer availability section on the public page.',
          })}
        </p>
        <div className="flex flex-wrap gap-4">
          {existingGallery.map(url => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={t('admin.modelGalleryPreviewAlt', { defaultValue: 'Model gallery image' })}
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
                alt={t('admin.modelGalleryPreviewAlt', { defaultValue: 'Model gallery image preview' })}
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
              {t('admin.modelGalleryEmpty', { defaultValue: 'No gallery images added yet.' })}
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
              ? t('admin.modelGalleryLimitReached', { defaultValue: 'Gallery limit reached' })
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
          {t('admin.modelGalleryHint', {
            defaultValue: 'JPEG or PNG recommended. Maximum of 3 gallery images.',
          })}
        </p>
      </div>

      <div className="flex items-center space-x-3">
        <input
          id="model-featured"
          name="isFeatured"
          type="checkbox"
          checked={formState.isFeatured}
          onChange={handleChange}
          className="h-4 w-4 rounded border-white/20 bg-gray-900 text-gray-cyan focus:ring-gray-cyan"
        />
        <label htmlFor="model-featured" className="text-sm text-gray-200">
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
          disabled={isSubmitting || isPrefillLoading}
          className="rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? `${t('admin.save')}...` : t('admin.save')}
        </button>
      </div>
      </form>
    </div>
  );
};

export default ModelForm;
