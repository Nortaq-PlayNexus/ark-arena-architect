# Structure presets — inventory and QA checklist

Arena Architect builds voxel placement commands from `SHAPE_PRESETS` in `src/lib/shapeGenerators.ts`. Counts are also exposed as `PRESET_COUNTS` (derived from the same array). **Grid mode templates** are defined in `src/lib/gridTemplates.ts` as `GRID_TEMPLATES`.

## 100× spatial upgrade

All `SHAPE_PRESETS` and `GRID_TEMPLATES` **spatial** fields (`centerX` / `centerY` / `centerZ`, `radius`, `step`, grid `maxX` / `maxY`, steps, `gridZ`, simple wall dimensions, grid wall heights, offsets, spacing, etc.) use values **100×** the previous baseline. Counts such as `gateCount`, `floorCount`, maze `difficulty`, wall thickness **layers**, boolean flags, `seed`, and normalized values (`obstacleDensity`, …) are unchanged. `MAX_COMMANDS` is still 50,000; scaling `radius` and `step` together keeps generator loop counts similar to before.

---

## Master checklist — structure presets (`SHAPE_PRESETS`, 120 total)

### Shapes (29)

- [ ] Sphere
- [ ] Cube
- [ ] Pac-Man
- [ ] Pyramid
- [ ] Torus
- [ ] Diamond
- [ ] Helix
- [ ] Star
- [ ] Cylinder
- [ ] Hemisphere
- [ ] Arch
- [ ] Tunnel
- [ ] Hex Platform
- [ ] Cone
- [ ] Cross
- [ ] Spiral Ramp
- [ ] Obelisk
- [ ] Ziggurat
- [ ] Solid Sphere
- [ ] Wireframe Cube
- [ ] Stone Column
- [ ] Frustum
- [ ] Ring Platform
- [ ] Wedge Ramp
- [ ] Bowl
- [ ] Grid Wall
- [ ] Stacked Toruses
- [ ] Quarter Pipe
- [ ] Spire

### Arenas (25)

- [ ] Colosseum
- [ ] Sky Ring
- [ ] Tower Arena
- [ ] Cage Match
- [ ] Dome Arena
- [ ] Octagon Arena
- [ ] Pit Arena
- [ ] Bridge Arena
- [ ] King of the Hill
- [ ] Four-Corner Arena
- [ ] Fortress
- [ ] Amphitheater
- [ ] Watchtower Ring
- [ ] Thunderdome
- [ ] Sky Deck
- [ ] Duel Strip
- [ ] Ruins Pit
- [ ] Moat Arena
- [ ] Pedestal Arena
- [ ] Hex Ring
- [ ] Twin Arenas
- [ ] Spectacle Bowl
- [ ] Open Ring
- [ ] Floating Slab
- [ ] Brawl Square

### Events (25)

- [ ] Maze
- [ ] Obstacle Course
- [ ] Spiral Staircase
- [ ] Skull
- [ ] Race Track
- [ ] Parkour Tower
- [ ] Dropper Tower
- [ ] Spleef Grid
- [ ] Capture Point Arena
- [ ] Boss Summon Platform
- [ ] Last Man Standing
- [ ] Gauntlet
- [ ] Lava Run
- [ ] Micro Maze
- [ ] Mega Maze
- [ ] Serpentine Course
- [ ] Circuit Run
- [ ] Endurance Run
- [ ] Sky Spiral Climb
- [ ] Stepping Stones
- [ ] Pillar Arena
- [ ] Checkpoint Chase
- [ ] Bridge Gauntlet
- [ ] Tower Relay
- [ ] Island Gauntlet

### Creatures (41)

- [ ] Dragon
- [ ] T-Rex
- [ ] Wyvern
- [ ] Skull Creature
- [ ] Human Face
- [ ] Spider
- [ ] Snake
- [ ] Scorpion
- [ ] Bat
- [ ] Eagle
- [ ] Wolf
- [ ] Lion
- [ ] Bear
- [ ] Octopus
- [ ] Butterfly
- [ ] Triceratops
- [ ] Stegosaurus
- [ ] Fish
- [ ] Crab
- [ ] Turtle
- [ ] Phoenix
- [ ] Mantis
- [ ] Crocodile
- [ ] Rhino
- [ ] Elephant
- [ ] Pteranodon
- [ ] Brachiosaurus
- [ ] Sea Serpent
- [ ] Griffin
- [ ] Shark
- [ ] Hippopotamus
- [ ] Giraffe
- [ ] Deer
- [ ] Rabbit
- [ ] Penguin
- [ ] Squid
- [ ] Jellyfish
- [ ] Unicorn
- [ ] Pegasus
- [ ] Cerberus
- [ ] Hydra

## Master checklist — grid templates (`GRID_TEMPLATES`, 41 total)

### Flat (7)

- [ ] Micro test
- [ ] Small floor
- [ ] Medium arena floor
- [ ] Large flat
- [ ] Dense lattice
- [ ] Sparse runway
- [ ] Sky platform

### Simple (10)

- [ ] Terminal · 200×200 footprint
- [ ] Terminal · ~200 per edge
- [ ] Terminal · long wall strip
- [ ] Duel ring
- [ ] Team box
- [ ] Fort perimeter
- [ ] Corridor strip
- [ ] Square arena
- [ ] Tight edge step
- [ ] Colossal outline

### Grid layout (7)

- [ ] Grid · compact
- [ ] Grid · standard
- [ ] Grid · wide
- [ ] Grid · square tight
- [ ] Grid · no floor
- [ ] Grid · tall stack
- [ ] Grid · thick arena

### Wall stack (7)

- [ ] Stack · starter
- [ ] Stack · vertical full
- [ ] Stack · mega height
- [ ] Stack · raised base
- [ ] Stack · thin slices
- [ ] Stack · four layers
- [ ] Stack · walls only

### Wall tiers (10)

- [ ] Small wall · 1 layer
- [ ] Small wall · 2 layers
- [ ] Small wall · 3 layers
- [ ] Medium wall · 1 layer
- [ ] Medium wall · 2 layers
- [ ] Medium wall · 3 layers
- [ ] Large wall · 1 layer
- [ ] Large wall · 2 layers
- [ ] Large wall · 3 layers
- [ ] Large wall · 4 layers

---

## Global checks (every preset)

- [ ] **3D preview** loads without freezing; silhouette matches the description.
- [ ] **Command count** under `MAX_COMMANDS` (50k); use Command warnings if near limit — raise `step` or lower `radius` (defaults use 100× coordinates but matched `step`, so behavior matches the pre-scale generators).
- [ ] **Blueprint** paste path is valid for your map/mod when testing in ARK.
- [ ] **Center** (`centerX/Y/Z`) places the build where expected; adjust if using a non-default origin.

## Shapes (decorative / primitives)

Use for monuments, props, and geometry tests. Tune `radius` / `step` for density.

| Preset | Focus improvement |
|--------|-------------------|
| Sphere | Hollow shell — good for rings; increase `step` for huge radii. |
| Cube | Edge shell — verify corner thickness at large scale. |
| Pac-Man | Eye + mouth gap — check mouth angle vs step. |
| Pyramid | Stepped solid — base alignment to ground. |
| Torus | Single ring — tube thickness vs `radius`. |
| Diamond | Double pyramid — tip resolution. |
| Helix | DNA tower — height vs command count. |
| Star | 5-point extrusion — thickness `step * 3`. |
| Cylinder | Vertical shell — open ends. |
| Hemisphere | Dome base at `cz`. |
| Arch | Standing arch — pillar width. |
| Tunnel | Semicircle bore — length vs `radius`. |
| Hex Platform | Flat hex — single Z layer. |
| Cone | Solid cone — apex resolution. |
| Cross | 3D plus — arm thickness. |
| Spiral Ramp | Drivable — ramp pitch vs step. |
| Obelisk | Hollow taper — capstone. |
| **Ziggurat** | Step stack — layer count vs height. |
| **Solid Sphere** | Filled — coarse grid at large R; watch command count. |
| **Wireframe Cube** | Edges only — corner posts + top/bottom rings. |
| **Stone Column** | Solid cylinder — height `5× radius`. |
| **Frustum** | Tapered solid — `MAX_COMMANDS` guarded per slice. |
| **Ring Platform** | Annulus floor — inner/outer ratio. |
| **Wedge Ramp** | Linear slope along +X — good for ramps. |
| **Bowl** | Hollow bowl shell — depth vs `radius`. |
| **Grid Wall** | Perforated panel — hole pattern on +Y face. |
| **Stacked Toruses** | Two donuts — vertical spacing. |
| **Quarter Pipe** | 90° curve + corner floor pad. |
| **Spire** | Hollow stacked squares — layer height. |

## Arenas (PvP / combat spaces)

| Preset | Focus improvement |
|--------|-------------------|
| Colosseum | Tiers, gates — `gateCount`; optional VIP. |
| Sky Ring | Ring width, railings, bridges, pillars — all optional flags. |
| Tower Arena | Floors, traversal style, central pillar, top platform. |
| Cage Match | `cagePreset` / shape — roof closed. |
| Dome Arena | Hemi enclosure — floor cut. |
| Octagon Arena | UFC-style fence. |
| Pit Arena | Sunken floor — wall height. |
| Bridge Arena | Two pads + bridge. |
| King of the Hill | Central mound — ramps. |
| Four-Corner Arena | Corner pads + center ring. |
| Fortress | Keep + walls — gate. |
| Amphitheater | Half-circle tiers — stage. |
| Watchtower Ring | 6 towers + ramps to hub. |
| **Thunderdome** | Floor + cage wall + roof ring. |
| **Sky Deck** | Large pad + perimeter posts. |
| **Duel Strip** | Long narrow strip + side rails. |
| **Ruins Pit** | Seeded broken pillars — change `seed` for layout. |
| **Moat Arena** | Inner disk + lower outer ring. |
| **Pedestal Arena** | Stem + roof disk + rail lip. |
| **Hex Ring** | Hex perimeter walls + inner floor. |
| **Twin Arenas** | Two disks + bridge. |
| **Spectacle Bowl** | 2-tier bowl — `gateCount` for gaps. |
| **Open Ring** | Ring corridor + inner fight disk. |
| **Floating Slab** | Huge top + corner pillars down. |
| **Brawl Square** | Square pit + corner posts + center marker. |

## Events (courses and challenges)

| Preset | Focus improvement |
|--------|-------------------|
| Maze | `difficulty`, `hasFloor`, `hasBorder`, dead ends. |
| Obstacle Course | `pathStyle`, `obstacleDensity`, length (`radius`). |
| Spiral Staircase | Height vs turns. |
| Skull | Floating skull mesh. |
| Race Track | Oval width + barriers. |
| Parkour Tower | Floors, seed, pillar supports. |
| Dropper Tower | Hole RNG — `seed`. |
| Spleef Grid | Floor + rim + safety net. |
| Capture Point Arena | 3 points + ramps. |
| Boss Summon Platform | Ritual ring + pillars. |
| Last Man Standing | Concentric rings. |
| Gauntlet | Corridor obstacles — `seed`. |
| Lava Run | Floating pads — `seed`. |
| Micro / Mega Maze | Grid size via difficulty. |
| Serpentine / Circuit / Endurance Run | Obstacle course variants. |
| Sky Spiral Climb | Tall spiral — `centerZ`. |
| Stepping Stones | Pad count scales with `radius`. |
| Pillar Arena | Staggered pillars + outer wall. |
| Checkpoint Chase | Ring of checkpoints + center. |
| Bridge Gauntlet | Towers + mid-air bridges. |
| Tower Relay | Four towers + hub ramps. |
| Island Gauntlet | Sparse islands — `seed`. |

## Creatures (voxel sculptures)

All use `refineCreatureStep` for voxel resolution. Increase `radius` for larger in-world statues (defaults are already scaled up).

| Preset | Focus improvement |
|--------|-------------------|
| Dragon / Wyvern | Wyvern = 2 legs only; Dragon = 4 legs + wings. |
| T-Rex | Huge head, tiny arms, tail — silhouette. |
| Skull Creature | Horns + zygomatics on base skull. |
| Human Face | Mask depth — features. |
| Spider / Scorpion | Leg vs tail clarity. |
| Snake / Sea Serpent | Coil vs ribbon. |
| Bat / Eagle / Pteranodon | Wing proportions differ. |
| Wolf / Lion / Bear | Silhouette contrast (mane, barrel, ears). |
| Octopus / Squid / Jellyfish | Arm count vs bell. |
| Butterfly | Four wings + body. |
| Dinosaurs | Frill/plates/neck length per species. |
| Elephant / Rhino / Hippo | Trunk vs horn vs barrel. |
| Phoenix | Eagle base + tail plume. |
| Mythic | Griffin, Pegasus, Unicorn, Cerberus, Hydra — distinct anatomy. |

## Per-category improvement backlog

1. **Performance**: `MAX_COMMANDS` (50k) is enforced in `generatorHelpers` for `fillCircle`, `fillRing`, `centeredRect`, `rectEdges`, `sampleCircle`, `extrudeZ`, and helpers that take `cmds` (`circleFloor`, `circleWall`, `rectPlatform`, `spiralStairs`, `rampSegment`). Generators pass `cmds` into those APIs so tight loops stop cleanly; additional guards exist in maze/obstacle/creature paths and hot arenas (e.g. dome/octagon shells, skull, race track, bridge railings, parkour/dropper towers).
2. **Consistency**: Align default `centerZ` so ground-based arenas sit at `0` and floating props at positive `Z` where applicable.
3. **Creatures**: Further differentiate similar pairs (e.g. Shark vs Fish, Squid vs Octopus) using dedicated `creature*` helpers.
4. **Events / UI**: Seed + regenerate exposed for **Maze / Micro Maze / Mega Maze**, **Obstacle Course** variants (Serpentine / Circuit / Endurance) with path + density, **Lava Run / Parkour / Dropper / Island Gauntlet / Gauntlet**, and arena **Ruins Pit**. Selecting a preset syncs path style, maze difficulty, gates, and related fields from `SHAPE_PRESETS`.
5. **Testing**: Snapshot or record command counts for default presets after changes to catch regressions.

## File map

| Area | Primary file |
|------|----------------|
| Presets + generators | `src/lib/shapeGenerators.ts` |
| Helpers (circles, ramps, dedupe) | `src/lib/generatorHelpers.ts` |
| UI + selection | `src/pages/Index.tsx` |
