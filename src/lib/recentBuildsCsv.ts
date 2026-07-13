import type { RecentBuild } from "@/lib/presetsStorage";

export function recentBuildsToCsv(rows: RecentBuild[]): string {
  const header = "name,commands,time_iso";
  const lines = rows.map((r) => {
    const name = `"${String(r.name).replace(/"/g, '""')}"`;
    return `${name},${r.commands},${new Date(r.time).toISOString()}`;
  });
  return [header, ...lines].join("\n") + "\n";
}
