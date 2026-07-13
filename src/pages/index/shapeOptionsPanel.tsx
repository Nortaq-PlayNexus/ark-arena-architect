import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { RefreshCw } from "lucide-react";
import type { ShapeCategory } from "@/lib/shapeGenerators";
import { Field, ToggleOption } from "@/pages/index/indexFormFields";

export type CreatureDetailImpact = {
  baseCount: number;
  currentCount: number;
  delta: number;
  percent: number;
} | null;

export type ShapeOptionsPanelProps = {
  activeShapeName: string;
  shapeCategory: ShapeCategory;
  creatureDetailImpact: CreatureDetailImpact;
  difficulty: "small" | "medium" | "large" | "brutal";
  setDifficulty: (v: "small" | "medium" | "large" | "brutal") => void;
  wallHeight: number;
  setWallHeight: (v: number) => void;
  wallThickness: number;
  setWallThickness: (v: number) => void;
  deadEndDensity: number;
  setDeadEndDensity: (v: number) => void;
  hasFloor: boolean;
  setHasFloor: (v: boolean) => void;
  hasBorder: boolean;
  setHasBorder: (v: boolean) => void;
  hasCornerTowers: boolean;
  setHasCornerTowers: (v: boolean) => void;
  mazeSeed: number;
  setMazeSeed: (v: number) => void;
  pathStyle: "linear" | "zigzag" | "circular" | "serpentine";
  setPathStyle: (v: "linear" | "zigzag" | "circular" | "serpentine") => void;
  obstacleDensity: number;
  setObstacleDensity: (v: number) => void;
  hasRailings: boolean;
  setHasRailings: (v: boolean) => void;
  hasSpectatorPlatforms: boolean;
  setHasSpectatorPlatforms: (v: boolean) => void;
  traversalStyle: "spiral" | "outer" | "ramp" | "jumpgap";
  setTraversalStyle: (v: "spiral" | "outer" | "ramp" | "jumpgap") => void;
  floorCount: number;
  setFloorCount: (v: number) => void;
  hasCentralPillar: boolean;
  setHasCentralPillar: (v: boolean) => void;
  hasTopPlatform: boolean;
  setHasTopPlatform: (v: boolean) => void;
  gateCount: number;
  setGateCount: (v: number) => void;
  hasVIPPlatform: boolean;
  setHasVIPPlatform: (v: boolean) => void;
  cagePreset: "small" | "medium" | "giant";
  setCagePreset: (v: "small" | "medium" | "giant") => void;
  roofStyle: "open" | "closed";
  setRoofStyle: (v: "open" | "closed") => void;
  hasDoors: boolean;
  setHasDoors: (v: boolean) => void;
  hasCornerPosts: boolean;
  setHasCornerPosts: (v: boolean) => void;
  hasCenterMarker: boolean;
  setHasCenterMarker: (v: boolean) => void;
  hasInnerFloor: boolean;
  setHasInnerFloor: (v: boolean) => void;
  hasBridges: boolean;
  setHasBridges: (v: boolean) => void;
  hasSupportPillars: boolean;
  setHasSupportPillars: (v: boolean) => void;
  shapeCenterZ: number;
  creatureDetailLevel: "low" | "medium" | "ultra";
  setCreatureDetailLevel: (v: "low" | "medium" | "ultra") => void;
};

export function ShapeOptionsPanel(p: ShapeOptionsPanelProps) {
  const name = p.activeShapeName;

  if (
    name === "Maze" ||
    name === "Micro Maze" ||
    name === "Mega Maze" ||
    name === "Winter Maze" ||
    name === "Citadel Maze" ||
    name === "Labyrinth Prime" ||
    name === "Apex Labyrinth"
  ) {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Difficulty</Label>
          <Select value={p.difficulty} onValueChange={(v) => p.setDifficulty(v as ShapeOptionsPanelProps["difficulty"])}>
            <SelectTrigger className="ark-input mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small (8×8)</SelectItem>
              <SelectItem value="medium">Medium (14×14)</SelectItem>
              <SelectItem value="large">Large (22×22)</SelectItem>
              <SelectItem value="brutal">Brutal (32×32)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field label="Wall Height" value={p.wallHeight} onChange={p.setWallHeight} min={300} />
        <Field label="Wall Thickness" value={p.wallThickness} onChange={p.setWallThickness} min={1} />
        <div>
          <Label className="text-xs text-muted-foreground">Dead-End Density: {Math.round(p.deadEndDensity * 100)}%</Label>
          <Slider value={[p.deadEndDensity]} onValueChange={([v]) => p.setDeadEndDensity(v)} min={0} max={1} step={0.05} className="mt-1" />
        </div>
        <ToggleOption label="Floor Layer" checked={p.hasFloor} onChange={p.setHasFloor} />
        <ToggleOption label="Outer Border" checked={p.hasBorder} onChange={p.setHasBorder} />
        <ToggleOption label="Corner Towers" checked={p.hasCornerTowers} onChange={p.setHasCornerTowers} />
        <Button variant="outline" onClick={() => p.setMazeSeed(Date.now())} className="w-full gap-2 font-display tracking-wide text-xs">
          <RefreshCw className="w-3 h-3" /> Regenerate Maze
        </Button>
        <Field label="Seed" value={p.mazeSeed} onChange={p.setMazeSeed} />
      </div>
    );
  }

  if (
    name === "Obstacle Course" ||
    name === "Serpentine Course" ||
    name === "Circuit Run" ||
    name === "Endurance Run" ||
    name === "Switchback Sprint" ||
    name === "Wave Rider Course" ||
    name === "Vortex Run" ||
    name === "Ironman Sprint" ||
    name === "Precision Parkour"
  ) {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Path Style</Label>
          <Select value={p.pathStyle} onValueChange={(v) => p.setPathStyle(v as ShapeOptionsPanelProps["pathStyle"])}>
            <SelectTrigger className="ark-input mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="linear">Linear</SelectItem>
              <SelectItem value="zigzag">Zig-Zag</SelectItem>
              <SelectItem value="serpentine">Serpentine</SelectItem>
              <SelectItem value="circular">Circular</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Obstacle Density: {Math.round(p.obstacleDensity * 100)}%</Label>
          <Slider value={[p.obstacleDensity]} onValueChange={([v]) => p.setObstacleDensity(v)} min={0.3} max={1} step={0.05} className="mt-1" />
        </div>
        <ToggleOption label="Railings" checked={p.hasRailings} onChange={p.setHasRailings} />
        <ToggleOption label="Spectator Platforms" checked={p.hasSpectatorPlatforms} onChange={p.setHasSpectatorPlatforms} />
        <Button variant="outline" onClick={() => p.setMazeSeed(Date.now())} className="w-full gap-2 font-display tracking-wide text-xs">
          <RefreshCw className="w-3 h-3" /> Regenerate Course
        </Button>
        <Field label="Seed" value={p.mazeSeed} onChange={p.setMazeSeed} />
      </div>
    );
  }

  if (name === "Tower Arena") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Traversal</Label>
          <Select value={p.traversalStyle} onValueChange={(v) => p.setTraversalStyle(v as ShapeOptionsPanelProps["traversalStyle"])}>
            <SelectTrigger className="ark-input mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spiral">Spiral Staircase</SelectItem>
              <SelectItem value="outer">Outer Staircase</SelectItem>
              <SelectItem value="ramp">Ramp</SelectItem>
              <SelectItem value="jumpgap">Jump-Gap Floors</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Field label="Floor Count" value={p.floorCount} onChange={p.setFloorCount} min={2} />
        <ToggleOption label="Central Pillar" checked={p.hasCentralPillar} onChange={p.setHasCentralPillar} />
        <ToggleOption label="Top Battle Platform" checked={p.hasTopPlatform} onChange={p.setHasTopPlatform} />
      </div>
    );
  }

  if (name === "Colosseum" || name === "Spectacle Bowl") {
    return (
      <div className="space-y-3">
        <Field label="Gate Count" value={p.gateCount} onChange={p.setGateCount} min={0} />
        <ToggleOption label="VIP Platform" checked={p.hasVIPPlatform} onChange={p.setHasVIPPlatform} />
      </div>
    );
  }

  if (name === "Cage Match") {
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Cage Size</Label>
          <Select value={p.cagePreset} onValueChange={(v) => p.setCagePreset(v as ShapeOptionsPanelProps["cagePreset"])}>
            <SelectTrigger className="ark-input mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small Duel</SelectItem>
              <SelectItem value="medium">Medium Team</SelectItem>
              <SelectItem value="giant">Giant Tournament</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Roof</Label>
          <Select value={p.roofStyle} onValueChange={(v) => p.setRoofStyle(v as ShapeOptionsPanelProps["roofStyle"])}>
            <SelectTrigger className="ark-input mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open Roof</SelectItem>
              <SelectItem value="closed">Closed Roof</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <ToggleOption label="Door Openings" checked={p.hasDoors} onChange={p.setHasDoors} />
        <ToggleOption label="Corner Posts" checked={p.hasCornerPosts} onChange={p.setHasCornerPosts} />
        <ToggleOption label="Center Marker" checked={p.hasCenterMarker} onChange={p.setHasCenterMarker} />
      </div>
    );
  }

  if (name === "Sky Ring") {
    return (
      <div className="space-y-3">
        <ToggleOption label="Inner Floor Fill" checked={p.hasInnerFloor} onChange={p.setHasInnerFloor} />
        <ToggleOption label="Cross Bridges" checked={p.hasBridges} onChange={p.setHasBridges} />
        <ToggleOption label="Support Pillars" checked={p.hasSupportPillars} onChange={p.setHasSupportPillars} />
        <ToggleOption label="Railings" checked={p.hasRailings} onChange={p.setHasRailings} />
        <div className="bg-secondary/30 rounded p-2 text-xs text-muted-foreground">
          <strong className="text-neon-cyan">Plane:</strong> X + Y (horizontal) · <strong className="text-primary">Fixed axis:</strong> Z ={" "}
          {p.shapeCenterZ}
        </div>
      </div>
    );
  }

  if (
    name === "Lava Run" ||
    name === "Parkour Tower" ||
    name === "Dropper Tower" ||
    name === "Island Gauntlet" ||
    name === "Atoll Gauntlet" ||
    name === "Gauntlet" ||
    name === "Siege Corridor" ||
    name === "Summit Ascent" ||
    name === "Abyss Dropper" ||
    name === "Icebreaker Spleef" ||
    name === "Ember Crossing" ||
    name === "Ruins Pit"
  ) {
    return (
      <div className="space-y-3">
        <Button variant="outline" onClick={() => p.setMazeSeed(Date.now())} className="w-full gap-2 font-display tracking-wide text-xs">
          <RefreshCw className="w-3 h-3" /> Regenerate Layout
        </Button>
        <Field label="Seed" value={p.mazeSeed} onChange={p.setMazeSeed} />
      </div>
    );
  }

  if (p.shapeCategory === "creatures") {
    const impact = p.creatureDetailImpact;
    const impactLabel =
      !impact || impact.delta === 0
        ? "Baseline command count"
        : `${impact.delta > 0 ? "+" : ""}${impact.delta.toLocaleString()} cmds (${impact.percent > 0 ? "+" : ""}${Math.round(impact.percent)}%) vs medium`;
    const absPercent = Math.abs(impact?.percent ?? 0);
    const impactTone =
      !impact || impact.delta <= 0
        ? "text-emerald-300 border-emerald-400/35 bg-emerald-500/10"
        : absPercent <= 15
          ? "text-neon-cyan border-neon-cyan/30 bg-neon-cyan/8"
          : absPercent <= 35
            ? "text-amber-300 border-amber-400/35 bg-amber-500/10"
            : "text-rose-300 border-rose-400/35 bg-rose-500/10";
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Detail Intensity</Label>
          <Select
            value={p.creatureDetailLevel}
            onValueChange={(v) => p.setCreatureDetailLevel(v as ShapeOptionsPanelProps["creatureDetailLevel"])}
          >
            <SelectTrigger className="ark-input mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (lighter command count)</SelectItem>
              <SelectItem value="medium">Medium (balanced)</SelectItem>
              <SelectItem value="ultra">Ultra (max detail)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="rounded-md border border-primary/20 bg-primary/5 px-2 py-1.5 text-[11px] text-muted-foreground">
          Higher detail adds more micro-voxels and can increase paste time.
        </p>
        <p className={`rounded-md border px-2 py-1.5 text-[11px] ${impactTone}`}>Estimated impact: {impactLabel}</p>
      </div>
    );
  }

  return null;
}
