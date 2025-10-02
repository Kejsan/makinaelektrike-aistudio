import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Model } from '../../types';

export interface ModelFormValues extends Omit<Model, 'id'> {
  id?: string;
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
  body_type: string;
  battery_capacity: string;
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

const defaultState: ModelFormState = {
  brand: '',
  model_name: '',
  body_type: '',
  battery_capacity: '',
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

  useEffect(() => {
    if (!initialValues) {
      setFormState(defaultState);
      return;
    }

    setFormState({
      brand: initialValues.brand ?? '',
      model_name: initialValues.model_name ?? '',
      body_type: initialValues.body_type ?? '',
      battery_capacity: initialValues.battery_capacity !== undefined && initialValues.battery_capacity !== null ? String(initialValues.battery_capacity) : '',
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
  }, [initialValues]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = event.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!formState.brand.trim()) {
      nextErrors.brand = `${t('admin.brand')} ${t('admin.required', { defaultValue: 'is required' })}`;
    }

    if (!formState.model_name.trim()) {
      nextErrors.model_name = `${t('admin.name')} ${t('admin.required', { defaultValue: 'is required' })}`;
    }

    const numericFields: Array<[keyof ModelFormState, string]> = [
      ['battery_capacity', 'Battery Capacity'],
      ['range_wltp', 'Range'],
      ['power_kw', 'Power'],
      ['torque_nm', 'Torque'],
      ['acceleration_0_100', 'Acceleration'],
      ['top_speed', 'Top Speed'],
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

    const payload: ModelFormValues = {
      id: initialValues?.id,
      brand: formState.brand.trim(),
      model_name: formState.model_name.trim(),
      body_type: formState.body_type.trim() || undefined,
      battery_capacity: parseNumber(formState.battery_capacity),
      range_wltp: parseNumber(formState.range_wltp),
      power_kw: parseNumber(formState.power_kw),
      torque_nm: parseNumber(formState.torque_nm),
      acceleration_0_100: parseNumber(formState.acceleration_0_100),
      top_speed: parseNumber(formState.top_speed),
      drive_type: formState.drive_type.trim() || undefined,
      seats: parseInteger(formState.seats),
      charging_ac: formState.charging_ac.trim() || undefined,
      charging_dc: formState.charging_dc.trim() || undefined,
      notes: formState.notes.trim() || undefined,
      image_url: formState.image_url.trim() || undefined,
      isFeatured: formState.isFeatured,
    };

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderInput(t('admin.brand'), 'brand')}
        {renderInput(t('admin.name'), 'model_name')}
        {renderInput(t('modelsPage.bodyType', { defaultValue: 'Body Type' }), 'body_type')}
        {renderInput('Drive Type', 'drive_type')}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {renderInput('Battery (kWh)', 'battery_capacity')}
        {renderInput('Range (WLTP)', 'range_wltp')}
        {renderInput('Power (kW)', 'power_kw')}
        {renderInput('Torque (Nm)', 'torque_nm')}
        {renderInput('0-100 km/h (s)', 'acceleration_0_100')}
        {renderInput('Top Speed (km/h)', 'top_speed')}
        {renderInput(t('modelDetails.seats', { defaultValue: 'Seats' }), 'seats')}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderInput('AC Charging', 'charging_ac')}
        {renderInput('DC Charging', 'charging_dc')}
      </div>

      {renderInput(t('modelDetails.notes', { defaultValue: 'Notes' }), 'notes', 'text', undefined, { isTextArea: true, rows: 4 })}

      {renderInput('Image URL', 'image_url')}

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
          disabled={isSubmitting}
          className="rounded-lg bg-gray-cyan px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? `${t('admin.save')}...` : t('admin.save')}
        </button>
      </div>
    </form>
  );
};

export default ModelForm;
