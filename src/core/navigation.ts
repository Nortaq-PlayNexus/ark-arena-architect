import type { LucideIcon } from "lucide-react";
import { Boxes, Calculator, FileCode, LayoutDashboard, Settings, Stethoscope, Users } from "lucide-react";

export type MasterNavItem = {
  title: string;
  path: string;
  icon: LucideIcon;
  description: string;
};

export const MASTER_NAV_MAIN: MasterNavItem[] = [
  {
    title: "Arena workspace",
    path: "/",
    icon: LayoutDashboard,
    description: "Grids, shapes, caves, spawn commands, export",
  },
  {
    title: "Cluster",
    path: "/cluster",
    icon: Users,
    description: "Server registry, snapshots, and cluster notes",
  },
  {
    title: "Toolkit",
    path: "/toolkit",
    icon: Calculator,
    description: "Calculators, spawn-grid admincheat generators, lightweight PvP math",
  },
  {
    title: "INI library",
    path: "/ini",
    icon: FileCode,
    description: "GameUserSettings / Engine snippets, import .ini, JSON backup",
  },
];

export const MASTER_NAV_SYSTEM: MasterNavItem[] = [
  {
    title: "Companions",
    path: "/companions",
    icon: Boxes,
    description: "Discord bot, PyQt automation, Promote, native tools — copy launch commands",
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
    description: "Data export and suite preferences",
  },
  {
    title: "Diagnostics",
    path: "/diagnostics",
    icon: Stethoscope,
    description: "Environment and support bundle",
  },
];

export const MASTER_SUITE_NAME = "ARK Master Suite";
