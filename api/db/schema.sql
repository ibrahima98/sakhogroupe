-- Schéma SAKHO GROUP pour Postgres (Neon via Vercel).
-- Pas de RLS : seule l'API Vercel parle à la base, avec une chaîne de connexion secrète.
-- Idempotent : peut être rejoué sans effet de bord (npm run migrate).

-- ---------------------------------------------------------------------------
-- Sites sources et publications (format_publication.json + rubrique)
-- ---------------------------------------------------------------------------
create table if not exists sites (
  slug text primary key,                      -- ex. tijanizawiya.net
  derniere_synchro timestamptz,
  derniere_erreur text
);

create table if not exists publications (
  id text primary key,                        -- ex. sn-97610
  site text not null references sites (slug) on delete cascade,
  type text not null check (type in ('video', 'image')),
  rubrique text not null default 'actualite'
    check (rubrique in ('actualite', 'cours', 'voyage')),
  titre varchar(90) not null,
  affiche text,                               -- image 16:9
  media_url text,                             -- lien vidéo (mp4 ou YouTube)
  duree text,                                 -- ex. 12:04
  date timestamptz not null,
  url text not null,
  vu_le timestamptz not null default now()    -- dernière synchro où la publication existait
);

create index if not exists publications_date_idx on publications (date desc);
create index if not exists publications_site_date_idx on publications (site, date desc);

-- ---------------------------------------------------------------------------
-- Administrateurs (mot de passe haché côté API)
-- ---------------------------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  mot_de_passe_hash text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Rubriques, livres, cours et leçons (ajoutés par l'administrateur)
-- ---------------------------------------------------------------------------
do $$ begin
  create type statut_contenu as enum ('brouillon', 'publie');
exception when duplicate_object then null;
end $$;

create table if not exists rubriques (
  id uuid primary key default gen_random_uuid(),
  nom text not null unique
);

create table if not exists livres (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  auteur text,
  rubrique_id uuid references rubriques (id) on delete set null,
  pdf_url text not null,                      -- Vercel Blob
  couverture_url text,                        -- 1re page du PDF
  nb_pages integer,
  statut statut_contenu not null default 'brouillon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cours (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  rubrique_id uuid references rubriques (id) on delete set null,
  affiche text,
  description text,
  statut statut_contenu not null default 'brouillon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lecons (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references cours (id) on delete cascade,
  titre text not null,
  ordre smallint not null default 0,
  video_url text not null,
  duree_secondes integer,
  created_at timestamptz not null default now()
);

create index if not exists lecons_cours_idx on lecons (cours_id, ordre);

-- ---------------------------------------------------------------------------
-- Voyages et demandes d'informations
-- ---------------------------------------------------------------------------
create table if not exists voyages (
  id uuid primary key default gen_random_uuid(),
  categorie text not null check (categorie in ('omra', 'hajj', 'billet')),
  titre text not null,
  texte text,
  affiche text,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  media_url text,
  statut statut_contenu not null default 'brouillon',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists demandes_voyage (
  id uuid primary key default gen_random_uuid(),
  voyage_id uuid references voyages (id) on delete set null,
  nom text not null,
  telephone text not null,
  email text,
  type_demande text,
  message text not null,
  ip text,                                    -- limite anti-envoi en masse
  envoyee_agence boolean not null default false,
  created_at timestamptz not null default now()
);
