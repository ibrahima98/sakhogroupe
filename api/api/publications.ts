import { waitUntil } from '@vercel/functions';

import type { Publication, Rubrique } from '../lib/adapters.js';
import { sql } from '../lib/db.js';
import { json, options } from '../lib/http.js';
import { synchroniser, synchroPerimee } from '../lib/sync.js';

const RUBRIQUES: Rubrique[] = ['actualite', 'cours', 'voyage'];

/**
 * GET /api/publications?site=seneinfo.net&rubrique=actualite,voyage&limite=20
 * Dernières publications, de la plus récente à la plus ancienne.
 */
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const site = params.get('site');
  const rubriques = (params.get('rubrique')?.split(',') ?? RUBRIQUES).filter((r): r is Rubrique =>
    RUBRIQUES.includes(r as Rubrique),
  );
  const limite = Math.min(Math.max(Number(params.get('limite')) || 20, 1), 50);

  // Rafraîchit les sites en arrière-plan si la dernière synchro date de plus de 15 min
  // (le cron Vercel du plan gratuit ne tourne qu'une fois par jour).
  if (await synchroPerimee()) waitUntil(synchroniser().catch(() => {}));

  // distinct on : une même vidéo intégrée à deux sites n'apparaît qu'une fois.
  const publications = await sql<Publication[]>`
    select * from (
      select distinct on (coalesce(media_url, id))
        id, site, type, rubrique, titre, affiche, media_url, duree, date, url
      from publications
      where rubrique in ${sql(rubriques)}
        ${site ? sql`and site = ${site}` : sql``}
      order by coalesce(media_url, id), date desc
    ) p
    order by date desc
    limit ${limite}
  `;

  return json(publications, { cache: 'public, s-maxage=60, stale-while-revalidate=300' });
}

export const OPTIONS = options;
