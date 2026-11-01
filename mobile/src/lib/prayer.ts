import { CalculationMethod, Coordinates, PrayerTimes } from 'adhan';
import { useEffect, useState } from 'react';

export type NomPriere = 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';

export type Lieu = { nom: string; latitude: number; longitude: number };

// Lieu par défaut avant que l'utilisateur choisisse le GPS ou une ville.
export const DAKAR: Lieu = { nom: 'Dakar, Sénégal', latitude: 14.6928, longitude: -17.4467 };

export const VILLES: Lieu[] = [
  DAKAR,
  { nom: 'Touba, Sénégal', latitude: 14.8667, longitude: -15.8833 },
  { nom: 'Tivaouane, Sénégal', latitude: 14.95, longitude: -16.8167 },
  { nom: 'Thiès, Sénégal', latitude: 14.791, longitude: -16.9359 },
  { nom: 'Kaolack, Sénégal', latitude: 14.1652, longitude: -16.0726 },
  { nom: 'Saint-Louis, Sénégal', latitude: 16.0326, longitude: -16.4818 },
  { nom: 'Ziguinchor, Sénégal', latitude: 12.5681, longitude: -16.2733 },
  { nom: 'New York, États-Unis', latitude: 40.7128, longitude: -74.006 },
  { nom: 'Paris, France', latitude: 48.8566, longitude: 2.3522 },
  { nom: 'La Mecque, Arabie saoudite', latitude: 21.4225, longitude: 39.8262 },
  { nom: 'Médine, Arabie saoudite', latitude: 24.4672, longitude: 39.6111 },
];

export const ORDRE: NomPriere[] = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const CLES = { Fajr: 'fajr', Dhuhr: 'dhuhr', Asr: 'asr', Maghrib: 'maghrib', Isha: 'isha' } as const;

export const NOMS_ARABES: Record<NomPriere, string> = {
  Fajr: 'الفجر',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export type MethodeCalcul =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'NorthAmerica'
  | 'Turkey';

// « Ligue islamique mondiale » par défaut : méthode affichée dans les maquettes.
export const METHODES: { id: MethodeCalcul; nom: string; details: string }[] = [
  { id: 'MuslimWorldLeague', nom: 'Ligue islamique mondiale', details: 'Fajr 18°, Isha 17°' },
  { id: 'Egyptian', nom: 'Autorité égyptienne', details: 'Fajr 19,5°, Isha 17,5°' },
  { id: 'Karachi', nom: 'Université de Karachi', details: 'Fajr 18°, Isha 18°' },
  { id: 'UmmAlQura', nom: 'Umm al-Qura (La Mecque)', details: 'Fajr 18,5°, Isha 90 min après Maghrib' },
  { id: 'Dubai', nom: 'Dubaï', details: 'Fajr 18,2°, Isha 18,2°' },
  { id: 'Qatar', nom: 'Qatar', details: 'Fajr 18°, Isha 90 min après Maghrib' },
  { id: 'Kuwait', nom: 'Koweït', details: 'Fajr 18°, Isha 17,5°' },
  { id: 'NorthAmerica', nom: 'ISNA (Amérique du Nord)', details: 'Fajr 15°, Isha 15°' },
  { id: 'Turkey', nom: 'Diyanet (Turquie)', details: 'Fajr 18°, Isha 17°' },
];

function horaires(lieu: Lieu, jour: Date, methode: MethodeCalcul) {
  const coords = new Coordinates(lieu.latitude, lieu.longitude);
  return new PrayerTimes(coords, jour, CalculationMethod[methode]());
}

/** Les 5 prières d'un jour, dans l'ordre. */
export function horairesDuJour(
  lieu: Lieu,
  jour: Date,
  methode: MethodeCalcul = 'MuslimWorldLeague',
): { nom: NomPriere; heure: Date }[] {
  const h = horaires(lieu, jour, methode);
  return ORDRE.map((nom) => ({ nom, heure: h[CLES[nom]] }));
}

export function prochainePriere(
  lieu: Lieu,
  maintenant: Date,
  methode: MethodeCalcul = 'MuslimWorldLeague',
): { nom: NomPriere; heure: Date } {
  const aujourdhui = horaires(lieu, maintenant, methode);
  for (const nom of ORDRE) {
    const heure = aujourdhui[CLES[nom]];
    if (heure > maintenant) return { nom, heure };
  }
  // Après Isha : Fajr du lendemain.
  const demain = new Date(maintenant);
  demain.setDate(demain.getDate() + 1);
  return { nom: 'Fajr', heure: horaires(lieu, demain, methode).fajr };
}

export function formatHeure(date: Date) {
  return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuree(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Heure courante, mise à jour chaque seconde. */
export function useMaintenant() {
  const [maintenant, setMaintenant] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setMaintenant(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return maintenant;
}
