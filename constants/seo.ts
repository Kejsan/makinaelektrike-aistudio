const { VITE_SITE_URL } = import.meta.env;

const DEFAULT_BASE_URL = 'https://makina-elektrike.netlify.app';

export const BASE_URL = (VITE_SITE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
export const DEFAULT_OG_IMAGE = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80';
