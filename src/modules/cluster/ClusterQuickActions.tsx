import { useRef, type ChangeEventHandler } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { ClusterState } from "@/lib/clusterRegistry";
import { clusterSummary, exportClusterJson, importClusterJson } from "@/lib/clusterRegistry";
import { appendClusterMetricSnapshot, clearClusterMetrics } from "@/lib/clusterMetrics";

type Props = {
  state: ClusterState;
  onImportState: (next: ClusterState) => void;
  onMetricsUpdate: () => void;
};

export function ClusterQuickActions({ state, onImportState, onMetricsUpdate }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const recordSnapshot = () => {
    const { onlineCount, totalPlayers } = clusterSummary(state);
    appendClusterMetricSnapshot({ totalPlayers, onlineServers: onlineCount });
    onMetricsUpdate();
    toast.success("Snapshot recorded", {
      description: `${totalPlayers} players across ${onlineCount} online servers (local series updated).`,
    });
  };

  const exportFile = () => {
    const blob = new Blob([exportClusterJson(state)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ark_master_cluster_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cluster registry exported");
  };

  const onPickFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const next = importClusterJson(text);
      if (!next) {
        toast.error("Import failed", { description: "File was not valid ARK Master cluster JSON." });
        return;
      }
      onImportState(next);
      toast.success("Cluster registry imported", {
        description: `${next.servers.length} servers, ${next.alerts.length} alerts.`,
      });
    };
    reader.readAsText(f);
  };

  const clearSeries = () => {
    clearClusterMetrics();
    onMetricsUpdate();
    toast.message("Snapshot series cleared");
  };

  return (
    <Card className="border-primary/15 bg-card/80">
      <CardHeader>
        <CardTitle>Quick actions</CardTitle>
        <CardDescription>Local data only — connect your own RCON or agent later for live control.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onPickFile} />
        <Button type="button" className="gap-2 bg-gradient-to-r from-primary to-neon-cyan text-primary-foreground" onClick={recordSnapshot}>
          <Camera className="h-4 w-4" />
          Record snapshot
        </Button>
        <Button type="button" variant="secondary" className="gap-2" onClick={exportFile}>
          <Download className="h-4 w-4" />
          Export registry
        </Button>
        <Button type="button" variant="outline" className="gap-2" onClick={() => fileRef.current?.click()}>
          <Upload className="h-4 w-4" />
          Import registry
        </Button>
        <Button type="button" variant="ghost" className="gap-2 text-muted-foreground" onClick={clearSeries}>
          <Trash2 className="h-4 w-4" />
          Clear chart data
        </Button>
      </CardContent>
    </Card>
  );
}
