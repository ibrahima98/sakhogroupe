import type { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type SiteInfo = {
  slug: string;
  nom: string;
  url: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
};

// Les 5 sites de SAKHO GROUP regroupés dans l'application.
export const SITES: SiteInfo[] = [
  {
    slug: 'tijanizawiya.com',
    nom: 'Tijanizawiya.com',
    url: 'https://tijanizawiya.com',
    description: 'Zawiya Tijaniya',
    icon: 'moon-outline',
  },
  {
    slug: 'almadinauniversity.com',
    nom: 'Almadinauniversity.com',
    url: 'https://almadinauniversity.com',
    description: 'Coran, arabe et études islamiques',
    icon: 'school-outline',
  },
  {
    slug: 'icfaonline.com',
    nom: 'Icfaonline.com',
    url: 'https://icfaonline.com',
    description: 'ICFA Institute : cours enfants et adultes',
    icon: 'library-outline',
  },
  {
    slug: 'almadinatravel.net',
    nom: 'Almadinatravel.net',
    url: 'https://almadinatravel.net',
    description: 'Omra et Hajj',
    icon: 'airplane-outline',
  },
  {
    slug: 'seneinfo.net',
    nom: 'SeneInfo.net',
    url: 'https://www.seneinfo.net',
    description: 'Actualités du Sénégal',
    icon: 'newspaper-outline',
  },
];
