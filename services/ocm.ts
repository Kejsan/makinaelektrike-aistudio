import type { FeatureCollection, Point } from 'geojson';

export interface OCMOperator {
  id: number;
  title: string;
}

export interface OCMConnectionType {
  id: number;
  title: string;
}

export interface OCMLevel {
  id: number;
  title: string;
  comments?: string | null;
}

export interface OCMUsageType {
  id: number;
  title: string;
}

export interface OCMStatusType {
  id: number;
  title: string;
  isOperational?: boolean;
}

export interface OCMReferenceData {
  Operators: OCMOperator[];
  ConnectionTypes: OCMConnectionType[];
  Levels: OCMLevel[];
  UsageTypes: OCMUsageType[];
  StatusTypes: OCMStatusType[];
}

export type StationFeatureCollection = FeatureCollection<Point, StationProperties>;

export interface StationProperties {
  id: number;
  uuid?: string;
  title?: string;
  addressInfo: {
    title?: string;
    addressLine1?: string;
    addressLine2?: string;
    town?: string;
    stateOrProvince?: string;
    postcode?: string;
    country?: {
      isoCode?: string;
      title?: string;
    };
    latitude: number;
    longitude: number;
    contactTelephone1?: string;
    contactTelephone2?: string;
    relatedURL?: string;
  };
  operatorInfo?: {
    id?: number;
    title?: string;
    websiteURL?: string;
    phonePrimaryContact?: string;
  };
  statusType?: {
    id?: number;
    title?: string;
    isOperational?: boolean;
  };
  usageType?: {
    id?: number;
    title?: string;
  };
  usageCost?: string | null;
  dateLastVerified?: string | null;
  dataProvider?: {
    title?: string;
  };
  connections?: Array<{
    id: number;
    connectionType?: {
      id?: number;
      title?: string;
      formalName?: string | null;
    };
    level?: {
      id?: number;
      title?: string;
    };
    powerKW?: number | null;
    amps?: number | null;
    voltage?: number | null;
    quantity?: number | null;
  }>;
  mediaItems?: Array<{
    id: number;
    itemURL: string;
    isEnabled?: boolean;
    comment?: string | null;
  }>;
  generalComments?: string | null;
}

const BASE_URL = 'https://api.openchargemap.io/v3';
const CLIENT_NAME = 'MakinaElektrike';

const { VITE_OCM_API_KEY } = import.meta.env;

const apiKey = VITE_OCM_API_KEY?.trim() ?? '';

export const OCM_CONFIG = {
  BASE_URL,
  CLIENT_NAME,
  API_KEY: apiKey,
};

type FetchParams = Record<string, string | number | undefined | null | false>;

const buildQueryString = (params: FetchParams) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === false) {
      return;
    }
    searchParams.append(key, String(value));
  });
  return searchParams.toString();
};

const buildHeaders = () => {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (apiKey) {
    headers['X-API-Key'] = apiKey;
  }
  return headers;
};

const appendAuthToUrl = (url: string) => {
  if (apiKey) {
    return url;
  }
  const joiner = url.includes('?') ? '&' : '?';
  return `${url}${joiner}key=YOUR_OCM_API_KEY`;
};

export async function fetchReferenceData(signal?: AbortSignal): Promise<OCMReferenceData> {
  const query = buildQueryString({ client: CLIENT_NAME, camelcase: 'true' });
  const url = appendAuthToUrl(`${BASE_URL}/referencedata?${query}`);
  const response = await fetch(url, { headers: buildHeaders(), signal });
  if (!response.ok) {
    throw new Error(`Failed to load reference data: ${response.status}`);
  }
  return response.json();
}

interface FetchStationsOptions {
  mode: 'country' | 'bounds';
  countryCode?: string;
  boundingBox?: string;
  filters?: {
    operators?: number[];
    connectionTypes?: number[];
    levels?: number[];
    usageTypes?: number[];
    statusTypes?: number[];
  };
  signal?: AbortSignal;
}

export async function fetchStations({
  mode,
  countryCode = 'AL',
  boundingBox,
  filters,
  signal,
}: FetchStationsOptions): Promise<StationFeatureCollection> {
  const baseParams: FetchParams = {
    output: 'geojson',
    countrycode: countryCode,
    maxresults: 200,
    camelcase: 'true',
    client: CLIENT_NAME,
  };

  if (mode === 'bounds' && boundingBox) {
    baseParams.boundingbox = boundingBox;
  }

  if (filters?.operators?.length) {
    baseParams.operatorid = filters.operators.join(',');
  }
  if (filters?.connectionTypes?.length) {
    baseParams.connectiontypeid = filters.connectionTypes.join(',');
  }
  if (filters?.levels?.length) {
    baseParams.levelid = filters.levels.join(',');
  }
  if (filters?.usageTypes?.length) {
    baseParams.usagetypeid = filters.usageTypes.join(',');
  }
  if (filters?.statusTypes?.length) {
    baseParams.statustypeid = filters.statusTypes.join(',');
  }

  const query = buildQueryString(baseParams);
  const url = appendAuthToUrl(`${BASE_URL}/poi?${query}`);
  const response = await fetch(url, { headers: buildHeaders(), signal });
  if (!response.ok) {
    throw new Error(`Failed to load charging locations: ${response.status}`);
  }
  return response.json();
}
