import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ClusterMetricPoint } from "@/lib/clusterMetrics";
import { metricsChartRows } from "@/lib/clusterMetrics";

type Props = {
  points: ClusterMetricPoint[];
};

export function ClusterStatsChart({ points }: Props) {
  const rows = metricsChartRows(points);
  const empty = rows.length === 0;

  return (
    <Card className="border-primary/15 bg-card/80">
      <CardHeader>
        <CardTitle>Cluster snapshots</CardTitle>
        <CardDescription>
          Player totals and online server counts each time you record a snapshot (stored locally in this browser).
        </CardDescription>
      </CardHeader>
      <CardContent>
        {empty ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No snapshots yet. Use <span className="font-medium text-foreground">Record snapshot</span> in Quick actions.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="time" className="text-xs" />
              <YAxis className="text-xs" allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="players" stroke="hsl(var(--primary))" strokeWidth={2} name="Players online" />
              <Line type="monotone" dataKey="online" stroke="hsl(var(--info))" strokeWidth={2} name="Servers online" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
