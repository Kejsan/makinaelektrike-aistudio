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
  const [statusMessage, setStatusMessage] = useState('');
  const [results, setResults] = useState<Model[]>([]);

  const vehicleControllerRef = useRef<AbortController | null>(null);

  const fetchVehicle = useCallback(async () => {
    const make = makeInput.trim();
    const model = modelInput.trim();

    if (!make && !model) {
      setError(
        t('admin.evSearch.missingInputs', {
          defaultValue: 'Enter a manufacturer or model to search.',
        }),
      );
      setStatusMessage('');
      setResults([]);
      return;
    }

    setError('');
    setStatusMessage('');
    setResults([]);
    setIsLoadingVehicle(true);
    vehicleControllerRef.current?.abort();
    const controller = new AbortController();
    vehicleControllerRef.current = controller;

    try {
      const vehicles = await getElectricVehicle(make || undefined, model || undefined, controller.signal);
      const firstVehicle = vehicles[0];

      if (!firstVehicle) {
        setError(
          t('admin.evSearch.noResults', {
            defaultValue: 'No electric vehicles found for this selection.',
          }),
        );
        return;
      }

      setResults(vehicles);

      if (vehicles.length === 1) {
        onPrefill(firstVehicle);
        setStatusMessage(
          t('admin.evSearch.singleResult', {
            defaultValue: 'Found 1 vehicle. Prefilled the details automatically.',
          }),
        );
        return;
      }

      setStatusMessage(
        t('admin.evSearch.multipleResults', {
          count: vehicles.length,
          defaultValue: 'Found {{count}} vehicles. Select the exact match below.',
        }),
      );
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
                setStatusMessage('');
                setResults([]);
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
                setStatusMessage('');
                setResults([]);
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
        {isPrefillUsed && !isLoadingVehicle && !error && !results.length && (
          <p className="text-gray-300">{t('admin.prefillDisabled', { defaultValue: 'Prefill available once per new model.' })}</p>
        )}
        {error && <p className="text-red-300">{error}</p>}
        {statusMessage && !error && <p className="text-gray-200">{statusMessage}</p>}
      </div>

      {!!results.length && !error && (
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-sm font-semibold text-white">
            {t('admin.evSearch.resultsHeader', { defaultValue: 'Matching vehicles' })}
          </p>
          <ul className="space-y-2 text-sm text-gray-200">
            {results.map(vehicle => (
              <li
                key={vehicle.id}
                className="flex flex-col gap-2 rounded-md border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">{`${vehicle.brand ?? 'Unknown'} ${vehicle.model_name ?? ''}`.trim()}</p>
                  {(vehicle.body_type || vehicle.drive_type) && (
                    <p className="text-xs text-gray-400">
                      {[vehicle.body_type, vehicle.drive_type].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onPrefill(vehicle)}
                  disabled={isPrefillUsed}
                  className="inline-flex items-center justify-center rounded-md bg-gray-cyan px-3 py-1 text-sm font-semibold text-white transition hover:bg-gray-cyan/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('admin.evSearch.useResult', { defaultValue: 'Use this model' })}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default EVModelSearch;
