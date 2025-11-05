export const formatCurrency = (value?: number | null, currencyCode: string = 'EUR'): string | null => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) {
    return null;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: value >= 1000 ? 0 : 2,
    }).format(Number(value));
  } catch (error) {
    console.warn('Unable to format currency with code:', currencyCode, error);
    return `${Number(value).toLocaleString()} ${currencyCode}`.trim();
  }
};

export const formatGuarantee = (
  value?: number | null,
  unit?: string | null,
  fallback?: string | null,
): string | null => {
  if (fallback && fallback.trim().length > 0) {
    return fallback;
  }

  if (value === undefined || value === null) {
    return null;
  }

  const normalizedUnit = unit?.toString().trim().toLowerCase();

  if (normalizedUnit === 'km' || normalizedUnit === 'kilometer' || normalizedUnit === 'kilometre') {
    return `${Number(value).toLocaleString()} km`;
  }

  if (normalizedUnit === 'year' || normalizedUnit === 'years') {
    return `${value} ${value === 1 ? 'year' : 'years'}`;
  }

  if (normalizedUnit && normalizedUnit.length > 0) {
    return `${value} ${normalizedUnit}`;
  }

  return `${value} years`;
};

export const normalizePaymentMethods = (methods?: string[] | string | null): string[] => {
  if (!methods) {
    return [];
  }

  if (Array.isArray(methods)) {
    return methods
      .map(method => method?.toString().trim())
      .filter((method): method is string => Boolean(method?.length));
  }

  return methods
    .split(',')
    .map(method => method.trim())
    .filter(Boolean);
};

export const formatPaymentMethodLabel = (method: string): string =>
  method
    .replace(/[_-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ');

export const safeNumber = (value?: number | null): number | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};
