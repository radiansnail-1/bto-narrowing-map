import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Where To BTO',
    short_name: 'Where To BTO',
    description: 'Compare Singapore BTO locations using transparent criteria and dated official sources.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#cb2b33',
    lang: 'en-SG',
    categories: ['housing', 'lifestyle', 'utilities'],
  };
}
