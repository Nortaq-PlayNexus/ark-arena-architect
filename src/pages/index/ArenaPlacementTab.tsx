import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";
import { toast } from "sonner";
import type { CommandOutputStyle, Mode, SpawnAnchorChoice, WorkspaceTab } from "@/pages/index/arenaIndexConstants";
import { SPAWN_ANCHOR_OPTIONS } from "@/pages/index/arenaIndexConstants";
import { Field, ToggleOption } from "@/pages/index/indexFormFields";

export type ArenaPlacementTabProps = {
  setWorkspaceTab: (t: WorkspaceTab) => void;
  spawnAnchor: SpawnAnchorChoice;
  setSpawnAnchor: (v: SpawnAnchorChoice) => void;
  commandOutputStyle: CommandOutputStyle;
  setCommandOutputStyle: (v: CommandOutputStyle) => void;
  totalCommands: number;
  faceOriginMode: "corner" | "center";
  setFaceOriginMode: (v: "corner" | "center") => void;
  faceYawDeg: number;
  setFaceYawDeg: (v: number) => void;
  faceForward: number;
  setFaceForward: (v: number) => void;
  faceRight: number;
  setFaceRight: (v: number) => void;
  faceUp: number;
  setFaceUp: (v: number) => void;
  buildOriginX: number;
  setBuildOriginX: (v: number) => void;
  buildOriginY: number;
  setBuildOriginY: (v: number) => void;
  buildOriginZ: number;
  setBuildOriginZ: (v: number) => void;
  mode: Mode;
  effectiveShapeTarget: { tx: number; ty: number; tz: number };
  gridZ: number;
  gridYawDeg: number;
  setGridYawDeg: (v: number) => void;
  faceAimWorld: { x: number; y: number } | null;
  effectiveGridOrigin: { ox: number; oy: number; oz: number };
  snapGridFaceToTeleport: () => void;
  snapGridCornerToTeleport: () => void;
  snapGridCenterToTeleport: () => void;
};

export default function ArenaPlacementTab(p: ArenaPlacementTabProps) {
  return (
    <div className="card-ark p-5 space-y-4">
      <h3 className="ark-section-title">Where spawns appear</h3>
      <p className="ark-muted-prose">
        <span className="font-mono text-foreground">In front (relative)</span> (default) outputs ARK&apos;s{" "}
        <span className="text-foreground">ahead · right · up</span> offsets from your body — paste in the console{" "}
        <span className="text-foreground">wherever you are</span>; no map coordinates needed. Match{" "}
        <span className="text-foreground">Face yaw</span> to the direction you&apos;re looking in-game.{" "}
        <span className="text-foreground">World / TP</span> anchors keep using absolute map X Y Z (option below).
      </p>
      <div>
        <Label className="text-[10px] text-muted-foreground">Spawn anchor</Label>
        <Select value={p.spawnAnchor} onValueChange={(v) => p.setSpawnAnchor(v as SpawnAnchorChoice)}>
          <SelectTrigger className="ark-input mt-1 h-auto min-h-10 py-2 text-left text-xs leading-snug">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SPAWN_ANCHOR_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-1.5 text-[10px] text-muted-foreground">{SPAWN_ANCHOR_OPTIONS.find((o) => o.value === p.spawnAnchor)?.hint}</p>
      </div>
      <div>
        <Label className="text-[10px] text-muted-foreground">Console command style</Label>
        <Select value={p.commandOutputStyle} onValueChange={(v) => p.setCommandOutputStyle(v as CommandOutputStyle)}>
          <SelectTrigger className="ark-input mt-1 h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spawnactor">SpawnActor — offsets after blueprint (layouts / grids)</SelectItem>
            <SelectItem value="summon">Summon — cheat Summon &lt;class&gt;, no coordinates (in front of you)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[9px] text-muted-foreground mt-1 leading-snug">
          Summon uses ARK&apos;s creature-style class id parsed from your blueprint path; each line spawns in front of your character with no X/Y/Z. Creature presets work best. Multi-piece structure builds will stack in one spot — use SpawnActor for spatial layouts.
        </p>
      </div>
      {p.commandOutputStyle === "summon" && p.totalCommands > 1 && (
        <p className="text-[10px] text-amber-600/90 dark:text-amber-400/90 border border-amber-500/30 rounded p-2 bg-amber-500/10 leading-snug">
          Summon mode ignores layout spacing: {p.totalCommands.toLocaleString()} lines will spawn on top of each other. Switch to SpawnActor for arenas and grids.
        </p>
      )}
      {p.spawnAnchor === "localLayout" && (
        <p className="text-[10px] text-muted-foreground leading-snug border border-neon-cyan/25 rounded p-2 bg-neon-cyan/5">
          Same idea as your paste: small <span className="text-foreground font-mono">X Y Z</span> steps (e.g.{" "}
          <span className="font-mono text-foreground">0 0 0</span>, <span className="font-mono text-foreground">300 0 500</span>).{" "}
          <span className="text-foreground">spawnactor</span> uses <strong className="text-foreground">absolute world</strong> coordinates. Uncheck{" "}
          <span className="text-foreground">Include Teleport</span> if you position with <span className="font-mono">cheat spi</span> yourself.
        </p>
      )}
      {(p.spawnAnchor === "teleportFace" || p.spawnAnchor === "playerRelative") && (
        <div className="space-y-2 rounded border border-primary/30 bg-primary/5 p-2">
          <ToggleOption
            label="Center footprint on aim (fixes huge builds appearing far to one side)"
            checked={p.faceOriginMode === "center"}
            onChange={(v) => p.setFaceOriginMode(v ? "center" : "corner")}
          />
          <p className="text-[10px] text-muted-foreground leading-snug">
            <span className="text-foreground font-medium">
              {p.spawnAnchor === "playerRelative" ? "Relative mode:" : "Face mode:"}
            </span>{" "}
            {p.spawnAnchor === "playerRelative"
              ? "Forward / Right / Face yaw place the build in front of your view. Numbers in the file become ahead / right / up from your character."
              : "TP = feet coords. Forward / Right / Face yaw define where you aim on the map (yaw 0° ≈ +X forward)."}
            {p.spawnAnchor === "teleportFace" &&
              (p.faceOriginMode === "center"
                ? " With centering on, the middle of the grid sits at that aim."
                : " Corner mode puts local (0,0) at the aim.")}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Face yaw (°)" value={p.faceYawDeg} onChange={p.setFaceYawDeg} min={-360} />
            <Field label="Forward (u)" value={p.faceForward} onChange={p.setFaceForward} min={0} />
            <Field label="Right (u)" value={p.faceRight} onChange={p.setFaceRight} min={-50000} />
            <Field label="Up (u)" value={p.faceUp} onChange={p.setFaceUp} min={-5000} />
          </div>
          <p className="text-[9px] text-muted-foreground">Forward: distance toward view. Up: vertical offset from feet. Right: strafe (+ = your right).</p>
          <div className="flex flex-wrap gap-1">
            {[0, 90, -90, 180].map((deg) => (
              <Button
                key={`face-${deg}`}
                type="button"
                variant={p.faceYawDeg === deg ? "neon" : "neonOutline"}
                size="sm"
                className="text-[10px] font-display px-2 h-7 flex-1 min-w-[3.5rem]"
                onClick={() => {
                  p.setFaceYawDeg(deg);
                  toast.success(`Face yaw ${deg}°`);
                }}
              >
                Face {deg}°
              </Button>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-[10px] h-7"
            onClick={() => {
              p.setFaceForward(60);
              p.setFaceUp(130);
              p.setFaceRight(0);
              toast.success("Forward 60 · Up 130 — very close");
            }}
          >
            Preset: almost touching (low forward)
          </Button>
        </div>
      )}
      {p.spawnAnchor === "teleportFace" && (
        <p className="text-[10px] text-amber-200/90 bg-amber-950/40 border border-amber-700/50 rounded p-2 leading-snug">
          Set <span className="font-semibold text-foreground">Teleport TP X / Y / Z</span> in the{" "}
          <button
            type="button"
            className="font-semibold text-primary underline underline-offset-2 hover:text-primary/90"
            onClick={() => p.setWorkspaceTab("export")}
          >
            Export
          </button>{" "}
          tab to your <span className="text-foreground">feet</span> while standing where you want to build.
        </p>
      )}
      {p.spawnAnchor === "playerRelative" && (
        <p className="text-[10px] text-emerald-200/95 bg-emerald-950/35 border border-emerald-700/45 rounded p-2 leading-snug">
          You don&apos;t need TP fields for placement. Stand in-game, align <span className="font-semibold text-foreground">Face yaw</span> with your camera, then paste — structures spawn in front of you on any map.
        </p>
      )}
      {p.spawnAnchor === "manual" && (
        <div className="grid grid-cols-3 gap-2">
          <Field label="Origin X" value={p.buildOriginX} onChange={p.setBuildOriginX} />
          <Field label="Origin Y" value={p.buildOriginY} onChange={p.setBuildOriginY} />
          <Field label="Origin Z" value={p.buildOriginZ} onChange={p.setBuildOriginZ} />
        </div>
      )}
      {p.mode === "shape" && p.spawnAnchor !== "manual" && (
        <p className="text-[9px] text-muted-foreground font-mono bg-muted/50 rounded p-2 leading-relaxed">
          Shape center → world ({p.effectiveShapeTarget.tx}, {p.effectiveShapeTarget.ty}, {p.effectiveShapeTarget.tz}) before conversion.
          {p.spawnAnchor === "playerRelative" ? " Copied lines = ahead / right / up from you." : null}
        </p>
      )}
      {p.mode === "grid" && (
        <>
          <p className="text-[10px] text-muted-foreground leading-snug border-l-2 border-primary/40 pl-2">
            <span className="text-foreground font-medium">Along the wall:</span> with Face or Relative anchor,{" "}
            <span className="text-foreground">Ground yaw</span> twists the grid <span className="italic">after</span> your view direction. Leave 0° first.
          </p>
          {p.spawnAnchor !== "manual" && (
            <p className="text-[9px] text-muted-foreground font-mono bg-muted/50 rounded p-2 leading-relaxed">
              {p.spawnAnchor === "teleportFace" && p.faceAimWorld ? (
                <>
                  Aim XY ≈ ({p.faceAimWorld.x}, {p.faceAimWorld.y})
                  {p.faceOriginMode === "center" ? " · footprint centered there" : " · corner (0,0) there"}
                  {" · "}
                </>
              ) : null}
              {p.spawnAnchor === "playerRelative" && <>Placement math from (0,0) + face — file uses player-relative triples · </>}
              First spawn (local 0,0) → world ({p.effectiveGridOrigin.ox}, {p.effectiveGridOrigin.oy}, {p.gridZ + p.effectiveGridOrigin.oz}) · oz=
              {p.effectiveGridOrigin.oz}
            </p>
          )}
          {p.spawnAnchor === "manual" && p.buildOriginX === 0 && p.buildOriginY === 0 && p.buildOriginZ === 0 && (
            <p className="text-[10px] text-destructive/90 bg-destructive/10 border border-destructive/30 rounded p-2">
              Manual origin is 0,0,0 — spawns stay at map origin. Use teleport anchor or enter your world coordinates.
            </p>
          )}
          <div className="space-y-1.5">
            <Field label="Ground yaw (°)" value={p.gridYawDeg} onChange={p.setGridYawDeg} min={-360} />
            <p className="text-[9px] text-muted-foreground">
              {p.spawnAnchor === "teleportFace" || p.spawnAnchor === "playerRelative"
                ? "Extra twist on top of Face yaw. Keep 0° unless the wall still runs the wrong way."
                : "Rotates the whole grid on the ground. 0° = local +X along world +X."}
            </p>
            <div className="flex flex-wrap gap-1">
              {[0, 90, -90, 180].map((deg) => (
                <Button
                  key={deg}
                  type="button"
                  variant={p.gridYawDeg === deg ? "neon" : "neonOutline"}
                  size="sm"
                  className="text-[10px] font-display px-2 h-7 flex-1 min-w-[3.5rem]"
                  onClick={() => {
                    p.setGridYawDeg(deg);
                    toast.success(`Yaw ${deg}°`);
                  }}
                >
                  {deg}°
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Button type="button" variant="outline" size="sm" className="w-full text-[10px] font-display h-8 gap-1" onClick={p.snapGridFaceToTeleport}>
              <MapPin className="w-3 h-3" /> Switch to face anchor (world)
            </Button>
            <Button type="button" variant="outline" size="sm" className="w-full text-[10px] font-display h-8 gap-1" onClick={p.snapGridCornerToTeleport}>
              <MapPin className="w-3 h-3" /> Switch to feet (corner)
            </Button>
            <Button type="button" variant="outline" size="sm" className="w-full text-[10px] font-display h-8 gap-1" onClick={p.snapGridCenterToTeleport}>
              <MapPin className="w-3 h-3" /> Switch to center @ teleport
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-[10px] font-display h-7 text-muted-foreground"
              onClick={() => {
                p.setBuildOriginX(0);
                p.setBuildOriginY(0);
                p.setBuildOriginZ(0);
                p.setGridYawDeg(0);
                p.setFaceYawDeg(0);
                p.setFaceForward(120);
                p.setFaceRight(0);
                p.setFaceUp(140);
                p.setSpawnAnchor("playerRelative");
                toast.success("Reset · anchor = in front (relative)");
              }}
            >
              Reset face offsets and ground yaw
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
