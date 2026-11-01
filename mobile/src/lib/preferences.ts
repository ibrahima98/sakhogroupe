import { DAKAR, type Lieu, type MethodeCalcul, type NomPriere } from '@/lib/prayer';
import { creerStore } from '@/lib/store';

export type Preferences = {
  methodePriere: MethodeCalcul;
  lieu: Lieu;
  /** true si le lieu vient du GPS (sinon : ville choisie). */
  lieuGps: boolean;
  /** Rappel activé pour chaque prière. */
  rappels: Record<NomPriere, boolean>;
};

const DEFAUT: Preferences = {
  methodePriere: 'MuslimWorldLeague',
  lieu: DAKAR,
  lieuGps: false,
  rappels: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
};

export const preferences = creerStore<Preferences>('preferences', DEFAUT, (defaut, lu) => ({
  ...defaut,
  ...lu,
  rappels: { ...defaut.rappels, ...lu.rappels },
}));

export function modifierPreferences(changement: Partial<Preferences>) {
  preferences.set((avant) => ({ ...avant, ...changement }));
}

export function usePreferences(): Preferences {
  return preferences.useValeur();
}
