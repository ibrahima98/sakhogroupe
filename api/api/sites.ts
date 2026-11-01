import { sql } from '../lib/db.js';
import { json, options } from '../lib/http.js';
import { SITES } from '../lib/sites.js';

/** GET /api/sites : les sites, avec l'état de leur dernière synchro. */
export async function GET() {
  const etats = await sql<{ slug: string; derniere_synchro: Date | null; derniere_erreur: string | null }[]>`
    select slug, derniere_synchro, derniere_erreur from sites
  `;
  const parSlug = new Map(etats.map((e) => [e.slug, e]));
  return json(
    SITES.map(({ slug, nom, url, rubrique }) => ({
      slug,
      nom,
      url,
      rubrique,
      derniere_synchro: parSlug.get(slug)?.derniere_synchro ?? null,
      disponible: !parSlug.get(slug)?.derniere_erreur,
    })),
    { cache: 'public, s-maxage=60' },
  );
}

export const OPTIONS = options;
