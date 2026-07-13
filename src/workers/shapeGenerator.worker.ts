import { generateShape, ShapeConfig } from "@/lib/shapeGenerators";

type ShapeJob = {
  config: ShapeConfig;
  blueprint: string;
  startedAt: number;
};

self.onmessage = (event: MessageEvent<ShapeJob>) => {
  const { config, blueprint, startedAt } = event.data;
  const commands = generateShape(config, blueprint);
  postMessage({ commands, elapsedMs: Math.max(0, performance.now() - startedAt) });
};

export {};
