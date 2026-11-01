import { recupererPublications } from './adapters.js';
import { sql } from './db.js';
import { SITES, type SiteConfig } from './sites.js';

export type Resultat = { site: string; publications: number; erreur?: string };

/** Délai minimal entre deux synchros déclenchées par une lecture. */
export const FRAICHEUR_MS = 15 * 60_000;

async function synchroniserSite(site: SiteConfig): Promise<Resultat> {
  await sql`insert into sites (slug) values (${site.slug}) on conflict do nothing`;
  try {
    const publications = await recupererPublications(site);
    // Dédoublonne (un même id peut apparaître deux fois sur une page).
    const uniques = [...new Map(publications.map((p) => [p.id, p])).values()];
    if (uniques.length > 0) {
      // La date n'est jamais mise à jour : pour Moodle, elle reste celle de la 1re synchro.
      await sql`
        insert into publications ${sql(uniques, 'id', 'site', 'type', 'rubrique', 'titre', 'affiche', 'media_url', 'duree', 'date', 'url')}
        on conflict (id) do update set
          type = excluded.type,
          rubrique = excluded.rubrique,
          titre = excluded.titre,
          affiche = excluded.affiche,
          media_url = excluded.media_url,
          duree = excluded.duree,
          url = excluded.url,
          vu_le = now()
      `;
    }
    await sql`update sites set derniere_synchro = now(), derniere_erreur = null where slug = ${site.slug}`;
    return { site: site.slug, publications: uniques.length };
  } catch (e) {
    // Site indisponible : on garde les anciennes publications et on note l'erreur.
    const erreur = e instanceof Error ? e.message : String(e);
    await sql`update sites set derniere_synchro = now(), derniere_erreur = ${erreur} where slug = ${site.slug}`;
    return { site: site.slug, publications: 0, erreur };
  }
}

export function synchroniser(): Promise<Resultat[]> {
  return Promise.all(SITES.map(synchroniserSite));
}

/** true si aucun site n'a été synchronisé depuis FRAICHEUR_MS. */
export async function synchroPerimee(): Promise<boolean> {
  const [{ derniere }] = await sql<{ derniere: Date | null }[]>`
    select max(derniere_synchro) as derniere from sites
  `;
  return !derniere || Date.now() - derniere.getTime() > FRAICHEUR_MS;
}
