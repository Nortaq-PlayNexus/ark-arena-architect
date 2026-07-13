import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { appConfig, getAppDisplayTitle } from "@/lib/appConfig";
import { loadClusterState } from "@/lib/clusterRegistry";
import { loadClusterMetrics } from "@/lib/clusterMetrics";
import packageJson from "../../package.json";
import { COMPANION_PROJECTS } from "@/core/companionProjects";
import { SUITE_ROUTE_PATHS } from "@/core/suiteRoutes";
import { SUITE_STORAGE_KEYS, suiteLocalStoragePresence } from "@/core/suiteStorageKeys";
import { loadIniLibraryState } from "@/lib/iniSnippetLibrary";

function buildSuiteDiagnostics(): Record<string, unknown> {
  const cluster = loadClusterState();
  const metrics = loadClusterMetrics();
  return {
    schema: "ark-master-suite-diagnostics",
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    app: {
      name: packageJson.name,
      version: packageJson.version,
      displayTitle: getAppDisplayTitle(),
      mode: appConfig.MODE,
      dev: appConfig.DEV,
      prod: appConfig.PROD,
    },
    client: {
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      href: typeof window !== "undefined" ? window.location.href : "",
      online: typeof navigator !== "undefined" ? navigator.onLine : true,
      language: typeof navigator !== "undefined" ? navigator.language : "",
    },
    cluster: {
      serverRows: cluster.servers.length,
      alertRows: cluster.alerts.length,
      metricSnapshots: metrics.length,
    },
    suite: {
      companionLaunchEntries: COMPANION_PROJECTS.length,
      iniSnippetCount: loadIniLibraryState().snippets.length,
      routes: [...SUITE_ROUTE_PATHS],
      storageKeys: [...SUITE_STORAGE_KEYS],
      localStoragePresent: suiteLocalStoragePresence(),
    },
  };
}

export default function MasterDiagnosticsPage() {
  const getText = () => JSON.stringify(buildSuiteDiagnostics(), null, 2);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      toast.success("Diagnostics copied to clipboard");
    } catch {
      toast.error("Clipboard denied — use Download instead");
    }
  };

  const download = () => {
    const blob = new Blob([getText()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ark_master_diagnostics_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Diagnostics file downloaded");
  };

  const snap = buildSuiteDiagnostics();

  return (
    <div className="min-h-full ark-survival-bg text-foreground">
      <div className="ark-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <p className="ark-kicker">Diagnostics</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">Support bundle</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Suite-level environment summary (no workspace preset payload). For full arena workspace JSON, use the Arena workspace Export tab or command palette.
          </p>
        </div>

        <Card className="border-primary/15 bg-card/80">
          <CardHeader>
            <CardTitle>Current snapshot</CardTitle>
            <CardDescription>Safe to share — excludes tokens and arena build payloads.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="max-h-64 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed">
              {JSON.stringify(snap, null, 2)}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" onClick={() => void copy()}>
                Copy JSON
              </Button>
              <Button type="button" className="gap-2" onClick={download}>
                <Download className="h-4 w-4" />
                Download JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
