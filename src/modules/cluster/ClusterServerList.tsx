import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { ClusterServer, ClusterState } from "@/lib/clusterRegistry";
import { defaultServer, newServerId } from "@/lib/clusterRegistry";

type Props = {
  state: ClusterState;
  onChange: (next: ClusterState) => void;
};

function updateServer(list: ClusterServer[], id: string, patch: Partial<ClusterServer>): ClusterServer[] {
  return list.map((s) => (s.id === id ? { ...s, ...patch } : s));
}

export function ClusterServerList({ state, onChange }: Props) {
  const add = () => {
    const row = defaultServer({ id: newServerId() });
    onChange({ ...state, servers: [...state.servers, row] });
    toast.success("Server row added — edit fields below.");
  };

  const remove = (id: string) => {
    onChange({ ...state, servers: state.servers.filter((s) => s.id !== id) });
  };

  const patch = (id: string, partial: Partial<ClusterServer>) => {
    onChange({ ...state, servers: updateServer(state.servers, id, partial) });
  };

  return (
    <Card className="border-primary/15 bg-card/80">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Server registry</CardTitle>
          <CardDescription>Define your cluster for local tracking. Toggle online and player counts to match your reality.</CardDescription>
        </div>
        <Button type="button" size="sm" className="gap-2" onClick={add}>
          <Plus className="h-4 w-4" />
          Add server
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {state.servers.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No servers yet. Add a row for each map or instance you operate.
          </p>
        ) : (
          state.servers.map((server) => (
            <div
              key={server.id}
              className="grid gap-3 rounded-lg border border-border/60 bg-muted/20 p-4 md:grid-cols-[1fr_1fr_minmax(0,120px)_minmax(0,100px)_minmax(0,100px)_auto] md:items-center"
            >
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`name-${server.id}`}>
                  Display name
                </label>
                <Input
                  id={`name-${server.id}`}
                  value={server.displayName}
                  onChange={(e) => patch(server.id, { displayName: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`map-${server.id}`}>
                  Map / id
                </label>
                <Input
                  id={`map-${server.id}`}
                  value={server.mapId}
                  onChange={(e) => patch(server.id, { mapId: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div className="flex items-center gap-2 md:flex-col md:items-start">
                <span className="text-xs font-medium text-muted-foreground">Online</span>
                <div className="flex items-center gap-2">
                  <Switch checked={server.online} onCheckedChange={(online) => patch(server.id, { online })} />
                  <Badge variant={server.online ? "default" : "secondary"} className={server.online ? "bg-success text-success-foreground" : ""}>
                    {server.online ? "online" : "offline"}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`pc-${server.id}`}>
                  Players
                </label>
                <Input
                  id={`pc-${server.id}`}
                  type="number"
                  min={0}
                  value={server.playerCount}
                  onChange={(e) => patch(server.id, { playerCount: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`mx-${server.id}`}>
                  Cap
                </label>
                <Input
                  id={`mx-${server.id}`}
                  type="number"
                  min={1}
                  max={500}
                  value={server.maxPlayers}
                  onChange={(e) => patch(server.id, { maxPlayers: Math.min(500, Math.max(1, parseInt(e.target.value, 10) || 1)) })}
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" size="icon" variant="ghost" onClick={() => remove(server.id)} aria-label="Remove server">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
