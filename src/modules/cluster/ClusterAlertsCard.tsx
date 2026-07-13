import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import type { ClusterAlert, ClusterState } from "@/lib/clusterRegistry";
import { newServerId } from "@/lib/clusterRegistry";

type Props = {
  state: ClusterState;
  onChange: (next: ClusterState) => void;
};

export function ClusterAlertsCard({ state, onChange }: Props) {
  const [message, setMessage] = useState("");
  const [level, setLevel] = useState<ClusterAlert["level"]>("info");

  const addAlert = () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error("Enter a message for the alert.");
      return;
    }
    const row: ClusterAlert = {
      id: newServerId(),
      level,
      message: trimmed,
      createdAt: new Date().toISOString(),
    };
    onChange({ ...state, alerts: [row, ...state.alerts] });
    setMessage("");
    toast.success("Alert added");
  };

  const remove = (id: string) => {
    onChange({ ...state, alerts: state.alerts.filter((a) => a.id !== id) });
  };

  return (
    <Card className="border-destructive/20 bg-card/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          Cluster notes & alerts
        </CardTitle>
        <CardDescription>Your own reminders (stored in this browser). Not synced to servers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="alert-level">Severity</Label>
            <Select value={level} onValueChange={(v) => setLevel(v as ClusterAlert["level"])}>
              <SelectTrigger id="alert-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid min-w-0 flex-[2] gap-2">
            <Label htmlFor="alert-msg">Message</Label>
            <Input
              id="alert-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Patch cluster before Friday event"
              maxLength={500}
            />
          </div>
          <Button type="button" className="gap-2 shrink-0" onClick={addAlert}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          {state.alerts.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">No alerts yet.</p>
          ) : (
            state.alerts.map((a) => (
              <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg bg-muted/40 p-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        a.level === "critical"
                          ? "border-destructive/60 bg-destructive/15 text-destructive-foreground"
                          : a.level === "warning"
                            ? "border-warning/50 bg-warning/15 text-warning-foreground"
                            : "border-info/50 bg-info/15 text-info-foreground"
                      }
                    >
                      {a.level}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(a.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-foreground">{a.message}</p>
                </div>
                <Button type="button" size="icon" variant="ghost" className="shrink-0" onClick={() => remove(a.id)} aria-label="Remove alert">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
