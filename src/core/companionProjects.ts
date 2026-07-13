/**
 * Launch metadata for sibling folders under the user's Ark desktop workspace.
 * Paths are relative to the folder that contains `ark_cluster_bot`, `native-tools`, etc.
 */

export type CompanionLaunchStep = {
  title: string;
  /** Newline-separated commands or notes (shown in a monospace block). */
  script: string;
};

export type CompanionProject = {
  id: string;
  title: string;
  summary: string;
  /** Primary folder name relative to Ark workspace root. */
  relativeRoot: string;
  prerequisites: string[];
  /** Optional path to .env.example under the same Ark root (forward slashes). */
  envExampleRelative?: string;
  steps: CompanionLaunchStep[];
  warnings?: string[];
};

export const COMPANION_PROJECTS: CompanionProject[] = [
  {
    id: "discord-bot",
    title: "ARK cluster Discord bot",
    summary:
      "Tribe registry, points, panels, and staff commands. Runs as a standalone Python process — never put your bot token in the web app.",
    relativeRoot: "ark_cluster_bot",
    prerequisites: ["Python 3.11+", "Discord bot token and guild configured in Developer Portal"],
    envExampleRelative: "ark_cluster_bot/.env.example",
    steps: [
      {
        title: "Install & start (PowerShell, from your Ark workspace root)",
        script: [
          "cd ark_cluster_bot",
          "python -m pip install -r requirements.txt",
          "Copy-Item .env.example .env   # then edit .env with your token and guild id",
          "python -m bot.main",
        ].join("\n"),
      },
    ],
    warnings: ["Invite the bot with applications.commands + bot scopes; sync slash commands after first run."],
  },
  {
    id: "pyqt-automation",
    title: "ARK Automation Suite (PyQt)",
    summary: "Desktop automation for ASA (crafting, farming, hotkeys). Separate GUI — not embedded in ARK Master.",
    relativeRoot: "Ark Automated scripts",
    prerequisites: ["Python 3.10+", "Windows desktop session with game focus as designed by each module"],
    steps: [
      {
        title: "Install & start (PowerShell, from your Ark workspace root)",
        script: [
          'cd "Ark Automated scripts"',
          "python -m pip install -r requirements.txt",
          "python main.py",
        ].join("\n"),
      },
    ],
    warnings: ["Respect server rules: automation can violate cluster ToS — use only where allowed."],
  },
  {
    id: "promote",
    title: "Cluster Promoter (CustomTkinter)",
    summary: "Marketing / outreach desktop app with optional heavy ML and social dependencies.",
    relativeRoot: "Promote",
    prerequisites: ["Python 3.10+", "Review Promote/requirements.txt — full install can be large (torch, etc.)"],
    steps: [
      {
        title: "Minimal path (from Ark workspace root)",
        script: ["cd Promote", "python -m pip install -r requirements.txt", "python main.py"].join("\n"),
      },
    ],
    warnings: ["Configure any API keys only in Promote/.env — never in ARK Master env files."],
  },
  {
    id: "fps-python",
    title: "Windows FPS / latency helper (Python)",
    summary: "Elevated tweaks for power plan, TCP, registry, optional process termination. Same behavior as legacy root script.",
    relativeRoot: "native-tools/fps_optimizer",
    prerequisites: ["Python 3 + psutil", "Administrator PowerShell or CMD"],
    steps: [
      {
        title: "From Ark workspace root (launcher)",
        script: ["python ark_fps_optimizer.py"].join("\n"),
      },
      {
        title: "Or run module directly",
        script: ["python native-tools/fps_optimizer/main.py"].join("\n"),
      },
    ],
    warnings: ["Read the script header before running; reboot or revert if anything misbehaves."],
  },
  {
    id: "asa-lag-fixer",
    title: "ASA Lag Fixer (WinUI / .NET)",
    summary: "GPU preference, Game Mode, and GameUserSettings.ini style fixes. Build with Visual Studio 2022 + Windows App SDK.",
    relativeRoot: "Asa Smooth Gameplay",
    prerequisites: [".NET 8 SDK", "Windows App SDK", "Desktop development with C++ workload (see folder README)"],
    steps: [
      {
        title: "Build & run",
        script: [
          "# Open in Visual Studio:",
          "#   Asa Smooth Gameplay/ArkLagFixer.csproj",
          "# Add required Assets images listed in Asa Smooth Gameplay/README.md before packaging.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "dedicated-manager",
    title: "ASA Dedicated Manager (release track)",
    summary: "Third-party dedicated server manager release notes / version mirror — not part of ARK Master source.",
    relativeRoot: "ASADedicatedManager_Releases_MSI-main",
    prerequisites: [],
    steps: [
      {
        title: "Use packaged MSI from upstream",
        script: [
          "# See ASADedicatedManager_Releases_MSI-main/ReleaseNotes/ and version.txt",
          "# Install the MSI from the publisher’s release channel when you add binaries to this folder.",
        ].join("\n"),
      },
    ],
  },
  {
    id: "ark-inis",
    title: "INI collection (stub)",
    summary: "Placeholder repo for GameUserSettings / Engine INI snippets. Add files under ark-inis-main to version them; ARK Master may add an INI browser later.",
    relativeRoot: "ark-inis-main",
    prerequisites: [],
    steps: [
      {
        title: "Populate",
        script: ["# Commit .ini templates or per-map presets into ark-inis-main when ready."].join("\n"),
      },
    ],
  },
];

export function companionProjectIds(): string[] {
  return COMPANION_PROJECTS.map((p) => p.id);
}

/** Portable JSON for runbooks / wiki (no secrets). */
export function exportCompanionLaunchRegistryJson(): string {
  return JSON.stringify(COMPANION_PROJECTS, null, 2);
}
