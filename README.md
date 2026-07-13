# Ark Arena Architect

> Desktop arena layout, preview, and command export toolkit for ARK server administrators.

## Overview

This repository contains a **Electron Desktop Application**. It is organized for clear local development, version control, review, and future releases.

## Technology

- **Project type:** Electron Desktop Application
- **Primary stack:** TypeScript
- **Repository branch:** `main`

## Project structure

```text
arena-architect-complete-main/
├── electron/
│   └── main.cjs
├── packaging/
│   ├── README_PlayNexus.txt
│   └── SETUP_INSTRUCTIONS.txt
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── sw.js
├── scripts/
│   ├── clean.mjs
│   ├── ingest-custom-caves.mjs
│   ├── ingest-terror-customs.mjs
│   ├── scale-creature-presets.mjs
│   └── scale-templates-100x.mjs
├── src/
│   ├── components/
│   ├── core/
│   ├── data/
│   ├── hooks/
│   ├── layouts/
│   ├── lib/
│   ├── modules/
│   ├── pages/
│   ├── test/
│   ├── workers/
│   ├── App.css
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── registerSw.ts
│   └── vite-env.d.ts
├── tests/
│   ├── smoke.spec.ts
│   └── visual.spec.ts
├── AUDIT_REPORT.md
├── CHANGELOG.txt
├── components.json
├── config_template.json
├── eslint.config.js
└── …
```

## Getting started

### Prerequisites

Install the tools required by the detected project type, then clone the repository:

```powershell
git clone <repository-url>
cd ark-arena-architect
```

### Installation

```powershell
npm install
```

### Common commands

```powershell
npm run dev
```
```powershell
npm run build
```
```powershell
npm run test
```

## Configuration

Keep machine-specific values, credentials, API keys, and tokens outside source control. Use environment variables or local configuration files ignored by Git. When configuration examples are useful, commit a sanitized `.env.example` rather than a real `.env` file.

## Development notes

- Create focused commits with clear messages.
- Keep generated files and dependency folders out of Git.
- Run the available build or test command before opening a pull request.
- Document material behavior changes in the changelog or release notes.

## Contributing

Contributions are welcome through issues and pull requests. Read [`CONTRIBUTING.md`](CONTRIBUTING.md) for the repository workflow.

## Security

Do not publish suspected vulnerabilities or credentials in a public issue. Follow [`SECURITY.md`](SECURITY.md) for responsible reporting guidance.

## License

License information is provided in [`LICENSE`](LICENSE) when a license has been selected for this repository.
