import { json } from '../../lib/http.js';
import { synchroniser } from '../../lib/sync.js';

/** GET /api/cron/sync : appelé par le cron Vercel (vercel.json) avec CRON_SECRET. */
export async function GET(request: Request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ erreur: 'Non autorisé' }, { status: 401 });
  }
  return json(await synchroniser());
}
