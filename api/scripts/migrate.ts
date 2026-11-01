import { readFileSync } from 'node:fs';

import { sql } from '../lib/db.js';

// Applique db/schema.sql (idempotent).
await sql.unsafe(readFileSync(new URL('../db/schema.sql', import.meta.url), 'utf8'));
console.log('Schéma appliqué.');
await sql.end();
