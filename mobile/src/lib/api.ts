const API_URL = process.env.EXPO_PUBLIC_API_URL;

/** GET sur l'API Vercel (dossier api/ du projet). */
export async function apiGet<T>(chemin: string, params: Record<string, string | number | undefined> = {}): Promise<T> {
  if (!API_URL) throw new Error('Serveur non configuré (EXPO_PUBLIC_API_URL manquant).');
  const url = new URL(chemin, API_URL);
  for (const [cle, valeur] of Object.entries(params)) {
    if (valeur !== undefined) url.searchParams.set(cle, String(valeur));
  }
  const reponse = await fetch(url.toString());
  if (!reponse.ok) throw new Error(`Erreur du serveur (${reponse.status}).`);
  return reponse.json() as Promise<T>;
}
