import { creerStore } from '@/lib/store';

export type Tasbih = {
  id: string;
  nom: string;
  /** Texte du dhikr, en arabe ou en français. */
  texte: string;
  /** Sens ou traduction (facultatif). */
  sens: string;
  cible: number;
  vibration: boolean;
  /** true pour les tasbih créés par l'utilisateur (supprimables). */
  perso: boolean;
};

export type Seance = {
  id: string;
  tasbihId: string;
  nom: string;
  total: number;
  dureeSecondes: number;
  date: string;
};

type Etat = {
  tasbihs: Tasbih[];
  actifId: string;
  /** Compte dans la série en cours (revient à 0 à chaque cible atteinte). */
  compteur: number;
  /** Numéro de la série en cours, à partir de 1. */
  serie: number;
  /** Total de la séance en cours (toutes séries). */
  totalSeance: number;
  /** Début de la séance (premier toucher), en ms ; null avant. */
  debut: number | null;
  /** Total de dhikr par jour (« 2026-11-01 »). */
  parJour: Record<string, number>;
  historique: Seance[];
  nuit: boolean;
};

export const CIBLES = [33, 99, 100];

const DE_BASE: Tasbih[] = [
  { id: 'subhanallah', nom: 'Subhanallah', texte: 'سُبْحَانَ ٱللَّهِ', sens: 'Gloire à Allah', cible: 33, vibration: true, perso: false },
  { id: 'alhamdulillah', nom: 'Alhamdulillah', texte: 'ٱلْحَمْدُ لِلَّهِ', sens: 'Louange à Allah', cible: 33, vibration: true, perso: false },
  { id: 'allahuakbar', nom: 'Allahu Akbar', texte: 'ٱللَّهُ أَكْبَرُ', sens: 'Allah est le plus grand', cible: 33, vibration: true, perso: false },
  { id: 'lailahaillallah', nom: 'La ilaha illa Allah', texte: 'لَا إِلَٰهَ إِلَّا ٱللَّهُ', sens: 'Il n’y a de divinité qu’Allah', cible: 100, vibration: true, perso: false },
  { id: 'astaghfirullah', nom: 'Astaghfirullah', texte: 'أَسْتَغْفِرُ ٱللَّهَ', sens: 'Je demande pardon à Allah', cible: 100, vibration: true, perso: false },
];

const SEANCE_VIDE = { compteur: 0, serie: 1, totalSeance: 0, debut: null };

const store = creerStore<Etat>(
  'tasbih',
  { tasbihs: DE_BASE, actifId: DE_BASE[0].id, ...SEANCE_VIDE, parJour: {}, historique: [], nuit: false },
  // Les tasbih de base viennent toujours du code ; on garde ceux de l'utilisateur.
  (defaut, lu) => ({ ...defaut, ...lu, tasbihs: [...DE_BASE, ...(lu.tasbihs ?? []).filter((t) => t.perso)] }),
);

export const useTasbih = store.useValeur;

export function tasbihActif(etat: Etat): Tasbih {
  return etat.tasbihs.find((t) => t.id === etat.actifId) ?? etat.tasbihs[0];
}

export function jourCle(date = new Date()): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const j = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${j}`;
}

/** Un toucher : +1. Renvoie 'cible' quand la série vient d'être terminée. */
export function compter(): 'cible' | 'compte' {
  let resultat: 'cible' | 'compte' = 'compte';
  store.set((e) => {
    const cible = tasbihActif(e).cible;
    const jour = jourCle();
    const compteur = e.compteur + 1;
    const fini = compteur >= cible;
    resultat = fini ? 'cible' : 'compte';
    return {
      ...e,
      compteur: fini ? 0 : compteur,
      serie: fini ? e.serie + 1 : e.serie,
      totalSeance: e.totalSeance + 1,
      debut: e.debut ?? Date.now(),
      parJour: { ...e.parJour, [jour]: (e.parJour[jour] ?? 0) + 1 },
    };
  });
  return resultat;
}

export function reinitialiser() {
  store.set((e) => ({ ...e, ...SEANCE_VIDE }));
}

/** Enregistre la séance en cours dans l'historique puis repart de zéro. */
export function enregistrerSeance(): boolean {
  const e = store.get();
  if (e.totalSeance === 0) return false;
  const t = tasbihActif(e);
  const seance: Seance = {
    id: String(Date.now()),
    tasbihId: t.id,
    nom: t.nom,
    total: e.totalSeance,
    dureeSecondes: e.debut ? Math.round((Date.now() - e.debut) / 1000) : 0,
    date: new Date().toISOString(),
  };
  // On garde les 200 dernières séances.
  store.set({ ...e, ...SEANCE_VIDE, historique: [seance, ...e.historique].slice(0, 200) });
  return true;
}

export function choisirTasbih(id: string) {
  store.set((e) => (e.actifId === id ? e : { ...e, actifId: id, ...SEANCE_VIDE }));
}

export function creerTasbih(t: Omit<Tasbih, 'id' | 'perso'>): Tasbih {
  const nouveau: Tasbih = { ...t, id: `perso-${Date.now()}`, perso: true };
  store.set((e) => ({ ...e, tasbihs: [...e.tasbihs, nouveau], actifId: nouveau.id, ...SEANCE_VIDE }));
  return nouveau;
}

export function supprimerTasbih(id: string) {
  store.set((e) => {
    const tasbihs = e.tasbihs.filter((t) => t.id !== id || !t.perso);
    const actifId = tasbihs.some((t) => t.id === e.actifId) ? e.actifId : tasbihs[0].id;
    return { ...e, tasbihs, actifId, ...(actifId !== e.actifId ? SEANCE_VIDE : {}) };
  });
}

export function basculerNuit() {
  store.set((e) => ({ ...e, nuit: !e.nuit }));
}

export function formatMinuteur(secondes: number) {
  const h = Math.floor(secondes / 3600);
  const m = String(Math.floor((secondes % 3600) / 60)).padStart(2, '0');
  const s = String(secondes % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}
