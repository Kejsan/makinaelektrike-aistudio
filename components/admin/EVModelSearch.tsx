import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Search } from 'lucide-react';
import { getElectricVehicle } from '../../services/apiNinjas';
import type { Model } from '../../types';

interface EVModelSearchProps {
  onPrefill: (model: Model) => void;
  onLoadingChange?: (isLoading: boolean) => void;
  isPrefillUsed?: boolean;
}

const EVModelSearch: React.FC<EVModelSearchProps> = ({ onPrefill, onLoadingChange, isPrefillUsed }) => {
  const { t } = useTranslation();
  const [makeInput, setMakeInput] = useState('');
  const [modelInput, setModelInput] = useState('');
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [error, setError] = useState('');

  const vehicleControllerRef = useRef<AbortController | null>(null);

  const fetchVehicle = useCallback(async () => {
    const make = makeInput.trim();
    const model = modelInput.trim();

    if (!make || !model) {
      setError(
        t('admin.evSearch.missingInputs', {
          defaultValue: 'Enter both a manufacturer and model to search.',
        }),
      );
      return;
    }

    setError('');
    setIsLoadingVehicle(true);
    vehicleControllerRef.current?.abort();
    const controller = new AbortController();
    vehicleControllerRef.current = controller;

    try {
      const vehicles = await getElectricVehicle(make, model, controller.signal);
      const firstVehicle = vehicles[0];

      if (firstVehicle) {
        onPrefill(firstVehicle);
      } else {
        setError(
          t('admin.evSearch.noResults', {
            defaultValue: 'No electric vehicles found for this selection.',
          }),
        );
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      console.error('Failed to fetch EV details', err);
      setError(t('admin.apiError', { defaultValue: 'Unable to fetch EV data. Please try again.' }));
    } finally {
      setIsLoadingVehicle(false);
    }
  }, [makeInput, modelInput, onPrefill, t]);

  useEffect(() => {
    return () => {
      vehicleControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isLoadingVehicle);
    }
  }, [isLoadingVehicle, onLoadingChange]);

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div>
        <h3 className="text-lg font-semibold text-white">
          {t('admin.searchEV', { defaultValue: 'Search electric vehicles' })}
        </h3>
        <p className="text-sm text-gray-300">
          {t('admin.evSearch.subtitle', {
            defaultValue: 'Search verified electric vehicles and prefill the model form automatically.',
          })}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            {t('admin.evSearch.makeLabel', { defaultValue: 'Manufacturer' })}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={makeInput}
              onChange={event => {
                setMakeInput(event.target.value);
                setError('');
              }}
              placeholder={t('admin.evSearch.makePlaceholder', { defaultValue: 'e.g. Tesla' })}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:border-gray-cyan focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            {t('admin.evSearch.modelLabel', { defaultValue: 'Model' })}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={modelInput}
              onChange={event => {
                setModelInput(event.target.value);
                setError('');
              }}
              placeholder={t('admin.evSearch.modelPlaceholder', { defaultValue: 'e.g. Model 3' })}
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-white placeholder:text-gray-400 focus:border-gray-cyan focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={fetchVehicle}
          disabled={isLoadingVehicle || isPrefillUsed}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-cyan px-3 py-2 font-semibold text-white transition hover:bg-gray-cyan/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoadingVehicle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>
            {isPrefillUsed
              ? t('admin.prefillUsed', { defaultValue: 'Prefill applied' })
              : t('admin.prefillButton', { defaultValue: 'Prefill model details' })}
          </span>
        </button>
        {isLoadingVehicle && !error && (
          <p className="flex items-center gap-2 text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('admin.evSearch.fetching', { defaultValue: 'Fetching vehicle data…' })}
          </p>
        )}
        {isPrefillUsed && !isLoadingVehicle && !error && (
          <p className="text-gray-300">{t('admin.prefillDisabled', { defaultValue: 'Prefill available once per new model.' })}</p>
        )}
        {error && <p className="text-red-300">{error}</p>}
      </div>
    </div>
  );
};

export default EVModelSearch;
