/**
 * Adaptateurs : convertissent chaque site au format unique de publication
 * (format_publication.json, plus le champ « rubrique »). Sans dépendance.
 */

export type Rubrique = 'actualite' | 'cours' | 'voyage';

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

export type Site = {
  slug: string;
  url: string;
  adaptateur: string;
  rubrique: Rubrique;
  depuis?: string;
};

const MAX_TITRE = 90;
const NB_PUBLICATIONS = 10;
const TIMEOUT_MS = 15_000;
const USER_AGENT = 'Mozilla/5.0 (compatible; SakhoGroupBot/1.0)';

// Préfixe des identifiants : « tz-97610 », « sn-97610 »…
const PREFIXES: Record<string, string> = {
  'tijanizawiya.net': 'tz',
  'almadinauniversity.com': 'amu',
  'icfaonline.com': 'icfa',
  'almadinatravel.net': 'amt',
  'seneinfo.net': 'sn',
};

export class AdaptateurErreur extends Error {}

// ---------------------------------------------------------------------------
// Utilitaires texte
// ---------------------------------------------------------------------------

const ENTITES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  laquo: '«',
  raquo: '»',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  ndash: '–',
  mdash: '—',
};

export function decoderEntites(texte: string): string {
  return texte.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (brut, code: string) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : brut;
    }
    return ENTITES[code.toLowerCase()] ?? brut;
  });
}

export function nettoyerTitre(html: string): string {
  const texte = decoderEntites(html.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
  return texte.length <= MAX_TITRE ? texte : texte.slice(0, MAX_TITRE - 1).trimEnd() + '…';
}

/** Cherche une vidéo dans un contenu HTML : YouTube d'abord, puis fichier mp4. */
export function trouverVideo(
  html: string,
): { id: string; media_url: string; affiche: string | null } | null {
  const yt = html.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (yt) {
    return {
      id: `yt-${yt[1]}`,
      media_url: `https://www.youtube.com/watch?v=${yt[1]}`,
      // hqdefault existe pour toutes les vidéos (maxresdefault, 1280 × 720, pas toujours).
      affiche: `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
    };
  }
  const mp4 = html.match(/https?:\/\/[^\s"'<>]+\.mp4/i);
  return mp4 ? { id: hash(mp4[0]), media_url: mp4[0], affiche: null } : null;
}

function premiereImage(html: string): string | null {
  return html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? null;
}

function idPublication(siteSlug: string, idSource: string | number): string {
  const prefixe = PREFIXES[siteSlug] ?? siteSlug.split('.')[0];
  return `${prefixe}-${idSource}`;
}

/** Hash court et stable (FNV-1a) pour les liens sans identifiant numérique. */
function hash(texte: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < texte.length; i++) {
    h ^= texte.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

function absolu(url: string, base: string): string {
  return new URL(url.startsWith('//') ? 'https:' + url : url, base).toString();
}

async function telecharger(url: string): Promise<Response> {
  let reponse: Response;
  try {
    reponse = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: 'follow',
    });
  } catch (e) {
    // « fetch failed » ne dit rien : on remonte la cause (ENOTFOUND = domaine introuvable).
    const cause = (e as { cause?: { code?: string } }).cause?.code;
    throw new AdaptateurErreur(`${url} : ${cause ?? (e instanceof Error ? e.message : e)}`);
  }
  if (!reponse.ok) throw new AdaptateurErreur(`${url} : HTTP ${reponse.status}`);
  return reponse;
}

// ---------------------------------------------------------------------------
// WordPress (API REST). Essaie /wp-json puis ?rest_route= (permaliens désactivés,
// cas d'almadinatravel.net).
// ---------------------------------------------------------------------------

type WpPost = {
  id: number;
  date_gmt: string;
  link: string;
  title: { rendered: string };
  content?: { rendered: string };
  _embedded?: { 'wp:featuredmedia'?: { source_url?: string }[] };
};

async function postsWordpress(site: Site): Promise<WpPost[]> {
  const params = `per_page=${NB_PUBLICATIONS}&_embed=wp:featuredmedia`;
  const urls = [
    `${site.url}/wp-json/wp/v2/posts?${params}`,
    `${site.url}/?rest_route=/wp/v2/posts&${params}`,
  ];
  let derniereErreur: unknown;
  for (const url of urls) {
    try {
      const reponse = await telecharger(url);
      if (!reponse.headers.get('content-type')?.includes('json')) {
        throw new AdaptateurErreur(`${url} : pas une API WordPress`);
      }
      const posts = await reponse.json();
      if (Array.isArray(posts)) return posts as WpPost[];
      throw new AdaptateurErreur(`${url} : réponse inattendue`);
    } catch (e) {
      derniereErreur = e;
    }
  }
  throw derniereErreur;
}

export async function adaptateurWordpress(site: Site): Promise<Publication[]> {
  const depuis = site.depuis ? Date.parse(site.depuis) : 0;
  const posts = (await postsWordpress(site)).filter(
    (post) => Date.parse(post.date_gmt + 'Z') >= depuis && post.title.rendered !== 'Hello world!',
  );

  return posts.map((post) => {
    const contenu = post.content?.rendered ?? '';
    const video = trouverVideo(contenu);
    const imageUne = post._embedded?.['wp:featuredmedia']?.[0]?.source_url ?? null;
    return {
      id: idPublication(site.slug, post.id),
      site: site.slug,
      type: video ? 'video' : 'image',
      rubrique: site.rubrique,
      titre: nettoyerTitre(post.title.rendered),
      affiche: imageUne ?? video?.affiche ?? premiereImage(contenu),
      media_url: video?.media_url ?? null,
      duree: null, // non fournie par WordPress ni par YouTube sans clé d'API
      date: new Date(post.date_gmt + 'Z').toISOString(),
      url: post.link,
    };
  });
}

// ---------------------------------------------------------------------------
// Moodle (almadinauniversity.com, icfaonline.com) : le catalogue demande une
// connexion, on lit donc les cours affichés sur la page d'accueil publique.
// Sans date de publication : la base garde la date de première synchro.
// ---------------------------------------------------------------------------

export function lireAccueilMoodle(html: string, site: Site, maintenant = new Date()): Publication[] {
  const cours = new Map<string, Publication>();

  // Thème « academi » : blocs available-content avec image et titre.
  const blocs = html.split(/class="available-content"/).slice(1);
  for (const bloc of blocs) {
    const lien = bloc.match(/href=["']?(https?:\/\/[^"'\s>]+\/course\/view\.php\?id=(\d+))/);
    const titre = bloc.match(/<h6>\s*<a[^>]*>([\s\S]*?)<\/a>/)?.[1];
    if (!lien || !titre) continue;
    const image = bloc.match(/<img[^>]+src="([^"]+overviewfiles[^"]+)"/)?.[1];
    cours.set(lien[2], {
      id: idPublication(site.slug, `cours-${lien[2]}`),
      site: site.slug,
      type: 'image',
      rubrique: 'cours',
      titre: nettoyerTitre(titre),
      affiche: image ? absolu(image, site.url) : null,
      media_url: null,
      duree: null,
      date: maintenant.toISOString(),
      url: lien[1],
    });
  }

  // Autres thèmes (« klassroom ») : simples liens vers les cours.
  for (const m of html.matchAll(/<a[^>]*href="(https?:\/\/[^"]+\/course\/view\.php\?id=(\d+))"[^>]*>([\s\S]*?)<\/a>/g)) {
    const titre = nettoyerTitre(m[3]);
    if (cours.has(m[2]) || !titre || m[2] === '1') continue;
    cours.set(m[2], {
      id: idPublication(site.slug, `cours-${m[2]}`),
      site: site.slug,
      type: 'image',
      rubrique: 'cours',
      titre,
      affiche: null,
      media_url: null,
      duree: null,
      date: maintenant.toISOString(),
      url: m[1],
    });
  }

  const publications = [...cours.values()];

  // Vidéo de présentation intégrée à l'accueil.
  const video = trouverVideo(html);
  if (video) {
    const titre = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? site.slug;
    publications.unshift({
      id: idPublication(site.slug, video.id),
      site: site.slug,
      type: 'video',
      rubrique: 'actualite',
      titre: nettoyerTitre(`Présentation : ${titre.replace(/^Home \| /, '')}`),
      affiche: video.affiche,
      media_url: video.media_url,
      duree: null,
      date: maintenant.toISOString(),
      url: site.url,
    });
  }
  return publications;
}

export async function adaptateurMoodle(site: Site): Promise<Publication[]> {
  const html = await (await telecharger(site.url)).text();
  const publications = lireAccueilMoodle(html, site);
  if (publications.length === 0) throw new AdaptateurErreur(`${site.url} : aucun cours trouvé`);
  return publications;
}

// ---------------------------------------------------------------------------
// RSS 2.0
// ---------------------------------------------------------------------------

function balise(item: string, nom: string): string | null {
  const m = item.match(new RegExp(`<${nom}[^>]*>([\\s\\S]*?)</${nom}>`, 'i'));
  if (!m) return null;
  return m[1].replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, '$1').trim();
}

function attribut(item: string, nom: string, attr: string): string | null {
  return item.match(new RegExp(`<${nom}[^>]*\\s${attr}=["']([^"']+)["']`, 'i'))?.[1] ?? null;
}

export function lireRss(xml: string, site: Site): Publication[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  return items.slice(0, NB_PUBLICATIONS).map((item) => {
    const lien = decoderEntites(balise(item, 'link') ?? '');
    const contenu = [balise(item, 'content:encoded'), balise(item, 'description')].join(' ');
    const video = trouverVideo(contenu) ?? trouverVideo(lien);
    const enclosure = attribut(item, 'enclosure', 'url');
    const affiche =
      attribut(item, 'media:content', 'url') ??
      attribut(item, 'media:thumbnail', 'url') ??
      (enclosure && /\.(jpe?g|png|webp)/i.test(enclosure) ? enclosure : null) ??
      video?.affiche ??
      premiereImage(contenu);
    const guid = balise(item, 'guid') ?? lien;
    const idSource = guid.match(/[?&]p=(\d+)/)?.[1] ?? hash(guid);
    const date = balise(item, 'pubDate');
    return {
      id: idPublication(site.slug, idSource),
      site: site.slug,
      type: video ? 'video' : 'image',
      rubrique: site.rubrique,
      titre: nettoyerTitre(balise(item, 'title') ?? ''),
      affiche,
      media_url: video?.media_url ?? null,
      duree: null,
      date: (date ? new Date(date) : new Date()).toISOString(),
      url: lien,
    };
  });
}

export async function adaptateurRss(site: Site, chemin = '/feed'): Promise<Publication[]> {
  const url = site.url + chemin;
  const xml = await (await telecharger(url)).text();
  if (!/<rss[\s>]/i.test(xml)) throw new AdaptateurErreur(`${url} : pas un flux RSS`);
  return lireRss(xml, site);
}

// ---------------------------------------------------------------------------
// Auto : WordPress, puis les chemins RSS courants
// ---------------------------------------------------------------------------

export async function adaptateurAuto(site: Site): Promise<Publication[]> {
  const essais: (() => Promise<Publication[]>)[] = [
    () => adaptateurWordpress(site),
    () => adaptateurRss(site, '/feed'),
    () => adaptateurRss(site, '/?feed=rss2'),
    () => adaptateurRss(site, '/rss.xml'),
  ];
  const erreurs: string[] = [];
  for (const essai of essais) {
    try {
      return await essai();
    } catch (e) {
      erreurs.push(e instanceof Error ? e.message : String(e));
    }
  }
  throw new AdaptateurErreur(`Aucun flux trouvé (API WordPress ou RSS). ${erreurs.join(' ; ')}`);
}

const ADAPTATEURS: Record<string, (site: Site) => Promise<Publication[]>> = {
  wordpress: adaptateurWordpress,
  moodle: adaptateurMoodle,
  rss: (site) => adaptateurRss(site),
  auto: adaptateurAuto,
};

export async function recupererPublications(site: Site): Promise<Publication[]> {
  const adaptateur = ADAPTATEURS[site.adaptateur];
  if (!adaptateur) throw new AdaptateurErreur(`Adaptateur inconnu : ${site.adaptateur}`);
  // On garde seulement les publications utilisables par la carte (titre, lien, date valide).
  return (await adaptateur(site)).filter(
    (p) => p.titre && p.url && !Number.isNaN(Date.parse(p.date)),
  );
}
