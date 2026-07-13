# Pre-Commit and Release Checklist

## Repository hygiene
- [x] Removed bundled `node_modules/`.
- [x] Removed generated `dist/`, `release/`, and `test-results/` directories.
- [x] Removed temporary command/test files.
- [x] Removed duplicate Bun lockfiles; npm is now the documented package manager.
- [x] Expanded `.gitignore` for generated, local, secret, log, and temporary files.
- [ ] Run `npm install` to refresh `package-lock.json` after adding Electron packaging dependencies.

## Functionality
- [x] Replaced `BrowserRouter` with `HashRouter` for packaged `file://` reliability.
- [x] Removed development-only route placeholder comment.
- [x] Removed noisy 404 console logging.
- [ ] Manually exercise all screens, preset operations, exports, cave tools, and 3D preview.

## Security
- [x] Added a restrictive Content Security Policy.
- [x] Retained sandbox, context isolation, and disabled Node integration.
- [x] Disabled packaged DevTools.
- [x] Blocked webviews and renderer navigation.
- [x] Allowlisted external protocols (`https:` and `mailto:` only).
- [x] Prevented insecure content.
- [ ] Run a dependency vulnerability audit after dependency installation.

## Build quality
- [x] Added `typecheck`, `check`, `clean`, desktop, and Windows packaging scripts.
- [x] Added Electron Builder configuration and application metadata.
- [x] Replaced Lovable placeholder metadata and documentation.
- [x] `npm run lint` (passes with non-blocking Fast Refresh warnings).
- [x] `npm run typecheck`.
- [x] `npm run test` — 47/47 tests pass.
- [x] `npm run build`.
- [ ] `npm run package:win` on Windows.

## Release verification
- [ ] Test clean install and uninstall.
- [ ] Test first launch and second-instance focus.
- [ ] Test offline launch.
- [ ] Test window resize, minimize, restore, and shutdown.
- [ ] Verify installer contains no source maps, tests, secrets, logs, or local paths.
- [ ] Smoke-test the final ZIP after extracting to a clean folder.
