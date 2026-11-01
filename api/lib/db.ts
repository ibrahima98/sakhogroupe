import postgres from 'postgres';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL manquant (chaîne de connexion Neon).');

// Neon impose TLS ; un Postgres local (tests) n'en a pas besoin.
export const sql = postgres(url, {
  ssl: /localhost|127\.0\.0\.1/.test(url) ? false : 'require',
  max: 1, // une connexion par fonction serverless
  idle_timeout: 20,
  onnotice: () => {},
});
