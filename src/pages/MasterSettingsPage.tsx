import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Boxes, Download, FileCode, Trash2 } from "lucide-react";
import { appConfig, getAppDisplayTitle } from "@/lib/appConfig";
import { exportClusterJson, loadClusterState } from "@/lib/clusterRegistry";
import { clearClusterMetrics, loadClusterMetrics } from "@/lib/clusterMetrics";
import { clearIniLibraryStorage, exportIniLibraryJson, loadIniLibraryState } from "@/lib/iniSnippetLibrary";
import packageJson from "../../package.json";

export default function MasterSettingsPage() {
  const [, setRev] = useState(0);

  const refresh = () => setRev((r) => r + 1);

  const exportCluster = () => {
    const state = loadClusterState();
    const blob = new Blob([exportClusterJson(state)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ark_master_cluster_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Cluster registry exported");
  };

  const clearClusterData = () => {
    if (!window.confirm("Remove all cluster servers, alerts, and metric snapshots from this browser?")) return;
    window.localStorage.removeItem("ark-master:cluster-registry:v1");
    clearClusterMetrics();
    refresh();
    toast.message("Cluster local data cleared");
  };

  const exportIniLibrary = () => {
    const state = loadIniLibraryState();
    const blob = new Blob([exportIniLibraryJson(state)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ark_master_ini_library_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("INI library exported");
  };

  const clearIniData = () => {
    if (!window.confirm("Remove all INI snippets from this browser? Export a backup first if you need them.")) return;
    clearIniLibraryStorage();
    refresh();
    toast.message("INI library cleared");
  };

  return (
    <div className="min-h-full ark-survival-bg text-foreground">
      <div className="ark-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <p className="ark-kicker">Settings</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">Suite preferences & data</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Workspace appearance and arena options live in the Arena workspace header. This page covers cluster data and environment.
          </p>
        </div>

        <Card className="border-primary/25 bg-card/80">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">Companion apps</CardTitle>
              <CardDescription>Copy-paste PowerShell steps for the Discord bot, PyQt suite, Promote, and native tools.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" className="gap-2" asChild>
                <Link to="/companions">
                  <Boxes className="h-4 w-4" />
                  Launch guide
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <Link to="/ini">
                  <FileCode className="h-4 w-4" />
                  INI library
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-primary/15 bg-card/80">
          <CardHeader>
            <CardTitle>Application</CardTitle>
            <CardDescription>Build identity from package and Vite env (no secrets).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <p>
              <span className="text-muted-foreground">Name:</span> {packageJson.name}
            </p>
            <p>
              <span className="text-muted-foreground">Version:</span> {packageJson.version}
            </p>
            <p>
              <span className="text-muted-foreground">Display title:</span> {getAppDisplayTitle()}
            </p>
            <p>
              <span className="text-muted-foreground">MODE:</span> {appConfig.MODE}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card/80">
          <CardHeader>
            <CardTitle>Cluster data</CardTitle>
            <CardDescription>Stored under keys <code className="text-xs">ark-master:cluster-registry:v1</code> and{" "}
            <code className="text-xs">ark-master:cluster-metrics:v1</code>.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="gap-2" onClick={exportCluster}>
              <Download className="h-4 w-4" />
              Export cluster JSON
            </Button>
            <Button type="button" variant="destructive" className="gap-2" onClick={clearClusterData}>
              <Trash2 className="h-4 w-4" />
              Clear cluster & metrics
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card/80">
          <CardHeader>
            <CardTitle>INI library</CardTitle>
            <CardDescription>
              Snippets in <code className="text-xs">ark-master:ini-library:v1</code>. Same backup format as the INI library page.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Snippets in this browser: <span className="font-mono text-foreground">{loadIniLibraryState().snippets.length}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" className="gap-2" onClick={exportIniLibrary}>
                <Download className="h-4 w-4" />
                Export INI backup JSON
              </Button>
              <Button type="button" variant="outline" className="gap-2" asChild>
                <Link to="/ini">
                  <FileCode className="h-4 w-4" />
                  Open INI library
                </Link>
              </Button>
              <Button type="button" variant="destructive" className="gap-2" onClick={clearIniData}>
                <Trash2 className="h-4 w-4" />
                Clear INI library
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card/80">
          <CardHeader>
            <CardTitle>Performance &amp; Windows helpers</CardTitle>
            <CardDescription>Native tools next to your Ark workspace (not bundled in the web build).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Python FPS / latency script</strong> —{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">native-tools/fps_optimizer/main.py</code> or run{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">ark_fps_optimizer.py</code> from the workspace root. Requires
              Python 3 + <code className="text-foreground">psutil</code>; run elevated; review before use (power, TCP, registry, may kill listed processes).
            </p>
            <p>
              <strong className="text-foreground">ASA Lag Fixer (WinUI / .NET)</strong> — sibling folder{" "}
              <code className="text-foreground">Asa Smooth Gameplay/</code> (Visual Studio / Windows App SDK). Tweaks GPU preference, Game Mode, and{" "}
              <code className="text-foreground">GameUserSettings.ini</code> — complementary to the Python script; pick one or both after reading each tool.
            </p>
            <p>
              <strong className="text-foreground">Dedicated server manager releases</strong> —{" "}
              <code className="text-foreground">ASADedicatedManager_Releases_MSI-main/</code> (release notes / version track; not part of this SPA).
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 bg-card/80">
          <CardHeader>
            <CardTitle>Companion projects</CardTitle>
            <CardDescription>Separate runtimes under the same Ark desktop folder — keep tokens and secrets out of the browser app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Discord bot</strong> — <code className="text-foreground">ark_cluster_bot/</code> (
              <code className="text-foreground">python -m bot.main</code> after <code className="text-foreground">.env</code>).
            </p>
            <p>
              <strong className="text-foreground">PyQt automation suite</strong> — <code className="text-foreground">Ark Automated scripts/</code> (in-game
              loop macros; large module tree).
            </p>
            <p>
              <strong className="text-foreground">Cluster promoter</strong> — <code className="text-foreground">Promote/</code> (Python; marketing / outreach tooling).
            </p>
            <p>
              <strong className="text-foreground">INI collection stub</strong> — <code className="text-foreground">ark-inis-main/</code> (README-only until you add INI payloads).
            </p>
            <p>
              <strong className="text-foreground">Server save data</strong> — <code className="text-foreground">Server/</code> (JSON profiles — backup only, not merged into the app).
            </p>
            <p className="border-t border-border/60 pt-3 text-xs">
              Snapshot count in this browser: <span className="font-mono text-foreground">{loadClusterMetrics().length}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
