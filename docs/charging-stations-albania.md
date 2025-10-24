# Charging Stations in Albania Page

The `/albania-charging-stations` route displays live data from Open Charge Map with a clustered Leaflet map, synced list view, and SEO content. This document outlines configuration knobs and maintenance tips.

## Environment variables

The page expects an Open Charge Map API key at build time. Provide it to Vite/Netlify using either the `VITE_OCM_API_KEY` or `OCM_API_KEY` variable (both are recognised at build time).

```
VITE_OCM_API_KEY=your_open_charge_map_key
# or
OCM_API_KEY=your_open_charge_map_key
```

If no key is supplied the client will attempt unauthenticated requests, which Open Charge Map may heavily throttle. Always configure a dedicated key for production builds to avoid disruptions.

## Map defaults

The default map centre and zoom are set in `pages/ChargingStationsAlbaniaPage.tsx`:

```
const DEFAULT_CENTER: [number, number] = [41.3275, 19.8187];
const DEFAULT_ZOOM = 8;
```

Update these constants to change the initial viewport (for example to focus on a different Albanian region).

## Query behaviour

Fetching logic lives in `services/ocm.ts` and `pages/ChargingStationsAlbaniaPage.tsx`.

- `maxresults` is currently capped at 200 to balance coverage and performance.
- Auto-update re-queries OCM when the user pans/zooms with a 450 ms debounce.
- Manual searches reuse the latest bounds when filters change.

Adjust the options in `fetchStations` or the debounce timing inside `handleMapMove` if you need different performance characteristics.

## Filters and reference data

`fetchReferenceData` (in `services/ocm.ts`) populates operators, connection types, levels, usage types, and status types. The page caches this response in component state.

To tweak available filters:

1. Update the mapping logic in `pages/ChargingStationsAlbaniaPage.tsx` when building the `operatorOptions`, `connectionOptions`, etc.
2. Modify the UI in the same file (look for the `MultiSelectFilter` component usages).

## Export controls

The CSV/JSON exports are generated client-side from the currently visible stations. Adjust the columns inside `exportData` if you need additional attributes.

## Shareable URLs

The page syncs filters, map position, auto-update state, and the selected POI to the query string. When adding new filters remember to read/write their values in both:

- The `filtersRef` initialisation block.
- The `setSearchParams` effect.
- The `shareStation` helper.

Keeping these in sync ensures deep links continue to work correctly.
