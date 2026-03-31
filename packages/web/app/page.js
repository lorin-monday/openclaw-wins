import { WinsDashboard } from '../components/wins-dashboard';
import { getAllWins, getWinStats } from '../lib/wins';

export const dynamic = 'force-dynamic';

export default function Page() {
  const wins = getAllWins();
  const stats = getWinStats(wins);
  return <WinsDashboard initialWins={wins} initialStats={stats} />;
}
