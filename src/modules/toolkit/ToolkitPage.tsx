import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calculator, Crosshair, Dna, Hammer, Map, Timer, Zap, Bomb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpawnGridGeneratorsPanel } from "@/modules/toolkit/SpawnGridGeneratorsPanel";

const RATE_DIVISOR = 15;

export default function ToolkitPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const outerTab = tabParam === "spawn-grids" ? "spawn-grids" : "calculators";

  const [breedCalc, setBreedCalc] = useState({ stat1: 0, stat2: 0, generations: 1 });
  const [damageCalc, setDamageCalc] = useState({ baseDamage: 100, meleeDmg: 100, armor: 0 });
  const [resourceCalc, setResourceCalc] = useState({ metal: 0, polymer: 0, cementing: 0 });
  const [tame, setTame] = useState({ level: 150, torpor: 8000, drainPerSec: 2.0 });
  const [raid, setRaid] = useState({ wallHp: 100_000 });

  const breedingResult = useMemo(() => {
    const g = Math.max(1, breedCalc.generations);
    return Math.floor(((breedCalc.stat1 + breedCalc.stat2) / 2) * Math.pow(1.1, g));
  }, [breedCalc]);

  const damageResult = useMemo(() => {
    const baseDmg = damageCalc.baseDamage;
    const melee = damageCalc.meleeDmg / 100;
    const armorReduction = 1 - Math.min(0.99, Math.max(0, damageCalc.armor) / 100);
    return Math.floor(baseDmg * melee * armorReduction);
  }, [damageCalc]);

  const narcoticEst = useMemo(() => {
    return Math.max(0, Math.ceil(tame.torpor / 40 - tame.drainPerSec * 300));
  }, [tame]);

  const tools = [
    { icon: Dna, title: "Breeding", description: "Rough stat projection from parents and mutation generations", color: "text-primary" },
    { icon: Crosshair, title: "Damage", description: "Simple melee vs armor reduction model", color: "text-destructive" },
    { icon: Calculator, title: "Resources", description: "Farm node estimates at configurable cluster rates", color: "text-info" },
    { icon: Map, title: "Resource map", description: "Use your cluster wiki or interactive maps for spawn heatmaps", color: "text-warning" },
    { icon: Timer, title: "Taming", description: "Torpor budget vs narcotic estimate", color: "text-neon-purple" },
    { icon: Zap, title: "Raid planner", description: "Wall HP to C4 / rocket counts (tuned divisors)", color: "text-accent" },
  ];

  return (
    <div className="min-h-full ark-survival-bg text-foreground">
      <div className="ark-vignette pointer-events-none fixed inset-0 z-0" aria-hidden />
      <div className="relative z-10 mx-auto max-w-[min(100%,88rem)] space-y-8 px-4 py-8 sm:px-6">
        <div className="text-center">
          <div className="mb-4 inline-flex items-center gap-3">
            <Calculator className="h-10 w-10 text-primary" />
            <h1 className="font-display text-2xl tracking-wide text-foreground md:text-3xl">Toolkit</h1>
          </div>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Calculators, spawn-grid command generators (legacy Python scripts ported here), and helpers for admins — always verify against your server rules and rates.
          </p>
        </div>

        <Tabs
          value={outerTab}
          onValueChange={(v) => {
            const next = new URLSearchParams(searchParams);
            if (v === "calculators") {
              next.delete("tab");
            } else {
              next.set("tab", v);
            }
            setSearchParams(next, { replace: true });
          }}
          className="w-full"
        >
          <TabsList className="mx-auto mb-8 grid h-auto w-full max-w-lg grid-cols-2 gap-1">
            <TabsTrigger value="calculators" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculators
            </TabsTrigger>
            <TabsTrigger value="spawn-grids" className="gap-2">
              <Hammer className="h-4 w-4" />
              Spawn grids
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spawn-grids" className="space-y-6">
            <SpawnGridGeneratorsPanel />
          </TabsContent>

          <TabsContent value="calculators" className="space-y-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <Card key={tool.title} className="card-ark border-primary/10 p-5">
              <tool.icon className={`mb-3 h-10 w-10 ${tool.color}`} />
              <h3 className="mb-1 font-display text-lg text-foreground">{tool.title}</h3>
              <p className="text-sm text-muted-foreground">{tool.description}</p>
            </Card>
          ))}
        </div>

        <Card className="card-ark border-primary/20 p-6 sm:p-8">
          <Tabs defaultValue="breeding" className="w-full">
            <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-1 sm:grid-cols-5">
              <TabsTrigger value="breeding">Breeding</TabsTrigger>
              <TabsTrigger value="damage">Damage</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="taming">Taming</TabsTrigger>
              <TabsTrigger value="raid">Raid</TabsTrigger>
            </TabsList>

            <TabsContent value="breeding" className="space-y-6">
              <div className="text-center">
                <Dna className="mx-auto mb-3 h-14 w-14 text-primary" />
                <h2 className="font-display text-xl text-foreground">Breeding projection</h2>
                <p className="text-sm text-muted-foreground">Average parents × 1.1^generations (illustrative only)</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="b1">Parent 1 stat</Label>
                  <Input
                    id="b1"
                    type="number"
                    className="mt-2"
                    value={breedCalc.stat1}
                    onChange={(e) => setBreedCalc({ ...breedCalc, stat1: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="b2">Parent 2 stat</Label>
                  <Input
                    id="b2"
                    type="number"
                    className="mt-2"
                    value={breedCalc.stat2}
                    onChange={(e) => setBreedCalc({ ...breedCalc, stat2: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bg">Generations (mut stack count model)</Label>
                  <Input
                    id="bg"
                    type="number"
                    className="mt-2"
                    min={1}
                    value={breedCalc.generations}
                    onChange={(e) => setBreedCalc({ ...breedCalc, generations: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 text-center">
                <p className="text-sm text-muted-foreground">Estimated offspring stat</p>
                <p className="font-mono text-4xl font-bold text-primary">{breedingResult}</p>
              </div>
            </TabsContent>

            <TabsContent value="taming" className="space-y-6">
              <div className="text-center">
                <Timer className="mx-auto mb-3 h-14 w-14 text-neon-purple" />
                <h2 className="font-display text-xl text-foreground">Taming narcotic estimate</h2>
                <p className="text-sm text-muted-foreground">Torpor per narcotic assumed 40; adjust for your mod stack sizes</p>
              </div>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="tl">Target level</Label>
                  <Input
                    id="tl"
                    type="number"
                    className="mt-2"
                    min={1}
                    value={tame.level}
                    onChange={(e) => setTame({ ...tame, level: parseInt(e.target.value, 10) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="tt">Torpor (est.)</Label>
                  <Input
                    id="tt"
                    type="number"
                    className="mt-2"
                    value={tame.torpor}
                    onChange={(e) => setTame({ ...tame, torpor: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="td">Drain / sec</Label>
                  <Input
                    id="td"
                    type="number"
                    className="mt-2"
                    step="0.1"
                    value={tame.drainPerSec}
                    onChange={(e) => setTame({ ...tame, drainPerSec: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="tn">Narcotic (rough)</Label>
                  <Input id="tn" className="mt-2" value={narcoticEst} readOnly />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="raid" className="space-y-6">
              <div className="text-center">
                <Bomb className="mx-auto mb-3 h-14 w-14 text-accent" />
                <h2 className="font-display text-xl text-foreground">Raid planner</h2>
                <p className="text-sm text-muted-foreground">C4 ~15k HP, rocket ~13.5k HP per hit (vary by server)</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="wh">Wall HP total</Label>
                  <Input
                    id="wh"
                    type="number"
                    className="mt-2"
                    value={raid.wallHp}
                    onChange={(e) => setRaid({ ...raid, wallHp: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <Label>C4 (÷15000)</Label>
                  <Input className="mt-2" readOnly value={Math.ceil(raid.wallHp / 15000)} />
                </div>
                <div>
                  <Label>Rockets (÷13500)</Label>
                  <Input className="mt-2" readOnly value={Math.ceil(raid.wallHp / 13500)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="damage" className="space-y-6">
              <div className="text-center">
                <Crosshair className="mx-auto mb-3 h-14 w-14 text-destructive" />
                <h2 className="font-display text-xl text-foreground">Damage output</h2>
                <p className="text-sm text-muted-foreground">Flat armor % reduction cap at 99%</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="bd">Base damage</Label>
                  <Input
                    id="bd"
                    type="number"
                    className="mt-2"
                    value={damageCalc.baseDamage}
                    onChange={(e) => setDamageCalc({ ...damageCalc, baseDamage: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="dm">Melee %</Label>
                  <Input
                    id="dm"
                    type="number"
                    className="mt-2"
                    value={damageCalc.meleeDmg}
                    onChange={(e) => setDamageCalc({ ...damageCalc, meleeDmg: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="ar">Armor %</Label>
                  <Input
                    id="ar"
                    type="number"
                    className="mt-2"
                    value={damageCalc.armor}
                    onChange={(e) => setDamageCalc({ ...damageCalc, armor: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-6 text-center">
                <p className="text-sm text-muted-foreground">Final damage (illustrative)</p>
                <p className="font-mono text-4xl font-bold text-destructive">{damageResult}</p>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="text-center">
                <Calculator className="mx-auto mb-3 h-14 w-14 text-info" />
                <h2 className="font-display text-xl text-foreground">Resource farming</h2>
                <p className="text-sm text-muted-foreground">Divide by {RATE_DIVISOR} × (your cluster gather rate / 15)</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="m">Metal ingots</Label>
                  <Input
                    id="m"
                    type="number"
                    className="mt-2"
                    value={resourceCalc.metal}
                    onChange={(e) => setResourceCalc({ ...resourceCalc, metal: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="p">Polymer</Label>
                  <Input
                    id="p"
                    type="number"
                    className="mt-2"
                    value={resourceCalc.polymer}
                    onChange={(e) => setResourceCalc({ ...resourceCalc, polymer: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="c">Cementing paste</Label>
                  <Input
                    id="c"
                    type="number"
                    className="mt-2"
                    value={resourceCalc.cementing}
                    onChange={(e) => setResourceCalc({ ...resourceCalc, cementing: parseInt(e.target.value, 10) || 0 })}
                  />
                </div>
              </div>
              <div className="rounded-lg border border-info/30 bg-info/10 p-6">
                <h3 className="mb-4 text-center font-display text-lg text-foreground">Nodes at {RATE_DIVISOR}× reference</h3>
                <div className="grid gap-4 text-center md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Metal ore nodes (illustrative)</p>
                    <p className="font-mono text-2xl font-bold text-primary">{Math.ceil(resourceCalc.metal / RATE_DIVISOR)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Organic polymer kills (illustrative)</p>
                    <p className="font-mono text-2xl font-bold text-primary">{Math.ceil(resourceCalc.polymer / RATE_DIVISOR)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Chitin/stone runs (illustrative)</p>
                    <p className="font-mono text-2xl font-bold text-primary">{Math.ceil(resourceCalc.cementing / RATE_DIVISOR)}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          For live dino stats and maps, pair this suite with Dododex, ASA Wiki, or your cluster’s own reference site.
        </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
