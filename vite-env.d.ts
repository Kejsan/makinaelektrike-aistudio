/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly PUBLIC_GOOGLE_MAPS_API_KEY?: string;
  readonly GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_OCM_API_KEY?: string;
  readonly OCM_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
