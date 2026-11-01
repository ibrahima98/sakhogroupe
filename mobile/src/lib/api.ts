const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Connexions mobiles parfois faibles : on retente avant d'afficher une erreur.
const DELAI_MS = 12_000; // par tentative
const ATTENTES_MS = [800, 2_000]; // avant la 2e puis la 3e tentative

/** Codes passagers (délai dépassé, surcharge, passerelle) qui valent une nouvelle tentative. */
const CODES_A_RETENTER = new Set([408, 425, 429, 500, 502, 503, 504]);

class ErreurApi extends Error {
  constructor(
    message: string,
    readonly aRetenter: boolean,
  ) {
    super(message);
  }
}

const attendre = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function tentative<T>(url: string): Promise<T> {
  const controleur = new AbortController();
  const minuterie = setTimeout(() => controleur.abort(), DELAI_MS);
  try {
    const reponse = await fetch(url, { signal: controleur.signal });
    if (!reponse.ok) {
      throw new ErreurApi(`Erreur du serveur (${reponse.status}).`, CODES_A_RETENTER.has(reponse.status));
    }
    return (await reponse.json()) as T;
  } catch (e) {
    if (e instanceof ErreurApi) throw e;
    // Délai dépassé ou pas de réseau : passager par nature.
    const message = controleur.signal.aborted ? 'Le serveur met trop de temps à répondre.' : 'Connexion impossible.';
    throw new ErreurApi(message, true);
  } finally {
    clearTimeout(minuterie);
  }
}

/** GET sur l'API Vercel (dossier api/ du projet), avec jusqu'à 3 tentatives. */
export async function apiGet<T>(chemin: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  if (!API_URL) throw new Error('Serveur non configuré (EXPO_PUBLIC_API_URL manquant).');
  const url = new URL(chemin, API_URL);
  for (const [cle, valeur] of Object.entries(params)) {
    if (valeur !== undefined) url.searchParams.set(cle, String(valeur));
  }

  for (let i = 0; ; i++) {
    try {
      return await tentative<T>(url.toString());
    } catch (e) {
      const derniere = i >= ATTENTES_MS.length;
      if (derniere || !(e instanceof ErreurApi) || !e.aRetenter) throw e;
      await attendre(ATTENTES_MS[i]);
    }
  }
}
