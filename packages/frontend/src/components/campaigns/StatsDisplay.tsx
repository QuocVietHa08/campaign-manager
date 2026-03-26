import { Progress } from '../ui/progress';
import type { Stats } from '../../types';

export function StatsDisplay({ stats }: { stats: Stats }) {
  return (
    <div className="space-y-5">
      <h3 className="font-semibold">Campaign Stats</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold tabular-nums">{stats.total}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold tabular-nums text-success">{stats.sent}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Sent</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold tabular-nums text-destructive">{stats.failed}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Failed</p>
        </div>
        <div className="rounded-xl border bg-card p-4 text-center">
          <p className="text-2xl font-bold tabular-nums text-primary">{stats.opened}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Opened</p>
        </div>
      </div>
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Send Rate</span>
            <span className="font-medium tabular-nums">{stats.send_rate}%</span>
          </div>
          <Progress value={stats.send_rate} max={100} />
        </div>
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Open Rate</span>
            <span className="font-medium tabular-nums">{stats.open_rate}%</span>
          </div>
          <Progress value={stats.open_rate} max={100} />
        </div>
      </div>
    </div>
  );
}
