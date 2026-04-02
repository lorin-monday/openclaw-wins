import { ok } from '../../../lib/api.js';
import { listBots } from '../../../lib/bot-auth.js';

export async function GET() {
  const bots = listBots();
  return ok({ bots });
}
