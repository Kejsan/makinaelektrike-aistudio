export const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const sanitizeArray = (items: unknown[]): unknown[] => {
  const result: unknown[] = [];

  items.forEach(item => {
    if (item === undefined) {
      return;
    }

    if (Array.isArray(item)) {
      const nested = sanitizeArray(item);
      if (nested.length > 0) {
        result.push(nested);
      }
      return;
    }

    if (isPlainObject(item)) {
      const sanitizedObject = omitUndefined(item);
      if (Object.keys(sanitizedObject).length > 0) {
        result.push(sanitizedObject);
      }
      return;
    }

    result.push(item);
  });

  return result;
};

export const omitUndefined = <T extends Record<string, unknown>>(input: T): T => {
  const result: Record<string, unknown> = {};

  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      const sanitized = sanitizeArray(value);
      if (sanitized.length > 0) {
        result[key] = sanitized;
      }
      return;
    }

    if (isPlainObject(value)) {
      const sanitizedObject = omitUndefined(value);
      if (Object.keys(sanitizedObject).length > 0) {
        result[key] = sanitizedObject;
      }
      return;
    }

    result[key] = value;
  });

  return result as T;
};
