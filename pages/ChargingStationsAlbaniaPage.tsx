import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerIcon from 'leaflet/dist/images/marker-icon.png?url';
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url';
import {
  Download,
  LocateFixed,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  Share2,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import SEO from '../components/SEO';
import { BASE_URL, DEFAULT_OG_IMAGE } from '../constants/seo';
import {
  OCMReferenceData,
  StationProperties,
  fetchReferenceData,
  fetchStations,
} from '../services/ocm';
import type { StationFeatureCollection } from '../services/ocm';
import { useToast } from '../contexts/ToastContext';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetina,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER: [number, number] = [41.3275, 19.8187];
const DEFAULT_ZOOM = 8;

type StationFeature = StationFeatureCollection['features'][number];

type BoundsTuple = [south: number, north: number, west: number, east: number];

interface FiltersState {
  search: string;
  operatorIds: number[];
  connectionTypeIds: number[];
  levelIds: number[];
  usageTypeIds: number[];
  statusTypeIds: number[];
  openNow: boolean;
  powerMin: string;
  powerMax: string;
}

interface OptionItem {
  id: number;
  label: string;
}

const parseIds = (value: string | null): number[] => {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map(part => Number.parseInt(part, 10))
    .filter(id => Number.isFinite(id));
};

const formatAddress = (properties: StationProperties) => {
  const { addressInfo } = properties;
  const segments = [
    addressInfo?.title,
    addressInfo?.addressLine1,
    addressInfo?.town,
    addressInfo?.stateOrProvince,
    addressInfo?.postcode,
  ].filter(Boolean);
  return segments.join(', ');
};

const formatPowerRange = (properties: StationProperties) => {
  const powerValues = (properties.connections ?? [])
    .map(connection => connection.powerKW ?? null)
    .filter((value): value is number => value !== null && !Number.isNaN(value));

  if (!powerValues.length) {
    return null;
  }

  const min = Math.min(...powerValues);
  const max = Math.max(...powerValues);

  if (min === max) {
    return `${min.toFixed(0)} kW`;
  }

  return `${min.toFixed(0)}–${max.toFixed(0)} kW`;
};

const getBoundingBoxFromBounds = (bounds: L.LatLngBounds) => {
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const west = bounds.getWest();
  const east = bounds.getEast();
  return `${south},${north},${west},${east}`;
};

const boundsFromTuple = (tuple?: BoundsTuple | null) => {
  if (!tuple) {
    return null;
  }
  const [south, north, west, east] = tuple;
  return L.latLngBounds([south, west], [north, east]);
};

const getStationLatLng = (feature: StationFeature) => {
  const { geometry, properties } = feature;
  if (geometry?.type === 'Point' && Array.isArray(geometry.coordinates)) {
    const [lng, lat] = geometry.coordinates;
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return { lat, lng };
    }
  }
  return {
    lat: properties.addressInfo.latitude,
    lng: properties.addressInfo.longitude,
  };
};

const formatDateTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const createPopupContent = (
  feature: StationFeature,
  actions: { onCopy: () => void; onShare: () => void },
) => {
  const { properties } = feature;
  const latLng = getStationLatLng(feature);
  const address = formatAddress(properties) || 'Address unavailable';
  const status = properties.statusType?.title ?? 'Status unknown';
  const usage = properties.usageType?.title ?? 'Usage unknown';
  const power = formatPowerRange(properties) ?? 'Unspecified power';
  const lastVerified = properties.dateLastVerified
    ? new Date(properties.dateLastVerified).toLocaleDateString()
    : 'Not provided';
  const operator = properties.operatorInfo?.title ?? 'Unknown operator';
  const thumbnail = properties.mediaItems?.find(item => item.isEnabled);

  const container = document.createElement('div');
  container.className = 'space-y-3 text-sm text-gray-900';

  const header = document.createElement('div');
  const title = document.createElement('h3');
  title.className = 'text-base font-semibold text-gray-900';
  title.textContent = properties.title ?? 'Charging location';
  header.appendChild(title);

  const addressParagraph = document.createElement('p');
  addressParagraph.className = 'mt-1 text-xs text-gray-600';
  addressParagraph.textContent = address;
  header.appendChild(addressParagraph);
  container.appendChild(header);

  if (thumbnail?.itemURL) {
    try {
      const mediaUrl = new URL(thumbnail.itemURL);
      if (mediaUrl.protocol === 'http:' || mediaUrl.protocol === 'https:') {
        const image = document.createElement('img');
        image.src = mediaUrl.toString();
        image.alt = 'Station thumbnail';
        image.className = 'h-28 w-full rounded-lg object-cover';
        container.appendChild(image);
      }
    } catch (error) {
      console.warn('Skipping invalid thumbnail URL', error);
    }
  }

  const details = document.createElement('dl');
  details.className = 'grid grid-cols-2 gap-2 text-xs text-gray-700';

  const addDetail = (label: string, value: string) => {
    const wrapper = document.createElement('div');
    const dt = document.createElement('dt');
    dt.className = 'font-semibold text-gray-800';
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = value;
    wrapper.appendChild(dt);
    wrapper.appendChild(dd);
    details.appendChild(wrapper);
  };

  addDetail('Operator', operator);
  addDetail('Status', status);
  addDetail('Usage', usage);
  addDetail('Power', power);
  addDetail('Last verified', lastVerified);

  if (properties.usageCost) {
    addDetail('Cost', properties.usageCost);
  }

  container.appendChild(details);

  if (properties.connections && properties.connections.length) {
    const wrapper = document.createElement('div');
    wrapper.className = 'max-h-32 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2';

    const table = document.createElement('table');
    table.className = 'min-w-full text-[11px] text-gray-700';

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const headers = ['Connector', 'Level', 'kW', 'Qty'];
    headers.forEach(text => {
      const th = document.createElement('th');
      th.className = 'px-1 py-1 text-left font-semibold';
      th.textContent = text;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    properties.connections.forEach(connection => {
      const row = document.createElement('tr');

      const connectorCell = document.createElement('td');
      connectorCell.className = 'px-1 py-1';
      connectorCell.textContent = connection.connectionType?.title ?? '—';
      row.appendChild(connectorCell);

      const levelCell = document.createElement('td');
      levelCell.className = 'px-1 py-1';
      levelCell.textContent = connection.level?.title ?? '—';
      row.appendChild(levelCell);

      const powerCell = document.createElement('td');
      powerCell.className = 'px-1 py-1';
      powerCell.textContent =
        connection.powerKW !== undefined && connection.powerKW !== null
          ? String(connection.powerKW)
          : '—';
      row.appendChild(powerCell);

      const qtyCell = document.createElement('td');
      qtyCell.className = 'px-1 py-1';
      qtyCell.textContent =
        connection.quantity !== undefined && connection.quantity !== null
          ? String(connection.quantity)
          : '—';
      row.appendChild(qtyCell);

      tbody.appendChild(row);
    });

    table.appendChild(tbody);
    wrapper.appendChild(table);
    container.appendChild(wrapper);
  }

  const actionsRow = document.createElement('div');
  actionsRow.className = 'flex flex-wrap gap-2 text-xs';

  const createLinkButton = (label: string, href: string) => {
    const link = document.createElement('a');
    link.href = href;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.className =
      'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1 font-semibold text-gray-800';
    link.textContent = label;
    actionsRow.appendChild(link);
  };

  createLinkButton('Directions', `https://www.google.com/maps/dir/?api=1&destination=${latLng.lat},${latLng.lng}`);
  createLinkButton('Apple Maps', `http://maps.apple.com/?daddr=${latLng.lat},${latLng.lng}`);

  const createActionButton = (label: string, onClick: () => void, action: 'copy' | 'share') => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.popupAction = action;
    button.className =
      'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 px-3 py-1 font-semibold text-gray-800';
    button.textContent = label;
    button.addEventListener('click', onClick);
    actionsRow.appendChild(button);
  };

  createActionButton('Copy address', actions.onCopy, 'copy');
  createActionButton('Share', actions.onShare, 'share');

  container.appendChild(actionsRow);

  const attribution = document.createElement('p');
  attribution.className = 'text-[11px] text-gray-500';
  attribution.textContent = 'Data © Open Charge Map contributors – OpenChargeMap.org';
  container.appendChild(attribution);

  return container;
};


const MultiSelectFilter: React.FC<{
  label: string;
  options: OptionItem[];
  selected: number[];
  onChange: (value: number[]) => void;
}> = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleValue = (id: number) => {
    onChange(
      selectedSet.has(id)
        ? selected.filter(value => value !== id)
        : [...selected, id].sort((a, b) => a - b),
    );
  };

  const clearSelection = () => {
    onChange([]);
    setOpen(false);
  };

  const summary = selected.length
    ? `${selected.length} selected`
    : 'All';

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(current => !current)}
        className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-cyan"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className="text-xs text-gray-300">{summary}</span>
      </button>
      {open && (
        <div
          className="absolute z-30 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-white/10 bg-gray-950/95 p-3 text-sm shadow-2xl backdrop-blur"
          role="listbox"
          aria-label={label}
        >
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs uppercase tracking-wide text-gray-400">Options</span>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs font-semibold text-gray-cyan hover:text-white"
            >
              Clear
            </button>
          </div>
          <ul className="space-y-2">
            {options.map(option => {
              const isSelected = selectedSet.has(option.id);
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    onClick={() => toggleValue(option.id)}
                    className={`flex w-full items-start rounded-md px-2 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-gray-cyan ${
                      isSelected ? 'bg-gray-cyan/20 text-white' : 'text-gray-200 hover:bg-white/5'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="mr-2 mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded border border-gray-cyan/40">
                      {isSelected && <span className="h-2 w-2 rounded-sm bg-gray-cyan" aria-hidden="true" />}
                    </span>
                    <span>{option.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const ChargingStationsAlbaniaPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const latParam = Number.parseFloat(searchParams.get('lat') ?? '');
  const lngParam = Number.parseFloat(searchParams.get('lng') ?? '');
  const zoomParam = Number.parseInt(searchParams.get('z') ?? '', 10);

  const filtersRef = useRef<FiltersState | null>(null);

  if (!filtersRef.current) {
    filtersRef.current = {
      search: searchParams.get('q') ?? '',
      operatorIds: parseIds(searchParams.get('operators')),
      connectionTypeIds: parseIds(searchParams.get('connections')),
      levelIds: parseIds(searchParams.get('levels')),
      usageTypeIds: parseIds(searchParams.get('usage')),
      statusTypeIds: parseIds(searchParams.get('status')),
      openNow: searchParams.get('open') === '1',
      powerMin: searchParams.get('minkw') ?? '',
      powerMax: searchParams.get('maxkw') ?? '',
    };
  }

  const [filters, setFilters] = useState<FiltersState>(filtersRef.current);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const [autoUpdate, setAutoUpdate] = useState(searchParams.get('auto') !== 'false');
  const [mapState, setMapState] = useState({
    center: [Number.isFinite(latParam) ? latParam : DEFAULT_CENTER[0], Number.isFinite(lngParam) ? lngParam : DEFAULT_CENTER[1]] as [number, number],
    zoom: Number.isFinite(zoomParam) ? zoomParam : DEFAULT_ZOOM,
  });
  const initialMapStateRef = useRef(mapState);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(() => {
    const poiParam = searchParams.get('poi');
    if (!poiParam) {
      return null;
    }
    const parsed = Number.parseInt(poiParam, 10);
    return Number.isFinite(parsed) ? parsed : null;
  });

  const [referenceData, setReferenceData] = useState<OCMReferenceData | null>(null);
  const [loadingReferenceData, setLoadingReferenceData] = useState(false);
  const [stations, setStations] = useState<StationFeature[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [pendingSearch, setPendingSearch] = useState(false);
  const [hoveredStationId, setHoveredStationId] = useState<number | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<number, L.Marker>>(new Map());
  const fetchControllerRef = useRef<AbortController | null>(null);
  const lastContextRef = useRef<{ mode: 'country' | 'bounds'; bounds: BoundsTuple | null }>({
    mode: 'country',
    bounds: null,
  });
  const pendingBoundsRef = useRef<L.LatLngBounds | null>(null);
  const moveDebounceRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const hasLoadedOnceRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setLoadingReferenceData(true);
    fetchReferenceData(controller.signal)
      .then(data => {
        if (!isMounted) return;
        setReferenceData(data);
      })
      .catch(errorRef => {
        if (!isMounted && controller.signal.aborted) {
          return;
        }
        console.error(errorRef);
      })
      .finally(() => {
        if (isMounted) {
          setLoadingReferenceData(false);
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const loadStations = useCallback(
    async (mode: 'country' | 'bounds', options: { bounds?: L.LatLngBounds | null } = {}) => {
      if (fetchControllerRef.current) {
        fetchControllerRef.current.abort();
      }
      const controller = new AbortController();
      fetchControllerRef.current = controller;
      setLoadingStations(true);
      setError(null);

      const sourceBounds = mode === 'bounds'
        ? options.bounds ?? mapRef.current?.getBounds() ?? null
        : null;

      const nextContext: { mode: 'country' | 'bounds'; bounds: BoundsTuple | null } = sourceBounds
        ? {
            mode: 'bounds',
            bounds: [
              Number(sourceBounds.getSouth().toFixed(6)),
              Number(sourceBounds.getNorth().toFixed(6)),
              Number(sourceBounds.getWest().toFixed(6)),
              Number(sourceBounds.getEast().toFixed(6)),
            ],
          }
        : { mode: 'country', bounds: null };

      try {
        const data = await fetchStations({
          mode: nextContext.mode,
          boundingBox: sourceBounds ? getBoundingBoxFromBounds(sourceBounds) : undefined,
          filters: {
            operators: filtersRef.current?.operatorIds ?? [],
            connectionTypes: filtersRef.current?.connectionTypeIds ?? [],
            levels: filtersRef.current?.levelIds ?? [],
            usageTypes: filtersRef.current?.usageTypeIds ?? [],
            statusTypes: filtersRef.current?.statusTypeIds ?? [],
          },
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setStations(data.features ?? []);
        setLastUpdated(new Date());
        lastContextRef.current = nextContext;
        hasLoadedOnceRef.current = true;
        if (sourceBounds) {
          pendingBoundsRef.current = sourceBounds;
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error(err);
        setError(err instanceof Error ? err.message : 'Failed to load charging locations');
      } finally {
        if (!controller.signal.aborted) {
          setLoadingStations(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    loadStations('country');
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, [loadStations]);

  useEffect(() => {
    if (!hasLoadedOnceRef.current) {
      return;
    }
    const context = lastContextRef.current;
    if (context.mode === 'bounds') {
      const bounds = boundsFromTuple(context.bounds);
      if (bounds) {
        loadStations('bounds', { bounds });
        return;
      }
    }
    loadStations('country');
  }, [filters, loadStations]);

  useEffect(() => {
    if (autoUpdate) {
      const bounds = mapRef.current?.getBounds();
      if (bounds) {
        setPendingSearch(false);
        loadStations('bounds', { bounds });
      }
    }
  }, [autoUpdate, loadStations]);

  const handleMapMove = useCallback(() => {
    if (!mapRef.current) {
      return;
    }
    const center = mapRef.current.getCenter();
    const zoom = mapRef.current.getZoom();
    const bounds = mapRef.current.getBounds();

    setMapState({ center: [center.lat, center.lng], zoom });

    if (autoUpdate) {
      setPendingSearch(false);
      pendingBoundsRef.current = bounds;
      if (moveDebounceRef.current) {
        clearTimeout(moveDebounceRef.current);
      }
      moveDebounceRef.current = window.setTimeout(() => {
        loadStations('bounds', { bounds });
      }, 450);
    } else {
      pendingBoundsRef.current = bounds;
      setPendingSearch(true);
    }
  }, [autoUpdate, loadStations]);

  useEffect(() => {
    return () => {
      if (moveDebounceRef.current) {
        clearTimeout(moveDebounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    const { center, zoom } = initialMapStateRef.current;
    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      minZoom: 5,
      maxZoom: 18,
      zoomControl: false,
    });

    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const clusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      chunkedLoading: true,
      maxClusterRadius: 60,
    });

    clusterRef.current = clusterGroup;
    map.addLayer(clusterGroup);

    return () => {
      clusterGroup.clearLayers();
      map.remove();
      clusterRef.current = null;
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
    };
  }, [handleMapMove]);

  const operatorOptions = useMemo<OptionItem[]>(
    () =>
      (referenceData?.Operators ?? [])
        .map(item => ({ id: item.id, label: item.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [referenceData?.Operators],
  );

  const connectionOptions = useMemo<OptionItem[]>(
    () =>
      (referenceData?.ConnectionTypes ?? [])
        .map(item => ({ id: item.id, label: item.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [referenceData?.ConnectionTypes],
  );

  const levelOptions = useMemo<OptionItem[]>(
    () =>
      (referenceData?.Levels ?? [])
        .map(item => ({ id: item.id, label: item.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [referenceData?.Levels],
  );

  const usageOptions = useMemo<OptionItem[]>(
    () =>
      (referenceData?.UsageTypes ?? [])
        .map(item => ({ id: item.id, label: item.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [referenceData?.UsageTypes],
  );

  const statusOptions = useMemo<OptionItem[]>(
    () =>
      (referenceData?.StatusTypes ?? [])
        .map(item => ({ id: item.id, label: item.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [referenceData?.StatusTypes],
  );

  const visibleStations = useMemo(() => {
    const textQuery = filters.search.trim().toLowerCase();
    const operatorSet = new Set(filters.operatorIds);
    const connectionSet = new Set(filters.connectionTypeIds);
    const levelSet = new Set(filters.levelIds);
    const usageSet = new Set(filters.usageTypeIds);
    const statusSet = new Set(filters.statusTypeIds);
    const minPower = Number.parseFloat(filters.powerMin);
    const maxPower = Number.parseFloat(filters.powerMax);
    const hasMin = Number.isFinite(minPower);
    const hasMax = Number.isFinite(maxPower);

    return stations.filter(feature => {
      const { properties } = feature;
      const address = formatAddress(properties).toLowerCase();
      const operator = properties.operatorInfo?.title?.toLowerCase() ?? '';
      const title = (properties.title ?? '').toLowerCase();

      if (textQuery) {
        const matchesText = title.includes(textQuery) || operator.includes(textQuery) || address.includes(textQuery);
        if (!matchesText) {
          return false;
        }
      }

      if (operatorSet.size && (!properties.operatorInfo?.id || !operatorSet.has(properties.operatorInfo.id))) {
        return false;
      }

      if (usageSet.size && (!properties.usageType?.id || !usageSet.has(properties.usageType.id))) {
        return false;
      }

      if (statusSet.size && (!properties.statusType?.id || !statusSet.has(properties.statusType.id))) {
        return false;
      }

      const connections = properties.connections ?? [];

      if (connectionSet.size) {
        const hasAny = connections.some(connection => connection.connectionType?.id && connectionSet.has(connection.connectionType.id));
        if (!hasAny) {
          return false;
        }
      }

      if (levelSet.size) {
        const hasAnyLevel = connections.some(connection => connection.level?.id && levelSet.has(connection.level.id));
        if (!hasAnyLevel) {
          return false;
        }
      }

      if (filters.openNow) {
        if (!properties.statusType?.isOperational) {
          return false;
        }
      }

      if (hasMin || hasMax) {
        const powerValues = connections
          .map(connection => connection.powerKW ?? null)
          .filter((value): value is number => value !== null && !Number.isNaN(value));
        if (!powerValues.length) {
          return false;
        }
        const minValue = Math.min(...powerValues);
        const maxValue = Math.max(...powerValues);
        if (hasMin && maxValue < (minPower ?? 0)) {
          return false;
        }
        if (hasMax && minValue > (maxPower ?? 0)) {
          return false;
        }
      }

      return true;
    });
  }, [filters, stations]);

  const shareStation = useCallback(
    (feature: StationFeature) => {
      const latLng = getStationLatLng(feature);
      const params = new URLSearchParams();
      params.set('lat', latLng.lat.toFixed(5));
      params.set('lng', latLng.lng.toFixed(5));
      params.set('z', '15');
      params.set('poi', String(feature.properties.id));

      if (filters.search) params.set('q', filters.search);
      if (filters.operatorIds.length) params.set('operators', filters.operatorIds.join(','));
      if (filters.connectionTypeIds.length) params.set('connections', filters.connectionTypeIds.join(','));
      if (filters.levelIds.length) params.set('levels', filters.levelIds.join(','));
      if (filters.usageTypeIds.length) params.set('usage', filters.usageTypeIds.join(','));
      if (filters.statusTypeIds.length) params.set('status', filters.statusTypeIds.join(','));
      if (!autoUpdate) params.set('auto', 'false');
      if (filters.openNow) params.set('open', '1');
      if (filters.powerMin) params.set('minkw', filters.powerMin);
      if (filters.powerMax) params.set('maxkw', filters.powerMax);

      const url = `${window.location.origin}/albania-charging-stations?${params.toString()}`;
      navigator.clipboard
        .writeText(url)
        .then(() => addToast('Shareable link copied to clipboard', 'success'))
        .catch(() => addToast('Unable to copy link', 'error'));
    },
    [addToast, autoUpdate, filters],
  );

  useEffect(() => {
    const clusterGroup = clusterRef.current;
    if (!clusterGroup) {
      return;
    }

    clusterGroup.clearLayers();
    markersRef.current.clear();

    visibleStations.forEach(feature => {
      const latLng = getStationLatLng(feature);
      if (!Number.isFinite(latLng.lat) || !Number.isFinite(latLng.lng)) {
        return;
      }
      const marker = L.marker([latLng.lat, latLng.lng], {
        riseOnHover: true,
        title: feature.properties.title ?? 'Charging station',
      });

      const handleCopy = () => {
        const address = formatAddress(feature.properties);
        navigator.clipboard
          .writeText(address)
          .then(() => addToast('Address copied to clipboard', 'success'))
          .catch(() => addToast('Unable to copy address', 'error'));
      };

      const handleShare = () => {
        shareStation(feature);
      };

      const popupContent = createPopupContent(feature, {
        onCopy: handleCopy,
        onShare: handleShare,
      });

      marker.bindPopup(popupContent, { maxWidth: 360, className: 'charging-popup' });

      marker.on('click', () => {
        setSelectedStationId(feature.properties.id);
        setHoveredStationId(feature.properties.id);
      });

      marker.on('mouseover', () => setHoveredStationId(feature.properties.id));
      marker.on('mouseout', () => setHoveredStationId(current => (current === feature.properties.id ? null : current)));

      clusterGroup.addLayer(marker);
      markersRef.current.set(feature.properties.id, marker);
    });
  }, [addToast, shareStation, visibleStations]);

  useEffect(() => {
    if (!selectedStationId) {
      return;
    }
    const marker = markersRef.current.get(selectedStationId);
    if (marker) {
      marker.openPopup();
      const latLng = marker.getLatLng();
      mapRef.current?.flyTo(latLng, Math.max(mapRef.current.getZoom(), 14), { animate: true });
    } else if (!visibleStations.some(station => station.properties.id === selectedStationId)) {
      setSelectedStationId(null);
    }
  }, [selectedStationId, visibleStations]);

  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setFilters(current => ({ ...current, search: value }));
  };

  const handleToggleAutoUpdate = () => {
    setAutoUpdate(current => !current);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      operatorIds: [],
      connectionTypeIds: [],
      levelIds: [],
      usageTypeIds: [],
      statusTypeIds: [],
      openNow: false,
      powerMin: '',
      powerMax: '',
    });
  };

  const handleSearchArea = () => {
    const bounds = pendingBoundsRef.current ?? mapRef.current?.getBounds();
    if (bounds) {
      setPendingSearch(false);
      loadStations('bounds', { bounds });
    }
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      addToast('Geolocation is not supported by your browser.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        if (mapRef.current) {
          mapRef.current.flyTo([latitude, longitude], 14, { animate: true });
        }
        setMapState({ center: [latitude, longitude], zoom: 14 });
      },
      () => {
        addToast('Unable to retrieve your location.', 'error');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleRetry = () => {
    const context = lastContextRef.current;
    if (context.mode === 'bounds') {
      const bounds = boundsFromTuple(context.bounds);
      if (bounds) {
        loadStations('bounds', { bounds });
        return;
      }
    }
    loadStations('country');
  };

  useEffect(() => {
    const params = new URLSearchParams();
    params.set('lat', mapState.center[0].toFixed(5));
    params.set('lng', mapState.center[1].toFixed(5));
    params.set('z', String(mapState.zoom));

    if (filters.search) params.set('q', filters.search);
    if (filters.operatorIds.length) params.set('operators', filters.operatorIds.join(','));
    if (filters.connectionTypeIds.length) params.set('connections', filters.connectionTypeIds.join(','));
    if (filters.levelIds.length) params.set('levels', filters.levelIds.join(','));
    if (filters.usageTypeIds.length) params.set('usage', filters.usageTypeIds.join(','));
    if (filters.statusTypeIds.length) params.set('status', filters.statusTypeIds.join(','));
    if (filters.openNow) params.set('open', '1');
    if (filters.powerMin) params.set('minkw', filters.powerMin);
    if (filters.powerMax) params.set('maxkw', filters.powerMax);
    if (!autoUpdate) params.set('auto', 'false');
    if (selectedStationId) params.set('poi', String(selectedStationId));

    const next = params.toString();
    if (next !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [autoUpdate, filters, mapState, searchParams, selectedStationId, setSearchParams]);

  const exportData = (format: 'csv' | 'json') => {
    if (!visibleStations.length) {
      addToast('No results to export right now.', 'info');
      return;
    }

    const plain = visibleStations.map(station => {
      const latLng = getStationLatLng(station);
      return {
        id: station.properties.id,
        title: station.properties.title ?? 'Unknown station',
        address: formatAddress(station.properties),
        operator: station.properties.operatorInfo?.title ?? 'Unknown operator',
        status: station.properties.statusType?.title ?? 'Unknown status',
        usage: station.properties.usageType?.title ?? 'Unknown usage',
        power: formatPowerRange(station.properties) ?? 'Unspecified',
        latitude: latLng.lat,
        longitude: latLng.lng,
      };
    });

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(plain, null, 2)], {
        type: 'application/json',
      });
      downloadBlob(blob, 'albania-charging-stations.json');
      addToast('Exported visible results to JSON.', 'success');
      return;
    }

    const headers = ['ID', 'Title', 'Address', 'Operator', 'Status', 'Usage', 'Power', 'Latitude', 'Longitude'];
    const rows = plain.map(item =>
      [
        item.id,
        item.title,
        item.address,
        item.operator,
        item.status,
        item.usage,
        item.power,
        item.latitude,
        item.longitude,
      ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(','),
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, 'albania-charging-stations.csv');
    addToast('Exported visible results to CSV.', 'success');
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const faqItems = useMemo(
    () => [
      {
        question: 'How accurate is the data on this map?',
        answer:
          'All charging locations come directly from Open Charge Map contributors. Each listing includes the last verified timestamp so you can gauge freshness.',
      },
      {
        question: 'Which connector types are common in Albania?',
        answer:
          'Type 2 AC connectors and CCS2 DC fast chargers are the most widespread. Use the filter panel to show stations that support your vehicle plug.',
      },
      {
        question: 'Can I filter for fast charging only?',
        answer:
          'Yes. Select the DC and rapid charging levels in the filters to see only high-power stations, or set a minimum kW value to match your needs.',
      },
      {
        question: 'What does “status” mean on each location?',
        answer:
          'Status reflects the operational flag reported to Open Charge Map. “Operational” sites are generally active, while other statuses highlight maintenance or planned units.',
      },
      {
        question: 'How do I get directions to a charger?',
        answer:
          'Open any station card or map popup and tap the Directions button. It will launch Google Maps with the coordinates pre-filled for easy navigation.',
      },
      {
        question: 'Why does the map refresh when I move it?',
        answer:
          'Auto-update keeps results aligned with the area currently visible. You can disable it to explore freely and then press “Search this area” when ready.',
      },
      {
        question: 'How can I report an issue or leave a comment?',
        answer:
          'Each listing links back to Open Charge Map where you can submit updates, photos, and comments to help the EV community in Albania.',
      },
      {
        question: 'Will this work on mobile devices?',
        answer:
          'Absolutely. The layout adapts to small screens, supports touch interactions, and keeps controls large enough for on-the-go route planning.',
      },
      {
        question: 'Do I need an account to use the map?',
        answer:
          'No account is required. All filters and exports are available instantly, and you can save stations by copying the share link to your notes.',
      },
    ],
    [],
  );

  const structuredData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }), [faqItems]);

  const seoTitle = 'Charging Stations in Albania – Interactive EV Map | Makina Elektrike';
  const seoDescription =
    'Find EV charging stations across Albania. Filter by connector, speed, status, and operator. Get directions and plan your route with our interactive map powered by Open Charge Map.';

  const breadcrumbItems = [
    { label: t('header.home'), to: '/' },
    { label: 'Charging Stations in Albania', to: '/albania-charging-stations' },
  ];

  const listHeading = visibleStations.length
    ? `${visibleStations.length} stations match your filters`
    : 'No stations match your filters yet';

  return (
    <div className="py-12">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonical={`${BASE_URL}/albania-charging-stations/`}
        keywords={[
          'Albania EV charging map',
          'Open Charge Map Albania',
          'EV charging stations Tirana',
          'Makina Elektrike charging',
        ]}
        openGraph={{
          title: seoTitle,
          description: seoDescription,
          url: `${BASE_URL}/albania-charging-stations/`,
          type: 'website',
          images: [DEFAULT_OG_IMAGE],
        }}
        twitter={{
          title: seoTitle,
          description: seoDescription,
          image: DEFAULT_OG_IMAGE,
          site: '@makinaelektrike',
        }}
        structuredData={structuredData}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap items-center gap-2 text-gray-300">
            {breadcrumbItems.map((item, index) => (
              <Fragment key={item.to}>
                {index > 0 && <span className="text-gray-500">/</span>}
                {index === breadcrumbItems.length - 1 ? (
                  <span className="font-semibold text-white">{item.label}</span>
                ) : (
                  <Link to={item.to} className="hover:text-white">
                    {item.label}
                  </Link>
                )}
              </Fragment>
            ))}
          </ol>
        </nav>

        <header className="space-y-4">
          <h1 className="text-4xl font-extrabold text-white">Charging Stations in Albania</h1>
          <p className="text-lg text-gray-300 max-w-3xl">
            Explore every public charging location in Albania with live data from Open Charge Map. Search, filter, and export results to plan confident electric journeys.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-[380px,1fr]">
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <SlidersHorizontal className="h-5 w-5 text-gray-cyan" aria-hidden="true" />
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-sm font-semibold text-gray-cyan hover:text-white"
                >
                  Reset
                </button>
              </div>
              {loadingReferenceData && (
                <p className="text-xs text-gray-400">Loading filter options…</p>
              )}

              <label className="block">
                <span className="text-sm font-medium text-gray-300">Search</span>
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      type="search"
                      value={filters.search}
                      onChange={handleSearchInput}
                      placeholder="Search by name, address, or operator"
                      className="w-full rounded-lg border border-white/10 bg-gray-950/70 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                    />
                  </div>
                </div>
              </label>

              <div className="space-y-4">
                <MultiSelectFilter
                  label="Operators"
                  options={operatorOptions}
                  selected={filters.operatorIds}
                  onChange={value => setFilters(current => ({ ...current, operatorIds: value }))}
                />
                <MultiSelectFilter
                  label="Connection types"
                  options={connectionOptions}
                  selected={filters.connectionTypeIds}
                  onChange={value => setFilters(current => ({ ...current, connectionTypeIds: value }))}
                />
                <MultiSelectFilter
                  label="Charging levels"
                  options={levelOptions}
                  selected={filters.levelIds}
                  onChange={value => setFilters(current => ({ ...current, levelIds: value }))}
                />
                <MultiSelectFilter
                  label="Usage types"
                  options={usageOptions}
                  selected={filters.usageTypeIds}
                  onChange={value => setFilters(current => ({ ...current, usageTypeIds: value }))}
                />
                <MultiSelectFilter
                  label="Status"
                  options={statusOptions}
                  selected={filters.statusTypeIds}
                  onChange={value => setFilters(current => ({ ...current, statusTypeIds: value }))}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-400">Min kW</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={filters.powerMin}
                    onChange={event => setFilters(current => ({ ...current, powerMin: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-wide text-gray-400">Max kW</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={filters.powerMax}
                    onChange={event => setFilters(current => ({ ...current, powerMax: event.target.value }))}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-gray-950/70 px-3 py-2 text-sm text-white focus:border-gray-cyan focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-gray-950/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={filters.openNow}
                  onChange={event => setFilters(current => ({ ...current, openNow: event.target.checked }))}
                  className="h-4 w-4 rounded border-gray-500 text-gray-cyan focus:ring-gray-cyan"
                />
                <span className="text-sm text-gray-200">Show operational stations only</span>
              </label>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-semibold text-white">Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleLocate}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-cyan/60 bg-gray-cyan/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/30 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                >
                  <LocateFixed className="h-4 w-4" aria-hidden="true" />
                  Locate me
                </button>
                <button
                  type="button"
                  onClick={() => exportData('csv')}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => exportData('json')}
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Export JSON
                </button>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-gray-950/60 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Auto-update on map move</p>
                  <p className="text-xs text-gray-400">Fetch stations automatically whenever you pan or zoom.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoUpdate}
                  onClick={handleToggleAutoUpdate}
                  className={`relative h-7 w-14 rounded-full transition ${
                    autoUpdate ? 'bg-gray-cyan' : 'bg-gray-700'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                      autoUpdate ? 'right-1' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {!autoUpdate && (
                <button
                  type="button"
                  onClick={handleSearchArea}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-gray-cyan/60 bg-gray-cyan/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/30 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Search this area
                </button>
              )}
              {pendingSearch && !autoUpdate && (
                <p className="text-xs text-gray-400">Move detected. Press “Search this area” to refresh results here.</p>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <div className="relative h-[420px] rounded-2xl border border-white/10 bg-gray-950/50 shadow-xl lg:h-[520px]">
              <div ref={mapContainerRef} className="h-full w-full rounded-2xl" aria-label="Charging stations map" />
              {loadingStations && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-gray-950/60 backdrop-blur">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-cyan" aria-hidden="true" />
                  <span className="ml-3 text-sm text-white">Loading stations...</span>
                </div>
              )}
              <div className="absolute bottom-3 right-4 rounded bg-black/70 px-3 py-1 text-xs text-gray-300">
                Data © <a href="https://openchargemap.org" className="underline" target="_blank" rel="noreferrer">Open Charge Map contributors</a>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">{listHeading}</h2>
                {lastUpdated && (
                  <p className="text-xs text-gray-400">Last updated: {formatDateTime(lastUpdated)}</p>
                )}
              </div>
              {error && (
                <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  <X className="h-5 w-5" aria-hidden="true" />
                  <span>{error}</span>
                  <button
                    type="button"
                    onClick={handleRetry}
                    className="ml-auto text-sm font-semibold text-red-200 underline"
                  >
                    Retry
                  </button>
                </div>
              )}
              <div className="space-y-4" aria-live="polite">
                {visibleStations.map(station => {
                  const latLng = getStationLatLng(station);
                  const address = formatAddress(station.properties);
                  const powerRange = formatPowerRange(station.properties);
                  const status = station.properties.statusType?.title ?? 'Status unknown';
                  const usage = station.properties.usageType?.title ?? 'Usage unknown';
                  const isActive = hoveredStationId === station.properties.id || selectedStationId === station.properties.id;

                  return (
                    <article
                      key={station.properties.id}
                      className={`rounded-xl border px-4 py-4 transition ${
                        isActive ? 'border-gray-cyan/60 bg-gray-cyan/10 shadow-lg' : 'border-white/10 bg-gray-950/60'
                      }`}
                      onMouseEnter={() => setHoveredStationId(station.properties.id)}
                      onMouseLeave={() => setHoveredStationId(current => (current === station.properties.id ? null : current))}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-2">
                          <h3 className="text-lg font-semibold text-white">{station.properties.title ?? 'Unnamed location'}</h3>
                          <p className="text-sm text-gray-300">{address || 'Address unavailable'}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-gray-300">
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                              Operator: {station.properties.operatorInfo?.title ?? 'Unknown'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                              Status: {status}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                              Usage: {usage}
                            </span>
                            {powerRange && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                                Power: {powerRange}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStationId(station.properties.id);
                              if (mapRef.current) {
                                mapRef.current.flyTo([latLng.lat, latLng.lng], Math.max(mapRef.current.getZoom(), 14), {
                                  animate: true,
                                });
                              }
                            }}
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-cyan/50 bg-gray-cyan/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-gray-cyan/30 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          >
                            <MapPin className="h-4 w-4" aria-hidden="true" />
                            Focus on map
                          </button>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${latLng.lat},${latLng.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          >
                            Directions
                          </a>
                          <button
                            type="button"
                            onClick={() => shareStation(station)}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-cyan"
                          >
                            <Share2 className="h-4 w-4" aria-hidden="true" />
                            Share
                          </button>
                        </div>
                      </div>

                      {station.properties.connections && station.properties.connections.length > 0 && (
                        <div className="mt-4 overflow-x-auto">
                          <table className="min-w-full text-left text-xs text-gray-200">
                            <thead>
                              <tr className="text-gray-400">
                                <th className="px-2 py-1 font-semibold">Connector</th>
                                <th className="px-2 py-1 font-semibold">Level</th>
                                <th className="px-2 py-1 font-semibold">Power</th>
                                <th className="px-2 py-1 font-semibold">Quantity</th>
                              </tr>
                            </thead>
                            <tbody>
                              {station.properties.connections.map(connection => (
                                <tr key={connection.id} className="border-t border-white/5">
                                  <td className="px-2 py-2">
                                    {connection.connectionType?.title ?? '—'}
                                  </td>
                                  <td className="px-2 py-2">{connection.level?.title ?? '—'}</td>
                                  <td className="px-2 py-2">{connection.powerKW ? `${connection.powerKW} kW` : '—'}</td>
                                  <td className="px-2 py-2">{connection.quantity ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {station.properties.generalComments && (
                        <p className="mt-3 text-xs text-gray-400">{station.properties.generalComments}</p>
                      )}
                    </article>
                  );
                })}

                {!loadingStations && !visibleStations.length && !error && (
                  <div className="rounded-lg border border-white/10 bg-gray-950/60 px-4 py-6 text-center text-sm text-gray-300">
                    Try adjusting your filters or searching a different area of Albania.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white">How to Use the Map</h2>
          <ol className="space-y-3 text-gray-300">
            <li>
              <strong className="text-white">Search or browse:</strong> Enter a city, operator, or neighbourhood to jump straight to chargers in that area.
            </li>
            <li>
              <strong className="text-white">Filter smartly:</strong> Narrow down stations by connector type, charging speed, operator, status, or access rules.
            </li>
            <li>
              <strong className="text-white">Pan and zoom:</strong> Explore the map to view clusters anywhere in Albania. Leave auto-update on for live results, or tap “Search this area”.
            </li>
            <li>
              <strong className="text-white">Tap a marker:</strong> Open the popup to review detailed connection specs, pricing notes, and get instant directions.
            </li>
            <li>
              <strong className="text-white">Export or share:</strong> Download the visible results to CSV/JSON or copy a share link to revisit later.
            </li>
          </ol>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white">Where You’ll Find Chargers in Albania</h2>
          <p className="text-gray-300">
            Fast-growing coverage stretches from Tirana and Durrës to key corridors toward Shkodër, Korçë, and the southern coast. Rapid DC hubs support major highways, while AC wallboxes keep city centres and hospitality venues connected. Expect Type 2 plugs for everyday top-ups and CCS2 rapid chargers on long-distance routes.
          </p>
          <p className="text-gray-300">
            New sites appear regularly thanks to private operators, retail destinations, and municipal initiatives. Keep an eye on status indicators in each listing to confirm availability before you depart.
          </p>
        </section>

        <section className="space-y-6 rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl">
          <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map(item => (
              <details key={item.question} className="group rounded-xl border border-white/10 bg-gray-950/60 p-4">
                <summary className="flex cursor-pointer items-center justify-between text-lg font-semibold text-white">
                  {item.question}
                  <span className="ml-4 text-gray-400 transition group-open:rotate-45">
                    <X aria-hidden="true" className="h-5 w-5" />
                  </span>
                </summary>
                <p className="mt-3 text-sm text-gray-300">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ChargingStationsAlbaniaPage;
