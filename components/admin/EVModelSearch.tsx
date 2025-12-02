import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import CustomSelect from '../CustomSelect';
import { getEVMakes, getEVModels, getElectricVehicle } from '../../services/apiNinjas';
import type { Model } from '../../types';

interface EVModelSearchProps {
  onPrefill: (model: Model) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}

const EVModelSearch: React.FC<EVModelSearchProps> = ({ onPrefill, onLoadingChange }) => {
  const { t } = useTranslation();
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingVehicle, setIsLoadingVehicle] = useState(false);
  const [error, setError] = useState('');

  const makesControllerRef = useRef<AbortController | null>(null);
  const modelsControllerRef = useRef<AbortController | null>(null);
  const vehicleControllerRef = useRef<AbortController | null>(null);

  const fetchMakes = useCallback(async () => {
    setError('');
    setIsLoadingMakes(true);
    makesControllerRef.current?.abort();
    const controller = new AbortController();
    makesControllerRef.current = controller;

    try {
      const fetchedMakes = await getEVMakes(controller.signal);
      setMakes(fetchedMakes);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
      console.error('Failed to fetch EV makes', err);
      setError(
        t('admin.evSearch.makeError', {
          defaultValue: 'Could not load EV manufacturers. Please try again.',
        }),
      );
    } finally {
      setIsLoadingMakes(false);
    }
  }, [t]);

  const fetchModels = useCallback(
    async (make: string) => {
      setError('');
      setIsLoadingModels(true);
      modelsControllerRef.current?.abort();
      const controller = new AbortController();
      modelsControllerRef.current = controller;

      try {
        const fetchedModels = await getEVModels(make, controller.signal);
        setModels(fetchedModels);
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return;
        console.error('Failed to fetch EV models', err);
        setError(
          t('admin.evSearch.modelError', {
            defaultValue: 'Could not load models for the selected manufacturer.',
          }),
        );
      } finally {
        setIsLoadingModels(false);
      }
    },
    [t],
  );

  const fetchVehicle = useCallback(
    async (make: string, model: string) => {
      if (!make || !model) {
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
    },
    [onPrefill, t],
  );

  useEffect(() => {
    fetchMakes();

    return () => {
      makesControllerRef.current?.abort();
      modelsControllerRef.current?.abort();
      vehicleControllerRef.current?.abort();
    };
  }, [fetchMakes]);

  useEffect(() => {
    if (!selectedMake) {
      setModels([]);
      setSelectedModel('');
      return;
    }

    fetchModels(selectedMake);
  }, [fetchModels, selectedMake]);

  const handleSelectMake = (value: string) => {
    setSelectedMake(value);
    setSelectedModel('');
    setError('');
  };

  const handleSelectModel = (value: string) => {
    setSelectedModel(value);
    setError('');
    fetchVehicle(selectedMake, value);
  };

  const isBusy = isLoadingMakes || isLoadingModels || isLoadingVehicle;

  useEffect(() => {
    if (onLoadingChange) {
      onLoadingChange(isBusy);
    }
  }, [isBusy, onLoadingChange]);

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
        <button
          type="button"
          onClick={fetchMakes}
          disabled={isLoadingMakes}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoadingMakes ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span>{t('admin.evSearch.refreshMakes', { defaultValue: 'Refresh makes' })}</span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            {t('admin.evSearch.makeLabel', { defaultValue: 'Manufacturer' })}
          </label>
          <CustomSelect
            options={makes.map(make => ({ value: make, label: make }))}
            value={selectedMake}
            onChange={handleSelectMake}
            placeholder={
              isLoadingMakes
                ? t('admin.evSearch.loadingMakes', { defaultValue: 'Loading manufacturers…' })
                : t('admin.selectMake', { defaultValue: 'Select a manufacturer' })
            }
            icon={<Search className="h-4 w-4" />}
          />
          {isLoadingMakes && (
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('admin.evSearch.loadingMakes', { defaultValue: 'Loading manufacturers…' })}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-200">
            {t('admin.evSearch.modelLabel', { defaultValue: 'Model' })}
          </label>
          <CustomSelect
            options={models.map(model => ({ value: model, label: model }))}
            value={selectedModel}
            onChange={handleSelectModel}
            placeholder={
              selectedMake
                ? isLoadingModels
                  ? t('admin.evSearch.loadingModels', { defaultValue: 'Loading models…' })
                  : t('admin.selectModel', { defaultValue: 'Select a model' })
                : t('admin.evSearch.selectMakeFirst', { defaultValue: 'Choose a manufacturer first' })
            }
            icon={<Search className="h-4 w-4" />}
          />
          {isLoadingModels && (
            <p className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('admin.evSearch.loadingModels', { defaultValue: 'Loading models…' })}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm">
        <button
          type="button"
          onClick={() => fetchVehicle(selectedMake, selectedModel)}
          disabled={!selectedMake || !selectedModel || isBusy}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-cyan px-3 py-2 font-semibold text-white transition hover:bg-gray-cyan/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoadingVehicle ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          <span>{t('admin.prefillButton', { defaultValue: 'Prefill model details' })}</span>
        </button>
        {isBusy && !error && (
          <p className="flex items-center gap-2 text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t('admin.evSearch.fetching', { defaultValue: 'Fetching vehicle data…' })}
          </p>
        )}
        {error && <p className="text-red-300">{error}</p>}
      </div>
    </div>
  );
};

export default EVModelSearch;
