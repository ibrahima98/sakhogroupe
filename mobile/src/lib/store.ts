import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/**
 * Petit store partagé gardé sur le téléphone : toutes les pages voient la même valeur,
 * sans compte ni serveur (préférences, tasbih…).
 */
export function creerStore<T>(cle: string, defaut: T, fusion: (defaut: T, lu: T) => T = (_, lu) => lu) {
  let courant = defaut;
  let pret = false;
  const abonnes = new Set<() => void>();
  const notifier = () => abonnes.forEach((f) => f());

  const charge = AsyncStorage.getItem(cle)
    .then((brut) => {
      if (brut) courant = fusion(defaut, JSON.parse(brut) as T);
    })
    .catch(() => {})
    .finally(() => {
      pret = true;
      notifier();
    });

  function sAbonner(f: () => void) {
    abonnes.add(f);
    return () => {
      abonnes.delete(f);
    };
  }

  return {
    /** Résolu quand la valeur enregistrée a été lue. */
    charge,
    get: () => courant,
    estPret: () => pret,
    set(modif: T | ((avant: T) => T)) {
      courant = typeof modif === 'function' ? (modif as (avant: T) => T)(courant) : modif;
      notifier();
      AsyncStorage.setItem(cle, JSON.stringify(courant)).catch(() => {});
    },
    useValeur(): T {
      return useSyncExternalStore(sAbonner, () => courant, () => courant);
    },
  };
}
