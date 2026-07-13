import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Copy, Download, Grid3X3, Map } from "lucide-react";
import {
  countNestedBoxCommands,
  countXzWallCommands,
  DEFAULT_TRIBUTE_BLUEPRINT,
  generateNestedBoxSpawnCommands,
  generateXzWallSpawnCommands,
  MAX_SPAWN_GRID_COMMANDS,
} from "@/lib/spawnGridGenerators";

const PREVIEW_LINES = 400;

export function SpawnGridGeneratorsPanel() {
  const [blueprint, setBlueprint] = useState(DEFAULT_TRIBUTE_BLUEPRINT);
  const [nested, setNested] = useState({
    sizeX: 1,
    sizeY: 1,
    sizeZ: 1,
    offsetX: 300,
    offsetY: 500,
    offsetZ: 300,
  });
  const [wall, setWall] = useState({
    xStep: 300,
    zStep: 500,
    maxX: 20_000,
    maxZ: 20_000,
  });
  const [lines, setLines] = useState<string[]>([]);

  const nestedCount = useMemo(
    () => countNestedBoxCommands(nested.sizeX, nested.sizeY, nested.sizeZ),
    [nested.sizeX, nested.sizeY, nested.sizeZ],
  );
  const wallCount = useMemo(
    () => countXzWallCommands(wall.xStep, wall.zStep, wall.maxX, wall.maxZ),
    [wall.xStep, wall.zStep, wall.maxX, wall.maxZ],
  );

  const outputText = useMemo(() => lines.join("\n"), [lines]);
  const previewText = useMemo(() => {
    if (lines.length <= PREVIEW_LINES) return outputText;
    return `${lines.slice(0, PREVIEW_LINES).join("\n")}\n\n… ${(lines.length - PREVIEW_LINES).toLocaleString()} more lines (copy or download for full set)`;
  }, [lines, outputText]);

  const runNested = () => {
    if (nestedCount > MAX_SPAWN_GRID_COMMANDS) {
      toast.error(`Too many commands (${nestedCount.toLocaleString()}). Max ${MAX_SPAWN_GRID_COMMANDS.toLocaleString()}.`);
      return;
    }
    if (nestedCount === 0) {
      toast.error("Volume is zero — adjust sizes.");
      return;
    }
    const next = generateNestedBoxSpawnCommands({ ...nested, blueprint });
    setLines(next);
    toast.success(`Generated ${next.length.toLocaleString()} lines`);
  };

  const runWall = () => {
    if (wallCount > MAX_SPAWN_GRID_COMMANDS) {
      toast.error(`Too many commands (${wallCount.toLocaleString()}). Max ${MAX_SPAWN_GRID_COMMANDS.toLocaleString()}.`);
      return;
    }
    if (wallCount === 0) {
      toast.error("Invalid steps or range — check inputs.");
      return;
    }
    const next = generateXzWallSpawnCommands({ ...wall, blueprint });
    setLines(next);
    toast.success(`Generated ${next.length.toLocaleString()} lines`);
  };

  const copyAll = async () => {
    if (!outputText) {
      toast.error("Generate commands first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(outputText);
      toast.success("Copied all lines");
    } catch {
      toast.error("Clipboard denied");
    }
  };

  const downloadTxt = () => {
    if (!outputText) {
      toast.error("Generate commands first.");
      return;
    }
    const blob = new Blob([outputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ark_spawn_grid_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Download started");
  };

  return (
    <div className="space-y-6">
      <Card className="card-ark border-primary/20">
        <CardHeader>
          <CardTitle className="font-display text-lg">Blueprint path</CardTitle>
          <CardDescription>
            Default matches tribute terminal. Paste any structure/dino blueprint path; output uses{" "}
            <code className="text-xs text-foreground">admincheat spawnactor &quot;…&quot; X Z Y|</code> (ARK ground plane X+Y, height Z).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={blueprint}
            onChange={(e) => setBlueprint(e.target.value)}
            rows={3}
            className="font-mono text-xs"
            spellCheck={false}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="nested" className="w-full">
        <TabsList className="mb-4 grid h-auto w-full max-w-md grid-cols-2">
          <TabsTrigger value="nested" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Nested grid
          </TabsTrigger>
          <TabsTrigger value="wall" className="gap-2">
            <Map className="h-4 w-4" />
            XZ plane wall
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nested" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            3D nested loops (from <code className="text-foreground">Terminal.py</code>). Negative size flips step direction per axis.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["sizeX", "sizeY", "sizeZ"] as const).map((key) => (
              <div key={key}>
                <Label htmlFor={key}>Size {key.slice(-1).toUpperCase()}</Label>
                <Input
                  id={key}
                  type="number"
                  className="mt-2 font-mono"
                  value={nested[key]}
                  onChange={(e) => setNested({ ...nested, [key]: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {(["offsetX", "offsetY", "offsetZ"] as const).map((key) => (
              <div key={key}>
                <Label htmlFor={key}>Offset {key.slice(-1).toUpperCase()}</Label>
                <Input
                  id={key}
                  type="number"
                  className="mt-2 font-mono"
                  value={nested[key]}
                  onChange={(e) => setNested({ ...nested, [key]: parseInt(e.target.value, 10) || 0 })}
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={runNested}>
              Generate ({nestedCount.toLocaleString()} lines)
            </Button>
            {nestedCount > MAX_SPAWN_GRID_COMMANDS && (
              <span className="text-sm text-destructive">Exceeds safe max — reduce volume.</span>
            )}
          </div>
        </TabsContent>

        <TabsContent value="wall" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Stepped grid on the ground plane at Y=0 (from <code className="text-foreground">terminalwall.py</code>). Inclusive{" "}
            <code className="text-foreground">0 … max</code> with your step size.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="xs">X step</Label>
              <Input
                id="xs"
                type="number"
                className="mt-2 font-mono"
                min={1}
                value={wall.xStep}
                onChange={(e) => setWall({ ...wall, xStep: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              />
            </div>
            <div>
              <Label htmlFor="zs">Z step</Label>
              <Input
                id="zs"
                type="number"
                className="mt-2 font-mono"
                min={1}
                value={wall.zStep}
                onChange={(e) => setWall({ ...wall, zStep: Math.max(1, parseInt(e.target.value, 10) || 1) })}
              />
            </div>
            <div>
              <Label htmlFor="mx">Max X</Label>
              <Input
                id="mx"
                type="number"
                className="mt-2 font-mono"
                min={0}
                value={wall.maxX}
                onChange={(e) => setWall({ ...wall, maxX: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              />
            </div>
            <div>
              <Label htmlFor="mz">Max Z</Label>
              <Input
                id="mz"
                type="number"
                className="mt-2 font-mono"
                min={0}
                value={wall.maxZ}
                onChange={(e) => setWall({ ...wall, maxZ: Math.max(0, parseInt(e.target.value, 10) || 0) })}
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={runWall}>
              Generate ({wallCount.toLocaleString()} lines)
            </Button>
            {wallCount > MAX_SPAWN_GRID_COMMANDS && (
              <span className="text-sm text-destructive">Exceeds safe max — raise steps or lower max.</span>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Card className="card-ark border-border/60">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">Output</CardTitle>
            <CardDescription>
              {lines.length > 0
                ? `${lines.length.toLocaleString()} lines — paste into the in-game console in chunks (e.g. 200–400 lines) to avoid hitches.`
                : "Generate to preview; copy or download the full text."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" className="gap-2" onClick={() => void copyAll()}>
              <Copy className="h-4 w-4" />
              Copy all
            </Button>
            <Button type="button" size="sm" variant="outline" className="gap-2" onClick={downloadTxt}>
              <Download className="h-4 w-4" />
              Download .txt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            value={previewText}
            rows={16}
            className="font-mono text-xs"
            placeholder="Generated admincheat lines appear here…"
          />
        </CardContent>
      </Card>
    </div>
  );
}
