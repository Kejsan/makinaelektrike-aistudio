import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Trash2, Copy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';
import {
  OFFLINE_QUEUE_EVENT,
  clearOfflineMutations,
  generateOfflineMutationExport,
  listOfflineMutations,
  removeOfflineMutation,
  type OfflineMutationRecord,
} from '../../services/offlineQueue';

interface OfflineQueuePanelProps {
  onClose?: () => void;
}

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

const downloadTextFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};

const OfflineQueuePanel: React.FC<OfflineQueuePanelProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [mutations, setMutations] = useState<OfflineMutationRecord[]>([]);

  const refresh = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }
    setMutations(listOfflineMutations());
  }, []);

  useEffect(() => {
    refresh();
    if (typeof window === 'undefined') {
      return;
    }

    const handleChange = () => refresh();
    window.addEventListener(OFFLINE_QUEUE_EVENT, handleChange);
    return () => {
      window.removeEventListener(OFFLINE_QUEUE_EVENT, handleChange);
    };
  }, [refresh]);

  const handleRemove = useCallback(
    (id: string) => {
      removeOfflineMutation(id);
      addToast(t('admin.offlineQueueEntryRemoved', { defaultValue: 'Entry removed from the offline queue.' }), 'info');
    },
    [addToast, t],
  );

  const handleClear = useCallback(() => {
    clearOfflineMutations();
    addToast(t('admin.offlineQueueCleared', { defaultValue: 'Offline queue cleared.' }), 'info');
    if (onClose) {
      onClose();
    }
  }, [addToast, onClose, t]);

  const handleCopy = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      addToast(
        t('admin.offlineQueueCopyUnavailable', {
          defaultValue: 'Clipboard access is not available in this browser.',
        }),
        'error',
      );
      return;
    }

    const payload = generateOfflineMutationExport();
    try {
      await navigator.clipboard.writeText(payload);
      addToast(t('admin.offlineQueueCopied', { defaultValue: 'Offline queue copied to clipboard.' }), 'success');
    } catch (error) {
      console.error('Failed to copy offline queue', error);
      addToast(t('admin.offlineQueueCopyFailed', { defaultValue: 'Failed to copy the offline queue.' }), 'error');
    }
  }, [addToast, t]);

  const handleDownload = useCallback(() => {
    const payload = generateOfflineMutationExport();
    const filename = `offline-submissions-${new Date().toISOString().slice(0, 10)}.json`;
    downloadTextFile(payload, filename);
    addToast(t('admin.offlineQueueDownloaded', { defaultValue: 'Offline queue downloaded.' }), 'success');
  }, [addToast, t]);

  const hasMutations = mutations.length > 0;

  const subtitle = useMemo(() => {
    if (!hasMutations) {
      return t('admin.offlineQueueEmpty', {
        defaultValue:
          'No pending submissions are stored locally. When Firebase rejects a write, the payload will appear here.',
      });
    }

    return t('admin.offlineQueueDescription', {
      defaultValue:
        'These entries were saved locally after Firebase rejected a write. Download or copy them and import manually via the Firebase console or CLI.',
    });
  }, [hasMutations, t]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-300">{subtitle}</p>

      {hasMutations && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-cyan px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/90"
          >
            <Download size={16} />
            <span>{t('admin.offlineQueueDownload', { defaultValue: 'Download JSON' })}</span>
          </button>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <Copy size={16} />
            <span>{t('admin.offlineQueueCopy', { defaultValue: 'Copy JSON' })}</span>
          </button>
          <button
            onClick={handleClear}
            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-100 transition hover:bg-red-500/20"
          >
            <Trash2 size={16} />
            <span>{t('admin.offlineQueueClear', { defaultValue: 'Clear queue' })}</span>
          </button>
        </div>
      )}

      <div className="space-y-4">
        {hasMutations ? (
          mutations.map(entry => (
            <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {entry.entity} · {entry.operation}
                  </p>
                  <p className="text-xs text-gray-400">{formatDateTime(entry.createdAt)}</p>
                  <p className="text-xs text-red-300/90">
                    {entry.error || t('admin.offlineQueueUnknownError', { defaultValue: 'Unknown error' })}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-gray-200 transition hover:bg-white/20"
                >
                  <Trash2 size={14} />
                  <span>{t('admin.remove', { defaultValue: 'Remove' })}</span>
                </button>
              </div>
              <pre className="mt-3 max-h-60 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-gray-100">
                {JSON.stringify(entry.payload, null, 2)}
              </pre>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-10 text-center text-sm text-gray-300">
            {t('admin.offlineQueueEmptyState', {
              defaultValue: 'All caught up! There are no offline submissions waiting for manual import.',
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineQueuePanel;
