import { useCallback, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, HardDrive, Server, Users } from "lucide-react";
import { ClusterServerList } from "@/modules/cluster/ClusterServerList";
import { ClusterStatsChart } from "@/modules/cluster/ClusterStatsChart";
import { ClusterQuickActions } from "@/modules/cluster/ClusterQuickActions";
import { ClusterAlertsCard } from "@/modules/cluster/ClusterAlertsCard";
import {
  clusterSummary,
  loadClusterState,
  saveClusterState,
  type ClusterState,
} from "@/lib/clusterRegistry";
import { loadClusterMetrics } from "@/lib/clusterMetrics";

export default function ClusterDashboardPage() {
  const [state, setState] = useState<ClusterState>(() => loadClusterState());
  const [metrics, setMetrics] = useState(() => loadClusterMetrics());

  const persist = useCallback((next: ClusterState) => {
    setState(next);
    saveClusterState(next);
  }, []);

  const summary = useMemo(() => clusterSummary(state), [state]);

  const perfApprox =
    state.servers.length === 0
      ? 0
      : Math.min(100, Math.round((summary.onlineCount / Math.max(1, state.servers.length)) * 100));

  return (
    <div className="min-h-full ark-survival-bg text-foreground">
      <div className="ark-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-[min(100%,88rem)] space-y-6 px-4 py-8 sm:px-6">
        <div>
          <p className="ark-kicker">Cluster</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">Registry & snapshots</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Track servers you operate, record player totals over time, and keep operational notes. Data stays in this browser until you export it.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Online servers</CardTitle>
              <Server className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.onlineCount}/{state.servers.length}
              </div>
              <p className="text-xs text-muted-foreground">{summary.offlineCount} marked offline</p>
            </CardContent>
          </Card>
          <Card className="border-accent/20 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Players (online maps)</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalPlayers}</div>
              <p className="text-xs text-muted-foreground">Sum of player counts you entered</p>
            </CardContent>
          </Card>
          <Card className="border-success/25 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity used</CardTitle>
              <Activity className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.maxCapacity === 0
                  ? "—"
                  : `${Math.min(100, Math.round((summary.totalPlayers / summary.maxCapacity) * 100))}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.totalPlayers} / {summary.maxCapacity} slots (online servers)
              </p>
            </CardContent>
          </Card>
          <Card className="border-info/25 bg-card/80">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Availability index</CardTitle>
              <HardDrive className="h-4 w-4 text-info" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{state.servers.length === 0 ? "—" : `${perfApprox}%`}</div>
              <p className="text-xs text-muted-foreground">Share of servers marked online</p>
            </CardContent>
          </Card>
        </div>

        <ClusterQuickActions
          state={state}
          onImportState={(next) => persist(next)}
          onMetricsUpdate={() => setMetrics(loadClusterMetrics())}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <ClusterStatsChart points={metrics} />
          <ClusterServerList state={state} onChange={persist} />
        </div>

        <ClusterAlertsCard state={state} onChange={persist} />
      </div>
    </div>
  );
}
