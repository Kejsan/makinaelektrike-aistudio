import { omitUndefined, isPlainObject } from '../utils/object';
import type { EntityKey, Operation } from '../contexts/DataContext';

export interface OfflineMutationRecord {
  id: string;
  entity: EntityKey;
  operation: Operation;
  payload: unknown;
  error: string;
  createdAt: string;
}

export const OFFLINE_QUEUE_EVENT = 'mek-offline-queue-change';

const STORAGE_KEY = 'mek-offline-mutations';

const hasStorage = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const broadcast = () => {
  if (!hasStorage()) {
    return;
  }
  window.dispatchEvent(new Event(OFFLINE_QUEUE_EVENT));
};

const sanitizeValue = (value: unknown): unknown => {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    const sanitized = value
      .map(item => sanitizeValue(item))
      .filter(item => item !== undefined);
    return sanitized;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    if (value && typeof (value as { toDate?: unknown }).toDate === 'function') {
      try {
        const converted = (value as { toDate: () => Date }).toDate();
        return converted.toISOString();
      } catch (error) {
        console.warn('Failed to serialise timestamp', error);
        return null;
      }
    }

    if (isPlainObject(value)) {
      const cleaned = omitUndefined(value as Record<string, unknown>);
      const entries = Object.entries(cleaned).reduce<Record<string, unknown>>((acc, [key, item]) => {
        const serialised = sanitizeValue(item);
        if (serialised !== undefined) {
          acc[key] = serialised;
        }
        return acc;
      }, {});
      return entries;
    }
  }

  return value;
};

const readRecords = (): OfflineMutationRecord[] => {
  if (!hasStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(item => typeof item === 'object' && item !== null) as OfflineMutationRecord[];
  } catch (error) {
    console.warn('Unable to read offline mutations from storage', error);
    return [];
  }
};

const writeRecords = (records: OfflineMutationRecord[]) => {
  if (!hasStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.warn('Unable to persist offline mutations', error);
  }

  broadcast();
};

const generateId = () => `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const addOfflineMutation = (
  input: Omit<OfflineMutationRecord, 'id' | 'createdAt'> & { id?: string; createdAt?: string },
): OfflineMutationRecord => {
  const records = readRecords();
  const payload = sanitizeValue(input.payload);

  const record: OfflineMutationRecord = {
    id: input.id ?? generateId(),
    createdAt: input.createdAt ?? new Date().toISOString(),
    entity: input.entity,
    operation: input.operation,
    payload,
    error: input.error,
  };

  records.push(record);
  writeRecords(records);
  return record;
};

export const listOfflineMutations = (): OfflineMutationRecord[] => readRecords();

export const removeOfflineMutation = (id: string): OfflineMutationRecord[] => {
  const records = readRecords().filter(entry => entry.id !== id);
  writeRecords(records);
  return records;
};

export const clearOfflineMutations = () => {
  writeRecords([]);
};

export const generateOfflineMutationExport = () => {
  const records = readRecords();
  return JSON.stringify(records, null, 2);
};
