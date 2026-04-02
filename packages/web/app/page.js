import { WinsDashboard } from '../components/wins-dashboard';
import { getAllWins, getWinStats } from '../lib/wins';
import { listBots } from '../lib/bot-auth';

export const dynamic = 'force-dynamic';

export default function Page() {
  const wins = getAllWins();
  const stats = getWinStats(wins);
  const bots = listBots();
  return <WinsDashboard initialWins={wins} initialStats={stats} initialBots={bots} />;
}
