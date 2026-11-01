import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { apiGet } from '@/lib/api';

export type Rubrique = 'actualite' | 'cours' | 'voyage';

/** Format unique des publications (format_publication.json, plus la rubrique). */
export type Publication = {
  id: string;
  site: string;
  type: 'video' | 'image';
  rubrique: Rubrique;
  titre: string;
  affiche: string | null;
  media_url: string | null;
  duree: string | null;
  date: string;
  url: string;
};

type Options = { site?: string; rubriques?: Rubrique[]; limite?: number };

type Etat = {
  publications: Publication[];
  chargement: boolean;
  erreur: string | null;
  /** true quand on affiche les publications gardées en mémoire (hors ligne). */
  depuisCache: boolean;
};

function cleCache({ site, rubriques, limite }: Options) {
  return `publications:${site ?? 'toutes'}:${rubriques?.join(',') ?? 'toutes'}:${limite ?? 20}`;
}

function charger({ site, rubriques, limite = 20 }: Options): Promise<Publication[]> {
  return apiGet<Publication[]>('/api/publications', { site, rubrique: rubriques?.join(','), limite });
}

/** En cas d'échec, renvoie les publications gardées en mémoire au dernier succès. */
async function chargerAvecCache(options: Options): Promise<Etat> {
  const cle = cleCache(options);
  try {
    const publications = await charger(options);
    AsyncStorage.setItem(cle, JSON.stringify(publications)).catch(() => {});
    return { publications, chargement: false, erreur: null, depuisCache: false };
  } catch (e) {
    const erreur = e instanceof Error ? e.message : String(e);
    const cache = await AsyncStorage.getItem(cle).catch(() => null);
    const publications: Publication[] = cache ? JSON.parse(cache) : [];
    return { publications, chargement: false, erreur, depuisCache: publications.length > 0 };
  }
}

/** Dernières publications, de la plus récente à la plus ancienne, avec cache hors ligne. */
export function usePublications({ site, rubriques, limite }: Options = {}) {
  // Clé stable : un tableau recréé à chaque rendu ne doit pas relancer le chargement.
  const rubriquesCle = rubriques?.join(',');
  const [etat, setEtat] = useState<Etat>({
    publications: [],
    chargement: true,
    erreur: null,
    depuisCache: false,
  });

  const actualiser = useCallback(async () => {
    setEtat((e) => ({ ...e, chargement: true, erreur: null }));
    setEtat(await chargerAvecCache({ site, rubriques: lire(rubriquesCle), limite }));
  }, [site, rubriquesCle, limite]);

  useEffect(() => {
    let annule = false;
    chargerAvecCache({ site, rubriques: lire(rubriquesCle), limite }).then((nouvelEtat) => {
      if (!annule) setEtat(nouvelEtat);
    });
    return () => {
      annule = true;
    };
  }, [site, rubriquesCle, limite]);

  return { ...etat, actualiser };
}

function lire(rubriquesCle: string | undefined) {
  return rubriquesCle?.split(',') as Rubrique[] | undefined;
}

const NOMS_SITES: Record<string, string> = {
  'tijanizawiya.com': 'Tijanizawiya.com',
  'almadinauniversity.com': 'Almadinauniversity.com',
  'icfaonline.com': 'Icfaonline.com',
  'almadinatravel.net': 'Almadinatravel.net',
  'seneinfo.net': 'SeneInfo.net',
};

export function nomSite(slug: string) {
  return NOMS_SITES[slug] ?? slug;
}

/** « Il y a 2 h », « Hier », « 13 oct. »… */
export function dateRelative(iso: string, maintenant = new Date()): string {
  const date = new Date(iso);
  const minutes = Math.floor((maintenant.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `Il y a ${heures} h`;
  if (heures < 48) return 'Hier';
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
