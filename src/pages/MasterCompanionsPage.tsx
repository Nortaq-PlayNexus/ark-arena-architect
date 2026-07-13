import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Copy, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { COMPANION_PROJECTS, exportCompanionLaunchRegistryJson } from "@/core/companionProjects";

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`Copied ${label}`);
  } catch {
    toast.error("Clipboard denied");
  }
}

function downloadLaunchRegistry() {
  const blob = new Blob([exportCompanionLaunchRegistryJson()], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ark_master_companion_launch_registry_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success("Launch registry downloaded");
}

export default function MasterCompanionsPage() {
  return (
    <div className="min-h-full ark-survival-bg text-foreground">
      <div className="ark-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <div>
          <p className="ark-kicker">Companions</p>
          <h1 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">Launch guide</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            These tools live next to ARK Master on disk. Open a terminal at your <strong className="text-foreground">Ark workspace root</strong>{" "}
            (the folder that contains <code className="text-foreground">ark_cluster_bot</code>,{" "}
            <code className="text-foreground">native-tools</code>, and this app’s parent folders). Copy commands below — adjust drive letters
            if your tree differs.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            <Link to="/settings" className="text-primary underline-offset-4 hover:underline">
              Settings
            </Link>{" "}
            still holds cluster export/clear and performance notes; this page is the runnable checklist.
          </p>
          <div className="mt-4">
            <Button type="button" variant="outline" size="sm" className="gap-2" onClick={downloadLaunchRegistry}>
              <Download className="h-4 w-4" />
              Download launch registry JSON
            </Button>
          </div>
        </div>

        <Accordion type="multiple" defaultValue={COMPANION_PROJECTS.slice(0, 2).map((p) => p.id)} className="space-y-2">
          {COMPANION_PROJECTS.map((p) => (
            <AccordionItem key={p.id} value={p.id} className="rounded-lg border border-border/80 bg-card/80 px-4">
              <AccordionTrigger className="text-left hover:no-underline">
                <div>
                  <div className="font-display text-base text-foreground">{p.title}</div>
                  <div className="text-xs font-normal text-muted-foreground">{p.relativeRoot}</div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="space-y-4 pb-4 text-sm text-muted-foreground">
                <p>{p.summary}</p>
                {p.prerequisites.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-foreground">Prerequisites</p>
                    <ul className="list-inside list-disc space-y-1">
                      {p.prerequisites.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {p.envExampleRelative && (
                  <p>
                    Env template:{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-foreground">{p.envExampleRelative}</code>
                  </p>
                )}
                {p.warnings && p.warnings.length > 0 && (
                  <ul className="space-y-1 border-l-2 border-warning/60 pl-3 text-xs text-warning">
                    {p.warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                )}
                {p.steps.map((step) => (
                  <div key={step.title}>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-foreground">{step.title}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={() => void copyText(step.script, step.title)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy block
                      </Button>
                    </div>
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-muted/50 p-3 font-mono text-xs text-foreground">
                      {step.script}
                    </pre>
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <Card className="border-primary/15 bg-card/80">
          <CardHeader>
            <CardTitle className="text-base">Root spawn scripts (legacy)</CardTitle>
            <CardDescription>
              Prefer <Link to="/toolkit" className="text-primary underline-offset-4 hover:underline">Toolkit → Spawn grids</Link> in this app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              <code className="text-foreground">Terminal.py</code> and <code className="text-foreground">terminalwall.py</code> at the Ark
              workspace root remain as references; the suite UI replaces them for interactive use.
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Not integrated</CardTitle>
            <CardDescription>Excluded from ARK Master on purpose.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              Folders such as <code className="text-foreground">Cheats/</code> and cheat-marketing repos are out of scope.{" "}
              <code className="text-foreground">Server/</code> holds live JSON saves — back it up; do not treat it as app source.
            </p>
          </CardContent>
        </Card>

        <p className="flex items-center gap-2 text-center text-xs text-muted-foreground">
          <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          ARK Master stays local-first: no Discord token or RCON password belongs in <code className="text-foreground">VITE_*</code> env.
        </p>
      </div>
    </div>
  );
}
