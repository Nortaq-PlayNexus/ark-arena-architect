import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Shuffle } from "lucide-react";
import { toast } from "sonner";
import AxisInspector from "@/components/AxisInspector";
import type { Footprint } from "@/lib/generatorHelpers";
import {
  GRID_TEMPLATE_CATEGORIES,
  GRID_TEMPLATES,
  type GridStyle,
  type GridTemplate,
  type GridTemplateCategory,
} from "@/lib/gridTemplates";
import type { ShapeCategory, ShapeConfig } from "@/lib/shapeGenerators";
import type { Mode } from "@/pages/index/arenaIndexConstants";
import { Field, ToggleOption } from "@/pages/index/indexFormFields";
import { ShapeOptionsPanel, type ShapeOptionsPanelProps } from "@/pages/index/shapeOptionsPanel";
import { shapeOptionsVisible } from "@/pages/index/shapeOptionsVisible";

export type ArenaDesignTabProps = {
  mode: Mode;
  shapePanelProps: ShapeOptionsPanelProps;
  footprint: Footprint;
  shapeCategory: ShapeCategory;
  setShapeCategory: (v: ShapeCategory) => void;
  shapeSearch: string;
  setShapeSearch: (v: string) => void;
  filteredShapePresets: ShapeConfig[];
  handleShapeSelect: (s: ShapeConfig) => void;
  activeShape: ShapeConfig;
  handleRandomizeEvent: () => void;
  handleRandomizeCreature: () => void;
  shapeCenterX: number;
  setShapeCenterX: (v: number) => void;
  shapeCenterY: number;
  setShapeCenterY: (v: number) => void;
  shapeCenterZ: number;
  setShapeCenterZ: (v: number) => void;
  shapeRadius: number;
  setShapeRadius: (v: number) => void;
  shapeStep: number;
  setShapeStep: (v: number) => void;
  setTeleportX: (v: number) => void;
  setTeleportY: (v: number) => void;
  setTeleportZ: (v: number) => void;
  setIncludeTeleport: (v: boolean) => void;
  gridTemplateCategory: GridTemplateCategory;
  setGridTemplateCategory: (v: GridTemplateCategory) => void;
  applyGridTemplate: (t: GridTemplate) => void;
  gridStyle: GridStyle;
  setGridStyle: (v: GridStyle) => void;
  gridPasteXOrder: "lowFirst" | "highFirst";
  setGridPasteXOrder: (v: "lowFirst" | "highFirst") => void;
  maxX: number;
  setMaxX: (v: number) => void;
  maxY: number;
  setMaxY: (v: number) => void;
  xStep: number;
  setXStep: (v: number) => void;
  yStep: number;
  setYStep: (v: number) => void;
  simpleWallWidth: number;
  setSimpleWallWidth: (v: number) => void;
  simpleWallDepth: number;
  setSimpleWallDepth: (v: number) => void;
  simpleWallStep: number;
  setSimpleWallStep: (v: number) => void;
  simpleWallThicknessLayers: number;
  setSimpleWallThicknessLayers: (v: number) => void;
  simpleWallThicknessSpacing: number;
  setSimpleWallThicknessSpacing: (v: number) => void;
  gridZ: number;
  setGridZ: (v: number) => void;
  gridWallIncludeFloor: boolean;
  setGridWallIncludeFloor: (v: boolean) => void;
  gridWallVerticalFull: boolean;
  setGridWallVerticalFull: (v: boolean) => void;
  gridWallZOffset: number;
  setGridWallZOffset: (v: number) => void;
  gridWallHeight: number;
  setGridWallHeight: (v: number) => void;
  gridWallVerticalStep: number;
  setGridWallVerticalStep: (v: number) => void;
  gridWallThicknessLayers: number;
  setGridWallThicknessLayers: (v: number) => void;
  gridWallThicknessSpacing: number;
  setGridWallThicknessSpacing: (v: number) => void;
};

export default function ArenaDesignTab(p: ArenaDesignTabProps) {
  const showShapeOptions =
    p.mode === "shape" && shapeOptionsVisible(p.shapePanelProps.activeShapeName, p.shapePanelProps.shapeCategory);

  if (p.mode === "shape") {
    return (
      <>
        <div className="card-ark p-5">
          <Tabs value={p.shapeCategory} onValueChange={(v) => p.setShapeCategory(v as ShapeCategory)}>
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-xl border border-primary/20 bg-black/25 p-1 shadow-[inset_0_1px_0_hsl(145_72%_46%/0.08)] sm:grid-cols-4">
              <TabsTrigger
                value="shapes"
                className="rounded-lg font-display text-[10px] tracking-wide transition-all data-[state=active]:border data-[state=active]:border-primary/45 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(145_72%_46%/0.2)] sm:text-xs"
              >
                🔷 Shapes
              </TabsTrigger>
              <TabsTrigger
                value="arenas"
                className="rounded-lg font-display text-[10px] tracking-wide transition-all data-[state=active]:border data-[state=active]:border-primary/45 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(145_72%_46%/0.2)] sm:text-xs"
              >
                🏟️ Arenas
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="rounded-lg font-display text-[10px] tracking-wide transition-all data-[state=active]:border data-[state=active]:border-primary/45 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(145_72%_46%/0.2)] sm:text-xs"
              >
                🎮 Events
              </TabsTrigger>
              <TabsTrigger
                value="creatures"
                className="rounded-lg font-display text-[10px] tracking-wide transition-all data-[state=active]:border data-[state=active]:border-primary/45 data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-[0_0_20px_hsl(145_72%_46%/0.2)] sm:text-xs"
              >
                🐉 Creatures
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Input
            value={p.shapeSearch}
            onChange={(e) => p.setShapeSearch(e.target.value)}
            placeholder="Search presets by name or description"
            className="ark-input mt-3 text-xs"
          />

          <div
            className={`scrollbar-ark mt-3 grid grid-cols-3 gap-2 overflow-y-auto pr-1 ${
              p.shapeCategory === "creatures" ? "max-h-[min(32rem,70vh)]" : "max-h-64"
            }`}
          >
            {p.filteredShapePresets.map((s) => (
              <button
                key={s.name}
                type="button"
                onClick={() => p.handleShapeSelect(s)}
                className={`group relative flex flex-col items-center gap-1 overflow-hidden rounded-lg border px-1 py-2.5 text-xs font-display transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                  p.activeShape.name === s.name
                    ? "border-primary/70 bg-primary/12 text-primary neon-border shadow-[0_0_24px_hsl(145_72%_46%/0.12)]"
                    : "border-border/80 bg-secondary/25 text-muted-foreground hover:border-primary/35 hover:bg-secondary/45 hover:text-foreground"
                }`}
              >
                <span className="text-lg transition-transform duration-200 group-hover:scale-110">{s.icon}</span>
                <span className="text-center text-[10px] leading-tight">{s.name}</span>
              </button>
            ))}
            {p.filteredShapePresets.length === 0 && (
              <p className="col-span-3 rounded-md border border-border/60 bg-secondary/20 px-2 py-3 text-center text-[10px] text-muted-foreground">
                No presets match your search.
              </p>
            )}
          </div>

          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.activeShape.description}</p>

          {p.shapeCategory === "events" && (
            <Button variant="outline" size="sm" onClick={p.handleRandomizeEvent} className="w-full mt-2 gap-2 font-display text-xs">
              <Shuffle className="w-3 h-3" /> Randomize Event
            </Button>
          )}
          {p.shapeCategory === "creatures" && (
            <Button variant="outline" size="sm" onClick={p.handleRandomizeCreature} className="w-full mt-2 gap-2 font-display text-xs">
              <Shuffle className="w-3 h-3" /> Randomize Creature
            </Button>
          )}
        </div>

        <div className="card-ark p-5 space-y-4">
          <h3 className="ark-section-title">Coordinates</h3>
          <div className="grid grid-cols-3 gap-2">
            <Field label="Center X" value={p.shapeCenterX} onChange={p.setShapeCenterX} />
            <Field label="Center Y" value={p.shapeCenterY} onChange={p.setShapeCenterY} />
            <Field label="Center Z" value={p.shapeCenterZ} onChange={p.setShapeCenterZ} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Radius" value={p.shapeRadius} onChange={p.setShapeRadius} min={100} />
            <Field label="Step" value={p.shapeStep} onChange={p.setShapeStep} min={100} />
          </div>
          {p.shapeCategory === "creatures" && (
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Creature presets use buildable scale: radius in the low tens of thousands and step around 300 Unreal units so spawns read as a floor layout, not map-wide spacing.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[10px] font-display gap-1 mt-1"
            onClick={() => {
              p.setTeleportX(p.shapeCenterX);
              p.setTeleportY(p.shapeCenterY);
              p.setTeleportZ(p.shapeCenterZ);
              p.setIncludeTeleport(true);
              toast.success("Teleport synced");
            }}
          >
            <MapPin className="w-3 h-3" /> Sync Teleport to Structure
          </Button>
        </div>

        {showShapeOptions && (
          <div className="card-ark p-5 space-y-4">
            <h3 className="ark-section-title">Options</h3>
            <ShapeOptionsPanel {...p.shapePanelProps} />
          </div>
        )}

        <AxisInspector footprint={p.footprint} shapeName={p.activeShape.name} />
      </>
    );
  }

  return (
    <>
      <div className="card-ark p-5 space-y-4">
        <h3 className="ark-section-title">Templates</h3>
        <Tabs value={p.gridTemplateCategory} onValueChange={(v) => p.setGridTemplateCategory(v as GridTemplateCategory)} className="w-full">
          <TabsList className="flex h-auto w-full flex-wrap gap-1 rounded-xl border border-primary/20 bg-black/25 p-1 shadow-[inset_0_1px_0_hsl(145_72%_46%/0.06)]">
            {GRID_TEMPLATE_CATEGORIES.map((c) => (
              <TabsTrigger
                key={c.id}
                value={c.id}
                className="text-[10px] font-display flex-1 min-w-[3.25rem] px-1.5 py-1.5 data-[state=active]:bg-primary/12 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/35 data-[state=active]:shadow-[0_0_12px_hsl(145_70%_45%/0.25)]"
              >
                {c.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {GRID_TEMPLATE_CATEGORIES.map((c) => (
            <TabsContent key={c.id} value={c.id} className="mt-3 outline-none">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {GRID_TEMPLATES.filter((t) => t.category === c.id).map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => p.applyGridTemplate(t)}
                    className="flex flex-col items-start gap-0.5 py-2 px-2 rounded-md border border-border bg-secondary/30 text-left text-muted-foreground hover:border-primary/40 hover:bg-secondary/50 transition-all"
                  >
                    <span className="text-lg leading-none">{t.icon}</span>
                    <span className="text-[10px] font-display text-foreground leading-tight">{t.name}</span>
                    <span className="text-[9px] leading-snug line-clamp-2">{t.description}</span>
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
      <div className="card-ark p-5 space-y-4">
        <div className="bg-primary/10 border border-primary/30 rounded p-3 text-xs">
          <span className="font-display text-primary">✅ AXIS CONVENTION</span>
          <p className="text-muted-foreground mt-1">
            X + Y = flat ground plane · Z = floor height
            {(p.gridStyle === "walls" || p.gridStyle === "wallStack") && " · Walls stack along Z (vertical in Ark) · thickness = offsets in X/Y"}
            {p.gridStyle === "simpleWalls" && " · Simple = one Z layer · rectangle outline from origin · thickness grows inward"}
          </p>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Grid Style</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 mt-1">
            <Button variant={p.gridStyle === "flat" ? "neon" : "neonOutline"} size="sm" onClick={() => p.setGridStyle("flat")} className="text-xs font-display min-w-0">
              Flat
            </Button>
            <Button variant={p.gridStyle === "simpleWalls" ? "neon" : "neonOutline"} size="sm" onClick={() => p.setGridStyle("simpleWalls")} className="text-xs font-display min-w-0">
              Simple
            </Button>
            <Button variant={p.gridStyle === "walls" ? "neon" : "neonOutline"} size="sm" onClick={() => p.setGridStyle("walls")} className="text-xs font-display min-w-0">
              Grid walls
            </Button>
            <Button variant={p.gridStyle === "wallStack" ? "neon" : "neonOutline"} size="sm" onClick={() => p.setGridStyle("wallStack")} className="text-xs font-display min-w-0">
              Walls
            </Button>
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Paste order along local +X (first lines in file)</Label>
          <Select value={p.gridPasteXOrder} onValueChange={(v) => p.setGridPasteXOrder(v as "lowFirst" | "highFirst")}>
            <SelectTrigger className="ark-input mt-1 h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="highFirst">High X first (+X end first — avoids starting at the −X side when yaw 0°)</SelectItem>
              <SelectItem value="lowFirst">Low X first (0, step, … — old behavior)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[9px] text-muted-foreground mt-1">
            Same world positions; only the order in the text file changes. Use high-first if the first pasted spawns felt stuck on the “left” side of the wall.
          </p>
        </div>
        {(p.gridStyle === "flat" || p.gridStyle === "walls" || p.gridStyle === "wallStack") && (
          <>
            <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Footprint · ground plane</p>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Length X / Y = footprint size; X/Y steps = spacing between spawns. For a <span className="text-foreground/90">tight floor</span>, use ~300–500 step (not 10k+ — those are sparse arena templates).
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Length X" value={p.maxX} onChange={p.setMaxX} min={100} />
              <Field label="Length Y" value={p.maxY} onChange={p.setMaxY} min={100} />
              <Field label="X Step" value={p.xStep} onChange={p.setXStep} min={50} />
              <Field label="Y Step" value={p.yStep} onChange={p.setYStep} min={50} />
            </div>
          </>
        )}
        {p.gridStyle === "simpleWalls" && (
          <>
            <p className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">Footprint · rectangle</p>
            <p className="text-[10px] text-muted-foreground -mt-1">Length X / Length Y = outer size from (0,0); edge step = spacing along each wall.</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Length X (width)" value={p.simpleWallWidth} onChange={p.setSimpleWallWidth} min={0} />
              <Field label="Length Y (depth)" value={p.simpleWallDepth} onChange={p.setSimpleWallDepth} min={0} />
              <Field label="Edge step" value={p.simpleWallStep} onChange={p.setSimpleWallStep} min={1} />
            </div>
          </>
        )}
        <Field label="Z Height" value={p.gridZ} onChange={p.setGridZ} />
        {p.gridStyle === "simpleWalls" && (
          <>
            <p className="text-[10px] text-muted-foreground -mt-1">One spawn layer at Z · rectangle from (0,0) to (width, depth)</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Thickness layers" value={p.simpleWallThicknessLayers} onChange={p.setSimpleWallThicknessLayers} min={1} />
              <Field label="Layer spacing" value={p.simpleWallThicknessSpacing} onChange={p.setSimpleWallThicknessSpacing} min={1} />
            </div>
            <p className="text-[10px] text-muted-foreground -mt-1">Thickness offsets each edge inward (perpendicular to the wall)</p>
          </>
        )}
        {p.gridStyle === "walls" && (
          <p className="text-[10px] text-muted-foreground">
            Use the <span className="text-foreground font-medium">Walls</span> tab for floor grid, Z stacking, vertical full walls, and thickness.
          </p>
        )}
        {p.gridStyle === "wallStack" && (
          <>
            <h3 className="ark-section-title pt-1">Wall stack & thickness</h3>
            <ToggleOption label="Include floor grid" checked={p.gridWallIncludeFloor} onChange={p.setGridWallIncludeFloor} />
            <ToggleOption label="Vertical full walls" checked={p.gridWallVerticalFull} onChange={p.setGridWallVerticalFull} />
            <p className="text-[10px] text-muted-foreground -mt-1">On: stack pieces to cover wall height (Vertical Z step = segment height; no extra cap spawn). Off: legacy Z loop through top Z.</p>
            <Field label="Wall base Z offset" value={p.gridWallZOffset} onChange={p.setGridWallZOffset} min={0} />
            <p className="text-[10px] text-muted-foreground -mt-1">Bottom of each wall column = floor Z + offset (Ark Z is up)</p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Wall height (Z span)" value={p.gridWallHeight} onChange={p.setGridWallHeight} min={0} />
              <Field label="Vertical Z step" value={p.gridWallVerticalStep} onChange={p.setGridWallVerticalStep} min={1} />
            </div>
            <p className="text-[10px] text-muted-foreground -mt-1">
              Vertical Z step = height between stacked pieces. Use ~300–800 for normal tiers; very large values create a sky-high ladder, not one floor.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Thickness layers" value={p.gridWallThicknessLayers} onChange={p.setGridWallThicknessLayers} min={1} />
              <Field label="Layer spacing" value={p.gridWallThicknessSpacing} onChange={p.setGridWallThicknessSpacing} min={1} />
            </div>
            <p className="text-[10px] text-muted-foreground -mt-1">Extra layers offset along wall depth in X/Y (perimeter grows inward)</p>
          </>
        )}
      </div>
    </>
  );
}
