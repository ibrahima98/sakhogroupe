import type { Rubrique } from './adapters.js';

export type SiteConfig = {
  slug: string;
  nom: string;
  url: string;
  adaptateur: 'wordpress' | 'moodle' | 'auto';
  rubrique: Rubrique;
  /** Ignore les articles plus anciens (contenus de démo du thème WordPress). */
  depuis?: string;
};

// Les 5 sites de SAKHO GROUP (exploration du 01/11/2026).
export const SITES: SiteConfig[] = [
  {
    slug: 'tijanizawiya.net',
    nom: 'Tijanizawiya.net',
    url: 'https://tijanizawiya.net',
    adaptateur: 'auto', // le domaine ne résout pas (aucun DNS) au 01/11/2026
    rubrique: 'actualite',
  },
  {
    slug: 'almadinauniversity.com',
    nom: 'Almadinauniversity.com',
    url: 'https://almadinauniversity.com',
    adaptateur: 'moodle',
    rubrique: 'cours',
  },
  {
    slug: 'icfaonline.com',
    nom: 'Icfaonline.com',
    url: 'https://icfaonline.com',
    adaptateur: 'moodle',
    rubrique: 'cours',
  },
  {
    slug: 'almadinatravel.net',
    nom: 'Almadinatravel.net',
    url: 'https://almadinatravel.net',
    adaptateur: 'wordpress',
    rubrique: 'voyage',
    depuis: '2023-11-16', // avant : articles de démo du thème Enfold
  },
  {
    slug: 'seneinfo.net',
    nom: 'SeneInfo.net',
    url: 'https://www.seneinfo.net',
    adaptateur: 'wordpress',
    rubrique: 'actualite',
  },
];
