import { sql } from '../lib/db.js';
import { synchroniser } from '../lib/sync.js';

// Synchronise les 5 sites depuis la ligne de commande.
console.table(await synchroniser());
await sql.end();
